import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" }, 
      messages: [
        {
          role: 'system',
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
            `
        },
        {
          role: 'user',
          content: `Generate 10 multiple choice quiz questions about: ${topic}`
        }
      ],
      temperature: 0.7,
    });


    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
