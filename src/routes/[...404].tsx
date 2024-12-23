import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import { A } from "@solidjs/router";
import Nav from '~/components/Nav';

export default function NotFound() {
  return (
    <div>
      <div>{Nav()}</div>
      <div style={`text-align:center;color:#fff`}>
        <span style={`font-size:48px;margin-top:50px`}>
          404: URL not found, 
          <br/>
          or javascript client exception caught
        </span>
        <p style={`font-size:20px;margin-top:50px`}>
          Are you using an old URL?
          <br/>
          On 12/21/24, the piucenter website was overhauled, displacing many old links.
          <br/>
          Use the navigation bar to find a new link to your content.
        </p>
      </div>
    </div>
  );
}
