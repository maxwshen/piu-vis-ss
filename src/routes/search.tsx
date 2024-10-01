
import { createSignal, createMemo, For, createEffect, JSXElement, createResource } from "solid-js";
import "./search.css"


interface searchItemType {
  name: string,
  url: string,
}

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
 * Fetches search struct data
 * @param id: json filename
 * @returns 
 */
async function fetchSearchItems(): Promise<searchItemType[] | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/092424/search-struct.json`)
  );
    const names = await response.json();

    const searchItems: searchItemType[] = [];
      for (const name of names) {
        const searchItem = {
          'name': name, 
          'url': checkEnvironment().concat(`/chart/${name}`)
        };
        searchItems.push(searchItem);
      }
    return searchItems;
  } catch (error) {
    console.error(error);
  }
  return null;
}



/**
 * 
 * @returns 
 */
function searchTable(): JSXElement {
  const [items, setItems] = createResource([], fetchSearchItems);
  const [query, setQuery] = createSignal("");
  const [filteredItems, setFilteredItems] = createSignal(items());

  createEffect(() => {
    // Update filteredItems when query changes
    const q = query().toLowerCase();
    setFilteredItems(
      items()!.filter(item => item.name.toLowerCase().includes(q))
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
    <div style={'background-color: #2e2e2e'}>
      {searchTable()}
    </div>
  );
};