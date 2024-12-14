
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { checkEnvironment, fetchPageContent, fetchSkillData } from '../../lib/data';
import "./[skillname].css"
import { Show } from 'solid-js';


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
        <a href={url} style={`color:#00a0dc`}>
          {skillname}
        </a>
      </p>
    );
  }

  // Use createMemo to reactively compute the specific tier list
  const skillchartlist = createMemo(() => {
    const data = skillData();
    const indentSize = 50;
    if (data) {
      const skillChartDict: SkillDict = data;
      return (
        <ul style={`text-indent: -${indentSize}px; margin-left: ${indentSize}px`}>
          { Object.keys(skillChartDict).map((key) => ( makeSkillURL(key) )) }
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
  createEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Skills';
    }
  });

  return (
    <div style="background-color: #2e2e2e; height: 100%">
      <SkillLinks />
    </div>
  );
}