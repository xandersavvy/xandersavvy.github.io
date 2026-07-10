/* ============================================================
   PORTFOLIO  |  cv-pdf.js
   Fetches resume.md, parses Markdown → HTML, renders into a
   hidden off-screen div, then uses jsPDF html() to produce a
   true PDF download — no popup, no print dialog.
   ============================================================ */

(function () {

  /* ── Tiny Markdown → HTML parser ───────────────────────── */
  function mdToHtml (md) {
    let html = md
      // h4 before h3/h2/h1 so they don't double-match
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      // Bold / italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      // Inline code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links → plain text (PDFs don't need clickable links)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      // Bare URLs → strip (keep content clean)
      .replace(/(?<![">])(https?:\/\/[^\s<]+)/g, '<span class="url">$1</span>')
      // Horizontal rules
      .replace(/^---+$/gm, '<hr>')
      // Bullet list items
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>[\s\S]*?<\/li>)(\n(?!<li>)|$)/g, (m, p1) => {
        return '<ul>' + p1.replace(/\n<li>/g, '<li>') + '</ul>\n';
      })
      // Strip blank nbsp lines ( )
      .replace(/^\s*&nbsp;\s*$/gm, '')
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

  /* ── CSS injected into the off-screen render div ───────── */
  const CV_CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, #cv-print-root {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 7.8pt;
      color: #000;
      background: #fff;
      line-height: 1.32;
      width: 190mm;
    }
    h1 {
      font-size: 15pt;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 1pt;
      color: #000;
    }
    h2 {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      border-bottom: 0.6pt solid #000;
      padding-bottom: 1pt;
      margin: 6pt 0 2pt;
      color: #000;
    }
    h3 {
      font-size: 8pt;
      font-weight: 700;
      margin: 4pt 0 1pt;
      color: #000;
    }
    h4 {
      font-size: 7.8pt;
      font-weight: 600;
      margin: 2.5pt 0 1pt;
      color: #000;
    }
    p  { margin: 0.5pt 0; color: #000; line-height: 1.32; }
    ul { margin: 1pt 0 2pt; padding-left: 10pt; }
    li { margin: 0.4pt 0; color: #000; line-height: 1.32; }
    a, .url { color: #000; text-decoration: none; }
    hr { border: none; border-top: 0.4pt solid #bbb; margin: 3pt 0; }
    code { font-family: monospace; font-size: 7.5pt; color: #000; }
    strong { font-weight: 700; color: #000; }
    em { font-style: italic; }
  `;

  /* ── Load jsPDF + html2canvas from CDN if not present ──── */
  function loadScript (src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ── Core: render HTML → PDF download ──────────────────── */
  async function generatePDF (mdText) {
    // Load libraries
    await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');

    const { jsPDF } = window.jspdf;

    // Build off-screen render container
    const container = document.createElement('div');
    container.id = 'cv-print-root';
    container.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      'width:190mm',
      'background:#fff',
      'padding:6mm 7mm',
      'font-family:Segoe UI,Arial,sans-serif',
      'font-size:7.8pt',
      'line-height:1.32',
      'color:#000',
    ].join(';');

    // Inject scoped styles
    const style = document.createElement('style');
    style.textContent = CV_CSS;
    container.appendChild(style);

    // Inject content
    const content = document.createElement('div');
    content.innerHTML = mdToHtml(mdText);
    container.appendChild(content);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 3,               // high-res render
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.97);

      // A4: 210 × 297 mm
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN = 7;   // mm each side
      const usableW = PAGE_W - MARGIN * 2;

      // Scale image to usable width
      const pxPerMm = canvas.width / container.offsetWidth;
      const imgWmm  = usableW;
      const imgHmm  = (canvas.height / pxPerMm) * (usableW / (container.offsetWidth));
      // Simpler: keep aspect ratio
      const ratio   = canvas.height / canvas.width;
      const imgH    = imgWmm * ratio;

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      if (imgH <= PAGE_H - MARGIN * 2) {
        // Everything fits on one page — centre vertically
        doc.addImage(imgData, 'JPEG', MARGIN, MARGIN, imgWmm, imgH);
      } else {
        // Paginate: slice canvas row by row
        const pageContentH = PAGE_H - MARGIN * 2;
        let yOffset = 0;
        while (yOffset < imgH) {
          const sliceH = Math.min(pageContentH, imgH - yOffset);
          doc.addImage(imgData, 'JPEG', MARGIN, MARGIN - yOffset, imgWmm, imgH);
          yOffset += pageContentH;
          if (yOffset < imgH) doc.addPage();
        }
      }

      doc.save('Souvik-Ghosh-CV.pdf');
    } finally {
      document.body.removeChild(container);
    }
  }

  /* ── Fetch resume.md and trigger PDF ───────────────────── */
  async function downloadCV () {
    const btn = document.getElementById('btn-download-cv') ||
                document.getElementById('btn-print-cv');
    if (btn) { btn.textContent = 'Generating…'; btn.disabled = true; }

    try {
      const res = await fetch('./resume.md');
      if (!res.ok) throw new Error('Could not load resume.md (' + res.status + ')');
      const text = await res.text();
      await generatePDF(text);
    } catch (err) {
      console.error('[cv-pdf]', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      if (btn) { btn.textContent = 'Download PDF'; btn.disabled = false; }
    }
  }

  /* ── Wire buttons ───────────────────────────────────────── */
  function wireButtons () {
    const b1 = document.getElementById('btn-download-cv');
    const b2 = document.getElementById('btn-print-cv');
    if (b1) b1.addEventListener('click', downloadCV);
    if (b2) b2.addEventListener('click', downloadCV);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireButtons);
  } else {
    wireButtons();
  }

  window.downloadCV = downloadCV;

}());
