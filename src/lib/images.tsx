import { createSignal, Signal, onMount, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";
import { StrToStr } from "~/components/Chart/util";
import { StrToAny } from "./types";


const IMAGE_PATHS: StrToAny = {
  left: {
    arrow: [
      '/images/arrows-hint/arrow_downleft_left.png',
      '/images/arrows-hint/arrow_upleft_left.png',
      '/images/arrows-hint/arrow_center_left.png',
      '/images/arrows-hint/arrow_upright_left.png',
      '/images/arrows-hint/arrow_downright_left.png',
    ],
    trail: [
      '/images/arrows-hint/trail_downleft_left.png',
      '/images/arrows-hint/trail_upleft_left.png',
      '/images/arrows-hint/trail_center_left.png',
      '/images/arrows-hint/trail_upright_left.png',
      '/images/arrows-hint/trail_downright_left.png',
    ],
    cap: [
      '/images/arrows-hint/holdcap_downleft_left.png',
      '/images/arrows-hint/holdcap_upleft_left.png',
      '/images/arrows-hint/holdcap_center_left.png',
      '/images/arrows-hint/holdcap_upright_left.png',
      '/images/arrows-hint/holdcap_downright_left.png',
    ]
  },
  right: {
    arrow: [
      '/images/arrows-hint/arrow_downleft_right.png',
      '/images/arrows-hint/arrow_upleft_right.png',
      '/images/arrows-hint/arrow_center_right.png',
      '/images/arrows-hint/arrow_upright_right.png',
      '/images/arrows-hint/arrow_downright_right.png',
    ],
    trail: [
      '/images/arrows-hint/trail_downleft_right.png',
      '/images/arrows-hint/trail_upleft_right.png',
      '/images/arrows-hint/trail_center_right.png',
      '/images/arrows-hint/trail_upright_right.png',
      '/images/arrows-hint/trail_downright_right.png',
    ],
    cap: [
      '/images/arrows-hint/holdcap_downleft_right.png',
      '/images/arrows-hint/holdcap_upleft_right.png',
      '/images/arrows-hint/holdcap_center_right.png',
      '/images/arrows-hint/holdcap_upright_right.png',
      '/images/arrows-hint/holdcap_downright_right.png',
    ]
  },
  either: {
    arrow: [
      '/images/arrows-hint/arrow_downleft_either.png',
      '/images/arrows-hint/arrow_upleft_either.png',
      '/images/arrows-hint/arrow_center_either.png',
      '/images/arrows-hint/arrow_upright_either.png',
      '/images/arrows-hint/arrow_downright_either.png',
    ],
    trail: [
      '/images/arrows-hint/trail_downleft_either.png',
      '/images/arrows-hint/trail_upleft_either.png',
      '/images/arrows-hint/trail_center_either.png',
      '/images/arrows-hint/trail_upright_either.png',
      '/images/arrows-hint/trail_downright_either.png',
    ],
    cap: [
      '/images/arrows-hint/holdcap_downleft_either.png',
      '/images/arrows-hint/holdcap_upleft_either.png',
      '/images/arrows-hint/holdcap_center_either.png',
      '/images/arrows-hint/holdcap_upright_either.png',
      '/images/arrows-hint/holdcap_downright_either.png',
    ]
  },
  hand: {
    arrow: [
      '/images/arrows-hint/arrow_downleft_hand.png',
      '/images/arrows-hint/arrow_upleft_hand.png',
      '/images/arrows-hint/arrow_center_hand.png',
      '/images/arrows-hint/arrow_upright_hand.png',
      '/images/arrows-hint/arrow_downright_hand.png',
    ],
    trail: [
      '/images/arrows-hint/trail_downleft_hand.png',
      '/images/arrows-hint/trail_upleft_hand.png',
      '/images/arrows-hint/trail_center_hand.png',
      '/images/arrows-hint/trail_upright_hand.png',
      '/images/arrows-hint/trail_downright_hand.png',
    ],
    cap: [
      '/images/arrows-hint/holdcap_downleft_hand.png',
      '/images/arrows-hint/holdcap_upleft_hand.png',
      '/images/arrows-hint/holdcap_center_hand.png',
      '/images/arrows-hint/holdcap_upright_hand.png',
      '/images/arrows-hint/holdcap_downright_hand.png',
    ]
  }
};


export function useArrowImages() {
  // For client-side only, we can use a simpler baseUrl approach
  const [baseUrl, setBaseUrl] = createSignal('');
  
  onMount(() => {
    setBaseUrl(window.location.origin);
  });

  const getImage = (panel: number, limbAnnot: string, imageName: string): Signal<string> => {
    const limbMap: StrToStr = {
      'l': 'left',
      'r': 'right',
      'e': 'either',
      'h': 'hand',
      '?': 'either'
    };
    
    const limb = limbMap[limbAnnot[0]] || 'either';
    const type = imageName as 'arrow' | 'trail' | 'cap';
    const panelIndex = panel % 5;
    
    // Create the signal with a computed URL
    const [url, setUrl] = createSignal(baseUrl() + IMAGE_PATHS[limb][type][panelIndex]);
    
    // Update URL when baseUrl changes
    createEffect(() => {
      setUrl(baseUrl() + IMAGE_PATHS[limb][type][panelIndex]);
    });

    return [url, setUrl];
  };

  return { getImage };
}