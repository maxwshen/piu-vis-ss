import { useParams } from "@solidjs/router";
import { createSignal, createResource } from "solid-js";


const checkEnvironment = () => {
  // https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
  let base_url =
    import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:3000"
      : "https://example.com"; // https://v2ds.netlify.app
  return base_url;
};


const fetchData = async (id: string) => {
  const response = await fetch(checkEnvironment().concat(`/public/${id}.json`));
  return response.json();
}


export default function DynamicPage() {
  // const [url, setUrl] = createSignal<string>(window.location.href);
  const params = useParams();
  const [data] = createResource(params.id, fetchData);
  console.log(checkEnvironment());
  return (
    <>
      <span> {params.id} </span>
      <span>{data.loading && "Loading..."}</span>
      <span>{data.error && "Error"}</span>
      <div>
        <pre> {JSON.stringify(data(), null, 2)}</pre>
      </div>
    </>
  );
};

//   return (
//     <main>
//       <div>data: {params.id} </div>
//       {/* <div>User {params.id} {url()} </div> */}
//       {/* <div> {data()} </div> */}
//     </main>
//   );
// }

// import { createResource } from "solid-js";
// import { useParams } from "@solidjs/router";

// async function fetchUser(id: string) {
//   const response = await fetch(
//     `https://jsonplaceholder.typicode.com/users/${id}`
//   );
//   return response.json();
// }

// const User = () => {
//   const params = useParams();
//   const [data] = createResource(params.id, fetchUser); // Pass the id parameter to createResource

//   return (
//     <div>
//       <Show when={!data.loading} fallback={<p>Loading...</p>}>
//         <div>
//           <p>Name: {data().name}</p>
//           <p>Email: {data().email}</p>
//           <p>Phone: {data().phone}</p>
//         </div>
//       </Show>
//     </div>
//   );
// };