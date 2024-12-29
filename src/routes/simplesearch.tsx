
import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import "./simplesearch.css"


interface SearchItemType {
  name: string,
  url: string,
}


function SearchTable() {
  const [items, setItems] = createSignal<SearchItemType[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [query, setQuery] = createSignal("");

  const [baseUrl, setBaseUrl] = createSignal('');

  onMount(async () => {
    try {
      setBaseUrl(window.location.origin);
      const timestamp = Date.now();
      const [searchNameList, manualAnnotatedList] = await Promise.all([
        fetch(baseUrl().concat(`/chart-jsons/120524/__search-struct.json?cb=${timestamp}`)),
        fetch(baseUrl().concat(`/chart-jsons/120524/__manual-limb-annotated.json?cb=${timestamp}`))
      ]);

      const names: string[] = await searchNameList.json();
      const manualAnnotated = await manualAnnotatedList.json();

      const searchItems: SearchItemType[] = names.map(name => {
        // modify chart name to show in search
        var modName = manualAnnotated.includes(name) ? `${name} ✅` : name;
        modName = modName.replace('_ARCADE', '').replace('_INFOBAR_TITLE_', '_');
        modName = modName.replace(/_+/g, ' ');
        return {
          name: modName,
          url: baseUrl().concat(`/chart/${name}`)
        };
      });

      setItems(searchItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search items:", error);
      setIsLoading(false);
    }
  });

  const filteredItems = createMemo(() => {
    const q = query().toLowerCase();
    return items().filter(item => item.name.toLowerCase().includes(q));
  });

  return (
    <div style={'margin-left: 0px; margin-top: 0px'}>
      <input
        id='searchbar'
        type="text"
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        placeholder="Search..."
      />
      <hr />
      {isLoading() ? (
        <div>Loading...</div>
      ) : items().length === 0 ? (
        <div>No items found</div>
      ) : (
        <ul class='searchItemResult'>
          <For each={filteredItems()}>
            {(item) => (
              <li>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.name}
                </a>
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
}

export default function Page(): JSXElement {
  createEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Search';
    }
  });

  return (
    <div>
      <div class='container' style={'background-color: #2e2e2e; height: 100%'}>      
        {SearchTable()}
      </div>
    </div>
  );
};