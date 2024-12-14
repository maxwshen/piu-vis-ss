import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, onCleanup, createEffect, $DEVCOMP, untrack, For } from "solid-js";
import type { Signal, Accessor, Resource, Setter, JSXElement, Component } from 'solid-js';
import { Show } from 'solid-js';
import "./[id].css"
import Konva from 'konva';
import { isServer } from 'solid-js/web';
import { getImage } from '../../lib/images';
import { checkEnvironment, fetchData } from '../../lib/data';
import { getLevel, getSinglesOrDoubles, computeLastTime } from '../../lib/canvas_art';
import { ArrowArt, HoldArt, HoldTick, ChartArt, Segment } from '../../lib/types';
import { JSX } from "solid-js/h/jsx-runtime";
import { useNavigate } from "@solidjs/router";

const panelPxInterval = 40;
const [pxPerSecond, setPxPerSecond] = createSignal(400);
const [canvasWidth, setCanvasWidth] = createSignal(530);
const arrowImgWidth = 40;
const arrowImgHeight = arrowImgWidth;

interface strToStr {
  [key: string]: string;
};
interface strToAny {
  [key: string]: any;
};
const [clickTo, setClickTo] = createSignal<strToStr>({'l': 'r', 'r': 'l'});

const [canvasScrollPositionMirror, setCanvasScrollPositionMirror] = createSignal<number>();

const [scrollContainerRef, setScrollContainerRef] = createSignal<HTMLDivElement>();

const [activeColumn, setActiveColumn] = createSignal('column1');

/**
 * Draws Konva HTML canvas of arrow arts and hold arts.
 * @param data 
 */
