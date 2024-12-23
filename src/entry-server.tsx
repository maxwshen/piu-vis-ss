import { createHandler, StartServer } from "@solidjs/start/server";

const wrapHandler = (handler: Function) => {
  let lastCall = Date.now();
  return (...args: any[]) => {
    const now = Date.now();
    const event = args[0];
    const userAgent = event?.node?.req?.headers['user-agent'];
    
    // Block Amazonbot
    if (userAgent?.includes('Amazonbot')) {
      console.log({
        blocked: true,
        timestamp: new Date().toISOString(),
        ip: event?.node?.req?.headers['x-forwarded-for'],
        ua: userAgent
      });
      
      // Return a 403 response
      event.node.res.writeHead(403, { 'Content-Type': 'application/json' });
      event.node.res.end(JSON.stringify({ error: 'Access denied' }));
      return;
    }

    // Original logging for non-Amazonbot requests
    console.log({
      timeSinceLastCall: now - lastCall,
      timestamp: new Date().toISOString(),
      method: event?.node?.req?.method,
      path: event?.node?.req?.url,
      ip: event?.node?.req?.headers['x-forwarded-for'],
      ua: userAgent,
      clientId: event?.node?.req?.headers['x-client-id'],
      stack: new Error().stack?.split('\n').slice(1).join('\n')
    });
    lastCall = now;
    return handler(...args);
  };
};

const handler = () => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="robots" content="nofollow, max-snippet:-1, max-image-preview:none" />
          <meta name="AmazonBot" content="noindex, nofollow" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
);

export default wrapHandler(createHandler(handler));