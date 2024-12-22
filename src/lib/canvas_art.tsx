import { ChartArt } from './types';
import { ChartData } from './types';


// Returns 5 or 10 if singles or doubles
export function getSinglesOrDoubles(chartdata: ChartData): number {
  let arrowarts = chartdata['arrowarts'];
  let holdarts = chartdata['holdarts'];

  const max_aa_pos = Math.max(...arrowarts.map(([panelPos]) => panelPos));
  const max_ha_pos = Math.max(...holdarts.map(([panelPos]) => panelPos));
  const max_pos = Math.max(max_aa_pos, max_ha_pos);

  if (max_pos <= 4) {
    return 5;
  } else {
    return 10;
  };
}


export function getLevel(chartdata: ChartData): number {
  return chartdata['metadata']['METER'];
}


/**
 * Computes last time in ChartArt
 * @param data 
 */
export function computeLastTime(chartdata: ChartData): number {
  let arrowarts = chartdata['arrowarts'];
  let holdarts = chartdata['holdarts'];
  let lastArrowTime = 0;
  let lastHoldEndTime = 0;
  if (arrowarts && arrowarts.length > 0) {
    lastArrowTime = arrowarts[arrowarts.length - 1][1];
  }
  if (holdarts && holdarts.length > 0) {
    lastHoldEndTime = holdarts[holdarts.length - 1][2];
  }
  let lastTime = Math.max(lastArrowTime, lastHoldEndTime);
  return lastTime;
}