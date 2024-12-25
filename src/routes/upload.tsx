import { createSignal, createResource, onMount, createEffect, For, Resource } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { ChartData } from "~/lib/types";
import { Title } from "@solidjs/meta";

// Components
import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import chartDescription from "~/components/Chart/Description";
import LifebarPlot from "~/components/Chart/Lifebar";

import { JSONUploader } from "~/components/JsonUploader";
import { ChartDataProvider } from "~/components/ChartDataContext";
import { useChart } from "~/components/ChartDataContext";

import "~/styles/layout/chartvis.css"


// Types
type MutateFunction = (v: ChartData | ((prev: ChartData) => ChartData)) => void;


function UploaderOrVisualizer(): JSXElement {
  // Shows upload json button, or visualizer
  const { chartData, mutate, filename } = useChart();
  const [editorMode, setEditorMode] = createSignal(false);
  setEditorMode(true);

  return (
    <>
      <Title>Custom visualizer</Title>
      <div style={'background-color: #2e2e2e'}>

        <Show when={chartData() != null} 
          fallback=
          {
            <div style='max-width:800px;margin:auto;margin-top:50px'>
              <div class='text-[28px]' style={`color:#ddd;margin-top:50px;margin-bottom:50px`}>
                Upload a chart json file for visualization
              </div>
              <JSONUploader/>
              <div class='text-lg' style={`color:#888;margin-top:50px`}>
                Chart jsons are from piucenter's editor, which allows you to edit foot annotations and mark suggested misses.
                The editor lets you save chart json files to share with others. 
                <br/><br/>
                You can find and share chart json files in the <a href="https://discord.gg/aHbZsk7j2U">piucenter discord</a>.
              </div>
            </div>
          }
        >
          {/* Show visualizer */}

          <ChartProvider>
            <div class="columns-container" style={'overflow: hidden; padding: 0; background-color: #2e2e2e'}>
              {/* Column 1 */}
              <div 
                id="column1" 
                class="column" 
              >
                <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                  {chartData()?.metadata['TITLE']}
                  <hr style="border-color:#666" />
                </span>

                <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                  Custom uploaded chart json file:
                  <br/>
                  {filename()}
                  <hr style="border-color:#666" />
                </span>

                {chartData() && chartDescription(chartData()!.metadata)}

                <hr style="border-color:#666" />

                <Show when={editorMode()}>
                  <EditorPanel dataGet={chartData} />
                </Show>

                <div style={'height: 100%; overflow: auto'}>
                  <Show when={chartData()}>
                    <SegmentTimeline 
                      segments={chartData()!.segments}
                      segmentData={chartData()!.segmentdata}
                    />
                  </Show>
                </div>
              </div>

              {/* Column 2 */}
              <div 
                id="column2" 
                class="column" 
              >
                <div style={'background-color: #2e2e2e; height: 100%'}>
                  <ArrowCanvas
                    data={chartData()!}
                    mutate={mutate as MutateFunction}
                  />
                </div>
              </div>

              {/* Column 3 */}
              <div 
                id="column3" 
                class="column" 
              >
                <div style={'height: 100%; overflow: auto'}>
                  <Show when={chartData()}>
                    <ENPSTimeline data={chartData()!} />
                  </Show>
                </div>
              </div>

              {/* column 4 */}
              <div id="column4" 
                class='column'
              >
                <div style={'height: 100%; overflow: auto'}>
                  <LifebarPlot data={chartData()!}/>
                </div>
              </div>

            </div>
          </ChartProvider>

        </Show>

      </div>
    </>
  );
}

export default function UploaderPage(): JSXElement {
  return (
    <div>
      <ChartDataProvider>
        {UploaderOrVisualizer()}
      </ChartDataProvider>
    </div>
  );
}