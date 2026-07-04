// Downloads the voucher currently shown on screen as a self-contained .html
// file that can be opened and printed any time, even without the app.
export function downloadVoucherHtml(loanNumber) {
  const el = document.querySelector('.voucher-print');
  if (!el) return;

  let css = '';
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) css += rule.cssText + '\n';
    } catch {
      // cross-origin stylesheet - skip
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${loanNumber}</title>
<style>${css}</style>
</head>
<body style="background:#fff;padding:20px">${el.outerHTML}</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${loanNumber}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}
