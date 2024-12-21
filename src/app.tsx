import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import RootLayout from "./components/RootLayout";
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider } from "@solidjs/meta";


export default function App() {
  return (
    <Router
      root={props => (
        <RootLayout>
          <MetaProvider>
            {/* <Nav /> */}
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        </RootLayout>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
