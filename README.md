# PixelForge AI (Version 1)

Static HTML/CSS/vanilla JS site. No build step required.

## Structure
- css/ design tokens, base styles, components, workspace, cropper
- js/ theme, header/footer injection, tool grid rendering, shared tool workspace, per-tool logic in js/tools/
- data/tools.json single source of truth for the tool catalog
- tools/ 9 working browser-based tools
- ai-tools/ 8 Coming Soon AI tool pages
- categories/, about, privacy, terms, contact, pricing, 404

## Deploy
Upload all files preserving folder structure to any static host (GitHub Pages, Netlify, Vercel static, etc). No server, database or build tool needed for Version 1.

## Notes
- Only tools marked Available in data/tools.json are real. AI tools are intentionally Coming Soon until a real model/API is connected server-side.
