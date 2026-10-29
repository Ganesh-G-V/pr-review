import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type ParsedPR = { owner: string; repo: string; number: string };

const URL_RE = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/pull\/(\d+)(?:[/?#].*)?$/;

export function parsePrUrl(input: unknown): ParsedPR | null {
  if (typeof input !== "string") return null;
  const m = input.trim().match(URL_RE);
  if (!m) return null;
  const [, owner, repo, number] = m;
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null;
  if (!/^\d+$/.test(number)) return null;
  return { owner, repo, number };
}

export async function fetchPrDiff(pr: ParsedPR): Promise<string> {
  // ensure gh exists
  try {
    await execFileAsync("gh", ["--version"], { timeout: 5000 });
  } catch {
    throw new Error("GitHub CLI (gh) is not installed or not on PATH.");
  }
  let stdout: string;
  try {
    const res = await execFileAsync("gh", ["pr", "diff", pr.number, "--repo", `${pr.owner}/${pr.repo}`], {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    stdout = res.stdout;
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string; killed?: boolean };
    const msg = String(err.stderr || err.message || "Failed to fetch PR diff");
    if (/not logged in|auth/i.test(msg)) throw new Error("GitHub CLI is not authenticated. Run `gh auth login`.");
    if (/permission|forbidden|403/i.test(msg)) throw new Error("Insufficient repository permissions.");
    if (err.killed || /timeout/i.test(msg)) throw new Error("Fetching PR diff timed out.");
    throw new Error("Failed to fetch PR diff.");
  }
  const diff = stdout.trim();
  if (diff.length === 0) throw new Error("PR diff is empty.");
  if (diff.length > 50000) throw new Error("PR diff too large (max 50000 chars).");
  return diff;
}
