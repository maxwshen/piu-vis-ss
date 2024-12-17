
import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import "./search.css"
import { checkEnvironment, fetchData } from '~/lib/data';
import Nav from '~/components/Nav';


interface SearchItemType {
  name: string,
  url: string,
}


/**
 * Fetches search struct data
 * @returns Promise of search items or throws an error
 */
async function fetchSearchItems(): Promise<SearchItemType[]> {
  try {
    const [searchNameList, manualAnnotatedList] = await Promise.all([
      fetch(checkEnvironment().concat(`/chart-jsons/120524/__search-struct.json`)),
      fetch(checkEnvironment().concat(`/chart-jsons/120524/__manual-limb-annotated.json`))
    ]);

    const names: string[] = await searchNameList.json();
    const manualAnnotated = await manualAnnotatedList.json();

    const searchItems: SearchItemType[] = names.map(name => {
      const modName = manualAnnotated.includes(name) ? `${name} ✅` : name;
      return {
        name: modName,
        url: checkEnvironment().concat(`/chart/${name}`)
      };
    });

    return searchItems;
  } catch (error) {
    console.error("Error fetching search items:", error);
    throw error; // Rethrow to be caught by createResource
  }
}


/**
 * 
 * @returns 
 */
// function searchTable(): JSXElement {
//   const [items] = createResource(fetchSearchItems);
//   const [query, setQuery] = createSignal("");
//   // const [filteredItems, setFilteredItems] = createSignal(items());

//   // createEffect(() => {
//   //   // Update filteredItems when query changes
//   //   const q = query().toLowerCase();
//   //   setFilteredItems(
//   //     items()!.filter(item => item.name.toLowerCase().includes(q))
//   //   );
//   // });

//   const filteredItems = createMemo(() => {
//     // Only filter if items are loaded
//     if (items.loading) return [];
    
//     const q = query().toLowerCase();
//     return items()?.filter(item => item.name.toLowerCase().includes(q)) || [];
//   });

//   return (
//     <div style={'margin-left: 50px; margin-top: 0px'}>
//       <input
//         id='searchbar'
//         type="text"
//         value={query()}
//         onInput={(e) => setQuery(e.target.value)}
//         placeholder="Search..."
//       />
//       <hr></hr>
//       {/* <ul class='searchItemResult'>
//         <For each={filteredItems()}>
//           {(item) => (
//           <li >
//             <a href={item.url} target="_blank" rel="noopener noreferrer">
//               {item.name}
//             </a>
//           </li>
//         )}</For>
//       </ul> */}
//       {items.loading ? (
//         <div>Loading...</div>
//       ) : items.error ? (
//         <div>Error loading search items</div>
//       ) : (
//         <ul class='searchItemResult'>
//           <For each={filteredItems()}>
//             {(item) => (
//               <li>
//                 <a href={item.url} target="_blank" rel="noopener noreferrer">
//                   {item.name}
//                 </a>
//               </li>
//             )}
//           </For>
//         </ul>
//       )}
//     </div>
//   );
// };

function SearchTable() {
  const [items, setItems] = createSignal<SearchItemType[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [query, setQuery] = createSignal("");

  onMount(async () => {
    try {
      const [searchNameList, manualAnnotatedList] = await Promise.all([
        fetch(checkEnvironment().concat(`/chart-jsons/120524/__search-struct.json`)),
        fetch(checkEnvironment().concat(`/chart-jsons/120524/__manual-limb-annotated.json`))
      ]);

      const names: string[] = await searchNameList.json();
      const manualAnnotated = await manualAnnotatedList.json();

      const searchItems: SearchItemType[] = names.map(name => {
        // modify chart name to show in search
        var modName = manualAnnotated.includes(name) ? `${name} ✅` : name;
        modName = modName.replace('_ARCADE', '');
        modName = modName.replace(/_+/g, ' ');
        return {
          name: modName,
          url: checkEnvironment().concat(`/chart/${name}`)
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
      <div>{Nav()}</div>
      <div class='container' style={'background-color: #2e2e2e; height: 100%'}>      
        {SearchTable()}
      </div>
    </div>
  );
};