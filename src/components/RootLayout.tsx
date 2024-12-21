// src/components/RootLayout.tsx
import { ParentComponent, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Meta } from "@solidjs/meta";

const RootLayout: ParentComponent = (props) => {
  const navigate = useNavigate();

  // Handle navigation on single-page app, client-side rendering
  const handleLinkClick = (e: MouseEvent) => {
    // Skip if user is holding modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
  
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Skip if it's an external link
    if (href.startsWith('http') || href.startsWith('//')) return;
    
    // Skip if it's a download
    if (link.hasAttribute('download')) return;
    
    // Skip if it has a target
    if (link.hasAttribute('target')) return;
    
    // Handle internal navigation
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault();
      navigate(href);
      
      // Optionally scroll to top for new pages (not anchor links)
      // if (!href.includes('#')) {
      //   window.scrollTo(0, 0);
      // }
    }
  };

  onMount(() => {
    document.addEventListener('click', handleLinkClick);

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

  onCleanup(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', handleLinkClick);
    }
  });

  return (
    <div>{props.children}</div>
  );
};

export default RootLayout;