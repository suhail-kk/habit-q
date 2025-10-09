import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error("❌ Missing OpenRouter API key in environment variables.");
  process.exit(1);
}

async function generateDailyQuestion() {
  const filePath = path.resolve("public", "questions.json");
  let existingData = [];

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    existingData = JSON.parse(fileContent || "[]"); // array of question objects
  } catch (err) {
    existingData = []; // file not found, start fresh
  }

  const existingQuestionsText = existingData.map(q => q.question).join("\n- ");

  const prompt = `
  Generate **one open-ended interview question** suitable for a **mid-level or senior developer**. 
  The topics should include, but are not limited to: 
  - JavaScript (advanced concepts, async patterns, closures, event loop) 
  - Node.js & Express 
  - Python (core, OOP, advanced concepts) 
  - Databases: MongoDB, DynamoDB, SQL 
  - Cloud: AWS (Lambda, S3, EC2, networking, architecture) 
  - System & software architecture (design patterns, scalability, performance) 
  - Testing: Unit testing (Jest), Integration testing 
  - DevOps & CI/CD concepts (optional)
  
  **Constraints:**  
  - Do NOT repeat any of these questions:
  - ${existingQuestionsText}
  
  **Output format:**  
  Strictly valid JSON with the following keys: 
  - "question": The question text
  - "options": An array of 4 answer options
- "answer": The correct answer
- "date": The date when the question was generated (ISO format)
  - "reason": A short explanation of why this is a valuable interview question
  
  **Important:**  
  - Do NOT include any markdown, \`\`\`, or extra text. Only return JSON.
  - The question must be clear, self-contained, and suitable for a real interview.
  `;

  try {
    // Safely read existing questions
    const filePath = path.resolve("public", "questions.json");
    let existingData = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(fileContent || "[]");
    } catch {
      existingData = [];
    }

    let newQuestion;
    let attempts = 0;
    const maxAttempts = 5;

    while (!newQuestion && attempts < maxAttempts) {
      attempts++;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
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
        console.warn(`Attempt ${attempts}: Failed to parse AI response. Retrying...`);
        continue;
      }

      // Check for duplicates
      const isDuplicate = existingData.some(q => q.question === questionObj.question);
      if (!isDuplicate) {
        // Add date
        questionObj.date = new Date().toISOString();
        newQuestion = questionObj;
        existingData.push(newQuestion);
        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
        console.log("✅ New question generated and saved:", newQuestion.question);
      } else {
        console.log(`⚠️ Duplicate question detected. Retrying... (Attempt ${attempts})`);
      }
    }

    if (!newQuestion) {
      console.error("❌ Could not generate a unique question after multiple attempts.");
    }

  } catch (err) {
    console.error("❌ Error generating daily question:", err.message);
  }
}

generateDailyQuestion();
