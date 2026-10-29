export type Severity = "High" | "Medium" | "Low";

export type Finding = {
  id: number;
  severity: Severity;
  category?: string;
  title: string;
  filePath: string;
  lineRange: string;
  evidence?: string;
  explanation: string;
  suggestedFix: string;
  resolved: boolean;
};

export type RawFinding = {
  severity?: unknown;
  category?: unknown;
  title?: unknown;
  filePath?: unknown;
  lineRange?: unknown;
  evidence?: unknown;
  explanation?: unknown;
  suggestedFix?: unknown;
};

const SEVERITIES: Severity[] = ["High", "Medium", "Low"];

export function validateDiff(input: unknown): { ok: true; diff: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: "diff must be a string" };
  const diff = input.trim();
  if (diff.length === 0) return { ok: false, error: "diff is required" };
  if (diff.length > 50000) return { ok: false, error: "diff too large (max 50000 chars)" };
  return { ok: true, diff };
}

export function validateFinding(raw: unknown): Finding | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const severity = r.severity;
  if (typeof severity !== "string" || !SEVERITIES.includes(severity as Severity)) return null;
  const title = r.title;
  const filePath = r.filePath ?? r.file_path ?? r.file;
  const explanation = r.explanation;
  const suggestedFix = r.suggestedFix ?? r.suggested_fix ?? r.fix;
  if (typeof title !== "string" || title.trim() === "") return null;
  if (typeof filePath !== "string" || filePath.trim() === "") return null;
  if (typeof explanation !== "string" || explanation.trim() === "") return null;
  if (typeof suggestedFix !== "string" || suggestedFix.trim() === "") return null;
  const lineRangeRaw = r.lineRange ?? r.line_range ?? r.lines;
  const lineRange = typeof lineRangeRaw === "string" && lineRangeRaw.trim() !== "" ? lineRangeRaw.trim() : "n/a";
  const category = typeof r.category === "string" ? r.category.trim() : undefined;
  const evidence = typeof r.evidence === "string" ? r.evidence.trim() : undefined;
  return {
    id: 0,
    severity: severity as Severity,
    category,
    title: title.trim(),
    filePath: filePath.trim(),
    lineRange,
    evidence,
    explanation: explanation.trim(),
    suggestedFix: suggestedFix.trim(),
    resolved: false,
  };
}

export function validateFindings(raw: unknown): Finding[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Finding[] = [];
  for (const item of raw) {
    const f = validateFinding(item);
    if (!f) return null;
    out.push(f);
  }
  return out.map((f, i) => ({ ...f, id: i + 1 }));
}
