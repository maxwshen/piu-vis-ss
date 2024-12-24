// chartContext.ts
// Provides context and provider for chartData uploaded by user
import { createContext, useContext, ParentComponent, Context, createResource, Resource } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { ChartData } from "~/lib/types";


interface ChartContextType {
  chartData: Resource<ChartData | null>;
  mutate: (v: ChartData | null) => ChartData | null;
}

const ChartContext = createContext<ChartContextType>();

export const ChartDataProvider: ParentComponent = (props) => {
  const [chartData, { mutate }] = createResource<ChartData | null, string>(
    () => '', // Empty signal as we'll be using mutate directly
    async () => null, // Initial fetcher returns null
    { initialValue: null }
  );
  
  const value = {
    chartData,
    mutate
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