/**
 * Utility function to clean and map old CartoCraft map URLs (e.g. *.base44.app, old run.app)
 * to the active CartoCraft deployment URL (https://cartocraft.ai.studio).
 */
export function getCleanMapUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Target domain configured by user, or default CartoCraft domain
  let targetDomain = "https://cartocraft-v2.ai.studio";
  
  // Safely attempt to read from localStorage
  try {
    const stored = localStorage.getItem("cartocraft_base_url");
    if (stored && stored.trim()) {
      targetDomain = stored.trim().replace(/\/+$/, ""); // Remove trailing slashes
    }
  } catch (err) {
    // LocalStorage might be blocked or unavailable in some sandbox iframes
  }

  try {
    let workingUrl = trimmed;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      workingUrl = `https://${trimmed}`;
    }

    const parsed = new URL(workingUrl);
    
    // Check if it belongs to base44.app (the older system), old cartocraft.ai.studio, or cartocraft run.app
    if (
      parsed.hostname.includes("base44.app") || 
      parsed.hostname.includes("carto-craft") || 
      parsed.hostname.includes("cartocraft-679508173370") ||
      parsed.hostname === "cartocraft.ai.studio"
    ) {
      return `${targetDomain}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    
    // If it's already using cartocraft-v2.ai.studio or another custom map URL, return as is
    return workingUrl;
  } catch (e) {
    // Fallback if URL parsing fails
    if (trimmed.includes("base44.app") || trimmed.includes("run.app") || trimmed.includes("cartocraft.ai.studio")) {
      return trimmed.replace(/https?:\/\/[^\/]+/, targetDomain);
    }
    return trimmed;
  }
}
