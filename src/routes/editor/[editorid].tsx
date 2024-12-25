import { useParams } from "@solidjs/router";
import { createSignal, createResource, onMount, onCleanup, createEffect, For } from "solid-js";
import type { JSXElement } from 'solid-js';
import { Show } from 'solid-js';
import { fetchData } from '~/lib/data';
import { ChartArt, Segment, StrToAny, ArrowArt, HoldArt } from '~/lib/types';
import { getShortChartName, getShortChartNameWithLevel, skillBadge } from '~/lib/util';

import ArrowCanvas from "~/components/Chart/ArrowCanvas";
import ENPSTimeline from "~/components/Chart/NPSTimeline";
import SegmentTimeline from "~/components/Chart/SegmentTimeline";
import { ChartProvider } from "~/components/Chart/ChartContext";
import EditorPanel from "~/components/Chart/Editor";
import LifebarPlot from "~/components/Chart/Lifebar";
import chartDescription from "~/components/Chart/Description";
import { ChartData } from "~/lib/types";

import EditorCollection from "~/components/collections/EditorCollection";

import "~/styles/layout/chartvis.css"

const [activeColumn, setActiveColumn] = createSignal('column1');


/**
 * Default function, drawn by solid.js
 * @returns 
 */
export default function DynamicPage(): JSXElement {
  // Stores current route path; /chart/:id = params.editorid = [id].tsx
  const params = useParams();
  const [currentParams, setCurrentParams] = createSignal(params.editorid);

  // Refetches data whenever params.editorid changes
  const [chartData, { mutate, refetch }] = createResource<ChartData, string>(
    () => params.editorid,
    async (id: string) => {
      const result = await fetchData(id);
      if (!result) {
        throw new Error('Failed to fetch chart data');
      }
  
      const metadata = result[2] as StrToAny;
      if (!metadata) {
        throw new Error('Missing metadata in chart data');
      }
  
      const chartData = {
        arrowarts: result[0] as ArrowArt[] || [],
        holdarts: result[1] as HoldArt[] || [],
        metadata,
        segments: metadata['Segments'] as Segment[] || [],
        segmentdata: metadata['Segment metadata'] as StrToAny[] || [],
        manuallyAnnotatedFlag: metadata['Manual limb annotation'] ? '✅' : ''
      };
      return chartData;
    }
  );

  // Update document title when params change
  createEffect(() => {
    if (typeof document !== 'undefined' && params.editorid) {
      document.title = getShortChartNameWithLevel(params.editorid);
    }
  });

  // Use createEffect to update document title
  createEffect(() => {
    if (typeof document !== 'undefined' && currentParams()) {
      document.title = getShortChartNameWithLevel(currentParams());
    }
  });

  return EditorCollection(chartData, mutate, null);
};
