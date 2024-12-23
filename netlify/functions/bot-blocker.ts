import { Context, Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  const userAgent = event.headers['user-agent'] || '';
  const ip = event.headers['x-forwarded-for'] || '';

  console.log({
    message: "Server bot-blocker running",
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });

  if (userAgent.includes('Amazonbot')) {
    console.log({
      message: "Server blocking Amazonbot",
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Access denied' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  // If not blocked, proxy to original destination
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Allowed' })
  };
};