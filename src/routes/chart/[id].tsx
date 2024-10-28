import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, onCleanup, createEffect, $DEVCOMP } from "solid-js";
import type { Signal, Accessor, Setter, JSXElement } from 'solid-js';
import "./[id].css"
import Konva from 'konva';
import { isServer } from 'solid-js/web';

// [panel, time, limbAnnot]
type ArrowArt = [number, number, string];
// [panel, startTime, endTime, limbAnnot]
type HoldArt = [number, number, number, string];
type ChartArt = [ArrowArt[], HoldArt[]];

const panelPxInterval = 43;
const [pxPerSecond, setPxPerSecond] = createSignal(400);
// arrow imgs are square
const canvasWidth = 530;
const canvasHeight = 5000;
const arrowImgWidth = 40;
const arrowImgHeight = arrowImgWidth;

interface strToStr {
  [key: string]: string;
};
const [clickTo, setClickTo] = createSignal<strToStr>({'l': 'r', 'r': 'l'});

const [scrollPosition, setScrollPosition] = createSignal(0);


/**
 * Get base URL, depending on local env variable
 * https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
 * @returns 
 */
function checkEnvironment(): string {
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


/**
 * Fetches JSON data
 * @param id: json filename
 * @returns 
 */
async function fetchData(id: string): Promise<ChartArt | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/101824/${id}.json`)
      // checkEnvironment().concat(`/rayden-072924-ae-072824-lgbm-091924/${id}.json`)
      // checkEnvironment().concat(`/public/piucenter-annot-070824/chart-json/${id}.json`)
      // checkEnvironment().concat(`/rayden-072624/chart-json/${id}.json`)
  );
    const obj = await response.json();
    return obj;
  } catch (error) {
    console.error(error);
  }
  return null;
}

const arrowImagePathsLeft = [
  '/public/images/arrows-hint/arrow_downleft_left.png',
  '/public/images/arrows-hint/arrow_upleft_left.png',
  '/public/images/arrows-hint/arrow_center_left.png',
  '/public/images/arrows-hint/arrow_upright_left.png',
  '/public/images/arrows-hint/arrow_downright_left.png',
];
const arrowImgSignalsLeft = Array.from(
  { length: arrowImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsLeft[i])
  )
);
const trailImagePathsLeft = [
  '/public/images/arrows-hint/trail_downleft_left.png',
  '/public/images/arrows-hint/trail_upleft_left.png',
  '/public/images/arrows-hint/trail_center_left.png',
  '/public/images/arrows-hint/trail_upright_left.png',
  '/public/images/arrows-hint/trail_downright_left.png',
];
const trailImageSignalsLeft = Array.from(
  { length: trailImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsLeft[i])
  )
);
const capImagePathsLeft = [
  '/public/images/arrows-hint/holdcap_downleft_left.png',
  '/public/images/arrows-hint/holdcap_upleft_left.png',
  '/public/images/arrows-hint/holdcap_center_left.png',
  '/public/images/arrows-hint/holdcap_upright_left.png',
  '/public/images/arrows-hint/holdcap_downright_left.png',
];
const capImgSignalsLeft = Array.from(
  { length: capImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsLeft[i])
  )
);
const arrowImagePathsRight = [
  '/public/images/arrows-hint/arrow_downleft_right.png',
  '/public/images/arrows-hint/arrow_upleft_right.png',
  '/public/images/arrows-hint/arrow_center_right.png',
  '/public/images/arrows-hint/arrow_upright_right.png',
  '/public/images/arrows-hint/arrow_downright_right.png',
];
const arrowImgSignalsRight = Array.from(
  { length: arrowImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsRight[i])
  )
);
const trailImagePathsRight = [
  '/public/images/arrows-hint/trail_downleft_right.png',
  '/public/images/arrows-hint/trail_upleft_right.png',
  '/public/images/arrows-hint/trail_center_right.png',
  '/public/images/arrows-hint/trail_upright_right.png',
  '/public/images/arrows-hint/trail_downright_right.png',
];
const trailImageSignalsRight = Array.from(
  { length: trailImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsRight[i])
  )
);
const capImagePathsRight = [
  '/public/images/arrows-hint/holdcap_downleft_right.png',
  '/public/images/arrows-hint/holdcap_upleft_right.png',
  '/public/images/arrows-hint/holdcap_center_right.png',
  '/public/images/arrows-hint/holdcap_upright_right.png',
  '/public/images/arrows-hint/holdcap_downright_right.png',
];
const capImgSignalsRight = Array.from(
  { length: capImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsRight[i])
  )
);
const arrowImagePathsEither = [
  '/public/images/arrows-hint/arrow_downleft_either.png',
  '/public/images/arrows-hint/arrow_upleft_either.png',
  '/public/images/arrows-hint/arrow_center_either.png',
  '/public/images/arrows-hint/arrow_upright_either.png',
  '/public/images/arrows-hint/arrow_downright_either.png',
];
const arrowImgSignalsEither = Array.from(
  { length: arrowImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsEither[i])
  )
);
const trailImagePathsEither = [
  '/public/images/arrows-hint/trail_downleft_either.png',
  '/public/images/arrows-hint/trail_upleft_either.png',
  '/public/images/arrows-hint/trail_center_either.png',
  '/public/images/arrows-hint/trail_upright_either.png',
  '/public/images/arrows-hint/trail_downright_either.png',
];
const trailImageSignalsEither = Array.from(
  { length: trailImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsEither[i])
  )
);
const capImagePathsEither = [
  '/public/images/arrows-hint/holdcap_downleft_either.png',
  '/public/images/arrows-hint/holdcap_upleft_either.png',
  '/public/images/arrows-hint/holdcap_center_either.png',
  '/public/images/arrows-hint/holdcap_upright_either.png',
  '/public/images/arrows-hint/holdcap_downright_either.png',
];
const capImgSignalsEither = Array.from(
  { length: capImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsEither[i])
  )
);
const arrowImagePathsHand = [
  '/public/images/arrows-hint/arrow_downleft_hand.png',
  '/public/images/arrows-hint/arrow_upleft_hand.png',
  '/public/images/arrows-hint/arrow_center_hand.png',
  '/public/images/arrows-hint/arrow_upright_hand.png',
  '/public/images/arrows-hint/arrow_downright_hand.png',
];
const arrowImgSignalsHand = Array.from(
  { length: arrowImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsHand[i])
  )
);
const trailImagePathsHand = [
  '/public/images/arrows-hint/trail_downleft_hand.png',
  '/public/images/arrows-hint/trail_upleft_hand.png',
  '/public/images/arrows-hint/trail_center_hand.png',
  '/public/images/arrows-hint/trail_upright_hand.png',
  '/public/images/arrows-hint/trail_downright_hand.png',
];
const trailImageSignalsHand = Array.from(
  { length: trailImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsHand[i])
  )
);
const capImagePathsHand = [
  '/public/images/arrows-hint/holdcap_downleft_hand.png',
  '/public/images/arrows-hint/holdcap_upleft_hand.png',
  '/public/images/arrows-hint/holdcap_center_hand.png',
  '/public/images/arrows-hint/holdcap_upright_hand.png',
  '/public/images/arrows-hint/holdcap_downright_hand.png',
];
const capImgSignalsHand = Array.from(
  { length: capImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsHand[i])
  )
);

/**
 * Fetches Signal for query image
 * @param panel: number in [0-9]
 * @param limbAnnot: one of ['l', 'r', 'e', 'h', '?']
 * @param imageName: one of ['arrow', 'trail', 'cap']
 */
function getImage(
  panel: number, 
  limbAnnot: string, 
  imageName: string
): Signal<string> {
  interface treeInterface {
    [key: string]: Signal<string>[];
  }
  const tree: treeInterface = {
    'l_arrow': arrowImgSignalsLeft,
    'l_trail': trailImageSignalsLeft,
    'l_cap': capImgSignalsLeft,
    'r_arrow': arrowImgSignalsRight,
    'r_trail': trailImageSignalsRight,
    'r_cap': capImgSignalsRight,
    'h_arrow': arrowImgSignalsHand,
    'h_trail': trailImageSignalsHand,
    'h_cap': capImgSignalsHand,
    'e_arrow': arrowImgSignalsEither,
    'e_trail': trailImageSignalsEither,
    'e_cap': capImgSignalsEither,
    '?_arrow': arrowImgSignalsEither,
    '?_trail': trailImageSignalsEither,
    '?_cap': capImgSignalsEither,
  }
  let key = (limbAnnot + '_' + imageName);
  let imgSet = tree[key];
  let panel_idx = panel % 5;
  return imgSet[panel_idx];
}


/**
 * Draws Konva HTML canvas of arrow arts and hold arts.
 * @param data 
 */
function drawKonvaCanvas(data: ChartArt, mutate: Setter<ChartArt | null | undefined>) {
  const [isClient, setIsClient] = createSignal(false);
  let containerRef: HTMLDivElement;
  let scrollContainerRef: HTMLDivElement;
  let largeContainerRef: HTMLDivElement;

  // Only run on client-side - avoids hydration error.
  // Konva creates canvas elements directly in the DOM after mounting,
  // which can conflict with SSR/hydration.
  onMount(() => {
    setIsClient(true);
  });

  createEffect(() => {
    // Skip initialization if we're on the server or Konva isn't ready
    if (isServer || !isClient()) return;

    // Dynamically import Konva only on the client side
    import('konva').then((Konva) => {
      // draw

      // compute canvas height from last note
      let arrowarts = data[0];
      let holdarts = data[1];
      let lastArrowTime = 0;
      let lastHoldEndTime = 0;
      if (arrowarts && arrowarts.length > 0) {
        lastArrowTime = arrowarts[arrowarts.length - 1][1];
      }
      if (holdarts && holdarts.length > 0) {
        lastHoldEndTime = holdarts[holdarts.length - 1][2];
      }
      let lastTime = Math.max(lastArrowTime, lastHoldEndTime);
      var canvas_height = lastTime * pxPerSecond() + 100;

      largeContainerRef.style.height = canvas_height + 'px';

      var PADDING = 500;
      console.log(window.innerWidth, window.innerHeight);

      // make stage & layers
      const newStage = new Konva.default.Stage({
        container: containerRef,
        width: window.innerWidth + PADDING * 2,
        height: window.innerHeight + PADDING * 2,
        // width: canvasWidth,
        // height: canvas_height,
      });
      const layer1 = new Konva.default.Layer();
      const layer2 = new Konva.default.Layer();

      // make background
      const background = new Konva.default.Rect({
        x: 0,
        y: 0,
        width: newStage.width(),
        height: newStage.height(),
        fill: '#2e2e2e'
      });
      layer1.add(background);

      // draw spaced lines for time
      const lineMargin = 50;
      const x_left = 0 + lineMargin;
      const x_right = canvasWidth - lineMargin;
      const y_interval = 50;
      const num_lines = canvas_height / y_interval;
      for (let i: number = 0; i < num_lines; i++) {
        const y = i * y_interval;
        var line = new Konva.default.Line({
          points: [x_left, y, x_right, y],
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
          text: `${i*seconds_per_timestamp}s`,
          x: 0,
          y: y,
          fontSize: 32,
          fontFamily: 'Helvetica',
          fill: 'White',
          align: 'right',
        });
        layer1.add(text);
      }

      // add arrows
      for (const arrowart of arrowarts) {
        const [panelPos, time, limbAnnot] = arrowart;
        const image = new Image();
        const [imageGetter, _] = getImage(panelPos, limbAnnot, 'arrow');
        image.src = imageGetter();
        image.onload = () => {
          var konva_img = new Konva.default.Image({
            x: lineMargin + panelPos * panelPxInterval,
            y: time * pxPerSecond(),
            image: image,
            width: arrowImgWidth,
            height: arrowImgHeight,
          });
          layer1.add(konva_img);
        };
      }

      // add holds
      for (const holdart of holdarts) {
        const [panelPos, startTime, endTime, limbAnnot] = holdart;
  
        // draw hold head
        const holdHead = new Image();
        const [headImageGetter, _] = getImage(panelPos, limbAnnot, 'arrow');
        holdHead.src = headImageGetter();
        holdHead.onload = () => {
          var konva_img = new Konva.default.Image({
            x: lineMargin + panelPos * panelPxInterval,
            y: startTime * pxPerSecond(),
            image: holdHead,
            width: arrowImgWidth,
            height: arrowImgHeight,
          });
          layer2.add(konva_img);
        };
  
        // draw hold trail
        const holdTrail = new Image();
        const [trailImageGetter, __] = getImage(panelPos, limbAnnot, 'trail');
        holdTrail.src = trailImageGetter();
        holdTrail.onload = () => {
          var konva_img = new Konva.default.Image({
            x: lineMargin + panelPos * panelPxInterval,
            y: startTime * pxPerSecond() + arrowImgHeight / 2,
            image: holdTrail,
            width: arrowImgWidth,
            height: (endTime - startTime) * pxPerSecond(),
          });
          layer1.add(konva_img);
        };

        // draw hold cap
        const holdCap = new Image();
        const [capImageGetter, ___] = getImage(panelPos, limbAnnot, 'cap');
        holdCap.src = capImageGetter();
        holdCap.onload = () => {
          var konva_img = new Konva.default.Image({
            x: lineMargin + panelPos * panelPxInterval,
            y: endTime * pxPerSecond(),
            image: holdCap,
            width: arrowImgWidth,
            height: arrowImgHeight,
          });
          layer1.add(konva_img);
        };
      }

      // interactivity on stage
      newStage.on('click', function (e) {
        // e.target is a clicked Konva.Shape or current stage if you clicked on empty space
        const scrolly = scrollContainerRef.scrollTop - PADDING;
        const scrollx = scrollContainerRef.scrollLeft - PADDING;
        const x = newStage.getPointerPosition()!.x + scrollx;
        const y = newStage.getPointerPosition()!.y + scrolly;
        console.log(x, y);

        // console.log('clicked on', e.target);
        // console.log('clicked on', newStage.getPointerPosition().x);
        // console.log('clicked on', newStage.getPointerPosition().y);
        // console.log(
        //   'usual click on ' + JSON.stringify(newStage.getPointerPosition())
        // );

        // handle clicking on arrow
        for (let i: number = 0; i < arrowarts.length; i++) {
          let arrowart = arrowarts[i];
          const [panelPos, time, limbAnnot] = arrowart;
          const arrow_x = lineMargin + panelPos * panelPxInterval;
          const arrow_y = time * pxPerSecond();
    
          if (
            x >= arrow_x &&
            x <= arrow_x + arrowImgWidth &&
            y >= arrow_y &&
            y <= arrow_y + arrowImgHeight
          ) {
            let editedArrowArts = arrowarts.slice(0, i).concat(
              [[panelPos, time, clickTo()[limbAnnot]]],
            ).concat(arrowarts.slice(i + 1, arrowarts.length));
            mutate([editedArrowArts, holdarts]);
            return;
          }
        };
    
        // handle clicking on hold 
        for (let i: number = 0; i < holdarts.length; i++) {
          let holdart = holdarts[i];
          const [panelPos, startTime, endTime, limbAnnot] = holdart;
          const arrow_x = lineMargin + panelPos * panelPxInterval;
          const arrow_y = startTime * pxPerSecond();
    
          // clicking on head
          if (
            x >= arrow_x &&
            x <= arrow_x + arrowImgWidth &&
            y >= arrow_y &&
            y <= arrow_y + arrowImgHeight
          ) {
            // console.log("Hold clicked!", holdart);
            let editedHoldArts = holdarts.slice(0, i).concat(
              [[panelPos, startTime, endTime, clickTo()[limbAnnot]]],
            ).concat(holdarts.slice(i + 1, holdarts.length));
            mutate([arrowarts, editedHoldArts]);
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
            mutate([arrowarts, editedHoldArts]);
            return;
          }
    
        };
      });

      // scrolling
      function repositionStage() {
        var dx = scrollContainerRef.scrollLeft - PADDING;
        var dy = scrollContainerRef.scrollTop - PADDING;
        newStage.container().style.transform =
          'translate(' + dx + 'px, ' + dy + 'px)';
        newStage.x(-dx);
        newStage.y(-dy);
        if (dy != - PADDING) {
          setScrollPosition(dy);
        };
      }
      scrollContainerRef.addEventListener('scroll', repositionStage);
      repositionStage();

      newStage.add(layer1);
      newStage.add(layer2);

      // on solidjs redraw, scroll back to previous location
      scrollContainerRef.scrollTo(0, scrollPosition() + PADDING);
    });
  });

  return (
    <div>
      <div
        ref={scrollContainerRef!}
        style={{
          "overflow": "auto",
          "width": "1000px",
          "height": "calc(100vh - 100px)",
          "margin": "auto",
          "border": "1px solid grey",
        }}
      >
        <div
          ref={largeContainerRef!}
          style={{
            "width": "800px",
            // "height": "200000px",
            "height": "200px",
            "overflow": "hidden",
            "background-color": "#2e2e2e",
          }}
        >
          <div 
            ref={containerRef!} 
            style={{
              "border": "1px solid #ccc",
              "margin": "auto",
              "width": "800px",
              "height": "600px",
              "background-color": "#2e2e2e",
            }}
          >
          </div>
        </div>
      </div>
    </div>
  );
};


/**
 * Draws HTML canvas of arrow arts and hold arts.
 * @param data 
 */
function drawCanvas(data: ChartArt, mutate: Setter<ChartArt | null | undefined>) {
  var canvasRef: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvasRef.getContext("2d", {alpha: false});

    // compute canvas height from last note
    let arrowarts = data[0];
    let holdarts = data[1];
    let lastArrowTime = 0;
    let lastHoldEndTime = 0;
    if (arrowarts && arrowarts.length > 0) {
      lastArrowTime = arrowarts[arrowarts.length - 1][1];
    }
    if (holdarts && holdarts.length > 0) {
      lastHoldEndTime = holdarts[holdarts.length - 1][2];
    }
    let lastTime = Math.max(lastArrowTime, lastHoldEndTime);
    canvasRef.height = lastTime * pxPerSecond() + 100;
    
    // draw spaced lines for time
    if (ctx) {
      const lineMargin = 50;
      const x_left = 0 + lineMargin;
      const x_right = canvasWidth - lineMargin;
      const y_interval = 50;
      const num_lines = canvasRef.height / y_interval;
      for (let i: number = 0; i < num_lines; i++) {
        ctx.beginPath();
        const y = i * y_interval;
        ctx.moveTo(x_left, y);
        ctx.lineTo(x_right, y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "gray";
        ctx.stroke();
      }

      // draw text for time
      const seconds_per_timestamp = 1;
      const num_timestamps = lastTime / seconds_per_timestamp + 1;
      ctx.font = "32px Helvetica";
      ctx.fillStyle = "White";
      ctx.textAlign = "right";
      for (let i: number = 1; i < num_timestamps; i++) {
        const y = i * seconds_per_timestamp * pxPerSecond();
        ctx.fillText(`${i*seconds_per_timestamp}s`, canvasWidth, y);
      }

      // draw arrows and holds
      drawArrowArts(ctx);
      drawHoldArts(ctx);
      canvasRef.addEventListener("click", handleCanvasClick);
    };
  });

  // draw arrows
  const drawArrowArts = (ctx: CanvasRenderingContext2D) => {
    let arrowarts = data[0];

    for (const arrowart of arrowarts) {
      const [panelPos, time, limbAnnot] = arrowart;
      const image = new Image();
      const [imageGetter, _] = getImage(panelPos, limbAnnot, 'arrow');
      image.src = imageGetter();
      image.onload = () => {
        ctx.drawImage(
          image, 
          panelPos * panelPxInterval, 
          time * pxPerSecond(),
          arrowImgWidth,
          arrowImgHeight);
      };
    }
  };

  // draw holds
  const drawHoldArts = (ctx: CanvasRenderingContext2D) => {
    let holdarts = data[1];
    ctx.globalCompositeOperation = "destination-over";

    for (const arrowart of holdarts) {
      const [panelPos, startTime, endTime, limbAnnot] = arrowart;

      // draw hold head
      const holdHead = new Image();
      const [headImageGetter, _] = getImage(panelPos, limbAnnot, 'arrow');
      holdHead.src = headImageGetter();
      holdHead.onload = () => {
        ctx.drawImage(
          holdHead, 
          panelPos * panelPxInterval, 
          startTime * pxPerSecond(),
          arrowImgWidth,
          arrowImgHeight);
      };

      // draw hold cap
      const holdCap = new Image();
      const [capImageGetter, ___] = getImage(panelPos, limbAnnot, 'cap');
      holdCap.src = capImageGetter();
      holdCap.onload = () => {
        ctx.drawImage(
          holdCap, 
          panelPos * panelPxInterval, 
          endTime * pxPerSecond(),
          arrowImgWidth,
          arrowImgHeight);
      };

      // draw hold trail
      const holdTrail = new Image();
      const [trailImageGetter, __] = getImage(panelPos, limbAnnot, 'trail');
      holdTrail.src = trailImageGetter();
      holdTrail.onload = () => {
        ctx.drawImage(
          holdTrail, 
          panelPos * panelPxInterval, 
          startTime * pxPerSecond() + arrowImgHeight / 2,
          arrowImgWidth,
          (endTime - startTime) * pxPerSecond());
      };

    }
  };

  const handleCanvasClick = (event: MouseEvent) => {
    if (!canvasRef) return;

    const rect = canvasRef.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(x, y);

    let arrowarts = data[0];
    let holdarts = data[1];
    for (let i: number = 0; i < arrowarts.length; i++) {
      let arrowart = arrowarts[i];
      const [panelPos, time, limbAnnot] = arrowart;
      const arrow_x = panelPos * panelPxInterval;
      const arrow_y = time * pxPerSecond();

      if (
        x >= arrow_x &&
        x <= arrow_x + arrowImgWidth &&
        y >= arrow_y &&
        y <= arrow_y + arrowImgHeight
      ) {
        let editedArrowArts = arrowarts.slice(0, i).concat(
          [[panelPos, time, clickTo()[limbAnnot]]],
        ).concat(arrowarts.slice(i + 1, arrowarts.length));
        mutate([editedArrowArts, holdarts]);
        return;
      }
    };

    for (let i: number = 0; i < holdarts.length; i++) {
      let holdart = holdarts[i];
      const [panelPos, startTime, endTime, limbAnnot] = holdart;
      const arrow_x = panelPos * panelPxInterval;
      const arrow_y = startTime * pxPerSecond();

      // clicking on head
      if (
        x >= arrow_x &&
        x <= arrow_x + arrowImgWidth &&
        y >= arrow_y &&
        y <= arrow_y + arrowImgHeight
      ) {
        // console.log("Hold clicked!", holdart);
        let editedHoldArts = holdarts.slice(0, i).concat(
          [[panelPos, startTime, endTime, clickTo()[limbAnnot]]],
        ).concat(holdarts.slice(i + 1, holdarts.length));
        mutate([arrowarts, editedHoldArts]);
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
        mutate([arrowarts, editedHoldArts]);
        return;
      }

    };
  };

  return (
    <canvas 
      // ! asserts that canvasRef is not null
      ref={canvasRef!} 
      width={canvasWidth} 
      height={canvasHeight} 
      style={`border: 1px solid gray; margin: auto`}
    />
  )
}

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

function ScrollButton(): JSXElement {
  const [scrolling, setScrolling] = createSignal(false);
  let scrollInterval: any;
  let logScrollPosition: any;

  // 10 ms per scroll event
  let millisecondInterval = 10;
  let scrollEventsPerSec = 1000 / millisecondInterval;
  let scrollByPx = pxPerSecond() / scrollEventsPerSec;

  const startScrolling = () => {
    if (!scrolling()) {
      setScrolling(true);
      scrollInterval = setInterval(() => {
        window.scrollBy(0, scrollByPx); // Scroll by pixels
      }, 10); // ms interval per scroll event

      createEffect(() => {
        if (scrolling()) {
          const logScrollPosition = setInterval(() => {
            console.log('scrolling', scrolling());
            console.log("Scroll Y:", window.scrollY);
            playTickSound();
            if (!scrolling()) {
              clearInterval(logScrollPosition);
            }
          }, 1000);
    
          // cleanup function
          return () => clearInterval(logScrollPosition);
        }
      });
    }
  };

  const stopScrolling = () => {
    if (scrolling()) {
      setScrolling(false);
      clearInterval(scrollInterval);
      clearInterval(logScrollPosition);
    }
  };

  return (
    <div>
      <button class="nice-button" onClick={startScrolling} disabled={scrolling()}>
        Start Scrolling
      </button>
      <button class="nice-button" onClick={stopScrolling} disabled={!scrolling()}>
        Stop Scrolling
      </button>
    </div>
  );
};

function SetClickToEitherButton(): JSXElement {
  const ChangeClickAction = () => {
    setClickTo({'l': 'e', 'r': 'e', 'e': 'e'});
  };

  return (
    <div>
      <button class="nice-button" onClick={ChangeClickAction}>Set Click To Either</button>
    </div>
  )
};

function SetClickToLRButton(): JSXElement {
  const ChangeClickAction = () => {
    setClickTo({'l': 'r', 'r': 'l', 'e': 'l'});
  };

  return (
    <div>
      <button class="nice-button" onClick={ChangeClickAction}>Set Click To L/R</button>
    </div>
  )
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

  console.log('env: ', checkEnvironment());
  // console.log(data());
  return (
    <>
      <div style={'position: fixed; background-color: #3e3e3e'}>
        <span> {params.id} </span>
        <span> {data.loading && "Loading..."} </span>
        <span> {data.error && "Error"} </span>
        {SaveJsonButton(params.id, data()!)}
        {ScrollButton()}
        {SetClickToEitherButton()}
        {SetClickToLRButton()}
        <br></br>
        <span> Pixels per second: </span>
        <input
          id='setPxPerSecInput'
          type="text"
          value={pxPerSecond()}
          onBlur={(e) => {
            console.log(e.target.value);
            setPxPerSecond(Number(e.target.value));
            refetch();
          }}
          placeholder="Set pixels per second ..."
        />
        </div>
      <div style={'background-color: #2e2e2e'}> {drawKonvaCanvas(data()!, mutate)} </div>
      {/* <div style={'background-color: #2e2e2e'}> {drawCanvas(data()!, mutate)} </div> */}
      {/* <div> */}
        {/* <pre> {data() && JSON.stringify(data()![0][0], null, 0)}</pre> */}
        {/* <pre> {JSON.stringify(data(), null, 1)}</pre> */}
      {/* </div> */}
    </>
  );
};
