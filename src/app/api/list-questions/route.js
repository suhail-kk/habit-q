// API to fetch list of questions from local JSON file with pagination
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;

        const filePath = path.join(process.cwd(), "public", "questions.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const allQuestions = JSON.parse(fileContents);

        // Sort questions by date (latest first)
        allQuestions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Implement pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedQuestions = allQuestions.slice(startIndex, endIndex);

        return NextResponse.json({
            page,
            limit,
            total: allQuestions.length,
            questions: paginatedQuestions,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load questions" },
            { status: 500 }
        );
    }
}