These components crawl /src/content/articles/*md.

To create a new article, add a new markdown file in that folder.
`[slug].tsx` supports Markdown with :
- HTML rendering, to support colored text using <span style={`color:#ddd`}></span>
- LaTeX, I think?
- css classes for tips/warnings/error colored boxes, see app.css