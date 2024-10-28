
import { createSignal, createMemo, For, createEffect, JSXElement, createResource } from "solid-js";
import "./search.css"
import { checkEnvironment, fetchData } from '../lib/data';


interface searchItemType {
  name: string,
  url: string,
}


/**
 * Fetches search struct data
 * @param id: json filename
 * @returns 
 */
async function fetchSearchItems(): Promise<searchItemType[] | null> {
  try {
    const response = await fetch(
      checkEnvironment().concat(`/chart-jsons/101824/search-struct.json`)
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