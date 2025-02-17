import { onMount, createSignal, createEffect, onCleanup } from "solid-js";
import { isServer } from 'solid-js/web';
import { useLocation } from '@solidjs/router'
import { ChartArt, Segment, HoldTick, StrToAny } from '~/lib/types';
import { secondsToTimeStr } from '~/lib/util';
import { useChartContext } from "~/components/Chart/ChartContext";
import { ChartData } from "~/lib/types";

const [showOverflow, setShowOverflow] = createSignal(true);
const [minHealth, setMinHealth] = createSignal(500);
const [freezeLifePct, setFreezeLifePct] = createSignal<number | string>('');


function calcHealths(data: ChartData, missTimes: number[]) {
  // based on https://github.com/Team-Infinitesimal/Infinitesimal/blob/lts/Modules/PIU/Gameplay.Life.lua
  const arrowArts = data['arrowarts'];
  const metadata = data['metadata'];

  let arrowTimes = arrowArts.map((aa) => aa[1]);
  let uniqueArrowTimes = new Set(arrowTimes);
  const uniqueSortedArrowTimes = [...uniqueArrowTimes].sort((a, b) => a - b);

  let holdticks: Array<HoldTick> = metadata['Hold ticks'];
  let holdTickStartTimes = holdticks.map((ht) => ht[0]);
  let holdTickEndTimes = holdticks.map((ht) => ht[1]);
  let holdTickCounts = holdticks.map((ht) => ht[2]);

  const allUniqueTimes = [...new Set([...uniqueSortedArrowTimes, ...holdTickEndTimes])].sort((a, b) => a - b);

  const chartLevel = Number(metadata['METER']);
  var lifeMax = 1000 + 3 * chartLevel * chartLevel;

  let healFactor = 100;
  const healFactorMax = 800;
  const healFactorMiss = -700;

  let times: number[] = [0];
  let currLife = 500;
  if (freezeLifePct() != '') {
    currLife = 10 * Number(freezeLifePct());
  }
  let healths: number[] = [currLife];
  for (let i = 0; i < allUniqueTimes.length; i++) {
    const t = allUniqueTimes[i];

    if (missTimes.includes(t)) {
      // handle miss
      currLife = currLife - 500 * Math.min(currLife, 1000) / 2000 - 20
      currLife = Math.max(0, currLife);
      healFactor = Math.max(0, healFactor + healFactorMiss)
    } else {
      // handle perfect
      currLife = Math.min(currLife + 12 * healFactor / 1000, lifeMax);
      healFactor = Math.min(healFactor + 20, healFactorMax);
    }

    // holds: increase life at end of hold
    if (holdTickEndTimes.includes(t)) {
      let idx = holdTickEndTimes.indexOf(t);
      let counts = holdTickCounts[idx];
      for (let ct = 0; ct < counts; ct++) {
        currLife = Math.min(currLife + 12 * healFactor / 1000, lifeMax);
        healFactor = Math.min(healFactor + 20, healFactorMax);
      }
    }

    // handle freeze life before first miss
    if (freezeLifePct() != '') {
      if (t < Math.min(...missTimes) ) {
        currLife = Math.min(10 * Number(freezeLifePct()), lifeMax);
      }
    }

    times = [...times, t];
    healths = [...healths, currLife];

    // if no more misses and already at max life, break
    // plotter will draw continued rectangle to end of chart
    // this is nice, but incompatible with drawing difference from perfect play
    // if (Math.max(...missTimes) < t && currLife === lifeMax) {
    //   break;
    // }
  }
  return [times, healths];
}


interface Props {
  data: ChartData;

}


