
import { createSignal, createMemo, For, createEffect, JSXElement } from "solid-js";
import "./search.css"


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
 * 
 * @returns 
 */
function searchTable(): JSXElement {
  const [query, setQuery] = createSignal("");
  const [items, setItems] = createSignal([
    { name: "example", url: checkEnvironment().concat(`/chart/example`) },
    { name: "example-holds", url: checkEnvironment().concat(`/chart/example-holds`) },
    // ... more items
  ]);
  const [filteredItems, setFilteredItems] = createSignal(items());

  createEffect(() => {
    // Update filteredItems when query changes
    const q = query().toLowerCase();
    setFilteredItems(
      items().filter(item => item.name.toLowerCase().includes(q))
    );
  });

  return (
    <div style={'margin-left: 50px; margin-top: 50px'}>
      <input
        id='searchbar'
        type="text"
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <hr></hr>
      <ul>
        <For each={filteredItems()}>
          {(item) => (
          <li >
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.name}
            </a>
          </li>
        )}</For>
      </ul>
    </div>
  );
};


export default function Page(): JSXElement {
  return (
    <div>
      {searchTable()}
    </div>
  );
};