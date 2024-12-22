import { createSignal, createResource, onMount } from "solid-js";
import type { Resource } from 'solid-js';
import { isServer } from 'solid-js/web';
import Konva from 'konva';
import { useArrowImages } from '~/lib/images';
import { getLevel, getSinglesOrDoubles, computeLastTime } from '~/lib/canvas_art';
import { ArrowArt, HoldArt, HoldTick, ChartArt } from '~/lib/types';
import { secondsToTimeStr } from '~/lib/util';
import { useChartContext } from "~/components/Chart/ChartContext";
import { StrToAny, StrToStr } from "./util";


interface ArrowCanvasProps {
  dataGet: Resource<ChartArt | null>;
  mutate: (value: ChartArt) => void;
}


export default function KonvaCanvas(props: ArrowCanvasProps) {
  let dataGet = props.dataGet;
  let mutate = props.mutate;

  let containerRef: HTMLDivElement;
  let largeContainerRef: HTMLDivElement;

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

  const panelPxInterval = 40;
  const [canvasWidth, setCanvasWidth] = createSignal(530);
  const arrowImgWidth = 40;
  const arrowImgHeight = arrowImgWidth;

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

      const { getImage } = useArrowImages();

      // compute canvas height and width
      const numPanels = getSinglesOrDoubles(data);
      setCanvasWidth(panelPxInterval * numPanels + 55);

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
      const enpsAnnotColX = holdTicksColX + 20;

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
      const layerHoldHead = new Konva.default.Layer();
      const layerHoldCap = new Konva.default.Layer();
      const layerHoldTrail = new Konva.default.Layer();
      const layerTimingWindow = new Konva.default.Layer();

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
        const npsAnnotPart2 = nps_annot.split('\n')[1].replace('Quarter notes', 'Quarter\nnotes') + '\n' + nps_annot.split('\n')[2];
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
        if (limb.includes('miss')) {
          alpha = 0.3;
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
        if (limb.includes('miss')) {
          alpha = 0.3;
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
        layerHoldHead.add(konva_img);

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
        layerHoldTrail.add(konva_img);

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
        layerHoldCap.add(konva_img);

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

      // draw function for timing window
      function drawTimingWindow(time: number, id: string) {
        // draws timing window for arrow `id` at `time`
        // id is used to construct a shared name for all drawn assets
        const t = 0.0416;
        
        const judgmentToColor: StrToStr = {
          'perfect': '#00a0dc',
          'great': '#7cb82f',
          'good': '#efb920',
          'bad': '#8c68cb',
        }

        const windows = [
          [-t*4, -t*3],
          [-t*3, -t*2],
          [-t*2, -t],
          [-t, t*2],
          [t*2, t*3],
          [t*3, t*4],
          [t*4, t*5],
        ]
        const judgments = ['bad', 'good', 'great', 'perfect', 'great', 'good', 'bad']

        for (let i = 0; i < windows.length; i++) {
          let [beginTime, endTime] = windows[i];
          let judgment = judgments[i];
          let color = judgmentToColor[judgment];
          let rect = new Konva.default.Rect({
            x: arrowsColX,
            y: (time + beginTime) * pxPerSecond(),
            width: arrowsColXRight,
            height: (endTime - beginTime) * pxPerSecond(),
            fill: color,
            opacity: 0.5,
            name: id,
          })
          layerTimingWindow.add(rect);
        }

        // draw line for exact perfect time
        let rect = new Konva.default.Rect({
          x: arrowsColX,
          y: time * pxPerSecond(),
          width: arrowsColXRight,
          height: 1,
          fill: '#fff',
          name: id,
        })
        layerTimingWindow.add(rect);
      }

      // interactivity on stage
      stage.on('click', function (e) {
        // if (!editorMode) { return }
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
            // handle click-to-miss
            if (clickTo()['type'] == 'miss') {
              let misses = missTimes(); 
              
              // handle marking multiple arrows in same row as miss, 
              // by allowing duplicate times in missTimes, 
              // which are unique'd in code that calculates health
              if (!limbAnnot.includes('miss')) {
                setMissTimes([...misses, time]);
              } else {
                let newMisses = [...misses];
                newMisses.splice(newMisses.indexOf(time), 1);
                setMissTimes(newMisses);
              }
            }

            // handle click-to-show-timing-window
            if (clickTo()['type'] == 'timingwindow') {              
              if (!limbAnnot.includes('window')) {
                drawTimingWindow(time, id);
                layerTimingWindow.batchDraw();
              } else {
                let drawnAssets = layerTimingWindow.find(`.${id}`);
                drawnAssets.map((a) => a.destroy());
              }
            }

            // remove prev arrow
            const node = layer1?.findOne(`#${id}`);
            node?.destroy();

            // draw new arrow
            let newLimb = clickTo()[limbAnnot] ?? limbAnnot;
            drawArrowArt(arrowart, newLimb, i); 

            // edit foot annotation
            let editedArrowArts = arrowarts.slice(0, i).concat(
              [[panelPos, time, newLimb]],
            ).concat(arrowarts.slice(i + 1, arrowarts.length));
            mutate([editedArrowArts, holdarts, metadata]);
            return;
          }
        };

        // handle clicking on hold 
        for (let i: number = 0; i < holdarts.length; i++) {
          let holdart = holdarts[i];
          const [panelPos, startTime, endTime, limbAnnot] = holdart;
          const arrow_x = arrowsColX + panelPos * panelPxInterval;
          const arrow_y = startTime * pxPerSecond();

          // disallow click-to-miss on holds
          if (clickTo()['l'] == 'l_miss') {
            return;
          }

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
            const node2 = layerHoldHead?.findOne(`#${id}`);
            node2?.destroy();
            const node3 = layerHoldCap?.findOne(`#${id}`);
            node3?.destroy();
            const node4 = layerHoldTrail?.findOne(`#${id}`);
            node4?.destroy();

            // draw new art
            let newLimb = clickTo()[limbAnnot] ?? limbAnnot;
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
            let newLimb = clickTo()[limbAnnot] ?? limbAnnot;

            let editedHoldArts = holdarts.slice(0, i).concat(
              [[panelPos, startTime, endTime, newLimb]],
            ).concat(holdarts.slice(i + 1, holdarts.length));
            mutate([arrowarts, editedHoldArts, metadata]);

            // remove prev art
            let id = String(i);
            const node2 = layerHoldHead?.findOne(`#${id}`);
            node2?.destroy();
            const node3 = layerHoldCap?.findOne(`#${id}`);
            node3?.destroy();
            const node4 = layerHoldTrail?.findOne(`#${id}`);
            node4?.destroy();

            // draw new art
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
      stage.add(layerHoldTrail);
      stage.add(layerHoldCap);
      stage.add(layerHoldHead);
      stage.add(layerTimingWindow);

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
        var sectionIdx = Number(paramSection) - 1;
        if (sectionIdx >= segments.length) {
          sectionIdx = segments.length - 1
        }
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
          "height": "calc(100vh - 80px)",
          "margin": "auto",
        }}
      >
        <div
          ref={largeContainerRef!}
          style={{
            "width": "80px",
            "height": "10px",
            "overflow": "hidden",
            "background-color": "#2e2e2e",
          }}
        >
          <div 
            ref={containerRef!} 
            style={{
              "margin": "auto",
              "width": canvasWidth() + 100 + "px",
              "height": "100%",
              "background-color": "#2e2e2e",
            }}
          >
          </div>
        </div>
      </div>
    </div>
  );
};