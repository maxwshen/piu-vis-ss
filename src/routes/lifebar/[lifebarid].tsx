import { useParams } from "@solidjs/router";
import { createSignal, createResource, createEffect } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { fetchData } from '~/lib/data';
import { Segment, StrToAny, ArrowArt, HoldArt } from '~/lib/types';
import { getShortChartNameWithLevel } from '~/lib/util';

import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import LifebarPlot from "~/components/Chart/Lifebar";
import chartDescription from "~/components/Chart/Description";
import { ChartData } from "~/lib/types";

import "~/styles/layout/chartvis.css"

const [activeColumn, setActiveColumn] = createSignal('column1');
const [editorMode, setEditorMode] = createSignal(false);


/**
 * Default function, drawn by solid.js
 * @returns 
 */
export default function DynamicPage(): JSXElement {
  // Stores current route path; /chart/:id = params.lifebarid = [id].tsx
  const params = useParams();
  const [currentParams, setCurrentParams] = createSignal(params.lifebarid);

  // Refetches data whenever params.lifebarid changes
  const [chartData, { mutate, refetch }] = createResource<ChartData, string>(
    () => params.lifebarid,
    async (id: string) => {
      const result = await fetchData(id);
      if (!result) {
        throw new Error('Failed to fetch chart data');
      }
  
      const metadata = result[2] as StrToAny;
      if (!metadata) {
        throw new Error('Missing metadata in chart data');
      }
  
      const chartData = {
        arrowarts: result[0] as ArrowArt[] || [],
        holdarts: result[1] as HoldArt[] || [],
        metadata,
        segments: metadata['Segments'] as Segment[] || [],
        segmentdata: metadata['Segment metadata'] as StrToAny[] || [],
        manuallyAnnotatedFlag: metadata['Manual limb annotation'] ? '✅' : ''
      };
      return chartData;
    }
  );

  // Update document title when params change
  createEffect(() => {
    if (typeof document !== 'undefined' && params.lifebarid) {
      document.title = getShortChartNameWithLevel(params.lifebarid);
    }
  });

  // Use createEffect to update document title
  createEffect(() => {
    if (typeof document !== 'undefined' && currentParams()) {
      document.title = getShortChartNameWithLevel(currentParams());
    }
  });

  return (
    <>
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
                  {params.lifebarid.replace('ARCADE', '').replace('INFOBAR_TITLE', '').replace('HALFDOUBLE', '').replace(/_/g," ")}
                  {chartData()?.manuallyAnnotatedFlag}
                  <hr style={`border-color:#666`}></hr>
              </span>
              <span> {chartData.loading && "Loading..."} </span>
              <span> {chartData.error && "Error"} </span>

              {chartData() && chartDescription(chartData()!.metadata)}

              <Show when={editorMode()}>
                <EditorPanel dataGet={chartData} />
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
                  <p>The lifebar calculator uses red to show your "bleed" compared to perfect play. The calculator does not support missing holds. Pro tip: don't miss holds! Hold tick counts are listed in the arrows canvas.</p>
                  <br></br>
                  <p>Freeze life % until first miss: Fixes life, resuming life calculations after the first miss. Use this to simulate entering a section with any life amount.</p>
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
                <ArrowCanvas data={chartData()!} mutate={mutate}/>
              </div>
            </div>

            <div id="column3" class={`column ${activeColumn() === 'column3' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
              <div style={'height: 100%; overflow: auto'}>
                <ENPSTimeline data={chartData()!} />
              </div>
            </div>

            <div id="column4" class={`column ${activeColumn() === 'column3' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
              <div style={'height: 100%; overflow: auto'}>
                <LifebarPlot data={chartData()!}/>
              </div>
            </div>

          </div>
        </ChartProvider>
      </div>

    </>
  );
};
