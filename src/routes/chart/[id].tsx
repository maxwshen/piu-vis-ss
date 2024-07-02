import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount } from "solid-js";
import type { Signal, Accessor, Setter } from 'solid-js';
import { JSX } from "solid-js/h/jsx-runtime";

// [panel, time, limbAnnot]
type ArrowArt = [number, number, string];
// [panel, start_time, end_time, limbAnnot]
type HoldArt = [number, number, number, string];
type ChartArt = [ArrowArt[], HoldArt[]];

const panel_px_interval = 50;
const pixels_per_second = 100;
// arrow imgs are square
const canvasWidth = 500;
const canvasHeight = 5000;
const arrowImgWidth = 40;
const arrowImgHeight = arrowImgWidth;


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
      checkEnvironment().concat(`/public/chart-json/${id}.json`)
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


/**
 * Fetches Signal for query image
 * @param panel: number in [0-9]
 * @param limbAnnot: one of ['l', 'r', 'e', 'h']
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
  }
  let key = (limbAnnot + '_' + imageName);
  let imgSet = tree[key];
  let panel_idx = panel % 5;
  return imgSet[panel_idx];
}

/**
 * Draws HTML canvas of arrow arts and hold arts.
 * @param data 
 */
function drawCanvas(data: ChartArt) {
  var canvasRef: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvasRef.getContext("2d");

    // draw spaced lines for time
    if (ctx) {
      const x_left = 100;
      const x_right = 300;
      const y_interval = 50;
      const num_lines = 30;
      for (let i: number = 0; i < num_lines; i++) {
        ctx.beginPath();
        const y = i * y_interval;
        ctx.moveTo(x_left, y);
        ctx.lineTo(x_right, y);
        ctx.stroke();
      }
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
          panelPos * panel_px_interval, 
          time * pixels_per_second,
          arrowImgWidth,
          arrowImgHeight);
      };
    }
  };

  // draw holds
  const drawHoldArts = (ctx: CanvasRenderingContext2D) => {
    let holdarts = data[1];

    for (const arrowart of holdarts) {
      const [panelPos, start_time, end_time, limbAnnot] = arrowart;

      // draw hold trail first, so it's on bottom of z-axis
      const holdTrail = new Image();
      // const [trailImageGetter, __] = trailImageSignals[panelPos % 5];
      const [trailImageGetter, __] = getImage(panelPos, limbAnnot, 'trail');
      holdTrail.src = trailImageGetter();
      holdTrail.onload = () => {
        ctx.drawImage(
          holdTrail, 
          panelPos * panel_px_interval, 
          start_time * pixels_per_second + arrowImgHeight / 2,
          arrowImgWidth,
          (end_time - start_time) * pixels_per_second);
      };

      // draw hold cap
      const holdCap = new Image();
      // const [capImageGetter, ___] = capImgSignals[panelPos % 5];
      const [capImageGetter, ___] = getImage(panelPos, limbAnnot, 'cap');
      holdCap.src = capImageGetter();
      holdCap.onload = () => {
        ctx.drawImage(
          holdCap, 
          panelPos * panel_px_interval, 
          end_time * pixels_per_second,
          arrowImgWidth,
          arrowImgHeight);
      };

      // draw hold head last, so it's on top of z-axis
      const holdHead = new Image();
      // const [headImageGetter, _] = arrowImgSignals[panelPos % 5];
      const [headImageGetter, _] = getImage(panelPos, limbAnnot, 'arrow');
      holdHead.src = headImageGetter();
      holdHead.onload = () => {
        ctx.drawImage(
          holdHead, 
          panelPos * panel_px_interval, 
          start_time * pixels_per_second,
          arrowImgWidth,
          arrowImgHeight);
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
    for (const arrowart of arrowarts) {
      const [panelPos, time, limbAnnot] = arrowart;
      const arrow_x = panelPos * panel_px_interval;
      const arrow_y = time * pixels_per_second;

      if (
        x >= arrow_x &&
        x <= arrow_x + arrowImgWidth &&
        y >= arrow_y &&
        y <= arrow_y + arrowImgHeight
      ) {
        console.log("Arrow clicked!", arrowart);
      }
    };
  };

  return (
    <canvas 
      // ! asserts that canvasRef is not null
      ref={canvasRef!} 
      width={canvasWidth} 
      height={canvasHeight} 
      style={`border: 1px solid red;`}
    />
  )
}


/**
 * Default function, drawn by solid.js
 * @returns 
 */
export default function DynamicPage(): JSX.Element {
  // Stores current route path; /chart/:id = params.id = [id].tsx
  const params = useParams();

  // Refetches data whenever params.id changes
  const [data] = createResource(params.id, fetchData);

  console.log('env: ', checkEnvironment());
  // console.log(data());
  return (
    <>
      <span> {params.id} </span>
      <span> {data.loading && "Loading..."} </span>
      <span> {data.error && "Error"} </span>
      <div> {drawCanvas(data()!)} </div>
      <div>
        {/* <pre> {data() && JSON.stringify(data()![0][0], null, 0)}</pre> */}
        <pre> {JSON.stringify(data(), null, 1)}</pre>
      </div>
    </>
  );
};
