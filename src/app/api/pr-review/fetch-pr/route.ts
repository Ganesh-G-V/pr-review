import { NextResponse } from "next/server";
import { parsePrUrl, fetchPrDiff } from "@/lib/github/pr";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const pr = parsePrUrl((body as { prUrl?: unknown })?.prUrl);
  if (!pr) return NextResponse.json({ error: "Invalid GitHub PR URL" }, { status: 400 });
  try {
    const diff = await fetchPrDiff(pr);
    return NextResponse.json({ diff });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fetch failed" }, { status: 502 });
  }
}
