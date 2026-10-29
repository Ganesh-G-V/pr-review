import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeDiff } from "../src/lib/ai/provider.ts";

test("ollama malformed output throws", async () => {
  process.env.AI_PROVIDER = "ollama";
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: { content: "not json" } }), { status: 200 }) as unknown as typeof fetch;
  await assert.rejects(() => analyzeDiff("diff"), /valid JSON/);
  globalThis.fetch = origFetch;
  delete process.env.AI_PROVIDER;
});

test("ollama empty findings ok", async () => {
  process.env.AI_PROVIDER = "ollama";
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: { content: "[]" } }), { status: 200 }) as unknown as typeof fetch;
  const r = await analyzeDiff("diff");
  assert.deepEqual(r, []);
  globalThis.fetch = origFetch;
  delete process.env.AI_PROVIDER;
});
