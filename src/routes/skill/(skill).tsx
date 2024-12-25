
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { fetchSkillData } from '../../lib/data';
import { Show } from 'solid-js';
import { skillBadge } from "~/lib/util";


function SkillLinks(props: { }) {
  // Create resource for tier list data
  const [skillData] = createResource(fetchSkillData);

  // Type definition for your dictionary
  type SkillDict = {
    [key: string]: Map<string, string[]>
  };

  function makeSkillURL(skillname: string) {
    const url = '/skill/' + skillname;
    return (
      <p>
        <a href={url} style={`color:#00a0dc; text-decoration: underline`}>
          {skillname.replace('_', ' ')}
        </a>
      </p>
    );
  }

  // Use createMemo to reactively compute the specific tier list
  const skillchartlist = createMemo(() => {
    const data_and_descriptions = skillData();
    const indentSize = 50;
    if (data_and_descriptions) {
      const data = data_and_descriptions[0];
      const skillChartDict: SkillDict = data;
      return (
        <ul style={`text-indent: -${indentSize}px; margin-left: ${indentSize}px`}>
          { Object.keys(skillChartDict).map((key) => ( 
            <p style={`margin-bottom:5px`}>{skillBadge(key)}</p> 
          )) }
        </ul>
      );
    }
    return null;
  });

  return (
    <div class="container">
      <div>
        <span class='font-medium' style={"color: #ddd;font-size:24px"}>
          Skills
        </span>
      </div>
      <div style={`margin-top: 10px`}>
        <span style={`color:#888`}>
          Stepcharts can test a variety of skills, patterns, and techniques.
          <br></br>
          Each page below describes a skill, and lists stepcharts for practicing that skill.
          <br></br>
        </span>
      </div>
      <div style="margin-top: 20px">
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
  createEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Skills';
    }
  });

  return (
    <div>
      <div style="background-color: #2e2e2e; height: 100%">
        <SkillLinks />
      </div>
    </div>
  );
}