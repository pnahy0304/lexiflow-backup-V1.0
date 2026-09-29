// ============================================================
// R2 CDN Audio Cache Control Headers
// Provides 1-year immutable caching for static IPA pronunciation audio files
// ============================================================

export function getAudioCDNHeaders(): Record<string, string> {
  return {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': '*',
    'Accept-Ranges': 'bytes'
  };
}
