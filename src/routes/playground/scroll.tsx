import { onMount, onCleanup } from "solid-js";

export default function App() {
  var canvasRef: HTMLCanvasElement;

  onMount(() => {
    console.log(canvasRef.width);
    // document.addEventListener("scroll", handleScroll);
  });

  // onCleanup(() => {
    // document.removeEventListener("scroll", handleScroll);
  // });

  const handleScroll = (event: any) => {
    console.log(event.target);
    if (event.target === canvasRef) {
      console.log(event);
    }
  };

  return (
    <canvas
      ref={canvasRef!}
      height={2000}
      width={200}
      style={`border: 1px solid red;`}
    >
      content
    </canvas>
  );
}
