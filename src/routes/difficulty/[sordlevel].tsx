
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { isServer } from 'solid-js/web';
import { useParams } from "@solidjs/router";
import { checkEnvironment, fetchPageContent, fetchSkillData } from '../../lib/data';
import Nav from '../../components/Nav';
// import "./[sordlevel].css"
import { Show } from 'solid-js';
import { getShortChartName } from '~/lib/util';


interface searchItemType {
  name: string,
  url: string,
}

interface StrToAny {
  [key: string]: any;
};

const [chartLevel, setChartLevel] = createSignal<number>(13);


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
    <div class='legend'>
      <span style={"color: #ddd"}> Legend: &emsp;</span>
      <span style={`color:#e2247f`}>■ Very hard &emsp;</span>
      <span style={`color:#ec4339`}>■ Hard &emsp;</span>
      <span style={`color:#efb920`}>■ Moderate &emsp;</span>
      <span style={`color:#7cb82f`}>■ Easier &emsp;</span>
    </div>
  );
}


function makeDifficultyNavigatorWheel() {
  const radius = 3;
  const chart_level = chartLevel();

  // Function to generate URL for a specific difficulty
  function makeURL(sord: string, level: number) {
    var lower = 1;
    var upper = 28;
    if (sord == 'S') {
      upper = 26;
    } else if (sord == 'D') {
      lower = 4;
    }

    const opacity = 0.8 - (Math.abs(chart_level - level) / 5);

    return (
      <Show 
        when={(level >= lower) && (level <= upper)} 
        fallback={
          <span style={`width:40px;display:inline-block;text-align:center`}>
          </span>
        }
      >
        <span style={`width:40px;display:inline-block;text-align:center`}>
          <a 
            href={`/difficulty/${sord}${level}`} 
            class="difficulty-link"
            style={`color:#ddd;opacity:${opacity};text-decoration: underline`}
          >
            {sord}{level}
          </a>
        </span>
      </Show>
    );
  }

  // Generate difficulty navigation links
  const difficultyLinks = () => {
    const links = [];

    // Add numerical difficulty links
    for (
      let level = chart_level - radius; 
      level <= chart_level + radius; 
      level++
    ) {
      links.push(makeURL('S', level));
    }
    links.push(<br></br>)
    for (
      let level = chart_level - radius; 
      level <= chart_level + radius; 
      level++
    ) {
      links.push(makeURL('D', level));
    }

    return links;
  };

  return (
    <div class="difficulty-navigator">
      <p style={`color:#ddd`}>Navigation</p>
      {difficultyLinks()}
    </div>
  );
}


function DifficultyTierList(props: { sordlevel: string }) {
  // Create resource for tier list data
  const [tierListData] = createResource(fetchTierListData);
  // const chartLevel = ;
  setChartLevel(Number(props.sordlevel.slice(1)));

  // Type definition for your dictionary
  type TierListDict = {
    [key: string]: [string[], number[]]
  };

  function makeColoredURL(chart: string, predLevel: number) {
    const shortName = getShortChartName(chart);
    const url = '/chart/' + chart;
    return (
      <span>
        <a
          href={url}
          style={`color:${getColor(predLevel, chartLevel())};text-decoration: underline`}
        >
          {shortName}
        </a>
        <span style={`color: #ddd`}>&emsp;</span>
      </span>
    );
  }

  function makeRow(key: string, charts: string[], predLevels: number[]): JSXElement {
    const zipped = charts.map((chart, i) => [chart, predLevels[i]]);
    
    const key1 = key.split('\n')[0];
    const key2 = key.split('\n')[1];

    return (
      <li style={`margin-bottom: 20px`}>
        <span style={"text-style: bold; color: #ddd"}>{key1}</span> 
        <span style={"text-style: bold; color: #888"}> ({key2})<br></br></span> 
        {zipped.map(([chart, predLevel]) => (
          makeColoredURL(String(chart), Number(predLevel))
        ))}
      </li>
    );
  }

  // Use createMemo to reactively compute the specific tier list
  const tierlist = createMemo(() => {
    const data = tierListData();
    const indentSize = 50;
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
    <div class="container">
      <div>
        <span class='font-medium' style={"color: #ddd;font-size:24px"}>
          Difficulty tier list: {props.sordlevel}
        </span>
        <span>
          {makeLegend()}
        </span>
        <div>
          {makeDifficultyNavigatorWheel()}
        </div>
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

  const [currentParams, setCurrentParams] = createSignal(params);

  // Optional: React to param changes
  createEffect(() => {
    // This will run whenever the params change    
    setChartLevel(Number(currentParams().sordlevel.slice(1)));

    if (typeof document !== 'undefined') {
      document.title = params.sordlevel;
    }
  });

  return (
    <div>
      <div>{Nav()}</div>
      <div style="background-color: #2e2e2e; height: 100%">
        <DifficultyTierList sordlevel={params.sordlevel} />
      </div>
    </div>
  );
}