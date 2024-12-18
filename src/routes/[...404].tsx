import { createSignal, createMemo, For, createEffect, JSXElement, onMount } from "solid-js";
import { A } from "@solidjs/router";
import Nav from '~/components/Nav';

export default function NotFound() {
  return (
    <div>
      <div>{Nav()}</div>
      <span style={`color:#ddd`}>
        404: URL not found
      </span>
    </div>
  );
}
