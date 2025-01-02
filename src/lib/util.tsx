import { StrToAny } from "./types";


export function roundToDecimals(input: any, decimals: number): number {
  let x = Number(input);
  let n = Math.pow(10, decimals);
  return Math.round(x * n) / n;
}


export function getShortChartName(name: string) {
  var n = name.replace('_INFOBAR_TITLE_', '_').replace('_HALFDOUBLE_', '_');
  n = n.replace('_INFOBAR_2_', '_').replace('_INFOBAR_1_', '_');
  const nsplit = n.split('_');
  const songtype = nsplit[nsplit.length - 1];
  const songname = n.split('_-_')[0].replace(/_+/g, ' ');
  
  var shortname = songname;
  if (songtype != 'ARCADE') {
    shortname = shortname + ' ' + songtype.toLowerCase();
  }
  return shortname;
}


export function getShortChartNameWithLevel(name: string) {
  var n = name.replace('_INFOBAR_TITLE_', '_').replace('_HALFDOUBLE_', '_');
  n = n.replace('_INFOBAR_2_', '_').replace('_INFOBAR_1_', '_');
  const nsplit = n.split('_');
  const sordlevel = nsplit[nsplit.length - 2];
  const songtype = nsplit[nsplit.length - 1];
  const songname = n.split('_-_')[0].replace(/_+/g, ' ');
  
  var shortname = songname + ' ' + sordlevel;
  if (songtype != 'ARCADE') {
    shortname = shortname + ' ' + songtype.toLowerCase();
  }
  return shortname;
}


export function getENPSColor(enps: number): string {
  if (enps < 1.5) {
    return '#7cb82f'
  } else if (enps < 4) {
    return '#efb920'
  } else if (enps < 8) {
    return '#f47b16'
  } else if (enps < 13) {
    return '#ec4339'
  }
  return '#ed4795'
}


export const skillToColor: StrToAny = {
  'jump': '#efb92080',
  'drill': '#ec433980',
  'run': '#ec433980',
  'anchor_run': '#ec433980',
  'run_without_twists': '#ec433980',
  'twists': '#00a0dc80',
  'twist_90': '#00a0dc80',
  'twist_over90': '#00a0dc80',
  'twist_close': '#00a0dc80',
  'twist_far': '#00a0dc80',
  'side3_singles': '#8c68cb80',
  'mid6_doubles': '#8c68cb80',
  'mid4_doubles': '#8c68cb80',
  'doublestep': '#efb92080',
  'jack': '#efb92080',
  'footswitch': '#efb92080',
  'bracket': '#60aa1480',
  'staggered_bracket': '#60aa1480',
  'bracket_run': '#60aa1480',
  'bracket_drill': '#60aa1480',
  'bracket_jump': '#60aa1480',
  'bracket_twist': '#60aa1480',
  '5-stair': '#00aeb380',
  '10-stair': '#00aeb380',
  'yog_walk': '#00aeb380',
  'mid6_pad_transition': '#00aeb380',
  'co-op_pad_transition': '#00aeb380',
  'split': '#ed479580',
  'hold_footslide': '#ed479580',
  'hold_footswitch': '#ed479580',
  'hands': '#ed479580',
  'bursty': '#f47b1680',
  'sustained': '#f47b1680',
}
const defaultColor = '#ed479580';

export function skillBadge(skill: string) {
  const color = skillToColor[skill] || defaultColor;
  let link = `/skill/${skill}`
  if (skill == 'twists') {
    link = `/skill/`
  }
  return (
    <span>
      <a href={link}
        style={`color:#eee;text-decoration:underline;background:${color};border-radius:8px;padding:2px;margin-left:3px;margin-right:3px`}
      >
        {skill.replace(/_/g, ' ')}
      </a>
    </span>
  );
}


export function secondsToTimeStr(inputTime: number): string {
  const time = Math.round(inputTime);
  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  function str_pad_left(string: string, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }
  const finalTime = str_pad_left(String(min), '0', 1) + ':' + str_pad_left(String(sec), '0', 2);
  return finalTime;
}