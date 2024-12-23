import { createHandler, StartServer } from "@solidjs/start/server";

const wrapHandler = (handler: Function) => {
  let lastCall = Date.now();
  return (...args: any[]) => {
    const now = Date.now();
    console.log({
      timeSinceLastCall: now - lastCall,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1).join('\n'),
      args
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