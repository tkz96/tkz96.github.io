const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy assets to docs/assets for deployment
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDirRecursive(path.join(__dirname, 'assets'), path.join(outputDir, 'assets'));

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

// Custom marked renderer for Swiss Design & Semantic HTML5
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

  return `<div class="code-block-wrapper">
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
  
  return `<h${depth} id="${slug}" class="heading-anchor-group">
  <span class="heading-text">${textClean}</span>
  <a class="heading-anchor" href="#${slug}" aria-label="Anchor link to ${textClean}">#</a>
</h${depth}>`;
};

renderer.table = function({ header, rows }) {
  let headerHtml = '';
  let bodyHtml = '';

  header.forEach(cell => {
    const content = marked.parseInline(cell.text);
    headerHtml += `<th scope="col">${content}</th>`;
  });

  rows.forEach(row => {
    bodyHtml += '<tr>';
    row.forEach((cell, idx) => {
      const content = marked.parseInline(cell.text);
      if (idx === 0) {
        bodyHtml += `<th scope="row">${content}</th>`;
      } else {
        bodyHtml += `<td>${content}</td>`;
      }
    });
    bodyHtml += '</tr>';
  });

  return `<div class="table-container">
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
    const content = marked.parseInline(item.text);
    itemsHtml += `<li>${content}</li>`;
  });
  return `<${type} class="swiss-list">${itemsHtml}</${type}>`;
};

renderer.image = function({ href, title, text }) {
  const caption = text || title ? `<figcaption>${text || title}</figcaption>` : '';
  return `<figure class="swiss-figure">
  <img src="${href}" alt="${text || ''}" ${title ? `title="${title}"` : ''} loading="lazy">
  ${caption}
</figure>`;
};

marked.use({ renderer });

function cleanMarkdownTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const cleanedLines = [];
  let inTable = false;
  let currentTableRow = '';
  let expectedPipes = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Isolated pipe line e.g., " |" or "|"
    const isIsolatedPipe = /^\s*\|\s*$/.test(line);

    if (isIsolatedPipe && inTable) {
      if (currentTableRow) {
        if (!currentTableRow.trim().endsWith('|')) {
          currentTableRow += ' |';
        }
        cleanedLines.push(currentTableRow);
        currentTableRow = '';
      }
      continue;
    }

    if (trimmed.startsWith('|')) {
      inTable = true;
      if (!currentTableRow) {
        currentTableRow = trimmed;
        const pipeCount = (trimmed.match(/\|/g) || []).length;
        if (pipeCount > expectedPipes) {
          expectedPipes = pipeCount;
        }
      } else {
        const currentPipes = (currentTableRow.match(/\|/g) || []).length;
        if (!currentTableRow.endsWith('|') || (expectedPipes > 2 && currentPipes < expectedPipes && !trimmed.startsWith('| ---'))) {
          currentTableRow += ' ' + trimmed;
        } else {
          cleanedLines.push(currentTableRow);
          currentTableRow = trimmed;
          const pipeCount = (trimmed.match(/\|/g) || []).length;
          if (pipeCount > expectedPipes) {
            expectedPipes = pipeCount;
          }
        }
      }
      continue;
    }

    if (inTable && currentTableRow && trimmed.length > 0) {
      currentTableRow += ' ' + trimmed;
      continue;
    }

    if (trimmed === '') {
      if (inTable && currentTableRow) {
        let nextIndex = i + 1;
        while (nextIndex < lines.length && lines[nextIndex].trim() === '') {
          nextIndex++;
        }
        if (nextIndex < lines.length && /^\s*\|/.test(lines[nextIndex])) {
          continue;
        } else {
          cleanedLines.push(currentTableRow);
          currentTableRow = '';
          inTable = false;
          expectedPipes = 0;
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    } else {
      if (inTable) {
        cleanedLines.push(currentTableRow);
        currentTableRow = '';
        inTable = false;
        expectedPipes = 0;
      }
      cleanedLines.push(line);
    }
  }

  if (currentTableRow) {
    cleanedLines.push(currentTableRow);
  }

  return cleanedLines.join('\n');
}

