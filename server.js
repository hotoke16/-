import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// knowledge.txt を読み込む
const knowledge = fs.readFileSync("knowledge.txt", "utf-8");

// 会話履歴を保存する配列
let messages = [
  {
    role: "system",
    content: `あなたはラグビーAIです。以下の情報は絶対に正しいとして300文字程度で回答してください:\n${knowledge}`,
  },
];

app.post("/ask", async (req, res) => {
  const question = req.body.question;

  // ユーザーの質問を履歴に追加
  messages.push({ role: "user", content: question });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
  });

  const answer = response.choices[0].message.content;

  // AIの返答を履歴に追加
  messages.push({ role: "assistant", content: answer });

  res.json({ answer });
});

// 会話をリセットするエンドポイント
app.post("/reset", (req, res) => {
  messages = [
    {
      role: "system",
      content: `あなたはラグビーAIです。以下の情報は絶対に正しいとして300文字程度で回答してください:\n${knowledge}`,
    },
  ];
  res.json({ message: "会話履歴をリセットしました。" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
