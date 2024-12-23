import { ChartArt, StrToAny } from './types';
import { isServer } from "solid-js/web";

export function checkEnvironment(): string {
  const viteEnv = import.meta.env.VITE_ENV;
  const baseUrl = isServer 
    ? 'https://www.piucenter.com'  // Production URL for server context
    : (typeof window !== 'undefined' && window.location 
        ? window.location.origin 
        : 'https://www.piucenter.com');
  
  return baseUrl;
  return viteEnv === 'dev' 
    ? "http://localhost:3000" 
    : baseUrl;
}


/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
export async function fetchData(id: string): Promise<ChartArt | null> {
  const startTime = Date.now();
  try {
    const url = checkEnvironment().concat(`/chart-jsons/120524/${id}.json`);
    console.log(`[${new Date().toISOString()}] Fetching ${url}`);
    const response = await fetch(url);
    console.log(`Fetch took ${Date.now() - startTime}ms`);
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}

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