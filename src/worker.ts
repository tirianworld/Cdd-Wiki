export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  BACKEND_URL?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. Proxy API routes to the backend service
    if (url.pathname.startsWith("/api/")) {
      const backendBase = env.BACKEND_URL || "https://ais-dev-ubul3fnd577wsbnobnvdjv-685498745515.europe-west2.run.app";
      const targetUrl = new URL(url.pathname + url.search, backendBase);

      const reqHeaders = new Headers(request.headers);
      reqHeaders.set("Host", targetUrl.host);
      reqHeaders.set("X-Forwarded-Host", url.host);
      reqHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

      // Handle OPTIONS preflight requests directly
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      try {
        const response = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: reqHeaders,
          body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
          redirect: "follow",
        });

        const resHeaders = new Headers(response.headers);
        resHeaders.set("Access-Control-Allow-Origin", "*");
        resHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
        resHeaders.set("Access-Control-Allow-Headers", "*");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
        });
      } catch (err: any) {
        console.error("[Cloudflare Worker Proxy Error]:", err);
        return new Response(
          JSON.stringify({
            error: "Backend proxy unreachable",
            message: err.message || "Failed to reach backend",
            path: url.pathname,
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 2. Serve static assets & SPA routes via ASSETS binding
    return env.ASSETS.fetch(request);
  },
};
