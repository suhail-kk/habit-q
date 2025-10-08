// app/api/generate-question/route.js
import { NextResponse } from "next/server";
import { generateDailyQuestion } from "@/lib/generateDailyQuestion";

export async function GET() {
    try {
        const question = await generateDailyQuestion();
        return NextResponse.json({ success: true, question });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
