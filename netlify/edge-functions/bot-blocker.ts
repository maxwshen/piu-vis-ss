import { Context } from "@netlify/edge-functions";

export default async function botBlocker(request: Request, context: Context) {
  const ip = request.headers.get("x-forwarded-for")?.split(", ")[0];
  const userAgent = request.headers.get("user-agent") || "";
  
  console.log({
    message: "Bot blocker running",
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });

  // Block if it's Amazonbot
  if (userAgent.includes("Amazonbot")) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Continue to the next middleware/function if not blocked
  return context.next();
}