function drawKonvaCanvas(
  dataGet: Resource<ChartArt | null>, 
  mutate: Setter<ChartArt | null | undefined>
) {
  let containerRef: HTMLDivElement;
  let largeContainerRef: HTMLDivElement;

  // Only run on client-side - avoids hydration error.
  // Konva creates canvas elements directly in the DOM after mounting,
  // which can conflict with SSR/hydration.
  onMount(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer ) return;
    
    // Dynamically import Konva only on the client side
    import('konva').then((Konva) => {
      // draw
      let data = dataGet()!;
      let arrowarts = data[0];
      let holdarts = data[1];
      let metadata = data[2];
      let holdticks: Array<HoldTick> = metadata['Hold ticks'];
      let segments = metadata['Segments'];

      // compute canvas height and width
      const numPanels = getSinglesOrDoubles(data);
      setCanvasWidth(panelPxInterval * numPanels + 50);

      const level = getLevel(data);
      if (level < 11) {
        setPxPerSecond(250);
      } else if (level <= 14) {
        setPxPerSecond(300);
      } else if (level <= 25) {
        setPxPerSecond(400);
      } else {
        setPxPerSecond(450);
      }

      let lastTime = computeLastTime(data);
      var canvas_height = lastTime * pxPerSecond() + 100;
      const timeFontSize = 15;
      const enpsAnnotFontSize = 15;
      const timeColX = 0;
      const arrowsColX = 40;
      const arrowsColXRight = arrowsColX + panelPxInterval * numPanels;
      const holdTicksColX = arrowsColXRight + 5;
      const enpsAnnotColX = holdTicksColX + 12;

      largeContainerRef.style.height = canvas_height + 'px';
      largeContainerRef.style.width = canvasWidth() + 80 + 'px';
      var PADDING = 0;

      // make stage & layers
      const stage = new Konva.default.Stage({
        container: containerRef,
        width: window.innerWidth + PADDING * 2,
        height: window.innerHeight + PADDING * 2,
      });
      const layer1 = new Konva.default.Layer();
      const layer2 = new Konva.default.Layer();
      const layer3 = new Konva.default.Layer();
      const layer4 = new Konva.default.Layer();

      // make background
      const background = new Konva.default.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: '#2e2e2e'
      });
      layer1.add(background);

      // draw spaced lines for time
      const y_interval = 50;
      const num_lines = canvas_height / y_interval;
      for (let i: number = 0; i < num_lines; i++) {
        const y = i * y_interval;
        var line = new Konva.default.Line({
          points: [arrowsColX, y, arrowsColXRight, y],
          stroke: 'gray',
          strokeWidth: 1,
        });
        layer1.add(line);
      }

      // draw text for time
      const seconds_per_timestamp = 1;
      const num_timestamps = lastTime / seconds_per_timestamp + 1;
      for (let i: number = 1; i < num_timestamps; i++) {
        const y = i * seconds_per_timestamp * pxPerSecond();
        var text = new Konva.default.Text({
          text: `${secondsToTimeStr(i*seconds_per_timestamp)}`,
          x: timeColX,
          y: y,
          fontSize: timeFontSize,
          // fontFamily: 'Helvetica',
          fill: '#AAAAAA',
          align: 'right',
        });
        layer1.add(text);
      }

      // draw segments demarcations
      for (let i: number = 0; i < segments.length; i++) {
        let segment = segments[i];
        const startTime: number = segment[0];
        const y = startTime * pxPerSecond();
        var line = new Konva.default.Line({
          points: [arrowsColX, y, arrowsColXRight, y],
          stroke: 'white',
          strokeWidth: 1,
        });
        line.dash([10, 5]);
        layer1.add(line);
      }

      // draw effective NPS annotations
      const enps_annots = metadata['eNPS annotations'];
      for (let i: number = 0; i < enps_annots.length; i++) {
        const [time, nps_annot] = enps_annots[i];
        const npsAnnotSplit = nps_annot.split('\n');
        const npsAnnotPart1 = nps_annot.split('\n')[0];
        const npsAnnotPart2 = nps_annot.split('\n')[1] + '\n' + nps_annot.split('\n')[2];
        // draw text
        var text = new Konva.default.Text({
          text: `${npsAnnotPart1}`,
          x: enpsAnnotColX,
          y: time * pxPerSecond(),
          fontSize: enpsAnnotFontSize,
          fill: '#aaa',
          align: 'left',
        });
        layer1.add(text);

        var text = new Konva.default.Text({
          text: `${npsAnnotPart2}`,
          x: enpsAnnotColX,
          y: time * pxPerSecond() + enpsAnnotFontSize,
          fontSize: enpsAnnotFontSize,
          fill: '#666',
          align: 'left',
        });
        layer1.add(text);

      }

      // draw holdtick annotations
      const y_gap = 2;
      for (let i: number = 0; i < holdticks.length; i++) {
        let holdtick = holdticks[i];
        const [startTime, endTime, nTicks] = holdtick;
        const y = i * seconds_per_timestamp * pxPerSecond();
        // draw text
        var text = new Konva.default.Text({
          text: `${nTicks}`,
          x: holdTicksColX + 3,
          y: startTime * pxPerSecond() + arrowImgHeight / 2,
          fontSize: enpsAnnotFontSize,
          fill: 'gray',
          align: 'right',
        });
        layer1.add(text);
        // draw line
        var line = new Konva.default.Line({
          points: [
            holdTicksColX, startTime * pxPerSecond() + arrowImgHeight / 2, 
            holdTicksColX, endTime * pxPerSecond() - y_gap + arrowImgHeight / 2],
          stroke: 'gray',
          strokeWidth: 1,
        });
        layer1.add(line);
      }

      // define drawing functions
      function drawArrowArt(aa: ArrowArt, limb: string, id: number) {
        let arrowart = aa;
        const [panelPos, time, limbAnnot] = arrowart;
        const image = new Image();
        const [imageGetter, _] = getImage(panelPos, limb, 'arrow');
        image.src = imageGetter();
        let alpha = 1.0;
        if (limb == 'h') {
          alpha = 0.5;
        }
        let konva_img = new Konva.default.Image({
          x: arrowsColX + panelPos * panelPxInterval,
          y: time * pxPerSecond(),
          image: image,
          width: arrowImgWidth,
          height: arrowImgHeight,
          id: String(id),
          opacity: alpha,
        });
        layer1.add(konva_img);
      };

      function drawHoldArt(ha: HoldArt, limb: string, id: number) {
        let holdart = ha;
        const [panelPos, startTime, endTime, limbAnnot] = holdart;
        let alpha = 1.0;
        let trail_alpha = 1.0;
        if (limb == 'h') {
          alpha = 0.4;
          trail_alpha = 0.15;
        }

        // draw hold head
        const holdHead = new Image();
        const [headImageGetter, _] = getImage(panelPos, limb, 'arrow');
        holdHead.src = headImageGetter();
        var konva_img = new Konva.default.Image({
          x: arrowsColX + panelPos * panelPxInterval,
          y: startTime * pxPerSecond(),
          image: holdHead,
          width: arrowImgWidth,
          height: arrowImgHeight,
          id: String(id),
          opacity: alpha,
        });
        layer2.add(konva_img);

        // draw hold trail
        const holdTrail = new Image();
        const [trailImageGetter, __] = getImage(panelPos, limb, 'trail');
        holdTrail.src = trailImageGetter();
        var konva_img = new Konva.default.Image({
          x: arrowsColX + panelPos * panelPxInterval,
          y: startTime * pxPerSecond() + arrowImgHeight / 2,
          image: holdTrail,
          width: arrowImgWidth,
          height: (endTime - startTime) * pxPerSecond(),
          id: String(id),
          opacity: trail_alpha,
        });
        layer4.add(konva_img);

        // draw hold cap
        const holdCap = new Image();
        const [capImageGetter, ___] = getImage(panelPos, limb, 'cap');
        holdCap.src = capImageGetter();
        var konva_img = new Konva.default.Image({
          x: arrowsColX + panelPos * panelPxInterval,
          y: endTime * pxPerSecond(),
          image: holdCap,
          width: arrowImgWidth,
          height: arrowImgHeight,
          id: String(id),
          opacity: alpha,
        });
        layer3.add(konva_img);

      };

      // draw arrows
      for (let i: number = 0; i < arrowarts.length; i++) {
        let arrowart = arrowarts[i];
        const [panelPos, time, limbAnnot] = arrowart;
        drawArrowArt(arrowarts[i], limbAnnot, i); 
      };
      // }

      // draw holds
      for (let i: number = 0; i < holdarts.length; i++) {
        let holdart = holdarts[i];
        const [panelPos, startTime, endTime, limbAnnot] = holdart;
        drawHoldArt(holdart, limbAnnot, i);
      }

      // interactivity on stage
      stage.on('click', function (e) {
        let data = dataGet()!;
        let arrowarts = data[0];
        let holdarts = data[1];

        const scrolly = scrollContainerRef()!.scrollTop - PADDING;
        const scrollx = scrollContainerRef()!.scrollLeft - PADDING;
        const x = stage.getPointerPosition()!.x + scrollx;
        const y = stage.getPointerPosition()!.y + scrolly;

        // handle clicking on arrow
        for (let i: number = 0; i < arrowarts.length; i++) {
          let arrowart = arrowarts[i];
          const [panelPos, time, limbAnnot] = arrowart;
          const arrow_x = arrowsColX + panelPos * panelPxInterval;
          const arrow_y = time * pxPerSecond();
          let id = String(i);
    
          if (
            x >= arrow_x &&
            x <= arrow_x + arrowImgWidth &&
            y >= arrow_y &&
            y <= arrow_y + arrowImgHeight
          ) {
            let editedArrowArts = arrowarts.slice(0, i).concat(
              [[panelPos, time, clickTo()[limbAnnot]]],
            ).concat(arrowarts.slice(i + 1, arrowarts.length));
            mutate([editedArrowArts, holdarts, metadata]);

            // remove prev arrow
            const node = layer1?.findOne(`#${id}`);
            node?.destroy();

            // draw new arrow
            let newLimb = clickTo()[limbAnnot];
            drawArrowArt(arrowart, newLimb, i); 
            return;
          }
        };
    
        // handle clicking on hold 
        for (let i: number = 0; i < holdarts.length; i++) {
          let holdart = holdarts[i];
          const [panelPos, startTime, endTime, limbAnnot] = holdart;
          const arrow_x = arrowsColX + panelPos * panelPxInterval;
          const arrow_y = startTime * pxPerSecond();
    
          // clicking on head
          if (
            x >= arrow_x &&
            x <= arrow_x + arrowImgWidth &&
            y >= arrow_y &&
            y <= arrow_y + arrowImgHeight
          ) {
            let editedHoldArts = holdarts.slice(0, i).concat(
              [[panelPos, startTime, endTime, clickTo()[limbAnnot]]],
            ).concat(holdarts.slice(i + 1, holdarts.length));
            mutate([arrowarts, editedHoldArts, metadata]);

            // remove prev art
            let id = String(i);
            const node2 = layer2?.findOne(`#${id}`);
            node2?.destroy();
            const node3 = layer3?.findOne(`#${id}`);
            node3?.destroy();
            const node4 = layer4?.findOne(`#${id}`);
            node4?.destroy();

            // draw new art
            let newLimb = clickTo()[limbAnnot];
            drawHoldArt(holdart, newLimb, i); 
            return;
          }
    
          // allow clicking on cap
          const arrow_y_end = endTime * pxPerSecond();
          if (
            x >= arrow_x &&
            x <= arrow_x + arrowImgWidth &&
            y >= arrow_y_end &&
            y <= arrow_y_end + arrowImgHeight
          ) {
            let editedHoldArts = holdarts.slice(0, i).concat(
              [[panelPos, startTime, endTime, clickTo()[limbAnnot]]],
            ).concat(holdarts.slice(i + 1, holdarts.length));
            mutate([arrowarts, editedHoldArts, metadata]);

            // remove prev art
            let id = String(i);
            const node2 = layer2?.findOne(`#${id}`);
            node2?.destroy();
            const node3 = layer3?.findOne(`#${id}`);
            node3?.destroy();
            const node4 = layer4?.findOne(`#${id}`);
            node4?.destroy();

            // draw new art
            let newLimb = clickTo()[limbAnnot];
            drawHoldArt(holdart, newLimb, i); 
            return;
          }
    
        };
      });

      // scrolling
      function repositionStage() {
        // var dx = scrollContainerRef.scrollLeft - PADDING;
        // var dy = scrollContainerRef.scrollTop - PADDING;
        var dx = scrollContainerRef()!.scrollLeft;
        var dy = scrollContainerRef()!.scrollTop;
        stage.container().style.transform =
          'translate(' + dx + 'px, ' + dy + 'px)';
        stage.x(-dx);
        stage.y(-dy);

        // track scroll position in mirror
        setCanvasScrollPositionMirror(dy);
      }

      // layer1 has background; draw it on bottom
      stage.add(layer1);
      // layers for holds
      stage.add(layer4);
      stage.add(layer3);
      stage.add(layer2);

      repositionStage();
      scrollContainerRef()!.addEventListener('scroll', repositionStage);
      stage.container().style.transform = 'translate(0px, 0px)';
      stage.x(0);
      stage.y(0);

      // once everything is loaded, scroll to first arrow, or section
      const urlParams = new URLSearchParams(window.location.search);
      const paramSection = urlParams.get('section');
      if (paramSection) {
        // Adjust from 1-indexed to 0-indexing
        const sectionIdx = Number(paramSection) - 1;
        const sectionStartTime = segments[sectionIdx][0];
        scrollContainerRef()!.scrollTo({
          top: sectionStartTime * pxPerSecond(),
        });
      } else {
        const firstHoldTime = holdarts[0][1];
        const firstArrowTime = arrowarts[0][1];
        const firstTime = Math.min(firstHoldTime, firstArrowTime);
        scrollContainerRef()!.scrollTo({
          top: firstTime * pxPerSecond(),
        });
      }

    });
  });

  return (
    <div>
      <div
        ref={setScrollContainerRef}
        id={"scrollbar1"}
        style={{
          "overflow": "auto",
            "width": canvasWidth() + 100 + "px",
            // "width": canvasWidth() + 100 + "px",
          // "width": "1000px",
          "height": "calc(100vh - 20px)",
          // "height": "100%",
          "margin": "auto",
          // "border": "1px solid grey",
        }}
      >
        <div
          ref={largeContainerRef!}
          style={{
            "width": "80px",
            // "height": "calc(100vh - 100px)",
            "height": "10px",
            // "height": canvas_height + "px",
            "overflow": "hidden",
            "background-color": "#2e2e2e",
          }}
        >
          <div 
            ref={containerRef!} 
            style={{
              // "border": "1px solid #ccc",
              "margin": "auto",
              "width": canvasWidth() + 100 + "px",
              // "height": "1000px",
              "height": "100%",
              // "height": "10px",
              // "height": canvas_height + "px",
              "background-color": "#2e2e2e",
            }}
          >
          </div>
        </div>
      </div>
    </div>
  );
};

