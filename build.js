const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read markdown source
const markdownPath = path.join(__dirname, 'aiplaybook.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf8');

// Slugify function to generate stable anchor IDs
const headingSlugs = new Set();
function generateSlug(text) {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let baseSlug = slug;
  let counter = 1;
  while (headingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  headingSlugs.add(slug);
  return slug;
}

// Custom marked renderer for Swiss Design
const renderer = new marked.Renderer();

renderer.code = function({ text, lang, escaped }) {
  const language = lang || 'plaintext';
  let highlighted;
  try {
    if (hljs.getLanguage(language)) {
      highlighted = hljs.highlight(text, { language }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch (err) {
    highlighted = escaped ? text : escapeHtml(text);
  }

  return `
<div class="code-block-wrapper">
  <div class="code-header">
    <span class="code-lang">${language}</span>
    <button type="button" class="copy-btn" aria-label="Copy code snippet" onclick="copyCode(this)">Copy</button>
  </div>
  <pre><code class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
};

renderer.heading = function({ text, depth }) {
  const textClean = text.trim();
  const slug = generateSlug(textClean);
  
  if (depth === 1) {
    return `<h1 id="${slug}" class="doc-title">${textClean}</h1>`;
  }
  
  return `
<h${depth} id="${slug}" class="heading-anchor-group">
  <span class="heading-text">${textClean}</span>
  <a class="heading-anchor" href="#${slug}" aria-label="Anchor link to ${textClean}">#</a>
</h${depth}>`;
};

renderer.table = function({ header, rows }) {
  let headerHtml = '';
  let bodyHtml = '';

  header.forEach(cell => {
    headerHtml += `<th>${cell.text}</th>`;
  });

  rows.forEach(row => {
    bodyHtml += '<tr>';
    row.forEach(cell => {
      bodyHtml += `<td>${cell.text}</td>`;
    });
    bodyHtml += '</tr>';
  });

  return `
<div class="table-container">
  <table class="swiss-table">
    <thead>
      <tr>${headerHtml}</tr>
    </thead>
    <tbody>
      ${bodyHtml}
    </tbody>
  </table>
</div>`;
};

renderer.list = function({ items, ordered }) {
  const type = ordered ? 'ol' : 'ul';
  let itemsHtml = '';
  items.forEach(item => {
    itemsHtml += `<li>${item.text}</li>`;
  });
  return `<${type} class="swiss-list">${itemsHtml}</${type}>`;
};

marked.use({ renderer });

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Parse markdown into AST tokens
const rawTokens = marked.lexer(markdownContent);

// Chapter Definitions for Multi-Page Pagination
const chapterConfigs = [
  { id: 'overview', filename: 'index.html', title: 'Overview & Index', num: '00', match: null },
  { id: 'core-concepts', filename: '01-core-concepts.html', title: '1. Core Concepts', num: '01', match: '1. Core Concepts' },
  { id: 'ai-augmented-sdlc', filename: '02-ai-augmented-sdlc.html', title: '2. The AI-Augmented SDLC', num: '02', match: '2. The AI-Augmented SDLC' },
  { id: 'preparing-codebase', filename: '03-preparing-codebase.html', title: '3. Phase 1: Preparing Codebase', num: '03', match: '3. Phase 1: Preparing the Codebase to Be AI-Friendly' },
  { id: 'developer-experience', filename: '04-developer-experience.html', title: '4. Phase 2: Developer Experience', num: '04', match: '4. Phase 2: Designing the Developer Experience' },
  { id: 'quality-security-assurance', filename: '05-quality-security-assurance.html', title: '5. Phase 3: Quality & Security', num: '05', match: '5. Phase 3: Reviewing Everything for Flaws (Quality & Security Assurance)' },
  { id: 'enterprise-workflows-gates', filename: '06-enterprise-workflows-gates.html', title: '6. Enterprise Workflows & Gates', num: '06', match: '6. End-to-End Enterprise Workflows, Gates & Governance' },
  { id: 'azure-devops-tickets', filename: '07-azure-devops-tickets.html', title: '7. Azure DevOps Ticket Standards', num: '07', match: '7. How to Write Tickets for Azure DevOps (dev.azure.com)' },
  { id: 'documentation-planning', filename: '08-documentation-planning.html', title: '8. Documentation Standards', num: '08', match: '8. Documentation as a First-Class Citizen & Planning Standards' }
];

// Group tokens by chapter
const chapters = chapterConfigs.map(config => ({
  ...config,
  tokens: [],
  subheadings: []
}));

let currentChapterIndex = 0; // Starts at Overview

for (const token of rawTokens) {
  // Skip the static Markdown TOC block
  if (token.type === 'heading' && token.text.trim() === 'Table of Contents') {
    continue;
  }

  if (token.type === 'heading' && token.depth === 2) {
    const textClean = token.text.trim();
    // Check if this matches a chapter definition
    const matchIndex = chapterConfigs.findIndex(c => c.match && textClean.startsWith(c.match));
    if (matchIndex !== -1) {
      currentChapterIndex = matchIndex;
    }
  }

  chapters[currentChapterIndex].tokens.push(token);

  if (token.type === 'heading' && token.depth >= 2) {
    const textClean = token.text.trim();
    if (textClean !== 'Table of Contents' && textClean !== 'Overview') {
      chapters[currentChapterIndex].subheadings.push({
        text: textClean,
        level: token.depth
      });
    }
  }
}

// Generate Overview Chapter Content for index.html if empty
if (chapters[0].tokens.length < 5) {
  const overviewMarkdown = `
# The AI Development Playbook
## Executive Operational Standard for AI-Augmented Software Engineering

Welcome to the enterprise operational standard for software development organizations integrating autonomous AI agents across the SDLC.

### Playbook Chapters

- [01. Core Concepts](01-core-concepts.html) — Tokens, Rules, Skills, Loops, and Prompt/Harness Engineering.
- [02. The AI-Augmented SDLC](02-ai-augmented-sdlc.html) — Shift-left architecture, continuous context, and gate loops.
- [03. Phase 1: Preparing Codebase](03-preparing-codebase.html) — Codebase readiness, domain models, and AI navigation.
- [04. Phase 2: Developer Experience](04-developer-experience.html) — Human-AI pair programming workflows and DX patterns.
- [05. Phase 3: Quality & Security](05-quality-security-assurance.html) — Two-tiered review architecture, automated edge cases, and auditing.
- [06. Enterprise Workflows & Gates](06-enterprise-workflows-gates.html) — Four-gate protocol, permission matrices, and safety.
- [07. Azure DevOps Ticket Standards](07-azure-devops-tickets.html) — Epic, Feature, PBI, Task, and Bug structural standards.
- [08. Documentation Standards](08-documentation-planning.html) — ADRs, PRDs, Glossaries, and code-level documentation rules.
`;
  chapters[0].tokens = marked.lexer(overviewMarkdown);
}

// Render each chapter to its HTML file
chapters.forEach((chapter, index) => {
  headingSlugs.clear(); // Reset slug generator per page for clean anchor IDs

  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null;

  const bodyHtml = marked.parser(chapter.tokens);

  // Generate Swiss Sidebar HTML with active status
  let sidebarHtml = '<ul class="toc-list">';
  chapters.forEach(c => {
    const isActive = c.id === chapter.id;
    sidebarHtml += `
      <li class="toc-item ${isActive ? 'active-chapter' : ''}">
        <a href="${c.filename}" onclick="closeMobileDrawer()">
          <span class="toc-num">${c.num}.</span>
          <span class="toc-text">${c.title}</span>
        </a>
      </li>
    `;
  });
  sidebarHtml += '</ul>';

  // Generate Pagination Controls
  const paginationHtml = `
    <nav class="pagination-nav" aria-label="Chapter Pagination">
      ${prevChapter ? `
        <a href="${prevChapter.filename}" class="pagination-btn prev-btn">
          <span class="pagination-label">← PREVIOUS CHAPTER</span>
          <span class="pagination-title">${prevChapter.title}</span>
        </a>
      ` : '<div class="pagination-placeholder"></div>'}
      ${nextChapter ? `
        <a href="${nextChapter.filename}" class="pagination-btn next-btn">
          <span class="pagination-label">NEXT CHAPTER →</span>
          <span class="pagination-title">${nextChapter.title}</span>
        </a>
      ` : '<div class="pagination-placeholder"></div>'}
    </nav>
  `;

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Swiss design operational standard for enterprise AI software development.">
  <title>${chapter.title} — The AI Development Playbook</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>

  <header class="site-header">
    <div class="header-container">
      <div class="header-logo">
        <a href="index.html" class="logo-link">
          <span class="logo-bold">SDLC</span>
          <span class="logo-light">/ STANDARD</span>
        </a>
      </div>
      <div class="header-meta">
        <span class="chapter-badge">CHAPTER ${chapter.num}</span>
        <span>•</span>
        <span>VERSION 4.0</span>
      </div>
      <button type="button" class="mobile-menu-btn" aria-label="Toggle Navigation Index" onclick="toggleMobileDrawer()">
        <span class="menu-icon-line"></span>
        <span class="menu-icon-line"></span>
      </button>
    </div>
  </header>

  <div class="layout-container">
    <aside class="sidebar" id="sidebar-drawer">
      <div class="sidebar-header">
        <span class="sidebar-title">CHAPTER INDEX</span>
        <button type="button" class="close-menu-btn" aria-label="Close Index" onclick="closeMobileDrawer()">×</button>
      </div>
      <nav class="sidebar-nav" aria-label="Table of Contents">
        ${sidebarHtml}
      </nav>
    </aside>

    <main class="content-wrapper" id="main-content">
      <article class="prose">
        ${bodyHtml}
      </article>
      ${paginationHtml}
    </main>
  </div>

  <footer class="site-footer">
    <div class="footer-container">
      <span>THE AI DEVELOPMENT PLAYBOOK © 2026</span>
      <span>•</span>
      <span>INTERNATIONAL TYPOGRAPHIC STYLE</span>
    </div>
  </footer>

  <script>
    function copyCode(button) {
      const wrapper = button.closest('.code-block-wrapper');
      const code = wrapper.querySelector('code').textContent;
      
      navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      }).catch(err => console.error('Failed to copy: ', err));
    }

    function toggleMobileDrawer() {
      const drawer = document.getElementById('sidebar-drawer');
      drawer.classList.toggle('active');
      document.body.classList.toggle('drawer-open');
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('sidebar-drawer');
      drawer.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, chapter.filename), fullHtml, 'utf8');
  console.log(`Generated docs/${chapter.filename}`);
});

console.log('Successfully generated all 9 Swiss Docs pages!');
