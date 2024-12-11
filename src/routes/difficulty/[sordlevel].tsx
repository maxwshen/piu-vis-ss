
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { isServer } from 'solid-js/web';
import { useParams } from "@solidjs/router";
import { checkEnvironment, fetchPageContent } from '../../lib/data';
import "./[sordlevel].css"

interface searchItemType {
  name: string,
  url: string,
}

interface StrToAny {
  [key: string]: any;
};


/**
 * Fetches search struct data
 * @param id: json filename
 * @returns 
 */
async function fetchTierListData(): Promise<StrToAny | null> {
  try {
    const response = await fetch(
      checkEnvironment() + `/chart-jsons/120524/page-content/tierlists.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const tierListData: StrToAny = await response.json();
    return tierListData;
  } catch (error) {
    console.error('Error fetching tier list data:', error);
    return null;
  }
}


function getColor(predLevel: number, chartLevel: number): string {
  if (predLevel >= chartLevel + 1.0) {
    return '#e2247f'
  } else if (predLevel >= chartLevel + 0.5) {
    return '#ec4339'
  } else if (predLevel >= chartLevel - 0.3) {
    return '#efb920'
  }
  return '#7cb82f'
}


function makeLegend() {
  return (
    <div>
      <span style={"color: #ddd"}> Legend: &emsp;</span>
      <span style={`color:#e2247f`}>■ Very Hard &emsp;</span>
      <span style={`color:#ec4339`}>■ Hard &emsp;</span>
      <span style={`color:#efb920`}>■ Moderate &emsp;</span>
      <span style={`color:#7cb82f`}>■ Easier &emsp;</span>
    </div>
  );
}


function getShortChartName(name: string) {
  var n = name.replace('_INFOBAR_TITLE', '_').replace('_HALFDOUBLE_', '_');
  const nsplit = n.split('_');
  const songtype = nsplit[nsplit.length - 1];
  const songname = n.split('_-_')[0].replace('_', ' ').replace('\_', ' ');
  
  var shortname = songname;
  if (songtype != 'ARCADE') {
    shortname = shortname + ' ' + songtype.toLowerCase();
  }
  return shortname;
}


function DifficultyTierList(props: { sordlevel: string }) {
  // Create resource for tier list data
  const [tierListData] = createResource(fetchTierListData);
  const chartLevel = Number(props.sordlevel.slice(1));

  // Type definition for your dictionary
  type TierListDict = {
    [key: string]: [string[], number[]]
  };

  function makeColoredURL(chart: string, predLevel: number) {
    const shortName = getShortChartName(chart);
    const url = '/chart/' + chart;
    return (
      <span>
        <a href={url} style={`color:${getColor(predLevel, chartLevel)}`}>
          {shortName}
        </a>
        <span style={`color: #ddd`}>&emsp;</span>
      </span>
    );
  }

  function makeRow(key: string, charts: string[], predLevels: number[]): JSXElement {
    const zipped = charts.map((chart, i) => [chart, predLevels[i]]);
    
    return (
      <li style={`margin-bottom: 20px`}>
        <span style={"text-style: bold; color: #ddd"}> {key}: </span> 
        {zipped.map(([chart, predLevel]) => (
          makeColoredURL(String(chart), Number(predLevel))
        ))}
      </li>
    );
  }

  // Use createMemo to reactively compute the specific tier list
  const tierlist = createMemo(() => {
    const data = tierListData();
    const indentSize = 100;
    if (data) {
      const tierListDict: TierListDict = data[props.sordlevel];
      return (
        <ul style={`text-indent: -${indentSize}px; margin-left: ${indentSize}px`}>
          { Object.entries(tierListDict).map(([key, [charts, predLevels]]) => ( makeRow(key, charts, predLevels) )) }
        </ul>
      );
    }
    return null;
  });

  return (
    <div style="margin-left:15%; margin-top: 50px;max-width:1000px">
      <div>
        <span class='font-medium' style={"color: #ddd;font-size:24px"}>
          Difficulty tier list: {props.sordlevel}
        </span>
        <span>
          {makeLegend()}
        </span>
      </div>
      <div style="margin-top: 50px">
        {/* Conditional rendering */}
        {tierListData.loading && <p>Loading...</p>}
        {tierListData.error && <p>Error loading data</p>}
        
        {/* Render tierlist if it exists */}
        {tierlist()}
      </div>
      <span style={"color: #666"}> <br></br>Difficulties are predicted using features like run length, twistiness, movement, and speed, and certain skills like double stepping, jacks, and brackets. The predictive model does not consider the life bar, or account for how the presence or absence of holds can impact difficulty of stage passing. </span>
    </div>
  );
}

export default function Page(): JSXElement {
  // Stores current route path; /chart/:id = params.id = [id].tsx
  const params = useParams();

  return (
    <div style="background-color: #2e2e2e; height: 100%">
      <DifficultyTierList sordlevel={params.sordlevel} />
    </div>
  );
}