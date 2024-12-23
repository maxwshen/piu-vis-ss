import { Title } from "@solidjs/meta";
import Nav from '~/components/Nav';
import { marked } from 'marked';
import { createSignal, onMount } from 'solid-js';

// Keep your original markdown content
const markdownContent = `
An interactive web app and knowledge resource for the dance rhythm game, Pump it Up!

---
**[Chart search](/search)**: Find stepcharts with specific skills and techniques, like twisting, anchor runs, brackets, and doubles charts focused on the middle 4 panels.

**[Difficulty tier lists](/difficulty)**: Trying to break into a new difficulty level? Find stepcharts ranked by difficulty *within* each level, for all difficulties: from S1 to S26, and D4 to D28.

**[Lifebar calculator](/articles/lifebarcalculator)**: Plan stage passes with our interactive lifebar calculator: see the impact of missing specific notes in a stepchart on your lifebar.

**[Articles](/articles)**: Learn about game mechanics, like the lifebar, judgment timing windows, and core concepts like crux sections (the hardest parts of a stepchart), notes per second to quantify footspeed, and time under tension.

---

**Stepchart visualization**
- Learn how to execute stepcharts: all arrows and holds are annotated with which foot you should use: right foot or left foot
- Prepare yourself for playing unfamiliar stepcharts
- Struggling on a particular stepchart section? Find similar charts, and similar chart sections

---

<span style="color:#888;">
Content version: Phoenix v2.01.

piucenter is founded on the idea that community-made .ssc stepchart files are a rich resource for data analysis, visualization, and creating tools for the community to support players playing on official Pump it Up machines.

piucenter is a hobby project by aesthete.
For more information and credits, see the [about page](/articles/about) and join our [discord](https://discord.gg/aHbZsk7j2U).
</span>
`;

export default function Home() {
  const [htmlContent, setHtmlContent] = createSignal('');

  onMount(() => {
    // Configure marked to handle HTML and styling
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
      sanitize: false, // Allow HTML
    });

    setHtmlContent(marked(markdownContent));
  });

  return (
    <div>
      <Title>piucenter</Title>
      <Nav />

      <main class="text-center mx-auto p-4" style="justify-content:center">
        <div>
          <h1 class="max-6-xs text-5xl font-thin" style={`color:#efb920;font-style:italic;text-shadow: 0 0 6px`}>
            piucenter
          </h1>
        </div>
      </main>

      <div 
        class="markdown-content prose prose-invert max-w-none mx-auto px-4"
        innerHTML={htmlContent()} 
      />
    </div>
  );
}