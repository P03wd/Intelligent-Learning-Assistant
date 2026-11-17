
class RecommendationEngine:

    LESSONS = {
        "python loops": [
            "Introduction to Loops",
            "For Loops in Python",
            "While Loops in Python",
            "Break and Continue Statements",
            "Nested Loops"
        ],
        "python functions": [
            "Introduction to Functions",
            "Function Parameters and Arguments",
            "Return Statements",
            "Lambda Functions"
        ],
        "python variables": [
            "Python Variables",
            "Data Types",
            "Type Conversion",
            "Variable Scope"
        ],
        "python conditions": [
            "Conditional Statements",
            "If and Else",
            "Elif Statements",
            "Logical Operators"
        ],
        "python lists": [
            "Introduction to Lists",
            "List Indexing and Slicing",
            "List Methods",
            "List Iteration"
        ]
    }

    def recommend_lessons(self, weak_topics: list) -> list:
        recommendations = []

        for item in weak_topics:
            topic = item["topic"].lower()

            lessons = self.LESSONS.get(
                topic,
                [f"Introduction to {topic.title()}",
                 f"Fundamentals of {topic.title()}"]
            )

            recommendations.append({
                "topic": topic,
                "average_score": item["average_score"],
                "recommended_lessons": lessons
            })

        return recommendations
