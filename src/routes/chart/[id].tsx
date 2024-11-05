import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, onCleanup, createEffect, $DEVCOMP, untrack } from "solid-js";
import type { Signal, Accessor, Resource, Setter, JSXElement } from 'solid-js';
import "./[id].css"
import Konva from 'konva';
import { isServer } from 'solid-js/web';
import { getImage } from '../../lib/images';
import { checkEnvironment, fetchData } from '../../lib/data';
import { ArrowArt, HoldArt, HoldTick, ChartArt } from '../../lib/types';


const panelPxInterval = 43;
const [pxPerSecond, setPxPerSecond] = createSignal(400);
// arrow imgs are square
const canvasWidth = 530;
const arrowImgWidth = 40;
const arrowImgHeight = arrowImgWidth;

interface strToStr {
  [key: string]: string;
};
const [clickTo, setClickTo] = createSignal<strToStr>({'l': 'r', 'r': 'l'});


/**
 * Computes last time in ChartArt
 * @param data 
 */
function computeLastTime(data: ChartArt): number {
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
  return lastTime;
}


/**
 * Draws Konva HTML canvas of arrow arts and hold arts.
 * @param data 
 */
function drawKonvaCanvas(dataGet: Resource<ChartArt | null>, mutate: Setter<ChartArt | null | undefined>) {
  let containerRef: HTMLDivElement;
  let scrollContainerRef: HTMLDivElement;
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
    
      // compute canvas height from last note
      let lastTime = computeLastTime(data);
      var canvas_height = lastTime * pxPerSecond() + 100;

      largeContainerRef.style.height = canvas_height + 'px';
      largeContainerRef.style.width = canvasWidth + 80 + 'px';
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
          fontSize: 24,
          fontFamily: 'Helvetica',
          fill: '#AAAAAA',
          align: 'right',
        });
        layer1.add(text);
      }

      // draw holdticks
      const holdtick_x = canvasWidth - lineMargin + 10;
      const y_gap = 4;
      for (let i: number = 0; i < holdticks.length; i++) {
        let holdtick = holdticks[i];
        const [startTime, endTime, nTicks] = holdtick;
        const y = i * seconds_per_timestamp * pxPerSecond();
        // draw text
        var text = new Konva.default.Text({
          text: `${nTicks}`,
          x: holdtick_x + 5,
          y: startTime * pxPerSecond() + arrowImgHeight / 2,
          fontSize: 18,
          fontFamily: 'Helvetica',
          fill: 'gray',
          align: 'right',
        });
        layer1.add(text);
        // draw line
        var line = new Konva.default.Line({
          points: [
            holdtick_x, startTime * pxPerSecond() + arrowImgHeight / 2, 
            holdtick_x, endTime * pxPerSecond() - y_gap + arrowImgHeight / 2],
          stroke: 'gray',
          strokeWidth: 1,
        });
        layer1.add(line);
      }

      // draw arrows
      for (let i: number = 0; i < arrowarts.length; i++) {
        let arrowart = arrowarts[i];
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
            id: String(i),
          });
          layer1.add(konva_img);
        };
      }

      // draw holds
      for (let i: number = 0; i < holdarts.length; i++) {
        let holdart = holdarts[i];
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
            id: String(i),
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
            id: String(i),
          });
          layer3.add(konva_img);
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
            id: String(i),
          });
          layer4.add(konva_img);
        };
      }

      // interactivity on stage
      stage.on('click', function (e) {
        let data = dataGet()!;
        let arrowarts = data[0];
        let holdarts = data[1];

        // e.target is a clicked Konva.Shape or current stage if you clicked on empty space
        const scrolly = scrollContainerRef.scrollTop - PADDING;
        const scrollx = scrollContainerRef.scrollLeft - PADDING;
        const x = stage.getPointerPosition()!.x + scrollx;
        const y = stage.getPointerPosition()!.y + scrolly;
        // console.log(x, y);
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
            mutate([editedArrowArts, holdarts]);

            // remove prev arrow
            const node = layer1?.findOne(`#${id}`);
            node?.destroy();

            // draw new arrow
            let newLimb = clickTo()[limbAnnot];
            const image = new Image();
            const [imageGetter, _] = getImage(panelPos, newLimb, 'arrow');
            image.src = imageGetter();
            image.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: time * pxPerSecond(),
                image: image,
                width: arrowImgWidth,
                height: arrowImgHeight,
                id: id,
              });
              layer1.add(konva_img);
            };
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
            let editedHoldArts = holdarts.slice(0, i).concat(
              [[panelPos, startTime, endTime, clickTo()[limbAnnot]]],
            ).concat(holdarts.slice(i + 1, holdarts.length));
            mutate([arrowarts, editedHoldArts]);

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
            // draw hold head
            const holdHead = new Image();
            const [headImageGetter, _] = getImage(panelPos, newLimb, 'arrow');
            holdHead.src = headImageGetter();
            holdHead.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: startTime * pxPerSecond(),
                image: holdHead,
                width: arrowImgWidth,
                height: arrowImgHeight,
                id: String(i),
              });
              layer2.add(konva_img);
            };

            // draw hold trail
            const holdTrail = new Image();
            const [trailImageGetter, __] = getImage(panelPos, newLimb, 'trail');
            holdTrail.src = trailImageGetter();
            holdTrail.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: startTime * pxPerSecond() + arrowImgHeight / 2,
                image: holdTrail,
                width: arrowImgWidth,
                height: (endTime - startTime) * pxPerSecond(),
                id: String(i),
              });
              layer3.add(konva_img);
            };

            // draw hold cap
            const holdCap = new Image();
            const [capImageGetter, ___] = getImage(panelPos, newLimb, 'cap');
            holdCap.src = capImageGetter();
            holdCap.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: endTime * pxPerSecond(),
                image: holdCap,
                width: arrowImgWidth,
                height: arrowImgHeight,
                id: String(i),
              });
              layer4.add(konva_img);
            };

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
            // draw hold head
            const holdHead = new Image();
            const [headImageGetter, _] = getImage(panelPos, newLimb, 'arrow');
            holdHead.src = headImageGetter();
            holdHead.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: startTime * pxPerSecond(),
                image: holdHead,
                width: arrowImgWidth,
                height: arrowImgHeight,
                id: String(i),
              });
              layer2.add(konva_img);
            };

            // draw hold trail
            const holdTrail = new Image();
            const [trailImageGetter, __] = getImage(panelPos, newLimb, 'trail');
            holdTrail.src = trailImageGetter();
            holdTrail.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: startTime * pxPerSecond() + arrowImgHeight / 2,
                image: holdTrail,
                width: arrowImgWidth,
                height: (endTime - startTime) * pxPerSecond(),
                id: String(i),
              });
              layer3.add(konva_img);
            };

            // draw hold cap
            const holdCap = new Image();
            const [capImageGetter, ___] = getImage(panelPos, newLimb, 'cap');
            holdCap.src = capImageGetter();
            holdCap.onload = () => {
              var konva_img = new Konva.default.Image({
                x: lineMargin + panelPos * panelPxInterval,
                y: endTime * pxPerSecond(),
                image: holdCap,
                width: arrowImgWidth,
                height: arrowImgHeight,
                id: String(i),
              });
              layer4.add(konva_img);
            };

            return;
          }
    
        };
      });

      // scrolling
      function repositionStage() {
        // var dx = scrollContainerRef.scrollLeft - PADDING;
        // var dy = scrollContainerRef.scrollTop - PADDING;
        var dx = scrollContainerRef.scrollLeft;
        var dy = scrollContainerRef.scrollTop;
        stage.container().style.transform =
          'translate(' + dx + 'px, ' + dy + 'px)';
        stage.x(-dx);
        stage.y(-dy);
      }

      // layer1 has background; draw it on bottom
      stage.add(layer1);
      // layers for holds
      stage.add(layer4);
      stage.add(layer3);
      stage.add(layer2);

      repositionStage();
      scrollContainerRef.addEventListener('scroll', repositionStage);
      stage.container().style.transform = 'translate(0px, 0px)';
      stage.x(0);
      stage.y(0);
    });
  });

  return (
    <div>
      <div
        ref={scrollContainerRef!}
        style={{
          "overflow": "auto",
            "width": canvasWidth + 100 + "px",
          // "width": "1000px",
          "height": "calc(100vh - 100px)",
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
              "width": canvasWidth + 100 + "px",
              "height": "1000px",
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
      <div style={'background-color: #2e2e2e'}> {drawKonvaCanvas(data, mutate)} </div>
    </>
  );
};
