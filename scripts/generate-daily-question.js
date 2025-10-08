import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("Missing OpenRouter API key in environment variables.");
  process.exit(1);
}

async function generateDailyQuestion() {
  const prompt = `
    Generate one multiple-choice question with 4 options, the correct answer, and a short reason.
    Topic: Programming in JavaScript.
    Output strictly valid JSON with keys: question, options, answer, reason.
    Do NOT include any \`\`\` or extra text. Only return JSON.
  `;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch from OpenRouter: ${errorText}`);
    }

    const data = await res.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response format from OpenRouter.");
    }

    let content = data.choices[0].message.content.trim();
    content = content.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

    let questionObj;
    try {
      questionObj = JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse AI response: ${err.message}`);
    }

    // Write the question to questions.json
    const filePath = path.resolve("public", "questions.json");
    const existingData = JSON.parse(await fs.readFile(filePath, "utf-8") || "[]");
    existingData.push(questionObj);

    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
    console.log("Question generated and saved successfully.");
  } catch (err) {
    console.error("Error generating daily question:", err.message);
  }
}

generateDailyQuestion();
