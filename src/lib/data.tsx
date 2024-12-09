import { ArrowArt, HoldArt, ChartArt } from './types';


/**
 * Get base URL, depending on local env variable
 * https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
 * @returns 
 */
export function checkEnvironment(): string {
  const viteEnv = import.meta.env.VITE_ENV;
  if (viteEnv == 'dev') {
    return "http://localhost:3000"
  } else if (viteEnv == 'prod') {
    return "https://piucenterv2.netlify.app"
  }
  return 'https://piucenterv2.netlify.app';
};


/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
export async function fetchData(id: string): Promise<ChartArt | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/120524/${id}.json`)
  );
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}
