import { createContext, useContext, JSX, onMount } from "solid-js";
import { createSignal } from "solid-js";
import { isServer } from 'solid-js/web';
import type { Signal, Accessor } from 'solid-js';

interface StrToStr {
  [key: string]: string;
}

// Define the context type
interface ChartContextType {
  scrollContainerRef: Accessor<HTMLDivElement | undefined>;
  setScrollContainerRef: (ref: HTMLDivElement) => void;
  canvasScrollPositionMirror: Accessor<number | undefined>;
  setCanvasScrollPositionMirror: (position: number) => void;
  clickTo: Accessor<StrToStr>;
  setClickTo: (mapping: StrToStr) => void;
  pxPerSecond: Accessor<number>;
  setPxPerSecond: (px: number) => void;
  missTimes: Accessor<number[]>;
  setMissTimes: (mapping: number[]) => void;
}

// Create the context
const ChartContext = createContext<ChartContextType>();

// Create the provider component
export function ChartProvider(props: { children: JSX.Element }) {
  const [scrollContainerRef, setScrollContainerRef] = createSignal<HTMLDivElement>();
  const [canvasScrollPositionMirror, setCanvasScrollPositionMirror] = createSignal<number>();
  const [clickTo, setClickTo] = createSignal<StrToStr>({'l': 'l', 'r': 'r'});
  const [pxPerSecond, setPxPerSecond] = createSignal(400);
  const [missTimes, setMissTimes] = createSignal<number[]>([]);

  const value = {
    scrollContainerRef,
    setScrollContainerRef,
    canvasScrollPositionMirror,
    setCanvasScrollPositionMirror,
    clickTo,
    setClickTo,
    pxPerSecond,
    setPxPerSecond,
    missTimes,
    setMissTimes,
  };

  return (
    <ChartContext.Provider value={value}>
      {props.children}
    </ChartContext.Provider>
  );
}

// Create a custom hook to use the context
export function useChartContext() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider");
  }
  return context;
}