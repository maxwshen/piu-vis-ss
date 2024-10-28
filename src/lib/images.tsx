import type { Signal, Accessor, Resource, Setter, JSXElement } from 'solid-js';
import { createSignal, createResource, onMount, onCleanup, createEffect, $DEVCOMP, untrack } from "solid-js";
import { checkEnvironment } from './data';


const arrowImagePathsLeft = [
  '/public/images/arrows-hint/arrow_downleft_left.png',
  '/public/images/arrows-hint/arrow_upleft_left.png',
  '/public/images/arrows-hint/arrow_center_left.png',
  '/public/images/arrows-hint/arrow_upright_left.png',
  '/public/images/arrows-hint/arrow_downright_left.png',
];
const arrowImgSignalsLeft = Array.from(
  { length: arrowImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsLeft[i])
  )
);
const trailImagePathsLeft = [
  '/public/images/arrows-hint/trail_downleft_left.png',
  '/public/images/arrows-hint/trail_upleft_left.png',
  '/public/images/arrows-hint/trail_center_left.png',
  '/public/images/arrows-hint/trail_upright_left.png',
  '/public/images/arrows-hint/trail_downright_left.png',
];
const trailImageSignalsLeft = Array.from(
  { length: trailImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsLeft[i])
  )
);
const capImagePathsLeft = [
  '/public/images/arrows-hint/holdcap_downleft_left.png',
  '/public/images/arrows-hint/holdcap_upleft_left.png',
  '/public/images/arrows-hint/holdcap_center_left.png',
  '/public/images/arrows-hint/holdcap_upright_left.png',
  '/public/images/arrows-hint/holdcap_downright_left.png',
];
const capImgSignalsLeft = Array.from(
  { length: capImagePathsLeft.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsLeft[i])
  )
);
const arrowImagePathsRight = [
  '/public/images/arrows-hint/arrow_downleft_right.png',
  '/public/images/arrows-hint/arrow_upleft_right.png',
  '/public/images/arrows-hint/arrow_center_right.png',
  '/public/images/arrows-hint/arrow_upright_right.png',
  '/public/images/arrows-hint/arrow_downright_right.png',
];
const arrowImgSignalsRight = Array.from(
  { length: arrowImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsRight[i])
  )
);
const trailImagePathsRight = [
  '/public/images/arrows-hint/trail_downleft_right.png',
  '/public/images/arrows-hint/trail_upleft_right.png',
  '/public/images/arrows-hint/trail_center_right.png',
  '/public/images/arrows-hint/trail_upright_right.png',
  '/public/images/arrows-hint/trail_downright_right.png',
];
const trailImageSignalsRight = Array.from(
  { length: trailImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsRight[i])
  )
);
const capImagePathsRight = [
  '/public/images/arrows-hint/holdcap_downleft_right.png',
  '/public/images/arrows-hint/holdcap_upleft_right.png',
  '/public/images/arrows-hint/holdcap_center_right.png',
  '/public/images/arrows-hint/holdcap_upright_right.png',
  '/public/images/arrows-hint/holdcap_downright_right.png',
];
const capImgSignalsRight = Array.from(
  { length: capImagePathsRight.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsRight[i])
  )
);
const arrowImagePathsEither = [
  '/public/images/arrows-hint/arrow_downleft_either.png',
  '/public/images/arrows-hint/arrow_upleft_either.png',
  '/public/images/arrows-hint/arrow_center_either.png',
  '/public/images/arrows-hint/arrow_upright_either.png',
  '/public/images/arrows-hint/arrow_downright_either.png',
];
const arrowImgSignalsEither = Array.from(
  { length: arrowImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsEither[i])
  )
);
const trailImagePathsEither = [
  '/public/images/arrows-hint/trail_downleft_either.png',
  '/public/images/arrows-hint/trail_upleft_either.png',
  '/public/images/arrows-hint/trail_center_either.png',
  '/public/images/arrows-hint/trail_upright_either.png',
  '/public/images/arrows-hint/trail_downright_either.png',
];
const trailImageSignalsEither = Array.from(
  { length: trailImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsEither[i])
  )
);
const capImagePathsEither = [
  '/public/images/arrows-hint/holdcap_downleft_either.png',
  '/public/images/arrows-hint/holdcap_upleft_either.png',
  '/public/images/arrows-hint/holdcap_center_either.png',
  '/public/images/arrows-hint/holdcap_upright_either.png',
  '/public/images/arrows-hint/holdcap_downright_either.png',
];
const capImgSignalsEither = Array.from(
  { length: capImagePathsEither.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsEither[i])
  )
);
const arrowImagePathsHand = [
  '/public/images/arrows-hint/arrow_downleft_hand.png',
  '/public/images/arrows-hint/arrow_upleft_hand.png',
  '/public/images/arrows-hint/arrow_center_hand.png',
  '/public/images/arrows-hint/arrow_upright_hand.png',
  '/public/images/arrows-hint/arrow_downright_hand.png',
];
const arrowImgSignalsHand = Array.from(
  { length: arrowImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(arrowImagePathsHand[i])
  )
);
const trailImagePathsHand = [
  '/public/images/arrows-hint/trail_downleft_hand.png',
  '/public/images/arrows-hint/trail_upleft_hand.png',
  '/public/images/arrows-hint/trail_center_hand.png',
  '/public/images/arrows-hint/trail_upright_hand.png',
  '/public/images/arrows-hint/trail_downright_hand.png',
];
const trailImageSignalsHand = Array.from(
  { length: trailImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(trailImagePathsHand[i])
  )
);
const capImagePathsHand = [
  '/public/images/arrows-hint/holdcap_downleft_hand.png',
  '/public/images/arrows-hint/holdcap_upleft_hand.png',
  '/public/images/arrows-hint/holdcap_center_hand.png',
  '/public/images/arrows-hint/holdcap_upright_hand.png',
  '/public/images/arrows-hint/holdcap_downright_hand.png',
];
const capImgSignalsHand = Array.from(
  { length: capImagePathsHand.length }, 
  (_, i) => createSignal(
    checkEnvironment().concat(capImagePathsHand[i])
  )
);

/**
 * Fetches Signal for query image
 * @param panel: number in [0-9]
 * @param limbAnnot: one of ['l', 'r', 'e', 'h', '?']
 * @param imageName: one of ['arrow', 'trail', 'cap']
 */
export function getImage(
  panel: number, 
  limbAnnot: string, 
  imageName: string
): Signal<string> {
  interface treeInterface {
    [key: string]: Signal<string>[];
  }
  const tree: treeInterface = {
    'l_arrow': arrowImgSignalsLeft,
    'l_trail': trailImageSignalsLeft,
    'l_cap': capImgSignalsLeft,
    'r_arrow': arrowImgSignalsRight,
    'r_trail': trailImageSignalsRight,
    'r_cap': capImgSignalsRight,
    'h_arrow': arrowImgSignalsHand,
    'h_trail': trailImageSignalsHand,
    'h_cap': capImgSignalsHand,
    'e_arrow': arrowImgSignalsEither,
    'e_trail': trailImageSignalsEither,
    'e_cap': capImgSignalsEither,
    '?_arrow': arrowImgSignalsEither,
    '?_trail': trailImageSignalsEither,
    '?_cap': capImgSignalsEither,
  }
  let key = (limbAnnot + '_' + imageName);
  let imgSet = tree[key];
  let panel_idx = panel % 5;
  return imgSet[panel_idx];
}