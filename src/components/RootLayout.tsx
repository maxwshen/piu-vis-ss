// src/components/RootLayout.tsx
import { ParentComponent, onMount, onCleanup } from "solid-js";
import { LayoutProvider, useLayout } from "~/components/LayoutContext";

const MOBILE_BREAKPOINT = 768;

const LayoutContent: ParentComponent = (props) => {
  const { setIsMobile } = useLayout();

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

    // Set up mobile detection
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      const layout = document.documentElement;
      if (e.matches) {
        layout.classList.add('mobile');
        layout.classList.remove('desktop');
        setIsMobile(true);
      } else {
        layout.classList.add('desktop');
        layout.classList.remove('mobile');
        setIsMobile(false);
      }
    };

    // Initial check
    handleResize(mediaQuery);
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handleResize);

    // Cleanup
    onCleanup(() => {
      mediaQuery.removeEventListener('change', handleResize);
    });
  });

  return <div class="root-layout">{props.children}</div>;
};

const RootLayout: ParentComponent = (props) => {
  return (
    <LayoutProvider>
      <LayoutContent>{props.children}</LayoutContent>
    </LayoutProvider>
  );
};

export default RootLayout;