function drawENPSTimeline(dataGet: Resource<ChartArt | null>) {
  let timelineContainerRef: HTMLDivElement;

  onMount(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer ) return;

    import('konva').then((Konva) => {
      const data = dataGet()!;
      const metadata = data[2];
      const timelineData: number[] = metadata['eNPS timeline data'];
      const segments: Segment[] = metadata['Segments'];
      const segmentMetadata: strToAny[] = metadata['Segment metadata'];
      const rangesOfInterest = metadata['eNPS ranges of interest'];

      const nSeconds = timelineData.length;

      const stageWidth = 290;
      const enpsPlotHeight = 850;
      const enpsBarMaxWidth = 70;
      const enpsPlotColumnX = 150;
      const difficultyLineColumnX = 100;
      const roiPlotColumnX = enpsPlotColumnX + enpsBarMaxWidth + 5;
      // const enpsTimeline_pxPerSecond = 7;
      const enpsTimeline_pxPerSecond = enpsPlotHeight / nSeconds;
      const headerHeight = 40;
      const fontSize = 14;
      const timeFontSize = 14;
      const stageHeight = headerHeight + enpsTimeline_pxPerSecond * timelineData.length + 10;

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
        if (relativeSegmentLevel >= 0.97) {
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
      })

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
      <p>test</p>
    </div>
  );
};

