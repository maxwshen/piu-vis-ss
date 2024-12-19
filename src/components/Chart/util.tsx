

export interface StrToStr {
  [key: string]: string;
};

export interface StrToAny {
  [key: string]: any;
};

export function getLevelColor(t: number): string {
  if (t < 0.6) {
    return '#aed677'
  } else if (t < 0.75) {
    return '#f3c746'
  } else if (t < 0.875) {
    return '#f59640'
  } else if (t < 0.97) {
    return '#ec4339'
  }
  return '#e2247f'
}


export function getLevelText(level: number): string {
  const r = Math.round(level);
  const threshold = 0.3;
  if (level - r <= -1 * threshold) {
    return `${r}-`;
  } else if (level - r >= threshold) {
    return `${r}+`;
  }
  return `${r}`;
}