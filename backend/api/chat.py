
from typing import Literal

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import Conversation, ChatMessage
from rag.knowledge_base import search_knowledge_base
from services.llm_service import LLMService


router = APIRouter(prefix="/chat", tags=["Chat"])

MIN_SIMILARITY_SCORE = 0.35


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    conversation_id: int | None = None
    conversation_history: list[ConversationMessage] = Field(
        default_factory=list,
        max_length=10
    )
    top_k: int = Field(default=3, ge=1, le=5)


@router.post("/ask")
def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:
        # Retrieve or create a conversation.
        if request.conversation_id is not None:
            conversation = db.query(Conversation).filter(
                Conversation.id == request.conversation_id
            ).first()

            if conversation is None:
                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found."
                )
        else:
            conversation = Conversation(title=request.question[:100])
            db.add(conversation)
            db.flush()

        # Load recent conversation messages before retrieval.
        previous_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation.id)
            .order_by(
                ChatMessage.created_at.desc(),
                ChatMessage.id.desc()
            )
            .limit(10)
            .all()
        )

        history = [
            {
                "role": message.role,
                "content": message.content
            }
            for message in reversed(previous_messages)
        ]

        # Use supplied history only for a new conversation.
        if request.conversation_id is None and request.conversation_history:
            history = [
                message.model_dump()
                for message in request.conversation_history
            ]

        # Build a retrieval query using previous user context
        # for short follow-up questions.
        retrieval_query = request.question

        follow_up_phrases = (
            "explain that",
            "explain this",
            "tell me more",
            "elaborate",
            "in simple words",
            "simplify that",
            "what about that",
            "can you explain",
            "give an example",
        )

        is_follow_up = (
            len(request.question.split()) <= 12
            or any(
                phrase in request.question.lower()
                for phrase in follow_up_phrases
            )
        )

        if is_follow_up and history:
            previous_user_questions = [
                message["content"]
                for message in history
                if message.get("role") == "user"
            ]

            previous_assistant_answers = [
                message["content"]
                for message in history
                if message.get("role") == "assistant"
            ]

            if previous_user_questions:
                retrieval_query = previous_user_questions[-1]

                # Include the previous answer to preserve
                # the subject of the follow-up.
                if previous_assistant_answers:
                    retrieval_query += " " + previous_assistant_answers[-1]

                retrieval_query += " " + request.question

        # Retrieve relevant course content.
        retrieved_chunks = search_knowledge_base(
            retrieval_query,
            top_k=request.top_k
        )

        relevant_chunks = [
            chunk for chunk in retrieved_chunks
            if chunk["similarity_score"] >= MIN_SIMILARITY_SCORE
        ]

        # Generate a grounded answer using Groq.
        ai_service = LLMService()

        result = ai_service.generate_answer(
            question=request.question,
            retrieved_chunks=relevant_chunks,
            conversation_history=history
        )

        # Save the question and answer.
        user_message = ChatMessage(
            conversation_id=conversation.id,
            role="user",
            content=request.question
        )

        assistant_message = ChatMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=result["answer"]
        )

        db.add(user_message)
        db.add(assistant_message)
        db.commit()
        db.refresh(conversation)

        return {
            "conversation_id": conversation.id,
            "question": request.question,
            "answer": result["answer"],
            "sources": result["sources"],
            "retrieved_chunks": len(relevant_chunks),
            "status": "success"
        }

    except HTTPException:
        db.rollback()
        raise

    except ValueError as error:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer. Please try again."
        )


# List all saved conversations.
@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db)
):
    conversations = (
        db.query(Conversation)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    return {
        "conversations": [
            {
                "conversation_id": conversation.id,
                "title": conversation.title,
                "created_at": conversation.created_at,
                "message_count": len(conversation.messages)
            }
            for conversation in conversations
        ],
        "status": "success"
    }


# Retrieve an individual conversation and its messages.
@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(
            ChatMessage.created_at,
            ChatMessage.id
        )
        .all()
    )

    return {
        "conversation_id": conversation.id,
        "title": conversation.title,
        "messages": [
            {
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at
            }
            for message in messages
        ],
        "status": "success"
    }
