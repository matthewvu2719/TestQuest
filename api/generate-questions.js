import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You generate quiz questions.

Return a JSON object with this structure:
{
  "questions": [
    {
      "question": "string",
      "answers": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ]
}

Generate exactly 10 questions.
          `,
        },
        { role: "user", content: `Generate 10 multiple choice quiz questions about: ${topic}` },
      ],
      temperature: 0.7,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
}