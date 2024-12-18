import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import { checkEnvironment } from '~/lib/data';
import Nav from '~/components/Nav';
import "./search.css"
import { StrToAny } from "~/lib/types";
import { getShortChartNameWithLevel, getENPSColor, skillBadge } from "~/lib/util";

// Enhanced interface to allow more flexible data handling
interface SearchItem {
  [key: string]: string | number | boolean;
}

// draw individual cells in table, conditional logic using column
function displayCell(item: StrToAny, column: string) {
  let value: any = item[column];
  if (column == 'name') {
    return (
      <td>
        <a href={`/chart/${value}`} target="_blank" rel="noopener noreferrer">
          {getShortChartNameWithLevel(value)}
        </a>
      </td>
    );
  };
  if (column == 'skills') {
    return (
      <td>
        <For each={value}>
          {(skill: string) => skillBadge(skill)}
        </For>
    </td>
    );
  }
  if (column == 'NPS') {
    return (
      <td>
      <span style={`color:${getENPSColor(value)}`}>
        {value}
      </span>
    </td>
    );
  }
  if (column == 'BPM info') {
    return (
      <td>
      <span style={`color:${getENPSColor(item['NPS'])}`}>
        {value}
      </span>
    </td>
    );
  }
  return (
    <td>
      {column === 'url' ? (
        <a href={item[column] as string} target="_blank" rel="noopener noreferrer">
          {item[column]}
        </a>
      ) : (
        item[column]
      )}
    </td>
  );
}


function SearchTable() {
  // State management for data and filters
  const [items, setItems] = createSignal<SearchItem[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = createSignal(1);
  const [itemsPerPage, setItemsPerPage] = createSignal(100);

  // Filters object to track multiple column filters
  const [filters, setFilters] = createSignal<{[key: string]: string}>({
    name: '' // Default filter on name column
  });

  // Columns in table, set from first item
  const [columns, setColumns] = createSignal<string[]>([]);

  // display columns
  const displayColumns = [
    'name', 'skills', 'BPM info', 'NPS', 'Sustain time',
  ]

  onMount(async () => {
    try {
      const searchDict = await fetch(checkEnvironment().concat(`/chart-jsons/120524/page-content/chart-table.json`));
      const searchData: SearchItem[] = await searchDict.json();

      // Set items and extract columns dynamically
      setItems(searchData);
      
      // Extract columns from the first item if data exists
      if (searchData.length > 0) {
        setColumns(Object.keys(searchData[0]));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching search items:", error);
      setIsLoading(false);
    }
  });

  // Dynamic filtering logic
  const filteredItems = createMemo(() => {
    return items().filter(item => {
      // Check all active filters
      return Object.entries(filters()).every(([column, filterValue]) => {
        // Skip empty filter values
        if (!filterValue) return true;
        
        // Convert both to lowercase for case-insensitive comparison
        const itemValue = String(item[column]).toLowerCase();
        const filterVal = filterValue.toLowerCase();
        
        return itemValue.includes(filterVal);
      });
    });
  });

  // Dynamic filter input generator
  const FilterInput = (column: string) => {
    return (
      <div class="filter-input">
        <label for={`filter-${column}`}>{column} filter:</label>
        <input
          id={`filter-${column}`}
          type="text"
          value={filters()[column] || ''}
          onInput={(e) => {
            setCurrentPage(1);
            setFilters(prev => ({
              ...prev,
              [column]: e.currentTarget.value
            }));
          }}
          placeholder={`Filter by ${column}...`}
        />
      </div>
    );
  };

  // Paginated items
  const paginatedItems = createMemo(() => {
    const filtered = filteredItems();
    const startIndex = (currentPage() - 1) * itemsPerPage();
    return filtered.slice(startIndex, startIndex + itemsPerPage());
  });

  // Total pages calculation
  const totalPages = createMemo(() => 
    Math.ceil(filteredItems().length / itemsPerPage())
  );

  // Pagination controls
  const PaginationControls = () => {
    return (
      <div class="pagination-controls">
        {/* Items per page selector */}
        <select 
          value={itemsPerPage()}
          onChange={(e) => {
            setItemsPerPage(Number(e.currentTarget.value));
            // Reset to first page when changing items per page
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50].map(num => (
            <option value={num}>{num} per page</option>
          ))}
        </select>

        {/* Page navigation */}
        <div class="page-navigation">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage() === 1}
          >
            ◄
          </button>
          
          <span>
            Page {currentPage()} of {totalPages()}
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages(), p + 1))}
            disabled={currentPage() === totalPages()}
          >
            ►
          </button>
        </div>
      </div>
    );
  };

  return (
    <div class="search-container">
      {/* Dynamic filter inputs */}
      <div class="filters">
        <For each={columns()}>
          {(column) => FilterInput(column)}
        </For>
      </div>

      {/* Pagination controls */}
      <PaginationControls />

      {/* Loading and empty states */}
      {isLoading() ? (
        <div>Loading...</div>
      ) : items().length === 0 ? (
        <div>No items found</div>
      ) : (
        <table class="search-results">
          <thead>
            <tr>
              <For each={displayColumns}>
                {(column) => <th>{column}</th>}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={paginatedItems()}>
              {(item) => (
                <tr>
                <For each={displayColumns}>
                  {(column) => (
                    displayCell(item, column)
                  )}
                </For>
              </tr>
              )}
            </For>
          </tbody>
        </table>
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
}