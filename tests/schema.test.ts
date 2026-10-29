import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDiff, validateFindings } from "../src/lib/pr-review/schema.ts";

test("validateDiff rejects empty", () => {
  assert.equal(validateDiff("").ok, false);
  assert.equal(validateDiff("   ").ok, false);
  assert.equal(validateDiff(123).ok, false);
});

test("validateDiff accepts nonempty", () => {
  const r = validateDiff("diff --git a/x b/x");
  assert.equal(r.ok, true);
});

test("validateFindings validates and assigns ids", () => {
  const raw = [{ severity: "High", title: "t", filePath: "f.ts", explanation: "e", suggestedFix: "s", lineRange: "1-2" }];
  const res = validateFindings(raw);
  assert.ok(res);
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 1);
  assert.equal(res[0].severity, "High");
});

test("validateFindings rejects invalid", () => {
  assert.equal(validateFindings([{ severity: "X", title: "t", filePath: "f", explanation: "e", suggestedFix: "s" }]), null);
  assert.equal(validateFindings("nope"), null);
});
