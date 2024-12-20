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
      <main class="text-center mx-auto p-4" style="justify-content:center">
        <div style={`color:#ddd;margin-top:30px;justify-content:center`}>

          <p>
            todo -- markdown
          </p>

        </div>
      </main>
    </div>
  );
}