function SaveJsonButton(id: string, data: ChartArt): JSXElement {
  // Function to save JSON to file
  const saveJsonToFile = () => {
    const json = JSON.stringify(data, null, 2); // Convert JSON object to string
    const blob = new Blob([json], { type: "application/json" }); // Create a Blob from the JSON string
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    // Create a temporary anchor element and trigger a download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button class="nice-button" onClick={saveJsonToFile}>Save JSON to File</button>
    </div>
  );
};


function SetClickToEitherButton(): JSXElement {
  const ChangeClickAction = () => {
    setClickTo({'l': 'e', 'r': 'e', 'e': 'e', 'h': 'e'});
  };
  return (
    <div>
      <button class="nice-button" onClick={ChangeClickAction}>Set Click To Either</button>
    </div>
  )
};


function SetClickToMissButton(): JSXElement {
  const ChangeClickAction = () => {
    setClickTo({'l': 'h', 'r': 'h', 'e': 'h', 'h': 'h'});
  };
  return (
    <div>
      <button class="nice-button" onClick={ChangeClickAction}>Set Click To Miss</button>
    </div>
  )
};


function SetClickToLRButton(): JSXElement {
  const ChangeClickAction = () => {
    setClickTo({'l': 'r', 'r': 'l', 'e': 'l', 'h': 'l'});
  };
  return (
    <div>
      <button class="nice-button" onClick={ChangeClickAction}>Set Click To L/R</button>
    </div>
  )
};


