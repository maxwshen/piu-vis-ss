
import { createSignal, createResource, createMemo, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For, JSXElement, Resource} from "solid-js";
import { useParams } from "@solidjs/router";
import { marked } from 'marked';
import frontMatter from 'front-matter';
import { fetchSkillData } from '../../lib/data';
import { getShortChartName, skillBadge } from '~/lib/util';

const [mdContent, setMDContent] = createSignal('');
const [htmlContent, setHtmlContent] = createSignal('');
const [isMounted, setIsMounted] = createSignal(false);


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
        <a href={url} style={`color:#00a0dc; text-decoration: underline`}>
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
    if (skillData.error) {
      return (<p>Error loading data</p>)
    };
    const data_and_descriptions = skillData();
    const indentSize = 50;
    if (data_and_descriptions) {
      const data = data_and_descriptions[0];
      const descriptions = data_and_descriptions[1];
      const skillChartDict: SkillDict = data[props.skillname];
      return (
        <div>
          {/* description in json */}
          {/* <div style="margin-bottom:20px">
            <span style="color:#ddd">
              {descriptions[props.skillname]}
            </span>
          </div> */}

          {/* markdown description */}
          <div 
            class="markdown-content prose prose-invert max-w-none mx-auto px-4"
            style={`font-size:1rem;padding-bottom:0rem;margin:0rem;max-width:100%;padding:0rem`}
            innerHTML={htmlContent()} 
          />

          {/* list */}
          <ul style={`text-indent: -${indentSize}px; margin-left: ${indentSize}px`}>
            { Object.entries(skillChartDict).map(([key, charts]) => ( makeRow(key, charts) )) }
          </ul>
        </div>
      );
    }
    return null;
  });

  return (
    <div class="container">
      <div>
        <span class='font-medium' style={"color: #ddd;font-size:24px"}>
          Skill: {skillBadge(props.skillname)}
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
  // Stores current route path; /skill/[skillname] = params.skillname
  const params = useParams();

  const [currentParams, setCurrentParams] = createSignal(params.skillname);

  onMount(() => {
    setIsMounted(true);
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  });

  createEffect(() => {
    setCurrentParams(params.skillname);
  });

  const [content] = createResource(currentParams, async (slug) => {
    try {
      const markdown = await import(`~/content/skills/${slug}.md`);
      const { attributes, body } = frontMatter(markdown.default);
      return body;
    } catch (error) {
      console.error('Error loading markdown:', error);
      return '';
    }
  });

  // Optional: React to param changes
  createEffect(() => {
    // This will run whenever the params change
    if (typeof document !== 'undefined') {
      document.title = params.skillname.replace(/_/g, ' ');
    }

    if (isMounted()) {

      // set 
      const parseContent = async () => {
        const parsedContent = await marked(content()!);
        setMDContent(parsedContent);
      }
      parseContent();
      setHtmlContent(mdContent());
    }
  });

  return (
    <div>
      <div style="background-color: #2e2e2e; height: 100%">
        <SkillList skillname={params.skillname} />
      </div>
    </div>
  );
}