export default function LifebarPlot(props: Props) {
  let plotContainerRef: HTMLDivElement;

  const {
    scrollContainerRef,
    canvasScrollPositionMirror,
    setClickTo,
    pxPerSecond,
    missTimes,
    setMissTimes,
  } = useChartContext();

  onMount(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer ) return;

    import('konva').then((Konva) => {
      const data = props.data;
      const metadata = data['metadata'];

      const timelineData: number[] = metadata['eNPS timeline data'];
      const nSeconds = timelineData.length;
      const chartLevel = Number(metadata['METER']);
      var lifeMax = 1000 + 3 * chartLevel * chartLevel;

      // plot using data structure
      const headerHeight = 30;
      // const stageWidth = 290;
      const stageWidth = 250;
      const plotHeight = window.innerHeight - 220;
      // console.log(plotContainerRef.clientHeight);
      const plotLeftX = 50;
      // const plotWidth = 200;
      const plotWidth = stageWidth - plotLeftX - 40;
      const stageHeight = headerHeight + plotHeight + 10;

      const fontSize = 14;

      const plotPxPerSecond = plotHeight / nSeconds;

      function timeToDrawingY(time: number): number {
        return headerHeight + time * plotPxPerSecond;
      }

      // create stage and layers
      const stage = new Konva.default.Stage({
        container: plotContainerRef,
        width: stageWidth,
        height: stageHeight,
      });
      const layer1 = new Konva.default.Layer();
      // layerPlot holds the actual plot, to be re-rendered when missTimes changes
      const layerPlot = new Konva.default.Layer();
      
      // plot lifebar, reactive to missTimes updating
      createEffect(() => {
        let misses = missTimes();
        let [times, healths] = calcHealths(data, misses);
        setMinHealth(Math.min(...healths));

        let perfectPlayHealths: number[] = [];
        if (freezeLifePct() != '') {
          let [perfectPlayTimes, pph] = calcHealths(
            data, [Math.min(...misses)]
          );
          perfectPlayHealths = pph;
        } else {
          let [perfectPlayTimes, pph] = calcHealths(data, []);
          perfectPlayHealths = pph;
        }

        layerPlot.destroyChildren();

        function healthToDrawWidth(health: number): number {
          if (!showOverflow()) {
            return Math.min(1, health / 1000) * plotWidth;
          } else {
            return Math.min(1, health / lifeMax) * plotWidth;
          }
        }

        // draw x-axis
        var xAxisLine = new Konva.default.Line({
          points: [plotLeftX, headerHeight, plotLeftX + plotWidth, headerHeight],
          stroke: '#888',
          strokeWidth: 1,
        })
        layerPlot.add(xAxisLine);

        // draw x-axis ticks
        let lifeThresholds = [500, 1000, lifeMax];
        if (!showOverflow()) {
          lifeThresholds = [100, 500, 1000];
        }
        for (let i: number = 0; i < lifeThresholds.length; i++) {
          const health = lifeThresholds[i];
          const x = plotLeftX + healthToDrawWidth(health);
          var tick = new Konva.default.Line({
            points: [x, headerHeight - 3, x, headerHeight + 3],
            stroke: '#888',
            strokeWidth: 1,
          })
          layerPlot.add(tick);

          const tickText = new Konva.default.Text({
            text: `${Math.round(health / 10)}%`,
            x: x - 5,
            y: headerHeight - 18,
            fontSize: 14,
            fill: '#bbb',
            align: 'right',
          });
          layerPlot.add(tickText);
        }

        // plot life
        for (let i = 0; i < times.length; i++) {
          const time = times[i];
          const health = healths[i];
          const perfectHealth = perfectPlayHealths[i];

          // draw rectangle to next health update time
          let nextTime = 0;
          let nextHealth = 0;
          if (i < times.length - 1) {
            nextTime = times[i + 1];
            nextHealth = healths[i + 1];
          } else {
            nextTime = nSeconds;
            nextHealth = health;
          }

          // draw line connecting curr time/health to next time health
          var line = new Konva.default.Line({
            points: [
              plotLeftX + healthToDrawWidth(health), timeToDrawingY(time), 
              plotLeftX + healthToDrawWidth(nextHealth), timeToDrawingY(nextTime)
            ],
            stroke: '#888',
            strokeWidth: 1,
          })
          layerPlot.add(line);

          // draw bleed
          const x = plotLeftX + healthToDrawWidth(health);
          if (health < perfectHealth) {
            const remWidth = Math.max(healthToDrawWidth(perfectHealth) - healthToDrawWidth(health), 1);
            let color = '#888';
            if (health <= 0) {
              color = '#fff'
            } else if (health <= 50) {
              color = '#ec4339'
            } else if (remWidth > 1) {
              color = '#ec433980'
            }
            var rect = new Konva.default.Rect({
              x: x,
              y: timeToDrawingY(time),
              width: remWidth,
              height: Math.max(1, timeToDrawingY(nextTime) - timeToDrawingY(time)),
              fill: color,
            })
            layerPlot.add(rect);
          }

          if (health <= 0) {
            var text = new Konva.default.Text({
              text: `death`,
              x: x - 50,
              y: timeToDrawingY(time),
              fontSize: 18,
              fill: '#fff',
            });
            layerPlot.add(text);
          }
        }

        layerPlot.batchDraw();
      });

      // draw y-axis
      var yAxisLine = new Konva.default.Line({
        points: [plotLeftX, headerHeight, plotLeftX, headerHeight + plotHeight],
        stroke: '#888',
        strokeWidth: 1,
      })
      layer1.add(yAxisLine);

      // draw header
      function drawHeader() {
        var text = new Konva.default.Text({
          text: `Life`,
          x: plotLeftX - 24,
          y: headerHeight - 18,
          fontSize: 14,
          fill: '#bbb',
        });
        layer1.add(text);  
      }
      drawHeader();

      function drawSegmentTimestamps() {
        // draw segment timestamps and levels
        const segments: Segment[] = metadata['Segments'];
        const segmentMetadata: StrToAny[] = metadata['Segment metadata'];
        const segmentSeparatorWidth = 10;
  
        function drawTimeStamp(time: number) {
          const y = timeToDrawingY(time);
          // lines
          var segmentStartLine = new Konva.default.Line({
            points: [
              plotLeftX - segmentSeparatorWidth / 2, y, 
              plotLeftX, y
            ],
            stroke: '#ddd',
            strokeWidth: 1,
          })
          layer1.add(segmentStartLine);
  
          // timestamp text
          const tt = secondsToTimeStr(time);
          const timeText = new Konva.default.Text({
            text: `${tt}`,
            x: plotLeftX - segmentSeparatorWidth - 30,
            y: y - 5,
            fontSize: fontSize,
            fill: '#bbb',
            align: 'right',
          });
          layer1.add(timeText);
        }
  
        for (let i: number = 0; i < segments.length; i++) {
          const segmentStartTime = segments[i][0];
          const segmentEndTime = segments[i][1];
          drawTimeStamp(segmentStartTime);
  
          // draw timestamp line and text for end of last section
          if (i == segments.length - 1) {
            drawTimeStamp(segmentEndTime);
          }
        }
      }
      drawSegmentTimestamps();

      // current scroll position tracker
      const viewportHeight = (800 / pxPerSecond()) * plotPxPerSecond;
      function drawPositionTracker(currTime: number) {
        var positionTracker = new Konva.default.Rect({
          x: 0,
          y: timeToDrawingY(currTime),
          width: stageWidth,
          height: viewportHeight,
          fill: 'white',
          opacity: 0.15,
          id: 'positionTracker',
        });
        layer1.add(positionTracker);
      };

      // Interactivity
      // current scroll position tracker
      drawPositionTracker(0);
      createEffect(() => {
        let y = canvasScrollPositionMirror();
        if (y) {
          const time = y / pxPerSecond();
          const node = layer1?.findOne(`#positionTracker`);
          node?.destroy();
          
          drawPositionTracker(time);
        }
      });

      onCleanup(() => {
        const node = layer1?.findOne(`#positionTracker`);
        node?.destroy();
      });

      // Interactivity on eNPS timeline, only in desktop mode. Disabled on mobile
      // scroll enps timeline stage to scroll chart
      if (window.innerWidth > 768) {

        // click on stage to scroll
        stage.on('click', function (e) {
          const y = stage.getPointerPosition()!.y
          const time = (y - headerHeight) / plotPxPerSecond;

          scrollContainerRef()!.scrollTo({
            top: time * pxPerSecond(),
            behavior: 'smooth'
          });

        });

        stage.container().addEventListener('wheel', function (e: WheelEvent) {
          scrollContainerRef()!.scrollBy({left: 0, top: 3 * e.deltaY});
        });
      }

      stage.add(layer1);
      stage.add(layerPlot);
    });

    // try to update miss times?
    let arrowarts = props.data.arrowarts;
    let initMissTimes: number[] = [];
    for (let i = 0; i < arrowarts.length; i++) {
      const [panelPos, time, limbAnnot] = arrowarts[i];

      if (limbAnnot.includes('miss')) {
        initMissTimes = [...initMissTimes, time];
      }
    }
    setMissTimes(initMissTimes);
  });

  const location = useLocation();
  createEffect(() => {
    if (location.pathname.includes('lifebar')) {
      setClickTo({
        'type': 'miss', 
        'l': 'l_miss', 
        'r': 'r_miss', 
        'e': 'e_miss', 
        'l_miss': 'l', 
        'r_miss': 'r', 
        'e_miss': 'e'
      });
    }
  });

  return (
    <div>
      <div>
        <span style={`color:#ddd`}>Life bar calculator</span>
      </div>
      <div class={`text-sm`} style={`color:#888`}>

        <input type="checkbox" checked={!showOverflow()}
          onChange={(e) => setShowOverflow(!e.target.checked)}
          class="mr-1"
        />
        <span> Hide life overflow</span>

        <p>
          <span> Freeze life % until first miss: </span>
          <input type="number" 
            value={freezeLifePct()}
            onBlur={(e) => setFreezeLifePct(e.currentTarget.value === '' ? '' : (Number(e.currentTarget.value)))}
            placeholder="none"
            style={`width:70px;background-color:#555;color:#fff`}
            class="mr-1"
          />
        </p>

        <p>
          <span>
            Lowest life: {Math.round(minHealth() / 10)}%
            &emsp;
            Num. misses: {new Set(missTimes()).size}
          </span>
        </p>

      </div>
      <div
        ref={plotContainerRef!}
        style={'height: 100%; overflow: auto'}
      >
        <p style={`color:#888`}>Loading ...</p>
      </div>
    </div>
  );
}