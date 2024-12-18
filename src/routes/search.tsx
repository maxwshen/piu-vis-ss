import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import { checkEnvironment } from '~/lib/data';
import Nav from '~/components/Nav';
import "./search.css"
import { StrToAny } from "~/lib/types";
import { getShortChartNameWithLevel, getENPSColor, skillBadge, skillToColor } from "~/lib/util";

// Enhanced interface to allow more flexible data handling
interface SearchItem {
  [key: string]: string | number | boolean | string[];
  level: number;
  NPS: number;
  'Sustain time': number;
  sord: 'singles' | 'doubles';
  skills: string[],
};


// skills to support in filter
const displaySkills = [
  'jump',
  'drill',
  'run',
  'anchor_run',
  'run_without_twists',
  'twists',
  'side3_singles',
  'mid6_doubles',
  'mid4_doubles',
  'doublestep',
  'jack',
  'footswitch',
  'bracket',
  'staggered_bracket',
  'bracket_run',
  'bracket_drill',
  'bracket_jump',
  'bracket_twist',
  'split',
  'hold_footswitch',
  'hands',
  'bursty',
  'sustained',
];


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

  // Sorting state
  const [sortColumn, setSortColumn] = createSignal<keyof SearchItem | null>(null);
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');

  // Filters object to track multiple column filters
  const [filters, setFilters] = createSignal<{
    name: string;
    sord: 'singles' | 'doubles' | '';
    levelMin: number | '';
    levelMax: number | '';
    NPSMin: number | '';
    NPSMax: number | '';
    skills: string[];
    sustainMin: number | '';
    sustainMax: number | '';
  }>({
    name: '',
    sord: '',
    levelMin: '',
    levelMax: '',
    NPSMin: '',
    NPSMax: '',
    skills: [],
    sustainMin: '',
    sustainMax: '',
  });

  // display columns
  const displayColumns = [
    'name', 'skills', 'BPM info', 'NPS', 'Sustain time',
  ]

  // Numeric range validation
  const isInRange = (value: number, min: number | '', max: number | '') => {
    if (min === '' && max === '') return true;
    if (min !== '' && value < min) return false;
    if (max !== '' && value > max) return false;
    return true;
  };

  onMount(async () => {
    try {
      const searchDict = await fetch(checkEnvironment().concat(`/chart-jsons/120524/page-content/chart-table.json`));
      const searchData: SearchItem[] = await searchDict.json();

      // Set items and extract columns dynamically
      setItems(searchData);      
      setIsLoading(false);

      const queryString = window.location.search;
      if (queryString) {
        decodeFilters(queryString);
      }

    } catch (error) {
      console.error("Error fetching search items:", error);
      setIsLoading(false);
    }
  });

  // Dynamic filtering logic
  const filteredItems = createMemo(() => {
    return items().filter(item => {
      const f = filters();
      
      // Name filter (case-insensitive)
      if (f.name && !String(item.name).toLowerCase().includes(f.name.toLowerCase())) 
        return false;
      
      // Sord filter (exact match)
      if (f.sord && item.sord !== f.sord) 
        return false;
      
      // Level range filter
      if (!isInRange(item.level, f.levelMin, f.levelMax)) 
        return false;
      
      // NPS range filter
      if (!isInRange(item.NPS, f.NPSMin, f.NPSMax)) 
        return false;
      
      // Sustain time filter
      if (!isInRange(item['Sustain time'], f.sustainMin, f.sustainMax)) 
        return false;

      // Skills filter - check if all selected skills are in the item's skills
      if (f.skills.length > 0) {
        const hasAllSkills = f.skills.every(skill => 
          item.skills.includes(skill)
        );
        if (!hasAllSkills) return false;
      }
      
      return true;
    });
  });

  // Sorting logic
  const sortedFilteredItems = createMemo(() => {
    const filtered = filteredItems();
    
    // If no sort column is selected, return filtered items
    if (!sortColumn()) return filtered;
    
    return [...filtered].sort((a, b) => {
      const columnToSort = sortColumn() as keyof SearchItem;
      const aValue = a[columnToSort];
      const bValue = b[columnToSort];
      
      // Handle string and number comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection() === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection() === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });
  });

  // Dynamic filter input generator
  const FilterInput = () => {
    // const f = filters();
    
    return (
      <div class="filters grid grid-cols-3 gap-4">
        {/* Text Filters */}
        <div class="text-filters">
          <label class="block">Name filter:</label>
          <input
            type="text"
            value={filters().name}
            onInput={(e) => setFilters(prev => ({...prev, name: e.currentTarget.value}))}
            placeholder="Filter by name..."
            class="w-full p-1"
            style={`background-color:#555;color:#fff`}
          />
        </div>

        {/* Sord Filter */}
        <div class="sord-filter">
          <label class="block">singles/doubles</label>
          <select
            value={filters().sord}
            onChange={(e) => setFilters(prev => ({...prev, sord: e.currentTarget.value as 'singles' | 'doubles' | ''}))}
            class="w-full p-1"
            style={`background-color:#555;color:#fff`}
          >
            <option value="">All</option>
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
          </select>
        </div>

        {/* Level Range Filters */}
        <div class="level-filters" style={`max-width:150px`}>
          <label class="block">Level range:</label>
          <div class="flex gap-2">
            <input
              type="number"
              value={filters().levelMin}
              onInput={(e) => setFilters(prev => ({...prev, levelMin: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="min"
            />
            <input
              type="number"
              value={filters().levelMax}
              onInput={(e) => setFilters(prev => ({...prev, levelMax: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="max"
            />
          </div>
        </div>

        {/* NPS Range Filters */}
        <div class="nps-filters" style={`max-width:150px`}>
          <label class="block">Notes per second</label>
          <div class="flex gap-2">
            <input
              type="number"
              value={filters().NPSMin}
              onInput={(e) => setFilters(prev => ({...prev, NPSMin: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="min"
            />
            <input
              type="number"
              value={filters().NPSMax}
              onInput={(e) => setFilters(prev => ({...prev, NPSMax: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="max"
            />
          </div>
        </div>

        {/* Level Range Filters */}
        <div class="sustain-filters" style={`max-width:150px`}>
          <label class="block">Sustain time</label>
          <div class="flex gap-2">
            <input
              type="number"
              value={filters().sustainMin}
              onInput={(e) => setFilters(prev => ({...prev, sustainMin: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="min"
            />
            <input
              type="number"
              value={filters().sustainMax}
              onInput={(e) => setFilters(prev => ({...prev, sustainMax: e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)}))}
              class="w-full p-1"
              style={`background-color:#555;color:#fff`}
              placeholder="max"
            />
          </div>
        </div>

        {/* Skills Multi-Select Filter */}
        <div class="skill-filter">
          <label class="block">Skill filter: select one or more</label>
          <div 
            class="w-full p-1"
            style={`display:flex;flex-direction:row;flex-wrap:wrap`}
          >
            {displaySkills.map((skill) => (
              <label class="flex items-center">
                <input
                  type="checkbox"
                  checked={filters().skills.includes(skill)}
                  onChange={(e) => {
                    setFilters(prev => {
                      const skills = [...prev.skills];
                      if (e.currentTarget.checked) {
                        skills.push(skill);
                      } else {
                        const index = skills.indexOf(skill);
                        if (index > -1) {
                          skills.splice(index, 1);
                        }
                      }
                      return {...prev, skills};
                    });
                  }}
                  class="mr-1"
                />
                <span 
                  style={`color:${skillToColor[skill]}`}
                >
                  {skill.replace(/_/g, ' ')}&emsp;
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>
    );
  };

  // Paginated items
  const paginatedItems = createMemo(() => {
    const filtered = sortedFilteredItems();
    const startIndex = (currentPage() - 1) * itemsPerPage();
    return filtered.slice(startIndex, startIndex + itemsPerPage());
  });

  // Total pages calculation
  const totalPages = createMemo(() => 
    Math.ceil(sortedFilteredItems().length / itemsPerPage())
  );

  // Sort column handler
  const handleSort = (column: keyof SearchItem) => {
    if (sortColumn() === column) {
      // Toggle sort direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  // Pagination controls
  const PaginationControls = () => {
    return (
      <div class="pagination-controls">
        {/* Page navigation */}
        <div class="page-navigation" style={`color:#ddd;text-align:center`}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage() === 1}
          >
            ◄
          </button>
          
          <span>
            &ensp;Page {currentPage()} of {totalPages()} ({sortedFilteredItems().length} stepcharts)&ensp;
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

  // URL handling
  const encodeFilters = (currentFilters: StrToAny) => {
    const params = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if (Array.isArray(value)) {
          // Handle arrays (skills)
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    return params.toString();
  };

  const decodeFilters = (queryString: string) => {
    const params = new URLSearchParams(queryString);

    params.forEach((value, key) => {
      if (key === 'skills') {
        setFilters(prev => ({...prev, [key]: value.split(',')}))
      } else if (['levelMin', 'levelMax', 'NPSMin', 'NPSMax'].includes(key)) {
        setFilters(prev => ({...prev, [key]: value === '' ? '' : Number(value)}))
      } else {
        setFilters(prev => ({...prev, [key]: value}))
      }
    });
    return;
  };

  // Copy URL button component
  const CopyUrlButton = () => {
    const handleCopy = () => {
      const queryString = encodeFilters(filters());
      const url = `${window.location.origin}${window.location.pathname}?${queryString}`;
      navigator.clipboard.writeText(url);
      // Optional: Add some visual feedback that URL was copied
    };

    return (
      <button
        onClick={handleCopy}
        style={`color:#ddd;text-decoration:underline`}
      >
        Copy URL to filtered results
      </button>
    );
  };

  return (
    <div class="search-container">
      {/* Dynamic filter inputs */}
      <FilterInput />

      {/* Pagination controls */}
      <div></div>
      <PaginationControls />

      <CopyUrlButton />
      <span style={`color:#888;float:right`}>* click to sort</span>

      {/* Loading and empty states */}
      {isLoading() ? (
        <div>Loading...</div>
      ) : sortedFilteredItems().length === 0 ? (
        <div>No items found</div>
      ) : (
        <table class="search-results">
          <thead>
            <tr>
              <For each={displayColumns}>
                {(column) => (
                  <th 
                    class="p-2 cursor-pointer hover:bg-gray-500"
                    onClick={() => {
                      // Only enable sorting for numeric columns and name
                      if (['level', 'NPS', 'Sustain time'].includes(column)) {
                        handleSort(column as keyof SearchItem);
                      }
                    }}
                  >
                    {/* {column} */}
                    {
                      (['level', 'NPS', 'Sustain time'].includes(column)) ? column + ' *': column 
                    }
                    {sortColumn() === column && (
                      <span class="ml-2">
                        {sortDirection() === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                )}
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