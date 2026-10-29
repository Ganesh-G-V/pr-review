import { NextResponse } from "next/server";
import { validateDiff } from "@/lib/pr-review/schema";
import { analyzeDiff, ProviderNotConfiguredError } from "@/lib/ai/provider";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const obj = body as Record<string, unknown> | null;
  const diffResult = validateDiff(obj?.diff);
  if (!diffResult.ok) {
    return NextResponse.json({ error: diffResult.error }, { status: 400 });
  }
  try {
    const findings = await analyzeDiff(diffResult.diff);
    return NextResponse.json({ findings });
  } catch (e) {
    if (e instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Analysis failed" }, { status: 502 });
  }
}
