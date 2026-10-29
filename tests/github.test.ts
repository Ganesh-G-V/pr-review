import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePrUrl } from "../src/lib/github/pr.ts";

test("parse valid url", () => {
  const r = parsePrUrl("https://github.com/acme/web-app/pull/123");
  assert.deepEqual(r, { owner: "acme", repo: "web-app", number: "123" });
});

test("reject invalid", () => {
  assert.equal(parsePrUrl("https://example.com/x/y/pull/1"), null);
  assert.equal(parsePrUrl("https://github.com/a/b/issues/1"), null);
  assert.equal(parsePrUrl("not a url"), null);
});
