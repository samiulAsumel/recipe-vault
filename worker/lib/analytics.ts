// KV has no atomic increment — this get-then-put can under-count on truly
// concurrent hits, an accepted tradeoff of the KV-for-counters design Section
// 10 explicitly chose over a more complex mechanism (e.g. a Durable Object).
export async function incrementKvCounter(kv: KVNamespace, key: string): Promise<void> {
  const current = await kv.get(key);
  const next = (Number(current) || 0) + 1;
  await kv.put(key, String(next));
}
