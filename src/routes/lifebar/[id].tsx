import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, onCleanup, createEffect, For } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { useNavigate } from "@solidjs/router";
import { checkEnvironment, fetchData } from '~/lib/data';
import { ChartArt, Segment, StrToAny } from '~/lib/types';
import { getShortChartName, getShortChartNameWithLevel, skillBadge } from '~/lib/util';
import Nav from '~/components/Nav';
import "./[id].css"
import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import LifebarPlot from "~/components/Chart/Lifebar";
import chartDescription from "~/components/Chart/Description";

const [activeColumn, setActiveColumn] = createSignal('column1');
const [editorMode, setEditorMode] = createSignal(false);


/**
 * Default function, drawn by solid.js
 * @returns 
 */
export default function DynamicPage(): JSXElement {
  // Stores current route path; /chart/:id = params.id = [id].tsx
  const params = useParams();
  const [currentParams, setCurrentParams] = createSignal(params.id);

  // Refetches data whenever params.id changes
  const [data, { mutate, refetch }] = createResource(currentParams, fetchData);

  // Add an effect to update currentParams when route changes
  createEffect(() => {
    // Ensure we're updating the signal to trigger a re-fetch
    if (params.id !== currentParams()) {
      setCurrentParams(params.id);
    }
  });

  // Use createEffect to update document title
  createEffect(() => {
    if (typeof document !== 'undefined' && currentParams()) {
      document.title = getShortChartNameWithLevel(currentParams());
    }
  });

  let metadata: StrToAny = {};
  let segments: Segment[] = [];
  let segmentdata: StrToAny[] = [];
  let manuallyAnnotatedFlag: string = '';
  if ( data() ) {
    metadata = data()![2];
    segments = metadata['Segments'];
    segmentdata = metadata['Segment metadata'];

    if (metadata['Manual limb annotation']) {
      manuallyAnnotatedFlag = '✅';
    }
  }

  onMount(() => {
    // Mobile tab functionality
    document.addEventListener('DOMContentLoaded', () => {
      const tabs = document.querySelectorAll('.mobile-tab');
      const columns = document.querySelectorAll('.column');
  
      // Set first tab and column as active by default
      tabs[0].classList.add('active');
      columns[0].classList.add('active');
      console.log(tabs);

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          console.log(tab);
          // Remove active class from all tabs and columns
          tabs.forEach(t => t.classList.remove('active'));
          columns.forEach(c => c.classList.remove('active'));

          // Add active class to clicked tab and corresponding column
          tab.classList.add('active');
          // const columnId = tab.getAttribute('data-column');
          // document.getElementById(columnId).classList.add('active');
        });
      });
    });

    // handle back/forward buttons: kinda scuffed currently
    const navigate = useNavigate();
    // Create a signal to track current path
    const [currentPath, setCurrentPath] = createSignal(window.location.pathname);
    // Handle browser navigation events
    const handlePopState = (event: PopStateEvent) => {
      const newPath = window.location.pathname;
      
      // Only navigate if the path has actually changed
      if (newPath !== currentPath()) {
        window.history.pushState(null, '', currentPath());
        setCurrentPath(newPath);
        // navigate(newPath, { replace: true });

        // Navigate to the new page
        navigate(newPath, {
          resolve: false, 
          // Optional: you can pass state if needed
          // state: { someData: "value" }
        });
    
        // Reload the page after a short delay to ensure navigation
        setTimeout(() => {
          window.location.reload();
        }, 50);

      }
    };

    // Add event listener when component mounts
    window.addEventListener('popstate', handlePopState);

    // Clean up event listener when component unmounts
    onCleanup(() => {
      window.removeEventListener('popstate', handlePopState);
    });

    // handle editor mode in query string
    const urlParams = new URLSearchParams(window.location.search);
    const editFlag = urlParams.get('edit');
    if (editFlag) {
      setEditorMode(Boolean(editFlag));
    };

  });

  console.log('env: ', checkEnvironment());
  return (
    <>
      <div>{Nav()}</div>
      <div style={'background-color: #2e2e2e'}>

        <div class="mobile-tabs">
          <div 
            class={`mobile-tab ${activeColumn() === 'column1' ? 'active' : ''}`} 
            onClick={() => setActiveColumn('column1')}
          >
            Overview
          </div>
          <div 
            class={`mobile-tab ${activeColumn() === 'column2' ? 'active' : ''}`} 
            onClick={() => setActiveColumn('column2')}
          >
            Stepchart
          </div>
          <div 
            class={`mobile-tab ${activeColumn() === 'column3' ? 'active' : ''}`} 
            onClick={() => setActiveColumn('column3')}
          >
            Timeline
          </div>
        </div>

        <ChartProvider>
          <div class="columns-container" style={'overflow: hidden; padding: 0; background-color: #2e2e2e'}>

            {/* column 1 */}
            <div id="column1" class={`column ${activeColumn() === 'column1' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
              
              {/* title */}
              <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                  {currentParams().replace('ARCADE', '').replace('INFOBAR_TITLE', '').replace('HALFDOUBLE', '').replace(/_/g," ") + manuallyAnnotatedFlag}
                  <hr style={`border-color:#666`}></hr>
              </span>
              <span> {data.loading && "Loading..."} </span>
              <span> {data.error && "Error"} </span>

              {chartDescription(metadata)}

              <Show when={editorMode()}>
                <EditorPanel dataGet={data}/>
              </Show>

              {/* lifebar calculator instructions */}
              <div style={`background-color:#ec433960;color:#eee;padding:8px`}>
                <div class='font-medium' style={`text-align:center;margin-top:10px`}>
                  Lifebar calculator mode
                </div>
                <span>Instructions:</span>
                <p>
                  1. Click arrows to toggle miss/perfect judgment
                </p>
                <br></br>
                <div style={`opacity:60%`}>
                  <p>The lifebar calculator uses red to show your "bleed" compared to perfect play.</p>
                  <br></br>
                  <p>The calculator does not support missing holds. Pro tip: don't miss holds! Hold tick counts are listed in the arrows canvas.</p>
                  <br></br>
                  <p>Hide/show life overflow: Life above 100% is called "overflow". Any overflow amount appears as a full lifebar in-game. Life overflow can accrue up to a max that depends on the chart level.</p>
                  <br></br>
                  <p>Freeze life % until first miss: Use this to fix life to a specific %. Life calculations resume after the first marked miss. Use this to quickly study what happens if you enter a specific section with a specific amount of life.</p>
                </div>
              </div>

              {/* <div style={'height: 100%; overflow: auto'}>
                <SegmentTimeline 
                  segments={segments} segmentData={segmentdata}
                />
              </div> */}

            </div>

            <div id="column2" class={`column ${activeColumn() === 'column2' ? 'active' : ''}`} style={'float: left'}>
              <div style={'background-color: #2e2e2e; height: 100%'}>
                <ArrowCanvas dataGet={data} mutate={mutate}/>
              </div>
            </div>

            <div id="column3" class={`column ${activeColumn() === 'column3' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
              <div style={'height: 100%; overflow: auto'}>
                <ENPSTimeline dataGet={data} />
                {/* <LifebarPlot dataGet={data}/> */}
              </div>
            </div>

            <div id="column4" class={`column ${activeColumn() === 'column3' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
              <div style={'height: 100%; overflow: auto'}>
                <LifebarPlot dataGet={data}/>
              </div>
            </div>

          </div>
        </ChartProvider>
      </div>

    </>
  );
};
