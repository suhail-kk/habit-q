import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const KEY_ENV_NAMES = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_API_KEY2",
  "OPENROUTER_API_KEY3",
  "OPENROUTER_API_KEY4",
  "OPENROUTER_API_KEY5",
];

const OPENROUTER_KEYS = KEY_ENV_NAMES.map((name) => ({
  name,
  value: process.env[name],
})).filter((k) => Boolean(k.value));

if (OPENROUTER_KEYS.length === 0) {
  console.error(
    `❌ Missing OpenRouter API key in environment variables. Set at least ${KEY_ENV_NAMES.join(
      ", ",
    )}.`,
  );
  process.exit(1);
}

const keyStatePath = path.resolve("scripts", "openrouter-key-state.json");

async function readKeyState() {
  try {
    const raw = await fs.readFile(keyStatePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeKeyState(state) {
  await fs.writeFile(keyStatePath, JSON.stringify(state, null, 2));
}

function isCreditError(status, errorText) {
  if (status === 402) return true;
  const lower = String(errorText || "").toLowerCase();
  return (
    lower.includes("more credits") ||
    lower.includes("can only afford") ||
    lower.includes("\"code\":402") ||
    lower.includes("insufficient") ||
    lower.includes("credits")
  );
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

  // Keep the prompt bounded so it doesn't grow unbounded over time.
  const recentQuestionsText = existingData
    .slice(-50)
    .map((q) => q.question)
    .join("\n- ");

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
  - ${recentQuestionsText}
  
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
    let newQuestion;
    let attempts = 0;
    const maxAttempts = 5;
    const keyState = await readKeyState();
    const lastUsedKeyName = keyState.lastUsedKeyName;
    const startKeyIndex = Math.max(
      0,
      OPENROUTER_KEYS.findIndex((k) => k.name === lastUsedKeyName),
    );

    while (!newQuestion && attempts < maxAttempts) {
      attempts++;

      let data;
      let lastErrorText = "";
      let usedKeyName = null;

      // Try keys starting from the last used key, wrapping around.
      for (let i = 0; i < OPENROUTER_KEYS.length; i++) {
        const key = OPENROUTER_KEYS[(startKeyIndex + i) % OPENROUTER_KEYS.length];

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key.value}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            // OpenRouter can assume a very large default max_tokens; set a sane cap
            // so low-credit accounts don't fail with "requested up to 16384 tokens".
            max_tokens: 800,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          lastErrorText = errorText;
          if (isCreditError(res.status, errorText)) {
            console.warn(
              `⚠️ Key ${key.name} appears out of credits (status ${res.status}). Trying next key...`,
            );
            continue;
          }
          throw new Error(`Failed to fetch from OpenRouter: ${errorText}`);
        }

        data = await res.json();
        usedKeyName = key.name;
        break;
      }

      if (!data) {
        throw new Error(
          `Failed to fetch from OpenRouter with all available keys. Last error: ${lastErrorText}`,
        );
      }

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
        if (usedKeyName) {
          await writeKeyState({
            ...keyState,
            lastUsedKeyName: usedKeyName,
            updatedAt: new Date().toISOString(),
          });
        }
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
