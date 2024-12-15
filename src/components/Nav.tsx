import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  return (
    <nav class="nav" style={`margin-bottom: 20px; background-color: #444`}>
      <ul class="container flex items-center p-1 text-gray-200">
        <li class={`border-b-2 ${active("/")} mx-1.5 sm:mx-6`}>
          <a class='nava' href="/">Home</a>
        </li>
        <li class={`border-b-2 ${active("/search")} mx-1.5 sm:mx-6`}>
          <a class='nava' href="/search">Chart search</a>
        </li>
        <li class={`border-b-2 ${active("/difficulty")} mx-1.5 sm:mx-6`}>
          <a class='nava' href="/difficulty/S13">Difficulty tier lists</a>
        </li>
        <li class={`border-b-2 ${active("/skill")} mx-1.5 sm:mx-6`}>
          <a class='nava' href="/skill">Skills</a>
        </li>
      </ul>
    </nav>
  );
}