interface SegmentTimelineProps {
  segments: Segment[];
  segmentData: strToAny[];
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


function getLevelColor(t: number): string {
  if (t < 0.6) {
    return '#aed677'
  } else if (t < 0.75) {
    return '#f3c746'
  } else if (t < 0.875) {
    return '#f59640'
  } else if (t < 0.97) {
    return '#ec4339'
  }
  return '#e2247f'
}

function getENPSColor(enps: number): string {
  if (enps < 1.5) {
    return '#7cb82f'
  } else if (enps < 4) {
    return '#efb920'
  } else if (enps < 8) {
    return '#f47b16'
  } else if (enps < 13) {
    return '#ec4339'
  }
  return '#ed4795'
}


function getLevelText(level: number): string {
  const r = Math.round(level);
  const threshold = 0.3;
  if (level - r <= -1 * threshold) {
    return `${r}-`;
  } else if (level - r >= threshold) {
    return `${r}+`;
  }
  return `${r}`;
}


function segmentContent(segment: Segment, data: strToAny): JSXElement {
  const similarSections = data['Closest sections'];

  let baseUrl = checkEnvironment();
  function makeUrlBullets(section: any): JSXElement {
    let [chartName, sectionIdx] = section;
    const sectionIdx1 = sectionIdx + 1;
    let link = [baseUrl, 'chart', chartName + '?section=' + sectionIdx1].join('/');
    const displayName = chartnameToDisplayName(chartName);

    const navigate = useNavigate();
    const handleNavAndReload = (e: MouseEvent) => {
      e.preventDefault();
      
      // Navigate to the new page
      navigate('chart' + '/' + chartName + '?section=' + sectionIdx1, {
        resolve: false, 
        // Optional: you can pass state if needed
        // state: { someData: "value" }
      });
  
      // Reload the page after a short delay to ensure navigation
      setTimeout(() => {
        window.location.reload();
      }, 50);
    };

    return <li><a href={link} onClick={handleNavAndReload}>{displayName}</a></li>
    // return <li><a href={link}>{displayName}, §{sectionIdx1}</a></li>
  }

  function makeRareSkillText(): JSXElement {
    const rareSkills = data['rare skills'];
    if (rareSkills.length > 0) {
      return <div>
        <p>Rare skills:</p>
        {rareSkills}
      </div>
    }
    return <></>
  }

  if (similarSections.length > 0) {
    return  <pre class="whitespace-pre-wrap text-sm">
    {makeRareSkillText()}
    <p>Similar chart sections:</p>    
    <ul>
      {similarSections.map((section: any) =>
        makeUrlBullets(section)
      )}
    </ul>
  </pre>
  } else {
    return <p></p>
  }
  
}


function secondsToTimeStr(inputTime: number): string {
  const time = Math.round(inputTime);
  const min = Math.floor(time / 60);
  const sec = time - min * 60;
  function str_pad_left(string: string, pad: string, length: number) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }
  const finalTime = str_pad_left(String(min), '0', 1) + ':' + str_pad_left(String(sec), '0', 2);
  return finalTime;
}


