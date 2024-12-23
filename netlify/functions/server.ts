// netlify/functions/server.ts
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Log request details
  const now = Date.now();
  console.log({
    timestamp: new Date(now).toISOString(),
    path: event.path,
    referer: event.headers.referer,
    section: event.queryStringParameters?.section,
    // These may help identify the requestor
    ip: event.headers['x-forwarded-for'],
    ua: event.headers['user-agent'],
    clientId: event.headers['x-client-id'],
  });

  return {
    statusCode: 200,
    body: event.body || ''
  };
};