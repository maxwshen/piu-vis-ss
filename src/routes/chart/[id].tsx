import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, createEffect, For, Resource } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { fetchData } from '~/lib/data';
import { ArrowArt, ChartArt, HoldArt, Segment, StrToAny } from '~/lib/types';
import { getShortChartName, getShortChartNameWithLevel, forceRefresh } from '~/lib/util';
import Nav from '~/components/Nav';
import "./[id].css"
import { ChartData } from "~/lib/types";

// Components
import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import chartDescription from "~/components/Chart/Description";

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



export default function DynamicPage(): JSXElement {
  const params = useParams();
  const [editorMode, setEditorMode] = createSignal(false);
  
  const [chartData, { mutate, refetch }] = createResource<ChartData, string>(
    () => params.id,
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
    if (typeof document !== 'undefined' && params.id) {
      document.title = getShortChartNameWithLevel(params.id);
    }
  });

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editFlag = urlParams.get('edit');
    if (editFlag) {
      setEditorMode(Boolean(editFlag));
    }
  });

  return (
    <>
      <div>{Nav()}</div>
      <div style={'background-color: #2e2e2e'}>

        <ChartProvider>
          <div class="columns-container" style={'overflow: hidden; padding: 0; background-color: #2e2e2e'}>
            {/* Column 1 */}
            <div 
              id="column1" 
              class="column" 
            >
              <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                {params.id.replace('ARCADE', '').replace('INFOBAR_TITLE', '').replace('HALFDOUBLE', '').replace(/_/g," ")}
                {chartData()?.manuallyAnnotatedFlag}
                <hr style="border-color:#666" />
              </span>

              <span>{chartData.loading && "Loading..."}</span>
              <span>{chartData.error && "Error"}</span>

              <Show when={editorMode()}>
                <EditorPanel dataGet={chartData} />
              </Show>

              {chartData() && chartDescription(chartData()!.metadata)}

              <hr style="border-color:#666" />

              <div style="text-align:center">
                <a 
                  href={`/lifebar/${params.id}`}
                  // onClick={(e) => {forceRefresh(e, `/lifebar/${params.id}`)}}
                >
                  Use lifebar calculator
                </a>
              </div>

              <hr style="border-color:#666" />

              {chartData() && similarCharts({ metadata: chartData()!.metadata })}

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
                {/* <Show when={chartData()} fallback={'Loading, or failed to find chart'}>
                  <ArrowCanvas
                    data={chartData()!}
                    mutate={mutate as MutateFunction}
                  />
                </Show> */}
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
      </div>
    </>
  );
}