import { Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  
  // Handle static assets
  // if (url.pathname.startsWith('/chart-jsons/') || url.pathname.startsWith('/articles/')) {
  console.log(url, url.pathname);
  if (url.pathname.startsWith('/chart-jsons/')) {
    const response = await context.next();
    return new Response(response.body, {
      ...response,
      headers: {
        ...response.headers,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  // Handle SPA routing
  return context.next();
};