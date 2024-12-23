import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  console.log({
    path: event.path,
    method: event.httpMethod,
    headers: event.headers,
    query: event.queryStringParameters,
    body: event.body,
    ip: event.headers['x-forwarded-for'],
    ua: event.headers['user-agent']
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from server function" })
  };
};