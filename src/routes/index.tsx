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
        {/* <img src="/favicon.ico"></img> */}
        <div>
          <h1 class="max-6-xs text-5xl font-thin" style={`color:#efb920;font-style:italic;text-shadow: 0 0 6px`}>
            piucenter
          </h1>
        </div>
        <div style={`color:#ddd;margin-top:30px;justify-content:center`}>
          <p>
            A web app for the dance rhythm arcade game, Pump it Up!
          </p>
          <div style={``}>
            <ul>
              <li>Learn about skills and techniques, like twisting, anchor runs, and brackets</li>
              <li>Find stepcharts ranked by difficulty within all levels: S1-S26, and D4-D28</li>
              <li>We visualize the hardest crux sections within stepcharts, so you can focus your efforts</li>
              <li>Struggling on a particular chart section? Find other similar charts</li>
              <li>Progressively improve your footspeed, working your way up to higher notes per second, and time under tension </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
