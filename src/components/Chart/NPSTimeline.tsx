import { onMount, createEffect, onCleanup, Accessor } from "solid-js";
import type { Resource } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ChartData, Segment } from '~/lib/types';
import { getENPSColor, secondsToTimeStr } from '~/lib/util';
import { getLevelColor, getLevelText, StrToAny } from "./util";
import { useChartContext } from "~/components/Chart/ChartContext";
import { useParams } from "@solidjs/router";


interface NPSTimelineProps {
  data: ChartData;
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
  const params = useParams();

  let timelineContainerRef: HTMLDivElement;
  let timelineStage: any | null = null;
  let timelineLayer1: any | null = null;

  const handleWheel = (e: WheelEvent) => {
    scrollContainerRef()?.scrollBy({left: 0, top: 3 * e.deltaY});
  };

  const {
    scrollContainerRef,
    canvasScrollPositionMirror,
    pxPerSecond,
  } = useChartContext();

  const drawEverything = async () => {
    if (typeof window === 'undefined' || !timelineContainerRef) return;

    // Clean up previous timelineStage if it exists
    if (timelineStage) {
      timelineStage.destroy();
    }

    const Konva = (await import('konva')).default;

    let data = props.data;
    const metadata = data['metadata'];
    const timelineData: number[] = metadata['eNPS timeline data'];
    const segments: Segment[] = metadata['Segments'];
    const segmentMetadata: StrToAny[] = metadata['Segment metadata'];
    const rangesOfInterest = metadata['eNPS ranges of interest'];

    const nSeconds = timelineData.length;

    const timelineStageWidth = 290 - 40;
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
    const timelineStageHeight = headerHeight + enpsPlotHeight + 10;

    const maxENPS = Math.max(...timelineData);

    // create timelineStage and layers
    timelineStage = new Konva.Stage({
      container: timelineContainerRef,
      width: timelineStageWidth,
      height: timelineStageHeight,
    });
    timelineLayer1 = new Konva.Layer();

    function timeToDrawingY(time: number): number {
      return headerHeight + time * enpsTimeline_pxPerSecond;
    }

    // draw header
    function drawHeader() {
      var text = new Konva.Text({
        text: `Notes per second`,
        x: enpsPlotColumnX,
        y: 0,
        fontSize: timeFontSize,
        fill: '#bbb',
      });
      timelineLayer1.add(text);

      var text = new Konva.Text({
        text: `Difficulty`,
        x: 50,
        y: 0,
        fontSize: timeFontSize,
        fill: '#bbb',
      });
      timelineLayer1.add(text);
    }
    drawHeader();

    // draw enps plot

    // draw axis
    var yAxisLine = new Konva.Line({
      points: [enpsPlotColumnX, headerHeight, enpsPlotColumnX, headerHeight + timelineStageHeight],
      stroke: '#888',
      strokeWidth: 1,
    })
    timelineLayer1.add(yAxisLine);
    var xAxisLine = new Konva.Line({
      points: [enpsPlotColumnX, headerHeight, enpsPlotColumnX + enpsBarMaxWidth, headerHeight],
      stroke: '#888',
      strokeWidth: 1,
    })
    timelineLayer1.add(xAxisLine);
    const enpsThresholds = [1.5, 4, 8, 13]
    for (let i: number = 0; i < enpsThresholds.length; i++) {
      const et = enpsThresholds[i];
      if (et <= maxENPS) {
        const x = enpsPlotColumnX + (et / maxENPS) * enpsBarMaxWidth;
        var tick = new Konva.Line({
          points: [x, headerHeight - 3, x, headerHeight + 3],
          stroke: '#888',
          strokeWidth: 1,
        })
        timelineLayer1.add(tick);

        const tickText = new Konva.Text({
          text: `${Math.round(et)}`,
          x: x - 5,
          y: headerHeight - 18,
          fontSize: timeFontSize,
          fill: '#bbb',
          align: 'right',
        });
        timelineLayer1.add(tickText);
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
        var rect = new Konva.Rect({
          x: x_left,
          y: y,
          width: width,
          height: enpsTimeline_pxPerSecond,
          fill: getENPSColor(enps),
          opacity: enpsBarAlpha,
        });
        timelineLayer1.add(rect);
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
      const timeText = new Konva.Text({
        text: `${endTime - startTime} s`,
        x: roiPlotColumnX + roiBracketWidth + 10,
        y: startTimeY,
        fontSize: fontSize,
        fill: '#bbb',
      });
      timelineLayer1.add(timeText);

      // draw lines
      var roiLine = new Konva.Line({
        points: [
          roiPlotColumnX,
          startTimeY, 
          roiPlotColumnX + roiBracketWidth, 
          startTimeY
        ],
        stroke: roiBracketColor,
        strokeWidth: roiBracketStrokeWidth,
      })
      timelineLayer1.add(roiLine);

      var roiLine = new Konva.Line({
        points: [
          roiPlotColumnX + roiBracketWidth,
          startTimeY, 
          roiPlotColumnX + roiBracketWidth, 
          endTimeY
        ],
        stroke: roiBracketColor,
        strokeWidth: roiBracketStrokeWidth,
      })
      timelineLayer1.add(roiLine);

      var roiLine = new Konva.Line({
        points: [
          roiPlotColumnX,
          endTimeY, 
          roiPlotColumnX + roiBracketWidth, 
          endTimeY
        ],
        stroke: roiBracketColor,
        strokeWidth: roiBracketStrokeWidth,
      })
      timelineLayer1.add(roiLine);

    }

    // draw segment timestamps and levels
    const levels = segmentMetadata.map((d) => Number(d['level']));
    const minSegmentLevel = Math.min(...levels);
    const maxSegmentLevel = Math.max(...levels);
    const segmentSeparatorWidth = 10;

    function drawTimeStamp(time: number) {
      const y = timeToDrawingY(time);
      // lines
      var segmentStartLine = new Konva.Line({
        points: [
          enpsPlotColumnX - segmentSeparatorWidth / 2, y, 
          enpsPlotColumnX, y
        ],
        stroke: '#ddd',
        strokeWidth: 1,
      })
      timelineLayer1.add(segmentStartLine);

      const leftLineX = difficultyLineColumnX;
      var segmentStartLine = new Konva.Line({
        points: [
          leftLineX - segmentSeparatorWidth / 2, y,
          leftLineX + segmentSeparatorWidth / 2, y
        ],
        stroke: '#ddd',
        strokeWidth: 1,
      })
      timelineLayer1.add(segmentStartLine);

      // timestamp text
      const tt = secondsToTimeStr(time);
      const timeText = new Konva.Text({
        text: `${tt}`,
        x: enpsPlotColumnX - segmentSeparatorWidth - 30,
        y: y - 5,
        fontSize: timeFontSize,
        fill: '#bbb',
        align: 'right',
      });
      timelineLayer1.add(timeText);
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
      const text = new Konva.Text({
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
      timelineLayer1.add(text);

      // difficulty line
      var difficultyLine = new Konva.Line({
        points: [
          difficultyLineColumnX, 
          y, 
          difficultyLineColumnX,
          timeToDrawingY(segmentEndTime)
        ],
        stroke: levelColor,
        strokeWidth: getLevelLineThickness(relativeSegmentLevel),
      })
      timelineLayer1.add(difficultyLine);

      // rare skill text
      const rareSkills = segmentMetadata[i]['rare skills'];
      let rareSkillText = '';
      if (rareSkills.length > 0) {
        rareSkillText = '⚠️';
        const rsText = new Konva.Text({
          text: `${rareSkillText}`,
          x: difficultyLineColumnX - 70,
          y: y - 5 - 2,
          fontSize: fontSize,
          fill: levelColor,
          align: 'right',
          fontStyle: levelFontStyle,
        });
        timelineLayer1.add(rsText);
      }
    }

    // current scroll position tracker
    const viewportHeight = (800 / pxPerSecond()) * enpsTimeline_pxPerSecond;
    function drawPositionTracker(currTime: number) {
      var positionTracker = new Konva.Rect({
        x: 0,
        y: timeToDrawingY(currTime),
        width: timelineStageWidth,
        height: viewportHeight,
        fill: 'white',
        opacity: 0.15,
        id: 'positionTracker',
      });
      timelineLayer1.add(positionTracker);
    };

    // Interactivity
    // current scroll position tracker
    drawPositionTracker(0);
    createEffect(() => {
      let y = canvasScrollPositionMirror();
      if (y) {
        const time = y / pxPerSecond();
        const node = timelineLayer1?.findOne(`#positionTracker`);
        node?.destroy();
        
        drawPositionTracker(time);
      }
    });

    onCleanup(() => {
      const node = timelineLayer1?.findOne(`#positionTracker`);
      node?.destroy();
    });

    // Interactivity on eNPS timeline, only in desktop mode. Disabled on mobile
    // scroll enps timeline timelineStage to scroll chart
    if (window.innerWidth > 768) {

      // click on timelineStage to scroll
      timelineStage.on('click', function (e: any) {
        const y = timelineStage.getPointerPosition()!.y
        const time = (y - headerHeight) / enpsTimeline_pxPerSecond;

        scrollContainerRef()!.scrollTo({
          top: time * pxPerSecond(),
          behavior: 'smooth'
        });

      });

      timelineStage.container().addEventListener('wheel', handleWheel);
    }

    timelineStage.add(timelineLayer1);
  };

  const cleanup = () => {
    // Remove event listeners from timelineStage container
    if (timelineStage) {
      timelineStage.off('click');  // Remove click handler
      const container = timelineStage.container();
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    }
  
    // Clean up layer and its children
    if (timelineLayer1) {
      // Remove the position tracker effect if it exists
      const tracker = timelineLayer1.findOne('#positionTracker');
      if (tracker) {
        tracker.destroy();
      }
  
      timelineLayer1.removeChildren();  // Remove all shapes
      timelineLayer1.destroy();        // Destroy layer
      timelineLayer1 = null;
    }
  
    // Destroy timelineStage
    if (timelineStage) {
      timelineStage.destroy();
      timelineStage = null;
    }
  
    // Remove scroll container event listeners if any
    if (scrollContainerRef()) {
      const el = scrollContainerRef()!;
      const clone = el.cloneNode(true) as HTMLElement;
      el.replaceWith(clone);
    }
  };

  // Call cleanup on component unmount
  onCleanup(cleanup);

  onMount(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer ) return;
    drawEverything();
  });

  createEffect(() => {
    // Redraw when URL changes
    const chartId = params.chart;
    if (!isServer) {
      // cleanup();
      drawEverything();
    }
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

