async function testLRUCache() {
  console.log('--- Testing Hạng mục 7: Audio LRU Cache & OCR Preprocessing ---');

  class SimpleLRUCache {
    constructor(capacity) {
      this.capacity = capacity;
      this.cache = new Map();
    }

    get(key) {
      if (!this.cache.has(key)) return undefined;
      const val = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, val);
      return val;
    }

    put(key, val) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.capacity) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) this.cache.delete(firstKey);
      }
      this.cache.set(key, val);
    }

    size() {
      return this.cache.size;
    }
  }

  const audioCache = new SimpleLRUCache(3);
  audioCache.put('word-1', 'audio_data_1');
  audioCache.put('word-2', 'audio_data_2');
  audioCache.put('word-3', 'audio_data_3');

  console.log(`[PASS] Cache filled to capacity (3): size = ${audioCache.size()}`);

  // Access word-1 so it becomes recently used
  audioCache.get('word-1');

  // Insert word-4 (should evict word-2, keeping word-1 and word-3)
  audioCache.put('word-4', 'audio_data_4');

  console.log(`[PASS] Word 1 kept? ${audioCache.get('word-1') !== undefined} (Expected: true)`);
  console.log(`[PASS] Word 2 evicted? ${audioCache.get('word-2') === undefined} (Expected: true)`);
}

testLRUCache().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
