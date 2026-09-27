/**
 * Utility to process and sanitize image URLs throughout Dragopedia.
 * Bypasses hotlink protection (e.g. Fandom/Wikia Cloudflare 403 blocks)
 * by proxying through our server-side image proxy, and provides reliable fallbacks.
 */

export function getSafeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Data URLs, local blob URLs, or local absolute paths are safe to use directly
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // Known domains with strict hotlink protections / CORS policies
  if (
    trimmed.includes("wikia.nocookie.net") ||
    trimmed.includes("fandom.com") ||
    trimmed.includes("artstation.com") ||
    trimmed.includes("deviantart.net") ||
    trimmed.includes("deviantart.com") ||
    trimmed.includes("wixmp.com") ||
    trimmed.includes("gamerantimages.com") ||
    trimmed.includes("dndbeyond.com") ||
    trimmed.includes("wargamer.com") ||
    trimmed.includes("dungeonnexus.com") ||
    trimmed.includes("arcpublishing.com")
  ) {
    return `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Returns an alternative proxied URL if a direct image URL fails to load.
 */
export function getProxiedFallbackUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/api/proxy-image")) {
    return trimmed;
  }
  return `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
}

/**
 * Common fallback handler for <img> elements:
 * Tries the proxy once; if that also fails, hides or falls back gracefully.
 */
export function handleImageErrorWithFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string,
  fallbackSrc?: string
) {
  const target = event.currentTarget;
  if (!target) return;

  const currentSrc = target.src;
  
  // If not yet proxied and original URL was external, try proxying
  if (originalUrl && !currentSrc.includes("/api/proxy-image") && originalUrl.startsWith("http")) {
    target.src = getProxiedFallbackUrl(originalUrl);
    return;
  }

  // If fallbackSrc provided and different, switch to it
  if (fallbackSrc && target.src !== fallbackSrc) {
    target.src = fallbackSrc;
    return;
  }

  // If all fails, hide image so broken icon doesn't show
  target.style.display = "none";
}
