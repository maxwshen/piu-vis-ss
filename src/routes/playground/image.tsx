import { createSignal, onCleanup, onMount } from 'solid-js';
import { JSX } from 'solid-js/h/jsx-runtime';


function checkEnvironment(): string {
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
}


export default function CanvasComponent(): JSX.Element {
  var canvasRef: HTMLCanvasElement;

  // Signal to hold the loaded image
  const [imageSrc, setImageSrc] = createSignal(
    checkEnvironment().concat('/images/arrows-standard/arrow_1.png')
  );

  onMount(() => {
    console.log(canvasRef.height);
    const ctx = canvasRef.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(200, 100);
      ctx.stroke();
      drawImage(ctx);
    };
    // const image = new Image();
    // image.src = imageSrc();
    // console.log(imageSrc());
    // image.onload = () => {
    //   ctx.drawImage(image, 0, 0);
    //   ctx.drawImage(image, 10, 0);
    //   ctx.drawImage(image, 20, 0);
    // };
  });

  const drawImage = (ctx: CanvasRenderingContext2D) => {
    const image = new Image();
    image.src = imageSrc();
    console.log(imageSrc());
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
    };
    image.onerror = (error) => {
      console.error('Image failed to load:', error);
    };
  };

  console.log(imageSrc());

  return (
    <div>
      <canvas 
        ref={canvasRef!} 
        width={500} 
        height={500} 
        style={`border: 1px solid red;`}
      >
        content
      </canvas>
      <img 
        src="/images/arrows-hint/arrow_center_left.png"
        onError={(e) => {
          console.error('Image load error:', e);
          console.log('Image source:', e.target);
        }}
      />
    </div>

  )
};