// Parse markdown into AST tokens
const sanitizedMarkdown = cleanMarkdownTables(markdownContent);
const rawTokens = marked.lexer(sanitizedMarkdown);

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
  { id: 'documentation-planning', filename: '08-documentation-planning.html', title: '8. Documentation Standards', num: '08', match: '8. Documentation as a First-Class Citizen & Planning Standards' },
  { id: 'skills-library', filename: '09-skills-library.html', title: '9. Recommended Skills Library', num: '09', match: '9. Recommended Skills Library' },
  { id: 'hybrid-architecture', filename: '10-hybrid-architecture.html', title: '10. Hybrid Architecture', num: '10', match: '10. The Dream: Hybrid Frontier/Local Execution Architecture' }
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
- [09. Recommended Skills Library](09-skills-library.html) — Reusable playbooks, audit tools, and custom skills.
- [10. Hybrid Architecture](10-hybrid-architecture.html) — Frontier vs local model execution split and routing.
`;
  chapters[0].tokens = marked.lexer(overviewMarkdown);
}

// Render each chapter to its HTML file
chapters.forEach((chapter, index) => {
  headingSlugs.clear(); // Reset slug generator per page for clean anchor IDs

  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null;

  // Normalize chapter heading depths so top heading is H1, sub-headings H2, etc.
  const chapterHeadings = chapter.tokens.filter(t => t.type === 'heading');
  let tokensToParse = chapter.tokens;
  if (chapterHeadings.length > 0) {
    const minDepth = Math.min(...chapterHeadings.map(t => t.depth));
    const depthOffset = 1 - minDepth;
    if (depthOffset !== 0) {
      tokensToParse = chapter.tokens.map(token => {
        if (token.type === 'heading') {
          return {
            ...token,
            depth: Math.max(1, token.depth + depthOffset)
          };
        }
        return token;
      });
    }
  }

  const bodyHtml = marked.parser(tokensToParse);

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
  <script>
    (function() {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  </script>
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
          <span class="logo-text">The new </span><span class="logo-accent">AI-SDLC</span>
        </a>
      </div>
      <div class="header-controls">
        <div class="header-meta">
          <span class="chapter-badge">CHAPTER ${chapter.num}</span>
        </div>
        <button type="button" class="theme-toggle-btn" id="theme-toggle" aria-label="Switch theme" onclick="toggleTheme()">
          <span class="theme-toggle-icon" id="theme-toggle-icon" aria-hidden="true">🌙</span>
          <span class="theme-toggle-label">Switch theme</span>
        </button>
        <button type="button" class="mobile-menu-btn" aria-label="Toggle Navigation Index" aria-expanded="false" aria-controls="sidebar-drawer" onclick="toggleMobileDrawer()">
          <span class="menu-icon-line" aria-hidden="true"></span>
          <span class="menu-icon-line" aria-hidden="true"></span>
          <span class="menu-icon-line" aria-hidden="true"></span>
        </button>
      </div>
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
      <div class="footer-left">
        <span>THE AI DEVELOPMENT PLAYBOOK © 2026</span>
        <span>•</span>
        <span class="footer-author">Talha Khalid Zuberi</span>
      </div>
      <div class="footer-socials">
        <a class="footer-social-icon" href="https://www.twitter.com/tkz96" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile">
          <img src="assets/icons/social-icons/icon-twitter.svg" alt="" aria-hidden="true" />
        </a>
        <a class="footer-social-icon" href="https://www.linkedin.com/in/talha-zuberi" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
          <img src="assets/icons/social-icons/icon-linkedin.svg" alt="" aria-hidden="true" />
        </a>
        <a class="footer-social-icon" href="https://medium.com/@tkz_96" target="_blank" rel="noopener noreferrer" aria-label="Medium Profile">
          <img src="assets/icons/social-icons/icon-medium.svg" alt="" aria-hidden="true" />
        </a>
        <a class="footer-social-icon" href="https://www.github.com/tkz96" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
          <img src="assets/icons/social-icons/icon-github.svg" alt="" aria-hidden="true" />
        </a>
        <a class="footer-social-icon" href="https://angel.co/u/talha-zuberi" target="_blank" rel="noopener noreferrer" aria-label="AngelList Profile">
          <img src="assets/icons/social-icons/icon-angellist.svg" alt="" aria-hidden="true" />
        </a>
      </div>
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

    function updateThemeIcon() {
      const current = document.documentElement.getAttribute('data-theme');
      const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const iconSpan = document.getElementById('theme-toggle-icon');
      if (iconSpan) {
        iconSpan.textContent = isDark ? '☀️' : '🌙';
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon();
    }

    function toggleMobileDrawer() {
      const drawer = document.getElementById('sidebar-drawer');
      const btn = document.querySelector('.mobile-menu-btn');
      const isActive = drawer.classList.toggle('active');
      document.body.classList.toggle('drawer-open', isActive);
      if (btn) btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('sidebar-drawer');
      const btn = document.querySelector('.mobile-menu-btn');
      drawer.classList.remove('active');
      document.body.classList.remove('drawer-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('DOMContentLoaded', updateThemeIcon);
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, chapter.filename), fullHtml, 'utf8');
  console.log(`Generated docs/${chapter.filename}`);
});

console.log(`Successfully generated all ${chapters.length} Swiss Docs pages!`);
