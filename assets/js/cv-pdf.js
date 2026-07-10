/* ============================================================
   PORTFOLIO  |  cv-pdf.js
   Fetches resume.md, parses Markdown → HTML, then uses the
   browser's print-to-PDF to generate a clean CV PDF.
   No external library needed — zero dependencies.
   ============================================================ */

(function () {

  /* ── Tiny Markdown → HTML parser ───────────────────────── */
  function mdToHtml (md) {
    let html = md
      // Headings
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      // Bold / italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      // Inline code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Bare URLs
      .replace(/(?<![">])(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
      // Horizontal rules
      .replace(/^---+$/gm, '<hr>')
      // Bullet list items
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|(?![\s\S]))/g, (m, p1) => {
        return '<ul>' + p1.replace(/\n<li>/g, '<li>') + '</ul>\n';
      })
      // Paragraphs — wrap orphan lines
      .split('\n\n')
      .map(function (block) {
        block = block.trim();
        if (!block) return '';
        if (/^<(h[1-6]|ul|hr|p)/.test(block)) return block;
        return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
      })
      .join('\n');

    return html;
  }

  /* ── Generate PDF via print window ─────────────────────── */
  function generatePDF (mdText) {
    const bodyHtml = mdToHtml(mdText);

    const css = `
      @page { margin: 18mm 16mm; }
      * { box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 11pt;
        color: #111;
        line-height: 1.55;
        max-width: 180mm;
        margin: 0 auto;
      }
      h1 { font-size: 22pt; margin: 0 0 2pt; letter-spacing: -0.03em; }
      h2 { font-size: 12pt; font-weight: 700; margin: 18pt 0 4pt;
           border-bottom: 1pt solid #ccc; padding-bottom: 3pt;
           text-transform: uppercase; letter-spacing: 0.06em; }
      h3 { font-size: 11pt; font-weight: 700; margin: 10pt 0 3pt; }
      p  { margin: 4pt 0; }
      ul { margin: 4pt 0; padding-left: 14pt; }
      li { margin: 3pt 0; }
      a  { color: #1a1917; text-decoration: none; }
      hr { border: none; border-top: 0.5pt solid #ddd; margin: 10pt 0; }
      code { font-family: monospace; font-size: 10pt; background: #f4f4f4; padding: 0 3pt; }
      strong { font-weight: 700; }
      @media print { body { max-width: 100%; } }
    `;

    const win = window.open('', '_blank',
      'width=900,height=700,menubar=no,toolbar=no,location=no,status=no');
    if (!win) {
      alert('Popup blocked – please allow popups for this page and try again.');
      return;
    }

    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Souvik Ghosh – CV</title>
  <style>${css}</style>
</head>
<body>${bodyHtml}</body>
</html>`);

    win.document.close();
    win.focus();
    // Small delay to let the browser render before print dialog
    setTimeout(function () {
      win.print();
      win.close();
    }, 600);
  }

  /* ── Fetch resume.md and trigger PDF ───────────────────── */
  async function downloadCV () {
    const btn = document.getElementById('btn-download-cv');
    if (btn) {
      btn.textContent = 'Preparing…';
      btn.disabled = true;
    }

    try {
      const res  = await fetch('./resume.md');
      if (!res.ok) throw new Error('Could not load resume.md (' + res.status + ')');
      const text = await res.text();
      generatePDF(text);
    } catch (err) {
      console.error('[cv-pdf]', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      if (btn) {
        btn.textContent = 'Download CV (PDF)';
        btn.disabled = false;
      }
    }
  }

  /* ── Wire button on DOMContentLoaded ───────────────────── */
  function wireButton () {
    const btn = document.getElementById('btn-download-cv');
    if (btn) btn.addEventListener('click', downloadCV);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButton);
  } else {
    wireButton();
  }

  // Expose globally so inline onclick can also call it
  window.downloadCV = downloadCV;

}());
