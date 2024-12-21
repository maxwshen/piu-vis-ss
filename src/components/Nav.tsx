import { A, useNavigate } from "@solidjs/router";

export default function Nav() {
  const navigate = useNavigate();

  const forceRefresh = (e: MouseEvent, url: string) => {
    e.preventDefault();
    // Force a full page load for the home page
    window.location.href = url;
  };

  return (
    <nav class="nav" style={`margin-bottom: 10px; background-color: #444`}>
      <ul class="container flex items-center p-1 text-gray-200">
        <a 
          href="/"
          onClick={(e) => {forceRefresh(e, '/')}}
          style={`color:#efb920;font-style:italic;text-decoration:none;text-shadow: 0 0 2px;`}
        > 
          piucenter 
        </a>

        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <A class='nava' 
            href="/search"
            style={`color:#ddd;text-decoration:underline`}
          >Chart search</A>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <A class='nava' 
            href="/difficulty/S13"
            style={`color:#ddd;text-decoration:underline`}
          >Difficulty tier lists</A>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <A class='nava'
            href="/skill"
            style={`color:#ddd;text-decoration:underline`}
          >Skills</A>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <A class='nava'
            href="/articles/lifebarcalculator"
            onClick={(e) => {forceRefresh(e, '/articles/lifebarcalculator')}}
            style={`color:#ddd;text-decoration:underline`}
          >Lifebar calculator</A>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <A class='nava'
            href="/articles"
            style={`color:#ddd;text-decoration:underline`}
          >Articles</A>
        </li>
      </ul>
    </nav>
  );
}