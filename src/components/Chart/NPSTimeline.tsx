import { onMount, createEffect, onCleanup, Accessor } from "solid-js";
import type { Resource } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ChartArt, Segment } from '~/lib/types';
import { getENPSColor, secondsToTimeStr } from '~/lib/util';
import { getLevelColor, getLevelText, StrToAny } from "./util";
import { useChartContext } from "~/components/Chart/ChartContext";


interface NPSTimelineProps {
  dataGet: Resource<ChartArt | null>;
}


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


export default function ENPSTimeline(props: NPSTimelineProps) {
  let dataGet = props.dataGet;

  let timelineContainerRef: HTMLDivElement;

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
      const segments: Segment[] = metadata['Segments'];
      const segmentMetadata: StrToAny[] = metadata['Segment metadata'];
      const rangesOfInterest = metadata['eNPS ranges of interest'];

      const nSeconds = timelineData.length;

      const stageWidth = 290 - 40;
      // const enpsPlotHeight = 820;
      const enpsPlotHeight = window.innerHeight - 150;
      const enpsBarMaxWidth = 70;
      const enpsPlotColumnX = 120;
      const difficultyLineColumnX = 70;
      const roiPlotColumnX = enpsPlotColumnX + enpsBarMaxWidth + 5;
      // const enpsTimeline_pxPerSecond = 7;
      const enpsTimeline_pxPerSecond = enpsPlotHeight / nSeconds;
      const headerHeight = 40;
      const fontSize = 14;
      const timeFontSize = 14;
      const stageHeight = headerHeight + enpsPlotHeight + 10;

      const maxENPS = Math.max(...timelineData);

      // create stage and layers
      const stage = new Konva.default.Stage({
        container: timelineContainerRef,
        width: stageWidth,
        height: stageHeight,
      });
      const layer1 = new Konva.default.Layer();

      function timeToDrawingY(time: number): number {
        return headerHeight + time * enpsTimeline_pxPerSecond;
      }

      // draw header
      function drawHeader() {
        var text = new Konva.default.Text({
          text: `Notes per second`,
          x: enpsPlotColumnX,
          y: 0,
          fontSize: timeFontSize,
          fill: '#bbb',
        });
        layer1.add(text);
  
        var text = new Konva.default.Text({
          text: `Difficulty`,
          x: 50,
          y: 0,
          fontSize: timeFontSize,
          fill: '#bbb',
        });
        layer1.add(text);
      }
      drawHeader();

      // draw enps plot

      // draw axis
      var yAxisLine = new Konva.default.Line({
        points: [enpsPlotColumnX, headerHeight, enpsPlotColumnX, headerHeight + stageHeight],
        stroke: '#888',
        strokeWidth: 1,
      })
      layer1.add(yAxisLine);
      var xAxisLine = new Konva.default.Line({
        points: [enpsPlotColumnX, headerHeight, enpsPlotColumnX + enpsBarMaxWidth, headerHeight],
        stroke: '#888',
        strokeWidth: 1,
      })
      layer1.add(xAxisLine);
      const enpsThresholds = [1.5, 4, 8, 13]
      for (let i: number = 0; i < enpsThresholds.length; i++) {
        const et = enpsThresholds[i];
        if (et <= maxENPS) {
          const x = enpsPlotColumnX + (et / maxENPS) * enpsBarMaxWidth;
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
            fontSize: timeFontSize,
            fill: '#bbb',
            align: 'right',
          });
          layer1.add(tickText);
        }
      }

      // draw enps plot
      const enpsBarAlpha = 0.7;
      for (let i: number = 0; i < timelineData.length; i++) {
        const y = timeToDrawingY(i);
        const enps = timelineData[i];
        const width = (enps / maxENPS) * enpsBarMaxWidth;
        const x_left = enpsPlotColumnX;

        if (width > 0) {
          var rect = new Konva.default.Rect({
            x: x_left,
            y: y,
            width: width,
            height: enpsTimeline_pxPerSecond,
            fill: getENPSColor(enps),
            opacity: enpsBarAlpha,
          });
          layer1.add(rect);
        }
      }

      // draw high eNPS sections of interest
      const roiBracketWidth = 5;
      const roiBracketColor = '#bbb';
      const roiBracketStrokeWidth = 2;
      for (let i: number = 0; i < rangesOfInterest.length; i++) {
        const startTime = rangesOfInterest[i][0];
        const endTime = rangesOfInterest[i][1];
        const startTimeY = timeToDrawingY(startTime);
        const endTimeY = timeToDrawingY(endTime);

        // draw text
        const timeText = new Konva.default.Text({
          text: `${endTime - startTime} s`,
          x: roiPlotColumnX + roiBracketWidth + 10,
          y: startTimeY,
          fontSize: fontSize,
          fill: '#bbb',
        });
        layer1.add(timeText);

        // draw lines
        var roiLine = new Konva.default.Line({
          points: [
            roiPlotColumnX,
            startTimeY, 
            roiPlotColumnX + roiBracketWidth, 
            startTimeY
          ],
          stroke: roiBracketColor,
          strokeWidth: roiBracketStrokeWidth,
        })
        layer1.add(roiLine);

        var roiLine = new Konva.default.Line({
          points: [
            roiPlotColumnX + roiBracketWidth,
            startTimeY, 
            roiPlotColumnX + roiBracketWidth, 
            endTimeY
          ],
          stroke: roiBracketColor,
          strokeWidth: roiBracketStrokeWidth,
        })
        layer1.add(roiLine);

        var roiLine = new Konva.default.Line({
          points: [
            roiPlotColumnX,
            endTimeY, 
            roiPlotColumnX + roiBracketWidth, 
            endTimeY
          ],
          stroke: roiBracketColor,
          strokeWidth: roiBracketStrokeWidth,
        })
        layer1.add(roiLine);

      }

      // draw segment timestamps and levels
      const levels = segmentMetadata.map((d) => Number(d['level']));
      const minSegmentLevel = Math.min(...levels);
      const maxSegmentLevel = Math.max(...levels);
      const segmentSeparatorWidth = 10;

      function drawTimeStamp(time: number) {
        const y = timeToDrawingY(time);
        // lines
        var segmentStartLine = new Konva.default.Line({
          points: [
            enpsPlotColumnX - segmentSeparatorWidth / 2, y, 
            enpsPlotColumnX, y
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
          x: enpsPlotColumnX - segmentSeparatorWidth - 30,
          y: y - 5,
          fontSize: timeFontSize,
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
      const viewportHeight = (800 / pxPerSecond()) * enpsTimeline_pxPerSecond;
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
          const time = (y - headerHeight) / enpsTimeline_pxPerSecond;

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
    });
  });

  return (
    <div
      ref={timelineContainerRef!}
      style={'height: 100%; overflow: auto'}
    >
      <p style={`color:#888`}>Loading ...</p>
    </div>
  );
};