function chartnameToDisplayName(chartname: string): string {
  var n = chartname.replace('_INFOBAR_TITLE', '_').replace('_HALFDOUBLE_', '_');
  const nsplit = n.split('_');
  const sordlevel = nsplit[nsplit.length - 2];
  const songname = n.split('_-_')[0].replace('_', ' ');
  return songname + ' ' + sordlevel;
}


const SegmentTimeline: Component<SegmentTimelineProps> = (props) => {
  const scrollToTime = (startTime: number) => {
    scrollContainerRef()!.scrollTo({
      top: startTime * pxPerSecond(),
      behavior: 'smooth'
    });
  };

  // console.log(props.segmentData);
  const levels = props.segmentData.map((d) => Number(d['level']));
  const minSegmentLevel = Math.min(...levels);
  const maxSegmentLevel = Math.max(...levels);

  const SegmentCollapsible = (segment: Segment, data: strToAny, index: number) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const sectionNumberP1 = index + 1;
    const fmtTimeStart = secondsToTimeStr(Math.round(segment[0]));
    const fmtTimeEnd = secondsToTimeStr(Math.round(segment[1]));
    const level = Number(data['level']);
    const n = (level - minSegmentLevel) / (maxSegmentLevel - minSegmentLevel);
    const levelColor = getLevelColor(n);
    const styleColor = `color:${levelColor};`;
    const levelText = getLevelText(level);

    const rareSkills = data['rare skills'];
    let rareSkillText = '';
    if (rareSkills.length > 0) {
      rareSkillText = '⚠️';
    }

    // create effect to open segment when scrolling into it
    let startPx = segment[0] * pxPerSecond();
    let endPx = segment[1] * pxPerSecond();
    createEffect(() => {
      const beforeLeniency = 500;
      const afterLeniency = -100;
      let y = canvasScrollPositionMirror();
      if (y) {
        // open if near
        if ((y > startPx - beforeLeniency) && (y < endPx + afterLeniency)) {
          setIsOpen(true);
        }

        // close if far
        if (y < startPx - beforeLeniency) {
          setIsOpen(false);
        }
        if (y > endPx + afterLeniency) {
          setIsOpen(false);
        }
      }
    })

    return (
      <div class="rounded-lg mb-2 overflow-hidden">
        {/* Header - Always visible */}
        <div 
          class="p-2 bg-gray-900 hover:bg-gray-800 cursor-pointer flex justify-between items-center transition-colors"
          onClick={() => (setIsOpen(!isOpen()), scrollToTime(segment[0]))}
        >
          <div class="flex-1">
          <span class="font-medium" style="color:#ddd">
            {/* §{sectionNumberP1} */}
            {sectionNumberP1}.
          </span>
          <span class="font-small" style="color:#777"> {fmtTimeStart}-{fmtTimeEnd} </span>
          <span class="font-medium" style={styleColor}>lv.{levelText} {rareSkillText}</span>
          </div>
          <span class={`transform transition-transform ${isOpen() ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Collapsible content */}
        <div 
          class={`overflow-hidden transition-all ${isOpen() ? 'max-h-96' : 'max-h-0'}`}
        >
          <div class="p-3" style="background-color: #444">
            {/* Add your SegmentData display here */}
            {segmentContent(segment, data)};
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="flex flex-col gap-0 p-4">
      {props.segments.map((segment, index) =>
        SegmentCollapsible(segment, props.segmentData[index], index)
      )}
    </div>
  );
};

function chartDescription(metadata: strToAny): JSXElement {
  function parseDisplayBPM(displaybpm: string | undefined): string {
    if (displaybpm === undefined) {
      return 'missing';
    }
    if (displaybpm.includes(':')) {
      let bpms = displaybpm.split(':');
      return `${Math.round(Number(bpms[0]))}~${Math.round(Number(bpms[1]))}`
    }
    return `${Math.round(Number(displaybpm))}`
  }

  return (
    <span class="font-small" style="color:#ddd">
      <p>Pack: {metadata['pack']}</p>
      <Show when={'CHARTNAME' in metadata} fallback={<></>}>
        <p>info: {metadata['CHARTNAME']}</p>
      </Show>
      <p>Song type: {metadata['SONGTYPE']}</p>
      <p>Song category: {metadata['SONGCATEGORY']}</p>
      <p>Display BPM: {parseDisplayBPM(metadata['DISPLAYBPM'])}</p>
      <p>Step artist: {metadata['CREDIT']}</p>
    </span>
);
};


/**
 * Default function, drawn by solid.js
 * @returns 
 */
export default function DynamicPage(): JSXElement {
  // Stores current route path; /chart/:id = params.id = [id].tsx
  const params = useParams();

  // Refetches data whenever params.id changes
  const [data, { mutate, refetch }] = createResource(params.id, fetchData);

  let metadata: strToAny = {};
  let segments: Segment[] = [];
  let segmentdata: strToAny[] = [];
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
    if (typeof document !== 'undefined') {
      document.title = params.id;
    }

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
  });

  console.log('env: ', checkEnvironment());
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

        <div class="columns-container" style={'overflow: hidden; padding: 0; background-color: #2e2e2e'}>
          <div id="column1" class={`column ${activeColumn() === 'column1' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>
            
            {/* <div style={'position: fixed; width: 400px; height: 100%; background-color: #3e3e3e'}>
            </div> */}

            <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
                {/* {params.id} */}
                {params.id.replace(/_/g," ")}
            </span>
            <span> {manuallyAnnotatedFlag} </span>
            <span> {data.loading && "Loading..."} </span>
            <span> {data.error && "Error"} </span>
            <div style={'display: flex'}>
              {SaveJsonButton(params.id, data()!)}
              {SetClickToEitherButton()}
              {SetClickToMissButton()}
              {SetClickToLRButton()}
            </div>
            {chartDescription(metadata)}
            <div style={'height: 100%; overflow: auto'}>
              <SegmentTimeline 
                segments={segments} segmentData={segmentdata}
              />
            </div>

          </div>

          <div id="column2" class={`column ${activeColumn() === 'column2' ? 'active' : ''}`} style={'float: left'}>
            <div style={'background-color: #2e2e2e; height: 100%'}> {drawKonvaCanvas(data, mutate)} </div>
          </div>

          <div id="column3" class={`column ${activeColumn() === 'column3' ? 'active' : ''}`} style={'float: left; background-color: #2e2e2e'}>

            <span class="font-medium" style="color:#eee; text-align: center; display:block; width: 100%">
              {/* <p>eNPS timeline data</p> */}
            </span>
            <div style={'height: 100%; margin-top: 10px; overflow: auto'}>
              {drawENPSTimeline(data)}
            </div>

            {/* <div style={'float: right; width: 500px; height: 100%; background-color: #3e3e3e; overflow: auto'}>
            </div> */}

          </div>
        </div>
      </div>

    </>
  );
};
