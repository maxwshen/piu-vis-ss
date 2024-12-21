import { ChartArt } from './types';


// Returns 5 or 10 if singles or doubles
export function getSinglesOrDoubles(chartart: ChartArt): number {
  let arrowarts = chartart[0];
  let holdarts = chartart[1];

  const max_aa_pos = Math.max(...arrowarts.map(([panelPos]) => panelPos));
  const max_ha_pos = Math.max(...holdarts.map(([panelPos]) => panelPos));
  const max_pos = Math.max(max_aa_pos, max_ha_pos);

  if (max_pos <= 4) {
    return 5;
  } else {
    return 10;
  };
}


export function getLevel(chartart: ChartArt): number {
  let metadata = chartart[2];
  return metadata['METER'];
}


/**
 * Computes last time in ChartArt
 * @param data 
 */
export function computeLastTime(data: ChartArt): number {
  let arrowarts = data[0];
  let holdarts = data[1];
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