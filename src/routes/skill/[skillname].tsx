
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { useParams } from "@solidjs/router";
import { checkEnvironment, fetchPageContent, fetchSkillData } from '../../lib/data';
import "./[skillname].css"
import { Show } from 'solid-js';


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



function SkillList(props: { skillname: string }) {
  // Create resource for tier list data
  const [skillData] = createResource(fetchSkillData);

  // Type definition for your dictionary
  type SkillDict = {
    [key: string]: string[]
  };

  function makeURL(chart: string) {
    const shortName = getShortChartName(chart);
    const url = '/chart/' + chart;
    return (
      <span>
        <a href={url} style={`color:#00a0dc`}>
          {shortName}
        </a>
        <span style={`color: #ddd`}>&emsp;</span>
      </span>
    );
  }

  function makeRow(key: string, charts: string[]): JSXElement {
    return (
      <li style={`margin-bottom: 0px`}>
        <span style={"text-style: bold; color: #ddd"}>{key}: </span> 
        {charts.map((chart) => (
          makeURL(String(chart)))
        )}
      </li>
    );
  }

  // Use createMemo to reactively compute the specific tier list
  const skillchartlist = createMemo(() => {
    const data = skillData();
    const indentSize = 50;
    if (data) {
      const skillChartDict: SkillDict = data[props.skillname];
      return (
        <ul style={`text-indent: -${indentSize}px; margin-left: ${indentSize}px`}>
          { Object.entries(skillChartDict).map(([key, charts]) => ( makeRow(key, charts) )) }
        </ul>
      );
    }
    return null;
  });

  return (
    <div class="container">
      <div>
        <span class='font-medium' style={"color: #ddd;font-size:24px"}>
          Skill: {props.skillname}
        </span>
      </div>
      <div style="margin-top: 50px">
        {/* Conditional rendering */}
        {skillData.loading && <p>Loading...</p>}
        {skillData.error && <p>Error loading data</p>}
        
        {/* Render skill chart list if it exists */}
        {skillchartlist()}
      </div>
    </div>
  );
}

export default function Page(): JSXElement {
  // Stores current route path; /skill/[skillname] = params.skillname
  const params = useParams();

  const [currentParams, setCurrentParams] = createSignal(params);

  // Optional: React to param changes
  createEffect(() => {
    // This will run whenever the params change
    if (typeof document !== 'undefined') {
      document.title = params.skillname;
    }
  });

  return (
    <div style="background-color: #2e2e2e; height: 100%">
      <SkillList skillname={params.skillname} />
    </div>
  );
}