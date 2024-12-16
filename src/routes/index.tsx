import Nav from '~/components/Nav';
import { createSignal, createMemo, For, createEffect, JSXElement, createResource } from "solid-js";


export default function Home() {
  createEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'piucenter';
    }
  });

  return (
    <div>
      <div>{Nav()}</div>
      <main class="text-center mx-auto text-gray-700 p-4">
        <img src="/favicon.ico"></img>
        <h1 class="max-6-xs text-5xl font-thin" style={`color:#ddd`}>
          piucenter
        </h1>
      </main>
    </div>
  );
}
