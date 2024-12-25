// Context for isMobile
import { createContext, useContext, ParentComponent, createSignal } from "solid-js";

type LayoutContextType = {
  isMobile: () => boolean;
  setIsMobile: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType>();

export const LayoutProvider: ParentComponent = (props) => {
  const [isMobile, setIsMobile] = createSignal(false);

  const store: LayoutContextType = {
    isMobile,
    setIsMobile
  };

  return (
    <LayoutContext.Provider value={store}>
      {props.children}
    </LayoutContext.Provider>
  );
};

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayoutContext must be used within a LayoutProvider");
  }
  return context;
}