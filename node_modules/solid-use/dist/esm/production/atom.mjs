import{createSignal as n}from"solid-js";function a(e,o=Object.is){let[r,T]=n(e,{equals:o});return(...t)=>(t.length===1&&T(()=>t[0]),r())}export{a as default};
