

export default function Nav() {
  return (
    <nav class="nav" style={`margin-bottom: 10px; background-color: #444`}>
      <ul class="container flex items-center p-1 text-gray-200">
      {/* <span style={`color:#efb920;font-style:italic`}> piucenter </span> */}
        <a 
          href="/"
          style={`color:#efb920;font-style:italic;text-decoration:none;text-shadow: 0 0 2px;`}
        > 
          piucenter 
        </a>
        {/* <img src="/favicon.ico" style={`width:20px`}></img> */}
        {/* <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
          <a class='nava' href="/">Home</a>
        </li> */}
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <a class='nava' 
            href="/search"
            style={`color:#ddd;text-decoration:underline`}
          >Chart search</a>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <a class='nava' 
            href="/difficulty/S13"
            style={`color:#ddd;text-decoration:underline`}
          >Difficulty tier lists</a>
        </li>
        <li class={`border-b-2} ml-1.5 sm:ml-6`}>
          <a class='nava'
            href="/skill"
            style={`color:#ddd;text-decoration:underline`}
          >Skills</a>
        </li>
      </ul>
    </nav>
  );
}
