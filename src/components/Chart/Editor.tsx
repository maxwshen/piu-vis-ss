import type { JSXElement } from 'solid-js';
import type { Resource } from 'solid-js';
import { useParams } from "@solidjs/router";
import { ChartArt } from '~/lib/types';
import { useChartContext } from "~/components/Chart/ChartContext";


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


interface EditorProps {
  dataGet: Resource<ChartArt | null>;
}

export default function EditorPanel(props: EditorProps) {
  let dataGet = props.dataGet;
  const params = useParams();

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
      setClickTo({'l': 'h', 'r': 'h', 'e': 'h', 'h': 'e'});
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

  return (
    <div style={'display: flex'}>
      {SetClickToLRButton()}
      {SetClickToEitherButton()}
      {SetClickToMissButton()}
      {SaveJsonButton(params.id, dataGet()!)}
    </div>
  );
}
