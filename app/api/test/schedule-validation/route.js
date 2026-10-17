import { NextResponse } from "next/server";
import { validateScheduleAlternatives } from "../../../../lib/booking-options";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const result = validateScheduleAlternatives(body);
  if (!result.valid) {
    return NextResponse.json({ valid: false, errors: result.errors }, { status: 422 });
  }
  return NextResponse.json({ valid: true, mode: result.mode, alternatives: result.alternatives });
}
