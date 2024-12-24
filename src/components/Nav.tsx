import { A } from "@solidjs/router";
import { createSignal } from "solid-js";


export default function Nav() {
  const [isOpen, setIsOpen] = createSignal(false);

  const navLinks = [
    { href: "/search", text: "Chart search" },
    { href: "/articles/difficultytierlists", text: "Difficulty tier lists" },
    { href: "/skill", text: "Skills" },
    { href: "/articles/lifebarcalculator", text: "Lifebar calculator" },
    { href: "/articles", text: "Articles" },
    { href: "/upload", text: "Upload" },
  ];

  return (
    <nav class="nav bg-[#444] mb-2.5 relative">
      <div class="container flex items-start justify-start p-1 text-gray-200">
        <a href="/" class="text-[#efb920] italic no-underline mr-6  " style="text-shadow: 0 0 2px">
          piucenter
        </a>

        {/* Hamburger button - visible on mobile */}
        <button 
          class="md:hidden absolute right-3"
          onClick={() => setIsOpen(!isOpen())}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d={isOpen() ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Desktop menu */}
        {/* <ul class="hidden md:flex space-x-6 items-start"> */}
        <ul class="hidden md:flex space-x-6 items-start">
        {/* <ul class="hidden md:flex"> */}
          {navLinks.map(link => (
            <li>
              <A 
                href={link.href}
                class="text-[#ddd] underline hover:text-white"
              >
                {link.text}
              </A>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile menu dropdown */}
      <div 
        class={`${isOpen() ? 'block' : 'hidden'} md:hidden absolute top-[100%] left-0 right-0 z-50`}
      >
        <ul class="bg-[#444] px-4 pb-3 space-y-2">
          {navLinks.map(link => (
            <li>
              <A 
                href={link.href}
                class="block text-[#ddd] underline py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.text}
              </A>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}