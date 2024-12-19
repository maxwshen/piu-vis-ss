import { createSignal, createEffect, Show } from "solid-js";
import type { JSXElement } from 'solid-js';
import { useNavigate } from "@solidjs/router";
import { checkEnvironment } from '~/lib/data';
import { Segment } from '~/lib/types';
import { getShortChartNameWithLevel, secondsToTimeStr } from '~/lib/util';
import { getLevelColor, getLevelText, StrToAny, StrToStr } from "./util";
import { useChartContext } from "~/components/Chart/ChartContext";


interface SegmentTimelineProps {
  segments: Segment[];
  segmentData: StrToAny[];
}



function segmentCollapsibleContent(segmentNumberP1: number, segment: Segment, data: StrToAny): JSXElement {
  // provides content inside of segment collapsible
  const similarSections = data['Closest sections'];

  let baseUrl = checkEnvironment();
  function makeUrlBullets(section: any): JSXElement {
    let [chartName, sectionIdx] = section;
    const sectionIdx1 = sectionIdx + 1;
    let link = [baseUrl, 'chart', chartName + '?section=' + sectionIdx1].join('/');
    const displayName = getShortChartNameWithLevel(chartName);

    const navigate = useNavigate();
    const handleNavAndReload = (e: MouseEvent) => {
      e.preventDefault();
      
      // Navigate to the new page
      navigate('chart' + '/' + chartName + '?section=' + sectionIdx1, {
        resolve: false, 
        // Optional: you can pass state if needed
        // state: { someData: "value" }
      });
  
      // Reload the page after a short delay to ensure navigation
      setTimeout(() => {
        window.location.reload();
      }, 50);
    };

    return (
      <li>
        <a href={link}
          onClick={handleNavAndReload}
          style={`text-decoration: underline`}
        >{displayName}</a>
      </li>
    );
    // return <li><a href={link}>{displayName}, §{sectionIdx1}</a></li>
  }

  function makeRareSkillText(): JSXElement {
    const rareSkills: string[] = data['rare skills'];
    const formattedSkills = rareSkills.map((skill) => skill.split('-')[0]);
    if (rareSkills.length > 0) {
      return <div style={`color:#ddd`}>
        <p style={`color:#ddd`}>⚠️ Skill warning</p>
        <p>{formattedSkills.join(', ')}</p>
        <br></br>
      </div>
    }
    return <></>
  }

  function copyToClipboard() {
    // note - not compatible with editor mode
    let loc = String(window.location);
    if (loc.includes('?')) {
      loc = loc.split('?')[0];
    }
    const sectionURL = loc + '?section=' + String(segmentNumberP1);
    navigator.clipboard.writeText(sectionURL);
  }

  return (
    <div class="text-md">
      <p class="hover:gray-900 cursor-pointer"
        style={`color:#888;text-decoration:underline`}
        onClick={(e) => copyToClipboard()}
      >copy link to section</p>
      {makeRareSkillText()}
      <Show when={similarSections.length > 0}>
        {/* <pre class="whitespace-pre-wrap text-base"> */}
        <p style={`color:#ddd`}>Similar chart sections:</p>    
        <ul>
          {similarSections.map((section: any) =>
            makeUrlBullets(section)
          )}
        </ul>
      {/* </pre> */}
      </Show>
    </div>
  );
}


export default function SegmentTimeline(props: SegmentTimelineProps) {
  const {
    scrollContainerRef,
    setScrollContainerRef,
    canvasScrollPositionMirror,
    setCanvasScrollPositionMirror,
    clickTo,
    setClickTo,
    pxPerSecond,
    setPxPerSecond,
    missTimes,
    setMissTimes,
  } = useChartContext();

  const scrollToTime = (startTime: number) => {
    scrollContainerRef()!.scrollTo({
      top: startTime * pxPerSecond(),
      behavior: 'smooth'
    });
  };

  // console.log(props.segmentData);
  const levels = props.segmentData.map((d) => Number(d['level']));
  const minSegmentLevel = Math.min(...levels);
  const maxSegmentLevel = Math.max(...levels);

  const SegmentCollapsible = (segment: Segment, data: StrToAny, index: number) => {
    const [isOpen, setIsOpen] = createSignal(false);
    const sectionNumberP1 = index + 1;
    const fmtTimeStart = secondsToTimeStr(Math.round(segment[0]));
    const fmtTimeEnd = secondsToTimeStr(Math.round(segment[1]));
    const level = Number(data['level']);
    const relativeSegmentLevel = (level - minSegmentLevel) / (maxSegmentLevel - minSegmentLevel);
    const levelColor = getLevelColor(relativeSegmentLevel);
    const styleColor = `color:${levelColor};`;
    
    // difficulty text
    const levelText = getLevelText(level);
    var levelTextwCrux = `lv.${levelText}`
    if (relativeSegmentLevel >= 0.97 && level >= 7) {
      levelTextwCrux = `lv.${levelText}\ncrux`
    }

    const rareSkills = data['rare skills'];
    let rareSkillText = '';
    if (rareSkills.length > 0) {
      rareSkillText = '⚠️';
    }

    // create effect to open segment when scrolling into it
    let startPx = segment[0] * pxPerSecond();
    let endPx = segment[1] * pxPerSecond();
    createEffect(() => {
      const beforeLeniency = 500;
      const afterLeniency = -100;
      let y = canvasScrollPositionMirror();
      if (y) {
        // open if near
        if ((y > startPx - beforeLeniency) && (y < endPx + afterLeniency)) {
          setIsOpen(true);
        }

        // close if far
        if (y < startPx - beforeLeniency) {
          setIsOpen(false);
        }
        if (y > endPx + afterLeniency) {
          setIsOpen(false);
        }
      }
    })

    return (
      <div class="rounded-md mb-1 overflow-hidden">
        {/* Header - Always visible */}
        <div 
          class={`p-1.5 bg-gray-900 hover:bg-gray-800 cursor-pointer flex justify-between items-center transition-colors transform transition-colors ${isOpen() ? 'bg-gray-700' : ''}`}
          onClick={() => (setIsOpen(!isOpen()), scrollToTime(segment[0]))}
        >
          <div class="flex-1">
          <span class="font-medium" style="color:#bbb">
            {/* §{sectionNumberP1} */}
            {sectionNumberP1}
          </span>
          <span class="font-small" style="color:#555"> {fmtTimeStart}-{fmtTimeEnd} </span>
          <span class="font-medium" style={styleColor}>{levelTextwCrux} {rareSkillText}</span>
          </div>
          <span class={`transform transition-transform ${isOpen() ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Collapsible content */}
        <div 
          class={`overflow-hidden transition-all ${isOpen() ? 'max-h-96' : 'max-h-0'}`}
        >
          <div class="p-2" style="background-color: #3e3e3e">
            {/* Add your SegmentData display here */}
            {segmentCollapsibleContent(sectionNumberP1, segment, data)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <hr style={`border-color:#666`}></hr>
      <span style={`color:#bbb;display:flex;justify-content:center;margin-top:10px;margin-bottom:10px`}
      > Sections</span>
      <div
        // class="flex flex-col gap-0 p-4"
        class="scrollbar"
        style = {`height: calc(100vh - 550px); overflow-y: auto`}
      >
        {props.segments.map((segment, index) =>
          SegmentCollapsible(segment, props.segmentData[index], index)
        )}
      </div>
    </div>
  );
};