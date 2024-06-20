import { createSignal, onCleanup, onMount } from 'solid-js';


const checkEnvironment = () => {
  // https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


export default function CanvasComponent() {
  var canvasRef: HTMLCanvasElement;

  // Signal to hold the loaded image
  const [imageSrc, setImageSrc] = createSignal(
    checkEnvironment().concat('/public/images/arrows-standard/arrow_1.png')
  );

  onMount(() => {
    console.log(canvasRef.height);
    const ctx = canvasRef.getContext("2d");
    // drawImage(ctx);
    const image = new Image();
    image.src = imageSrc();
    console.log(imageSrc());
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
    };
  });

  const drawImage = (ctx: CanvasRenderingContext2D) => {
    const image = new Image();
    image.src = imageSrc();
    console.log(imageSrc());
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
    };
  };

  console.log(imageSrc());

  return (
    // <canvas ref={canvasRef!} ></canvas>
    <canvas ref={canvasRef!} width={500} height={500} style={`border: 1px solid red;`}>
      content
    </canvas>
  )
};
