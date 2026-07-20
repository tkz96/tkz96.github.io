const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
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
    // Replace non-alphanumeric chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from start/end
    .replace(/^-+|-+$/g, '');
  
  // Ensure uniqueness
  let baseSlug = slug;
  let counter = 1;
  while (headingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  headingSlugs.add(slug);
  return slug;
}

// Generate the TOC tree using marked lexer
const tokens = marked.lexer(markdownContent);
const toc = [];
const filteredTokens = [];
let skipMode = false;

// Filter out the static "Table of Contents" in markdown to avoid duplicates
for (const token of tokens) {
  if (token.type === 'heading' && token.text.trim() === 'Table of Contents') {
    skipMode = true;
    continue;
  }
  if (skipMode) {
    if (token.type === 'heading' || token.type === 'hr') {
      skipMode = false;
    } else {
      continue;
    }
  }
  filteredTokens.push(token);

  // Extract headings for the TOC nav
  if (token.type === 'heading') {
    const text = token.text.trim();
    // Exclude the document title (H1) and version (first H2) from active TOC lists,
    // as they are page headers, not content sections.
    if (token.depth > 1 && !text.startsWith('Version 4:')) {
      toc.push({
        text: text,
        level: token.depth,
        slug: generateSlug(text)
      });
    }
  }
}

// Reset headingSlugs for the rendering pass to make sure the generated IDs match the TOC
headingSlugs.clear();

// Set up custom renderer to support Swiss design components
const renderer = new marked.Renderer();

// Custom code renderer with syntax highlighting, language label, and copy button
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

// Custom heading renderer to generate stable anchor links
renderer.heading = function({ text, depth, raw }) {
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

// Custom table renderer to ensure horizontal scrolling support
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

// Custom list renderer to ensure clean print-like alignment
renderer.list = function({ items, ordered, start }) {
  const type = ordered ? 'ol' : 'ul';
  let itemsHtml = '';
  items.forEach(item => {
    itemsHtml += `<li>${item.text}</li>`;
  });
  return `<${type} class="swiss-list">${itemsHtml}</${type}>`;
};

marked.use({ renderer });

// Compile Markdown to HTML
const htmlContent = marked.parser(filteredTokens);

// Helper function to escape HTML if fallback is needed
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate the sidebar TOC list HTML
function buildTocHtml(tocItems) {
  let html = '<ul class="toc-list">';
  tocItems.forEach(item => {
    // Determine section numbering if starts with digits, otherwise keep text
    let num = '';
    let label = item.text;
    const match = item.text.match(/^(\d+)\.\s*(.*)/);
    
    if (match) {
      num = match[1].padStart(2, '0') + '. ';
      label = match[2];
    }

    const itemClass = `toc-item toc-level-${item.level}`;
    html += `
      <li class="${itemClass}">
        <a href="#${item.slug}" onclick="closeMobileDrawer()">
          ${num ? `<span class="toc-num">${num}</span>` : ''}
          <span class="toc-text">${label}</span>
        </a>
      </li>
    `;
  });
  html += '</ul>';
  return html;
}

const tocHtml = buildTocHtml(toc);

// Full HTML Template in Swiss / International Typographic Style
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Operational standard for enterprise development organizations integrating autonomous AI agents across every stage of the SDLC.">
  <title>The AI Development Playbook</title>
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
        <span class="logo-bold">SDLC</span>
        <span class="logo-light">/ STANDARD</span>
      </div>
      <div class="header-meta">
        <span>VERSION 4.0</span>
        <span>•</span>
        <span>AZURE DEVOPS INTEGRATION</span>
      </div>
      <button type="button" class="mobile-menu-btn" aria-label="Toggle Table of Contents" onclick="toggleMobileDrawer()">
        <span class="menu-icon-line"></span>
        <span class="menu-icon-line"></span>
      </button>
    </div>
  </header>

  <div class="layout-container">
    <aside class="sidebar" id="sidebar-drawer">
      <div class="sidebar-header">
        <span class="sidebar-title">INDEX STRUCTURE</span>
        <button type="button" class="close-menu-btn" aria-label="Close Table of Contents" onclick="closeMobileDrawer()">×</button>
      </div>
      <nav class="sidebar-nav" aria-label="Table of Contents">
        ${tocHtml}
      </nav>
    </aside>

    <main class="content-wrapper" id="main-content">
      <article class="prose">
        ${htmlContent}
      </article>
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
    // Copy-to-clipboard function
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
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }

    // Mobile drawer toggles
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

    // Scrollspy and mathematical caliper indicator logic
    document.addEventListener('DOMContentLoaded', () => {
      const sections = [];
      const tocLinks = document.querySelectorAll('.toc-list a');
      
      // Get all headings in the document that have corresponding TOC links
      tocLinks.forEach(link => {
        const id = link.getAttribute('href').substring(1);
        const element = document.getElementById(id);
        if (element) {
          sections.push({ id, element, link });
        }
      });

      function updateActiveToc() {
        const scrollPosition = window.scrollY + 120; // offset for sticky header
        
        let activeIndex = -1;
        for (let i = 0; i < sections.length; i++) {
          if (scrollPosition >= sections[i].element.offsetTop) {
            activeIndex = i;
          } else {
            break;
          }
        }

        tocLinks.forEach(link => link.classList.remove('active'));
        
        if (activeIndex !== -1) {
          const activeLink = sections[activeIndex].link;
          activeLink.classList.add('active');
          
          // Align the indicator container
          const activeLi = activeLink.closest('li');
          if (activeLi) {
            // Scroll sidebar if active item is out of view
            const sidebarNav = document.querySelector('.sidebar-nav');
            const liTop = activeLi.offsetTop;
            const liBottom = liTop + activeLi.offsetHeight;
            const viewTop = sidebarNav.scrollTop;
            const viewBottom = viewTop + sidebarNav.clientHeight;
            
            if (liTop < viewTop) {
              sidebarNav.scrollTop = liTop;
            } else if (liBottom > viewBottom) {
              sidebarNav.scrollTop = liBottom - sidebarNav.clientHeight;
            }
          }
        }
      }

      window.addEventListener('scroll', updateActiveToc);
      updateActiveToc(); // Initial run
    });
  </script>
</body>
</html>
`;

// Write the index.html file
fs.writeFileSync(path.join(outputDir, 'index.html'), fullHtml, 'utf8');
console.log('Successfully generated docs/index.html');
