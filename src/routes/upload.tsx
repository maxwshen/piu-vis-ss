import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, createEffect, For, Resource } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { fetchData } from '~/lib/data';
import { ArrowArt, HoldArt, Segment, StrToAny } from '~/lib/types';
import { getShortChartName, getShortChartNameWithLevel } from '~/lib/util';
import Nav from '~/components/Nav';
import "./chart/[id].css"
import { ChartData } from "~/lib/types";
import { Title } from "@solidjs/meta";

// Components
import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import chartDescription from "~/components/Chart/Description";

import { JSONUploader } from "~/components/JsonUploader";
import { ChartDataProvider } from "~/components/ChartDataContext";
import { useChart } from "~/components/ChartDataContext";


// Types
type MutateFunction = (v: ChartData | ((prev: ChartData) => ChartData)) => void;

interface SimilarChartsProps {
  metadata: StrToAny;
}

// Helper Components
const similarCharts = ({ metadata }: SimilarChartsProps): JSXElement => {
  if (!metadata) {
    return null;
  }

  const makeSimilarChartsList = (level: string, chartList: string[]): JSXElement => {
    return (
      <p>{level}: 
        <For each={chartList}>
          {(chart: string) => (
            <span>
              <a href={`/chart/${chart}`} 
                style={`color:#aaa;text-decoration:underline`}
              >
                {getShortChartName(chart)}
              </a>
              &ensp;
            </span>
          )}
        </For>
      </p>
    );
  };

  return (
    <div class="font-small" style="color:#aaa">
      <span style={`color:#bbb;display:flex;justify-content:center;margin-top:10px;margin-bottom:10px`}>
        Similar charts
      </span>
      <Show 
        when={metadata['Similar charts'] && Object.keys(metadata['Similar charts']).length > 0}
        fallback={<></>}
      >
        <div>
          <For each={Object.entries(metadata['Similar charts'])}>
            {([key, valueList]) => (
              makeSimilarChartsList(key, valueList as string[])
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};



function UploaderOrVisualizer(): JSXElement {
  // Shows upload json button, or visualizer
  const { chartData, mutate, filename } = useChart();
  const [editorMode, setEditorMode] = createSignal(false);
  setEditorMode(true);

  return (
    <>
      <Title>Custom visualizer</Title>
      <div>{Nav()}</div>
      <div style={'background-color: #2e2e2e'}>

        <Show when={chartData() != null} 
          fallback=
          {
            <div style='max-width:800px;margin:auto;margin-top:50px'>
              <JSONUploader/>
              <div class='text-lg' style={`color:#888;margin-top:50px`}>
                Upload a chart json file to visualize it.
                <br/><br/>
                Where can you get chart jsons? Piucenter's editor allows you to edit foot annotations, mark suggested misses, and save these custom annotations to json file. You can use the editor to get chart jsons to re-visualize here, or get chart jsons shared by people in the community. 
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