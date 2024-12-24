import type { Accessor, JSXElement } from 'solid-js';
import type { Resource } from 'solid-js';
import { useParams } from "@solidjs/router";
import { ChartArt } from '~/lib/types';
import { useChartContext } from "~/components/Chart/ChartContext";
import { ChartData } from '~/lib/types';


function SaveJsonButton(id: string, data: ChartData): JSXElement {
  // Function to save JSON to file
  const saveJsonToFile = () => {
    const toSave = [data['arrowarts'], data['holdarts'], data['metadata']]

    // const json = JSON.stringify(data, null, 2); // Convert JSON object to string
    const json = JSON.stringify(toSave, null, 2); // Convert JSON object to string
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
  dataGet: Resource<ChartData | null>;
}

export default function EditorPanel(props: EditorProps) {
  let dataGet = props.dataGet;
  const params = useParams();

  const {
    clickTo,
    setClickTo,
  } = useChartContext(); 

  function SetClickToEitherButton(): JSXElement {
    const ChangeClickAction = () => {
      setClickTo({'type': 'either', 'l': 'e', 'r': 'e', 'e': 'e', 'h': 'e'});
    };
    return (
      <div>
        <button class="nice-button" onClick={ChangeClickAction}>Set Click To Either</button>
      </div>
    )
  };
  
  
  function SetClickToMissButton(): JSXElement {
    const ChangeClickAction = () => {
      setClickTo({
        'type': 'miss',
        'l': 'l_miss', 'r': 'r_miss', 'e': 'e_miss', 'l_miss': 'l', 'r_miss': 'r', 'e_miss': 'e'
      });
    };
    return (
      <div>
        <button class="nice-button" onClick={ChangeClickAction}>Set Click To Miss</button>
      </div>
    )
  };


  function SetClickToShowTimingWindowButton(): JSXElement {
    const ChangeClickAction = () => {
      setClickTo({
        'type': 'timingwindow',
        'l': 'l_window', 'r': 'r_window', 'e': 'e_window', 
        'l_window': 'l', 'r_window': 'r', 'e_window': 'e'
      });
    };
    return (
      <div>
        <button class="nice-button" onClick={ChangeClickAction}>Set Click To Show Timing Windows</button>
      </div>
    )
  };
  
  
  function SetClickToLRButton(): JSXElement {
    const ChangeClickAction = () => {
      setClickTo({'type': 'lr', 'l': 'r', 'r': 'l', 'e': 'l', 'h': 'l'});
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
      {SetClickToShowTimingWindowButton()}
      {SaveJsonButton(params.id, dataGet()!)}
    </div>
  );
}
