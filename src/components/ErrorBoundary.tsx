import { Component, JSXElement, ErrorBoundary as SolidErrorBoundary } from "solid-js";
import { useNavigate } from "@solidjs/router";
import NotFound from "~/routes/[...404]";

const ErrorBoundary: Component<{children: JSXElement}> = (props) => {

  return (
    <SolidErrorBoundary
      fallback={(err) => {
        console.error("Caught error:", err);
        return <NotFound />;
      }}
    >
      {props.children}
    </SolidErrorBoundary>
  );
};

export default ErrorBoundary;