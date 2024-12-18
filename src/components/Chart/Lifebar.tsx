import { onMount, createEffect, onCleanup } from "solid-js";
import type { Resource } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ChartArt, Segment, HoldTick, StrToAny } from '~/lib/types';
import { getLevelColor, getLevelText } from "./util";
import { getENPSColor, secondsToTimeStr } from '~/lib/util';
import { useChartContext } from "~/components/Chart/ChartContext";


function getLevelLineThickness(t: number): number {
  if (t < 0.6) {
    return 0.5
  } else if (t < 0.75) {
    return 1
  } else if (t < 0.875) {
    return 2
  } else if (t < 0.97) {
    return 3
  }
  return 5
}


function calcHealths(data: ChartArt, missTimes: number[]) {
  // based on https://github.com/Team-Infinitesimal/Infinitesimal/blob/lts/Modules/PIU/Gameplay.Life.lua
  const arrowArts = data[0];
  const metadata = data[2];

  let arrowTimes = arrowArts.map((aa) => aa[1]);
  const uniqueArrowTimes = new Set(arrowTimes);

  const uniqueSortedArrowTimes = [...uniqueArrowTimes].sort((a, b) => a - b);
  // todo - use holdticks
  let holdticks: Array<HoldTick> = metadata['Hold ticks'];

  const chartLevel = Number(metadata['METER']);
  const lifeMax = 1000 + 3 * chartLevel * chartLevel;

  let healFactor = 100;
  const healFactorMax = 800;
  const healFactorMiss = -700;

  let times: number[] = [0];
  let currLife = 500;
  let healths: number[] = [currLife];
  for (let i = 0; i < uniqueSortedArrowTimes.length; i++) {
    const t = uniqueSortedArrowTimes[i];

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
  dataGet: Resource<ChartArt | null>;

}


export default function LifebarPlot(props: Props) {
  let dataGet = props.dataGet;
  let plotContainerRef: HTMLDivElement;

  const {
    scrollContainerRef,
    setScrollContainerRef,
    canvasScrollPositionMirror,
    setCanvasScrollPositionMirror,
    clickTo,
    setClickTo,
    pxPerSecond,
    setPxPerSecond,
    missTimes,
    setMissTimes,
  } = useChartContext();

  onMount(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer ) return;

    import('konva').then((Konva) => {
      const data = dataGet()!;
      const metadata = data[2];
      const timelineData: number[] = metadata['eNPS timeline data'];
      const nSeconds = timelineData.length;
      const chartLevel = Number(metadata['METER']);
      const lifeMax = 1000 + 3 * chartLevel * chartLevel;

      // plot using data structure
      const headerHeight = 40;
      const stageWidth = 290;
      const plotHeight = window.innerHeight - 150;
      const plotLeftX = 120;
      const plotWidth = 140;
      const stageHeight = headerHeight + plotHeight + 10;

      const difficultyLineColumnX = 70;
      const fontSize = 14;

      const plotPxPerSecond = plotHeight / nSeconds;

      function timeToDrawingY(time: number): number {
        return headerHeight + time * plotPxPerSecond;
      }

      function healthToDrawWidth(health: number): number {
        return (health / lifeMax) * plotWidth;
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

      const [perfectPlayTimes, perfectPlayHealths] = calcHealths(data, []);

      // 
      createEffect(() => {
        let misses = missTimes();
        // let misses = [16.9231, 18.4615];
        let [times, healths] = calcHealths(data, misses);
        // console.log(times);

        layerPlot.destroyChildren();

        // plot life
        for (let i = 0; i < times.length; i++) {
          const time = times[i];
          const health = healths[i];
          const perfectHealth = perfectPlayHealths[i];

          // draw rectangle to next health update time
          let nextTime = 0
          if (i < times.length - 1) {
            nextTime = times[i + 1];
          } else {
            nextTime = nSeconds;
          }


          // var rect = new Konva.default.Rect({
          //   x: plotLeftX,
          //   y: timeToDrawingY(time),
          //   width: healthToDrawWidth(health),
          //   height: timeToDrawingY(nextTime) - timeToDrawingY(time),
          //   fill: color,
          // })
          const x = plotLeftX + healthToDrawWidth(health) - 1
          const remWidth = Math.max(healthToDrawWidth(perfectHealth) - healthToDrawWidth(health), 1)
          let color = '#888';
          if (health <= 0) {
            color = '#fff'
          } else if (health < 100 || remWidth > 1) {
            color = '#ec4339aa'
          }
          var rect = new Konva.default.Rect({
            x: x,
            y: timeToDrawingY(time),
            width: remWidth,
            height: timeToDrawingY(nextTime) - timeToDrawingY(time),
            fill: color,
          })
          layerPlot.add(rect);

          if (health <= 0) {
            var text = new Konva.default.Text({
              text: `you died`,
              x: x,
              y: timeToDrawingY(time),
              fontSize: 24,
              fill: '#fff',
            });
            layerPlot.add(text);
          }
        }

        layerPlot.batchDraw();
      });

      // draw axis
      var yAxisLine = new Konva.default.Line({
        points: [plotLeftX, headerHeight, plotLeftX, headerHeight + plotHeight],
        stroke: '#888',
        strokeWidth: 1,
      })
      layer1.add(yAxisLine);
      var xAxisLine = new Konva.default.Line({
        points: [plotLeftX, headerHeight, plotLeftX + plotWidth, headerHeight],
        stroke: '#888',
        strokeWidth: 1,
      })
      layer1.add(xAxisLine);

      // draw ticks
      const lifeThresholds = [500, 1000, lifeMax]
      for (let i: number = 0; i < lifeThresholds.length; i++) {
        const et = lifeThresholds[i];
        const x = plotLeftX + (et / lifeMax) * plotWidth;
        var tick = new Konva.default.Line({
          points: [x, headerHeight - 3, x, headerHeight + 3],
          stroke: '#888',
          strokeWidth: 1,
        })
        layer1.add(tick);

        const tickText = new Konva.default.Text({
          text: `${Math.round(et)}`,
          x: x - 5,
          y: headerHeight - 18,
          fontSize: 14,
          fill: '#bbb',
          align: 'right',
        });
        layer1.add(tickText);
      }

      // draw header
      function drawHeader() {
        var text = new Konva.default.Text({
          text: `Life bar`,
          x: plotLeftX,
          y: 0,
          fontSize: 14,
          fill: '#bbb',
        });
        layer1.add(text);  
      }
      drawHeader();

      // draw segment timestamps and levels
      const segments: Segment[] = metadata['Segments'];
      const segmentMetadata: StrToAny[] = metadata['Segment metadata'];
      const levels = segmentMetadata.map((d) => Number(d['level']));
      const minSegmentLevel = Math.min(...levels);
      const maxSegmentLevel = Math.max(...levels);
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

        const leftLineX = difficultyLineColumnX;
        var segmentStartLine = new Konva.default.Line({
          points: [
            leftLineX - segmentSeparatorWidth / 2, y,
            leftLineX + segmentSeparatorWidth / 2, y
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

        let levelFontStyle = '';
        const segmentLevel = segmentMetadata[i]['level'];
        const relativeSegmentLevel = (segmentLevel - minSegmentLevel) / (maxSegmentLevel - minSegmentLevel);
        const levelText = getLevelText(segmentLevel);
        if (segmentLevel > 0.95 * maxSegmentLevel) {
        }

        // difficulty text
        var levelTextwCrux = `lv.${levelText}`
        if (relativeSegmentLevel >= 0.97 && segmentLevel >= 7) {
          levelTextwCrux = `lv.${levelText}\ncrux`
        }
        const y = timeToDrawingY(segmentStartTime);
        const levelColor = getLevelColor(relativeSegmentLevel);
        const text = new Konva.default.Text({
          text: levelTextwCrux,
          x: difficultyLineColumnX - 45,
          // x: enpsPlotColumnX - segmentSeparatorWidth - 40,
          y: y - 5,
          // y: y + 5,
          fontSize: fontSize,
          fill: levelColor,
          align: 'right',
          fontStyle: levelFontStyle,
        });
        layer1.add(text);

        // difficulty line
        var difficultyLine = new Konva.default.Line({
          points: [
            difficultyLineColumnX, 
            y, 
            difficultyLineColumnX,
            timeToDrawingY(segmentEndTime)
          ],
          stroke: levelColor,
          strokeWidth: getLevelLineThickness(relativeSegmentLevel),
        })
        layer1.add(difficultyLine);

        // rare skill text
        const rareSkills = segmentMetadata[i]['rare skills'];
        let rareSkillText = '';
        if (rareSkills.length > 0) {
          rareSkillText = '⚠️';
          const rsText = new Konva.default.Text({
            text: `${rareSkillText}`,
            x: difficultyLineColumnX - 70,
            y: y - 5 - 2,
            fontSize: fontSize,
            fill: levelColor,
            align: 'right',
            fontStyle: levelFontStyle,
          });
          layer1.add(rsText);
        }
      }

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
  });

  return (
    <div
      ref={plotContainerRef!}
      style={'height: 100%; overflow: auto'}
    >
      <p style={`color:#888`}>Loading ...</p>
    </div>
  );
}