
class AdaptiveLearning:

    def determine_learning_level(self, average_score: float) -> str:
        if average_score < 40:
            return "beginner"
        elif average_score < 75:
            return "intermediate"
        else:
            return "advanced"

    def get_learning_instructions(self, level: str) -> str:
        instructions = {
            "beginner": (
                "Explain concepts using simple language, "
                "step-by-step instructions and basic examples."
            ),
            "intermediate": (
                "Provide detailed explanations, practical examples "
                "and moderate-level exercises."
            ),
            "advanced": (
                "Provide in-depth technical explanations, "
                "complex examples and challenging exercises."
            )
        }

        return instructions.get(
            level.lower(),
            "Provide a clear explanation with suitable examples."
        )

    def adapt_learning(self, topic: str, average_score: float) -> dict:
        level = self.determine_learning_level(average_score)

        return {
            "topic": topic,
            "average_score": average_score,
            "learning_level": level,
            "instructions": self.get_learning_instructions(level)
        }
