import { ArrowArt, HoldArt, ChartArt, StrToAny } from './types';
import { isServer } from "solid-js/web";

/**
 * Get base URL, depending on local env variable
 * https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
 * @returns 
 */
export function checkEnvironment(): string {
  const viteEnv = import.meta.env.VITE_ENV;
  // const baseUrl = window.location.origin;
  if (viteEnv == 'dev') {
    return "http://localhost:3000"
  } else if (viteEnv == 'prod') {
    return "https://www.piucenter.com"
    // return "https://piucenterv2.netlify.app"
    // return baseUrl;
  }
  return "https://www.piucenter.com"
  // return 'https://piucenterv2.netlify.app';
  // return baseUrl;
};


// export function checkEnvironment(): string {
//   const viteEnv = import.meta.env.VITE_ENV;
//   const baseUrl = isServer 
//     ? 'https://www.piucenter.com'  // Production URL for server context
//     : (typeof window !== 'undefined' && window.location 
//         ? window.location.origin 
//         : 'https://www.piucenter.com');

//   return viteEnv === 'dev' 
//     ? "http://localhost:3000" 
//     : baseUrl;
// }


/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
export async function fetchData(id: string): Promise<ChartArt | null> {
  try {
    const response = await fetch(
      // window.location.origin.concat(`/chart-jsons/120524/${id}.json`)
      checkEnvironment().concat(`/chart-jsons/120524/${id}.json`)
  );
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}

// export async function fetchData(id: string): Promise<ChartArt | null> {
//   try {
//     // For development environment
//     if (import.meta.env.DEV) {
//       const response = await fetch(
//         `http://localhost:3000/chart-jsons/120524/${id}.json`
//       );
//       const obj = await response.json();
//       return obj;
//     }
    
//     // For production environment
//     const baseUrl = window.location.origin;
//     const response = await fetch(
//       `${baseUrl}/chart-jsons/120524/${id}.json`
//     );
//     const obj = await response.json();
//     return obj;
//   } catch (error) {
//     console.error('Error fetching data:', error);
//     console.error('URL attempted:', `${window.location.origin}/chart-jsons/120524/${id}.json`);
//     return null;
//   }
// }

/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
export async function fetchPageContent(id: string): Promise< | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/120524/page-content/${id}.json`)
  );
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}

/**
 * Fetches search struct data
 * @param id: json filename
 * @returns 
 */
export async function fetchSkillData(): Promise<StrToAny | null> {
  try {
    const response = await fetch(
      checkEnvironment() + `/chart-jsons/120524/page-content/stepchart-skills.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const skillData: StrToAny = await response.json();
    return skillData;
  } catch (error) {
    console.error('Error fetching tier list data:', error);
    return null;
  }
}