import { NextResponse } from "next/server";
import type { CareerInput } from "@/lib/types";
import { generateCareerPlan } from "@/lib/ai/gemini";
import { validateCareerInput } from "@/lib/validators";

function normalizeSkills(value: unknown) {
  const rawSkills = Array.isArray(value) ? value : String(value ?? "").split(",");
  return rawSkills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 20);
}

export async function POST(request: Request) {
  try {
    let body: Partial<CareerInput> & { currentSkills?: unknown };
    try {
      body = (await request.json()) as Partial<CareerInput> & { currentSkills?: unknown };
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const input: CareerInput = {
      targetRole: String(body.targetRole ?? "").trim(),
      currentSkills: normalizeSkills(body.currentSkills),
      currentLevel: body.currentLevel as CareerInput["currentLevel"],
      weeklyHours: Number(body.weeklyHours),
      targetTimeline: body.targetTimeline ? String(body.targetTimeline).trim() : undefined
    };

    const validation = validateCareerInput(input);
    if (!validation.ok) {
      return NextResponse.json({ error: "Invalid career input.", details: validation.errors }, { status: 400 });
    }

    const result = await generateCareerPlan(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate plan." },
      { status: 500 }
    );
  }
}
