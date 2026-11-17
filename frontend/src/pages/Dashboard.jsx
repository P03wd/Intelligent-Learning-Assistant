
import { Link } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  Code,
  GraduationCap,
} from "lucide-react";

const features = [
  {
    title: "AI Chatbot",
    description: "Ask questions and learn from uploaded materials.",
    icon: MessageSquare,
    link: "/chatbot",
  },
  {
    title: "Learning Materials",
    description: "Upload PDF, DOCX and TXT documents.",
    icon: FileText,
    link: "/documents",
  },
  {
    title: "Coding Assistant",
    description: "Understand, debug and practise programming.",
    icon: Code,
    link: "/coding",
  },
  {
    title: "Personalized Learning",
    description: "Track performance and receive lesson recommendations.",
    icon: GraduationCap,
    link: "/learning",
  },
];

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Welcome to LearnAI</h1>
      <p>Your AI-powered personalized learning workspace.</p>

      <div className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Link
              to={feature.link}
              className="feature-card"
              key={feature.title}
            >
              <Icon size={30} />
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
              <span>Explore →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
