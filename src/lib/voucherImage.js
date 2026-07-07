import { toSvg } from 'html-to-image';

// Snapshots the voucher exactly as it looks on screen into a high-resolution
// PNG. Because printing and downloading both use this same snapshot, what
// you see in the app is exactly what comes out - no separate print styling
// that can drift from the screen design.
//
// Implementation note: we take html-to-image's SVG output and rasterize it
// onto a canvas ourselves using img.onload. The library's own toPng() relies
// on img.decode(), which hangs indefinitely on complex SVGs in some Chrome
// versions. skipFonts because the voucher only uses the system Arial font.
const PIXEL_RATIO = 3;

export async function voucherToPng() {
  const el = document.querySelector('.voucher-print');
  if (!el) throw new Error('No voucher on screen to capture.');

  const svgUrl = await toSvg(el, { skipFonts: true });

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Could not render the voucher image.'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth * PIXEL_RATIO;
  canvas.height = img.naturalHeight * PIXEL_RATIO;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(PIXEL_RATIO, PIXEL_RATIO);
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/png');
}

export async function downloadVoucherPng(loanNumber) {
  const dataUrl = await voucherToPng();
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${loanNumber || 'voucher'}.png`;
  link.click();
}

// Prints the snapshot image on the top half of a portrait A4 page via a
// hidden iframe, so the page's own CSS can't affect the output.
export async function printVoucherImage() {
  const dataUrl = await voucherToPng();

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '100%';
  iframe.style.bottom = '100%';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: A4 portrait; margin: 6mm; }
  html, body { margin: 0; padding: 0; }
  img { width: 100%; display: block; }
</style>
</head>
<body><img src="${dataUrl}"></body>
</html>`);
  doc.close();

  const img = doc.querySelector('img');
  await new Promise((resolve) => {
    if (img.complete) resolve();
    else img.onload = resolve;
  });

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  // Give the print dialog plenty of time before cleaning up.
  setTimeout(() => iframe.remove(), 60000);
}
