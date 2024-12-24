import { Show, For } from 'solid-js';
import type { JSXElement } from 'solid-js';
import { StrToAny } from '~/lib/types';
import { roundToDecimals } from '~/lib/util';
import { getShortChartName, getShortChartNameWithLevel, skillBadge } from '~/lib/util';


export default function chartDescription(metadata: StrToAny): JSXElement {
  if (metadata === undefined) {
    return null;
  }
  function parseDisplayBPM(displaybpm: string | undefined): string {
    if (displaybpm === undefined) {
      return 'missing';
    }
    if (displaybpm.includes(':')) {
      let bpms = displaybpm.split(':');
      return `${Math.round(Number(bpms[0]))}~${Math.round(Number(bpms[1]))}`
    }
    return `${Math.round(Number(displaybpm))}`
  }
  const sordChartLevel = metadata['sord_chartlevel'];
  const pack = String(metadata['pack']).toLowerCase()
  const songtype = String(metadata['SONGTYPE']).toLowerCase()
  const songcategory = String(metadata['SONGCATEGORY']).toLowerCase()

  let query_list = [metadata['TITLE'], sordChartLevel];
  if (songtype.toLowerCase() != 'arcade') {
    query_list = [...query_list, songtype];
  }
  const youtube_query = 'pump+it+up+' + query_list.join('+');

  return (
    <div class="font-small" style="color:#aaa;margin-top:10px">

      {/* skill badges */}
      <Show 
        when={metadata['chart_skill_summary'] && metadata['chart_skill_summary'].length > 0}
        fallback={<></>}
      >
        <div style={`justify-content:center;text-align:center`}>
          <For each={metadata['chart_skill_summary']}>
            {(skill: string) => skillBadge(skill)}
          </For>
        </div>
      </Show>

      {/* pack - difficulty - songtype */}
      {/* <hr style={`border-color:#666`}></hr> */}
      <div style={`text-align:center`}>
        <span>{pack}&emsp;</span>
        <a href={"/difficulty/"+sordChartLevel}
          style={`color:#aaa;text-decoration:underline`}
          >{sordChartLevel}</a>
        <span>&emsp;{songtype}&emsp;{songcategory}</span>
        <Show when={'CHARTNAME' in metadata} fallback={<></>}>
          <p>{metadata['CHARTNAME']}</p>
        </Show>
        <p>BPM: {parseDisplayBPM(metadata['DISPLAYBPM'])}&emsp;
        Step artist: {metadata['CREDIT']}
        </p>
      </div>

      {/* notetype/bpm info */}
      <span style={`color:#bbb;display:flex;justify-content:center;margin-top:5px;margin-bottom:5px`}
      >
        <Show when={metadata['notetype_bpm_summary']}>
          <span>
            {metadata['notetype_bpm_summary']}
            <br></br>
            {roundToDecimals(metadata['nps_summary'], 1)} notes per second
          </span>
        </Show>
      </span>

      {/* youtube */}
      <span style={`color:#bbb;display:flex;justify-content:center;margin-bottom:5px`}>
        <a href={`https://www.youtube.com/results?search_query=${youtube_query}`}
          target="_blank" rel="noopener noreferrer"
        >
          Find chart on YouTube
        </a>
      </span>

    </div>
);
};