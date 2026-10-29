import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeDiff, ProviderNotConfiguredError } from "../src/lib/ai/provider.ts";

test("analyzeDiff throws when no API key", async () => {
  delete process.env.OPENAI_API_KEY;
  await assert.rejects(() => analyzeDiff("diff --git a/x b/x"), ProviderNotConfiguredError);
});
