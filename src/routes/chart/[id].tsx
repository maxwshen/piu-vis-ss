import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount } from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";

// [panel, time, limb_annot]
type ArrowArt = [number, number, string];
// [panel, start_time, end_time, limb_annot]
type HoldArt = [number, number, number, string];
type ChartArt = [ArrowArt[], HoldArt[]];

const panel_px_interval = 50;
const pixels_per_second = 100;
// arrow imgs are square
const canvasWidth = 500;
const canvasHeight = 5000;
const arrowImgWidth = 40;
const arrowImgHeight = arrowImgWidth;


function checkEnvironment(): string {
  // Get base URL, depending on local env variable
  // https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


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


function drawCanvas(data: ChartArt) {
  var canvasRef: HTMLCanvasElement;

  const imagePaths = [
    '/public/images/arrows-standard/arrow_1.png',
    '/public/images/arrows-standard/arrow_7.png',
    '/public/images/arrows-standard/arrow_5.png',
    '/public/images/arrows-standard/arrow_9.png',
    '/public/images/arrows-standard/arrow_3.png',
  ];
  const arrowImgSignals = Array.from(
    { length: imagePaths.length }, 
    (_, i) => createSignal(
      checkEnvironment().concat(imagePaths[i])
    )
  );

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
      canvasRef.addEventListener("click", handleCanvasClick);
    };
  });

  // draw arrows
  const drawArrowArts = (ctx: CanvasRenderingContext2D) => {
    let arrowarts = data[0];

    for (const arrowart of arrowarts) {
      const [panel_pos, time, limb_annot] = arrowart;
      const image = new Image();
      const [imageGetter, _] = arrowImgSignals[panel_pos % 5];
      image.src = imageGetter();
      image.onload = () => {
        ctx.drawImage(
          image, 
          panel_pos * panel_px_interval, 
          time * pixels_per_second,
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
      const [panel_pos, time, limb_annot] = arrowart;
      const arrow_x = panel_pos * panel_px_interval;
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


export default function DynamicPage(): JSX.Element {
  // Stores current route path; /chart/:id = params.id = [id].tsx
  const params = useParams();

  // Refetches data whenever params.id changes
  const [data] = createResource(params.id, fetchData);

  console.log('found env', checkEnvironment());
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
