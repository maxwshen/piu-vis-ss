import { useParams } from "@solidjs/router";
import { ChartData } from "~/lib/types";
import { Resource, Show } from "solid-js";

import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import LifebarPlot from "~/components/Chart/Lifebar";
import chartDescription from "~/components/Chart/Description";

import "~/styles/layout/chartvis.css"

type MutateFunction = (v: ChartData | ((prev: ChartData) => ChartData) | undefined) => void


export default function EditorCollection(
  chartData: Resource<ChartData | null>, 
  mutate: any,
  uploadFileName: string | null,
) {
  const params = useParams();
  
  return (
    <>
      <div style={'background-color: #2e2e2e'}>

        <ChartProvider>
          <div class="columns-container" style={'overflow: hidden; padding: 0; background-color: #2e2e2e'}>

            {/* column 1 */}
            <div id="column1" class='column'>
              
              {/* title */}
              <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                  {chartData()?.metadata['shortname'].replace('ARCADE', '').replace('INFOBAR_TITLE', '').replace('HALFDOUBLE', '').replace(/_/g," ")}
                  {chartData()?.manuallyAnnotatedFlag}
                  <hr style={`border-color:#666`}></hr>
              </span>
              <span> {chartData.loading && "Loading..."} </span>
              <span> {chartData.error && "Error"} </span>

              <Show when={uploadFileName != null}>
                <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                    Uploaded file:
                    <br/>
                    {uploadFileName}
                    <hr style="border-color:#666" />
                  </span>
              </Show>

              {chartData() && chartDescription(chartData()!.metadata)}

              <EditorPanel dataGet={chartData} />

              {/* instructions */}
              <div style={`background-color:#00a0dc60;color:#eee;padding:8px`}>
                <div class='font-medium' style={`text-align:center;margin-top:10px`}>
                  Editor mode
                </div>
                <span>Instructions:</span>
                <p>
                  1. Click a button, to set your click action
                  <br/>
                  2. Click arrows/holds
                </p>
                <br></br>
                <div style={`opacity:60%`}>
                  Important: Your annotations will be discarded if you close this page.
                  Save json to file to keep your annotations, and use the upload page
                  to continue where you left off.
                </div>
              </div>

              {/* <div style={'height: 100%; overflow: auto'}>
                <SegmentTimeline 
                  segments={segments} segmentData={segmentdata}
                />
              </div> */}

            </div>

            <div id="column2" class='column'>
              <div style={'background-color: #2e2e2e; height: 100%'}>
                <ArrowCanvas data={chartData()!} mutate={mutate}/>
              </div>
            </div>

            <div id="column3" class='column'>
              <div style={'height: 100%; overflow: auto'}>
                <ENPSTimeline data={chartData()!} />
              </div>
            </div>

            <div id="column4" class='column'>
              <div style={'height: 100%; overflow: auto'}>
                <LifebarPlot data={chartData()!}/>
              </div>
            </div>

          </div>
        </ChartProvider>
      </div>

    </>
  );
}