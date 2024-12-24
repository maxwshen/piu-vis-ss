// chartContext.ts
// Provides context and provider for chartData uploaded by user
import { createContext, useContext, ParentComponent, Context, createResource, Resource, createSignal } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ChartData } from "~/lib/types";


interface ChartContextType {
  chartData: Resource<ChartData | null>;
  mutate: (v: ChartData | null) => ChartData | null;
  filename: () => string | null;
  setFilename: (name: string | null) => void;
}

const ChartContext = createContext<ChartContextType>();

export const ChartDataProvider: ParentComponent = (props) => {
  const [chartData, { mutate }] = createResource<ChartData | null, string>(
    () => '', // Empty signal as we'll be using mutate directly
    async () => null, // Initial fetcher returns null
    { initialValue: null }
  );
  const [filename, setFilename] = createSignal<string | null>(null);
  
  const value = {
    chartData,
    mutate,
    filename,
    setFilename,
  };
  
  return (
    <ChartContext.Provider value={value}>
      {props.children}
    </ChartContext.Provider>
  );
};

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartDataProvider");
  }
  return context;
};