import { ArrowArt, HoldArt, ChartArt } from './types';


/**
 * Get base URL, depending on local env variable
 * https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
 * @returns 
 */
export function checkEnvironment(): string {
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
export async function fetchData(id: string): Promise<ChartArt | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/101824/${id}.json`)
      // checkEnvironment().concat(`/rayden-072924-ae-072824-lgbm-091924/${id}.json`)
      // checkEnvironment().concat(`/public/piucenter-annot-070824/chart-json/${id}.json`)
      // checkEnvironment().concat(`/rayden-072624/chart-json/${id}.json`)
  );
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}
