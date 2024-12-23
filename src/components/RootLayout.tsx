// src/components/RootLayout.tsx
import { ParentComponent, onMount, onCleanup } from "solid-js";


const RootLayout: ParentComponent = (props) => {

  onMount(() => {
    // Add Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = "https://www.googletagmanager.com/gtag/js?id=G-2XBRXQWGP5";
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-2XBRXQWGP5');
    `;
    document.head.appendChild(script2);
  });

  return (
    <div>{props.children}</div>
  );
};

export default RootLayout;