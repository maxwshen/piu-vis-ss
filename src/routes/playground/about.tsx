import { createSignal, createResource } from "solid-js";
import { render } from "solid-js/web";
// import { useParams } from "@solidjs/router";

const fetchData = async (id: string) => {
  const response = await fetch(`/public/${id}.json`);
  return response.json();
}


const checkEnvironment = () => {
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


export default function About() {
  const [chartId, setChartId] = createSignal<string>();
  const [data] = createResource(chartId, fetchData);

  console.log(import.meta.env.VITE_ENV);
  console.log(checkEnvironment());

  return (
    <>
      <input
        type="string"
        placeholder="Enter text"
        onChange={(e) => setChartId(e.currentTarget.value)}
      />
      <span>{data.loading && "Loading..."}</span>
      <span>{data.error && "Error"}</span>
      <div>
        <pre> {JSON.stringify(data(), null, 2)}</pre>
      </div>
    </>
  );
};
