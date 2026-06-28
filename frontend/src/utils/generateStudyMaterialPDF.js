/**
 * KCI Premium Study Material PDF Generator
 * Enterprise-grade A4 PDF with header, footer, watermark, QR code
 * Uses jsPDF — production ready, error-safe
 */
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PW   = 210;   // page width  mm
const PH   = 297;   // page height mm
const ML   = 18;    // margin left/right
const CW   = PW - ML * 2; // content width

const HDR_H  = 32;  // header height
const FTR_H  = 18;  // footer height
const FTR_Y  = PH - FTR_H;
const CT     = HDR_H + 8;   // content top
const CB     = FTR_Y - 6;   // content bottom

// ─── COLOUR PALETTE ──────────────────────────────────────────────────────────
const NAVY   = [11,  31,  91];
const GOLD   = [212, 175, 55];
const WHITE  = [255, 255, 255];
const LGRAY  = [245, 247, 250];
const TEXT   = [34,  34,  34];
const SGRAY  = [100, 110, 130];
const BORD   = [220, 225, 235];
const GOLD2  = [180, 140, 30];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const sf = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const ss = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);
const st = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);

const fmt = d => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return String(d); }
};

const trunc = (s, n) => s && s.length > n ? s.slice(0, n - 1) + '…' : (s || '—');

/** Load any URL → base64 JPEG/PNG. Returns null on failure. */
const loadImg = url => new Promise(resolve => {
  if (!url) return resolve(null);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const cv = document.createElement('canvas');
      cv.width  = img.naturalWidth  || 400;
      cv.height = img.naturalHeight || 400;
      cv.getContext('2d').drawImage(img, 0, 0);
      resolve(cv.toDataURL('image/jpeg', 0.82));
    } catch { resolve(null); }
  };
  img.onerror = () => resolve(null);
  img.src = url;
  setTimeout(() => resolve(null), 8000);
});

/** Split text into wrapped lines */
const wrap = (doc, text, maxW) =>
  text ? doc.splitTextToSize(String(text), maxW) : [];

// ─── WATERMARK ───────────────────────────────────────────────────────────────
const drawWatermark = (doc, logo) => {
  if (!logo) return;
  const sz = 95;
  const x  = (PW - sz) / 2;
  const y  = (PH - sz) / 2;
  // Draw semi-transparent white rect first to simulate low opacity logo
  sf(doc, WHITE); doc.rect(0, 0, PW, PH, 'F'); // ensure white bg
  // Draw logo at very light opacity using canvas trick
  try {
    // Create faded version via canvas
    const cv  = document.createElement('canvas');
    cv.width  = 400; cv.height = 400;
    const ctx = cv.getContext('2d');
    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    // Draw logo at low opacity
    const tmpImg = new Image();
    tmpImg.src = logo;
    ctx.globalAlpha = 0.07;
    ctx.drawImage(tmpImg, 0, 0, 400, 400);
    ctx.globalAlpha = 1;
    const faded = cv.toDataURL('image/png');
    doc.addImage(faded, 'PNG', x, y, sz, sz);
  } catch {
    // fallback: draw logo directly with small size
    try { doc.addImage(logo, 'JPEG', x, y, sz, sz); } catch {}
  }
};

// ─── HEADER ──────────────────────────────────────────────────────────────────
const drawHeader = (doc, logo, pg, total) => {
  // Navy bg
  sf(doc, NAVY); doc.rect(0, 0, PW, HDR_H, 'F');
  // Gold bottom border
  sf(doc, GOLD); doc.rect(0, HDR_H - 1.5, PW, 1.5, 'F');

  // Logo
  if (logo) {
    try { doc.addImage(logo, 'JPEG', ML, (HDR_H - 18) / 2, 18, 18); } catch {}
  }

  const tx = logo ? ML + 22 : ML;

  // Institute name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  st(doc, WHITE);
  doc.text('KEERTI COMPUTER INSTITUTE', tx, 10);

  // Badges row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  st(doc, GOLD);
  doc.text('★ Government Recognized   ★ ISO Certified   ★ Est. 2005', tx, 15.5);

  // Tagline
  doc.setFontSize(6.5);
  st(doc, [160, 185, 225]);
  doc.text('Excellence in Computer Education', tx, 20.5);

  // Right side
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  st(doc, [170, 195, 235]);
  doc.text('www.keertiedu.in', PW - ML, 10, { align: 'right' });
  doc.text('📞 9936384736 / 9919660880', PW - ML, 15.5, { align: 'right' });

  // Page number right
  doc.setFontSize(7);
  st(doc, [140, 165, 215]);
  if (total) doc.text(`Page ${pg} of ${total}`, PW - ML, 20.5, { align: 'right' });
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const drawFooter = (doc, pg, total) => {
  // Gold top border
  sf(doc, GOLD); doc.rect(0, FTR_Y, PW, 1, 'F');
  // Navy bg
  sf(doc, NAVY); doc.rect(0, FTR_Y + 1, PW, FTR_H - 1, 'F');

  const y1 = FTR_Y + 7;
  const y2 = FTR_Y + 13;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  st(doc, WHITE);
  doc.text('KEERTI COMPUTER INSTITUTE', ML, y1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  st(doc, [160, 185, 225]);
  doc.text('Near Babuganj Chauraha, Lucknow, Uttar Pradesh', ML, y2);

  doc.setFontSize(6.5);
  st(doc, [160, 185, 225]);
  doc.text('www.keertiedu.in  |  info@keertiedu.in', PW / 2, y1, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, PW / 2, y2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  st(doc, GOLD);
  doc.text(`Page ${pg} of ${total}`, PW - ML, y1, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  st(doc, [160, 185, 225]);
  doc.text('9936384736', PW - ML, y2, { align: 'right' });
};

// ─── PAGE MANAGER ────────────────────────────────────────────────────────────
class PM {
  constructor(doc, logo) {
    this.doc    = doc;
    this.logo   = logo;
    this.pg     = 1;
    this.cursor = CT;
  }
  async newPage() {
    this.doc.addPage();
    this.pg++;
    drawWatermark(this.doc, this.logo);
    drawHeader(this.doc, this.logo, this.pg, '?');
    drawFooter(this.doc, this.pg, '?');
    this.cursor = CT;
  }
  async need(h) {
    if (this.cursor + h > CB) await this.newPage();
  }
  go(h) { this.cursor += h; }
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────
const sectionLabel = (doc, pm, text) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  st(doc, NAVY);
  doc.text(text, ML, pm.cursor);
  // Gold underline
  ss(doc, GOLD); doc.setLineWidth(0.7);
  doc.line(ML, pm.cursor + 1.8, ML + doc.getTextWidth(text) + 4, pm.cursor + 1.8);
  pm.go(8);
};

const divider = (doc, pm) => {
  ss(doc, BORD); doc.setLineWidth(0.25);
  doc.line(ML, pm.cursor, ML + CW, pm.cursor);
  pm.go(5);
};

// ─── TITLE BANNER ────────────────────────────────────────────────────────────
const drawTitleBanner = async (doc, pm, material) => {
  await pm.need(26);
  const bh = 24;

  // Card bg
  sf(doc, LGRAY); ss(doc, BORD); doc.setLineWidth(0.3);
  doc.roundedRect(ML, pm.cursor, CW, bh, 3, 3, 'FD');

  // Gold left stripe
  sf(doc, GOLD);
  doc.roundedRect(ML, pm.cursor, 4, bh, 1.5, 1.5, 'F');

  // Category pill
  const cat = (material.category || 'notes').replace('_', ' ').toUpperCase();
  sf(doc, NAVY);
  doc.roundedRect(ML + 9, pm.cursor + 3.5, 30, 6, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
  st(doc, GOLD);
  doc.text(cat, ML + 24, pm.cursor + 7.5, { align: 'center' });

  // Title text
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  st(doc, NAVY);
  const titleLines = wrap(doc, material.title || 'Study Material', CW - 50);
  doc.text(titleLines[0] || '', ML + 9, pm.cursor + 17);

  pm.go(bh + 7);
};

// ─── INFO CARD ────────────────────────────────────────────────────────────────
const drawInfoCard = (doc, pm, material) => {
  const rows = [
    ['Title',        material.title || '—'],
    ['Category',     (material.category || '—').replace('_', ' ')],
    ['Course',       material.course?.title || material.courseName || '—'],
    ['Instructor',   material.uploadedBy?.name || 'KCI Faculty'],
    ['Upload Date',  fmt(material.createdAt)],
    ['Status',       material.isActive ? 'Active' : 'Inactive'],
  ];

  const rowH  = 7.5;
  const cardH = 10 + rows.length * rowH + 5;

  // Outer card
  sf(doc, LGRAY); ss(doc, BORD); doc.setLineWidth(0.3);
  doc.roundedRect(ML, pm.cursor, CW, cardH, 3, 3, 'FD');

  // Gold left accent
  sf(doc, GOLD);
  doc.roundedRect(ML, pm.cursor, 4, cardH, 1.5, 1.5, 'F');

  // Section title bar
  sf(doc, NAVY);
  doc.roundedRect(ML + 4, pm.cursor, CW - 4, 9, 0, 0, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  st(doc, GOLD);
  doc.text('📋  MATERIAL INFORMATION', ML + 8, pm.cursor + 6);

  let ry = pm.cursor + 14;
  rows.forEach(([label, value], idx) => {
    // Alternate row bg
    if (idx % 2 === 0) {
      sf(doc, [238, 241, 250]);
      doc.rect(ML + 4, ry - 5, CW - 4, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); st(doc, SGRAY);
    doc.text(label, ML + 8, ry);
    doc.setFont('helvetica', 'normal'); st(doc, TEXT);
    doc.text(trunc(String(value), 60), ML + 48, ry);
    ry += rowH;
  });

  pm.go(cardH + 8);
};

// ─── FEATURED IMAGE ──────────────────────────────────────────────────────────
const drawFeaturedImage = async (doc, pm, imgB64) => {
  await pm.need(50);

  if (!imgB64) {
    // Elegant placeholder
    sf(doc, LGRAY); ss(doc, BORD); doc.setLineWidth(0.4);
    doc.roundedRect(ML, pm.cursor, CW, 42, 3, 3, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    st(doc, [180, 190, 210]);
    doc.text('[ No Preview Image Available ]', PW / 2, pm.cursor + 23, { align: 'center' });
    pm.go(42 + 8);
    return;
  }

  // Compute display dimensions
  let dW = CW, dH = 75;
  try {
    const tmpI = new Image(); tmpI.src = imgB64;
    await new Promise(r => { tmpI.onload = r; tmpI.onerror = r; });
    const ratio = (tmpI.naturalWidth || 4) / (tmpI.naturalHeight || 3);
    if (ratio > CW / 75)  { dW = CW;          dH = CW / ratio; }
    else                   { dH = Math.min(75, tmpI.naturalHeight || 75); dW = dH * ratio; }
  } catch {}

  await pm.need(dH + 12);

  // Shadow
  sf(doc, [205, 210, 222]);
  doc.roundedRect(ML + 1.5, pm.cursor + 1.5, dW, dH, 3, 3, 'F');

  // Image
  try { doc.addImage(imgB64, 'JPEG', ML, pm.cursor, dW, dH); } catch {}

  // Border
  ss(doc, BORD); doc.setLineWidth(0.4);
  doc.roundedRect(ML, pm.cursor, dW, dH, 3, 3, 'S');

  pm.go(dH + 10);
};

// ─── DESCRIPTION ─────────────────────────────────────────────────────────────
const drawDescription = async (doc, pm, description) => {
  if (!description) return;

  await pm.need(18);
  sectionLabel(doc, pm, '📝  DESCRIPTION');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setLineHeightFactor(1.55);
  st(doc, TEXT);

  const lines = wrap(doc, description, CW - 4);
  const lh    = 5.8;

  for (const line of lines) {
    await pm.need(lh + 2);
    doc.text(line, ML + 2, pm.cursor);
    pm.go(lh);
  }

  doc.setLineHeightFactor(1.15);
  pm.go(7);
};

// ─── INFO TABLE ──────────────────────────────────────────────────────────────
const drawInfoTable = (doc, pm, material, totalPgs) => {
  const rows = [
    ['PDF Name',      (material.title || 'Study Material') + '.pdf'],
    ['Category',      (material.category || '—').replace('_', ' ')],
    ['Upload Date',   fmt(material.createdAt)],
    ['Last Updated',  fmt(material.updatedAt || material.createdAt)],
    ['Total Pages',   String(totalPgs)],
    ['File Version',  'v1.0'],
    ['Institute',     'Keerti Computer Institute'],
  ];

  const rowH = 7.5;
  const tH   = rows.length * rowH;

  sectionLabel(doc, pm, '📄  DOWNLOAD INFORMATION');

  // Table header
  sf(doc, NAVY); doc.rect(ML, pm.cursor, CW, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); st(doc, WHITE);
  doc.text('FIELD', ML + 5,        pm.cursor + 5.5);
  doc.text('VALUE', ML + CW / 2,   pm.cursor + 5.5);
  pm.go(8);

  rows.forEach(([label, value], idx) => {
    sf(doc, idx % 2 === 0 ? WHITE : LGRAY);
    doc.rect(ML, pm.cursor, CW, rowH, 'F');
    ss(doc, BORD); doc.setLineWidth(0.2);
    doc.line(ML, pm.cursor + rowH, ML + CW, pm.cursor + rowH);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); st(doc, SGRAY);
    doc.text(label, ML + 5, pm.cursor + 5);
    doc.setFont('helvetica', 'normal'); st(doc, TEXT);
    doc.text(trunc(String(value), 65), ML + CW / 2, pm.cursor + 5);
    pm.go(rowH);
  });

  // Outer border
  ss(doc, BORD); doc.setLineWidth(0.4);
  doc.rect(ML, pm.cursor - tH, CW, tH, 'S');

  pm.go(10);
};

// ─── QR CODE ─────────────────────────────────────────────────────────────────
const drawQR = async (doc, pm, url) => {
  if (!url) return;
  try {
    const qr  = await QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: '#0B1F5B', light: '#FFFFFF' } });
    const sz  = 30;
    const qx  = PW - ML - sz;
    const qy  = pm.cursor;

    // White card
    sf(doc, WHITE); ss(doc, BORD); doc.setLineWidth(0.4);
    doc.roundedRect(qx - 3, qy - 3, sz + 6, sz + 13, 2, 2, 'FD');

    doc.addImage(qr, 'PNG', qx, qy, sz, sz);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); st(doc, SGRAY);
    doc.text('Scan to Access', qx + sz / 2, qy + sz + 6, { align: 'center' });
    doc.text('Material', qx + sz / 2, qy + sz + 10, { align: 'center' });
  } catch {}
};

// ─── UPDATE ALL PAGES ────────────────────────────────────────────────────────
const finalizePages = (doc, logo, total) => {
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    drawHeader(doc, logo, i, total);
    drawFooter(doc, i, total);
  }
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
/**
 * Generate premium A4 portrait PDF for a KCI study material.
 * @param {Object} material - study material document from API
 */
export const generateStudyMaterialPDF = async (material) => {
  // ── 1. Init doc ────────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // ── 2. Load assets concurrently ────────────────────────────────────────────
  const [logo, matImg] = await Promise.all([
    loadImg('/logo.png'),
    loadImg(material.thumbnailUrl || material.imageUrl || null),
  ]);

  // ── 3. Page 1 setup ────────────────────────────────────────────────────────
  // White background
  sf(doc, WHITE); doc.rect(0, 0, PW, PH, 'F');
  drawWatermark(doc, logo);
  drawHeader(doc, logo, 1, '?');
  drawFooter(doc, 1, '?');

  const pm = new PM(doc, logo);

  // ── 4. Title Banner ────────────────────────────────────────────────────────
  await drawTitleBanner(doc, pm, material);

  // ── 5. Info Card ───────────────────────────────────────────────────────────
  await pm.need(70);
  drawInfoCard(doc, pm, material);
  divider(doc, pm);

  // ── 6. Featured Image ──────────────────────────────────────────────────────
  await pm.need(50);
  sectionLabel(doc, pm, '🖼️  PREVIEW IMAGE');
  await drawFeaturedImage(doc, pm, matImg);
  divider(doc, pm);

  // ── 7. Description ─────────────────────────────────────────────────────────
  if (material.description) {
    await drawDescription(doc, pm, material.description);
    divider(doc, pm);
  }

  // ── 8. Info Table ──────────────────────────────────────────────────────────
  await pm.need(85);
  drawInfoTable(doc, pm, material, doc.getNumberOfPages());
  divider(doc, pm);

  // ── 9. QR Code ─────────────────────────────────────────────────────────────
  await pm.need(55);
  sectionLabel(doc, pm, '🔗  QUICK ACCESS');
  await drawQR(doc, pm, `${window.location.origin}/study-material`);

  // QR description text (left of QR)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); st(doc, SGRAY);
  doc.text('Scan the QR code to access this', ML, pm.cursor + 8);
  doc.text('study material online.', ML, pm.cursor + 14);
  doc.setFont('helvetica', 'bold'); st(doc, NAVY);
  doc.text('www.keertiedu.in', ML, pm.cursor + 21);
  pm.go(46);

  // ── 10. Final disclaimer strip ─────────────────────────────────────────────
  await pm.need(18);
  sf(doc, LGRAY); ss(doc, BORD); doc.setLineWidth(0.3);
  doc.roundedRect(ML, pm.cursor, CW, 14, 2, 2, 'FD');
  sf(doc, GOLD);
  doc.roundedRect(ML, pm.cursor, 3.5, 14, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); st(doc, SGRAY);
  doc.text(
    'This document is issued by Keerti Computer Institute for educational purposes only.',
    ML + 8, pm.cursor + 6
  );
  doc.text(
    'Unauthorized reproduction or distribution is strictly prohibited. © KCI 2025',
    ML + 8, pm.cursor + 11
  );

  // ── 11. Finalize: write correct page numbers on all pages ──────────────────
  finalizePages(doc, logo, doc.getNumberOfPages());

  // ── 12. Save ───────────────────────────────────────────────────────────────
  const safe = (material.title || 'StudyMaterial').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 40);
  doc.save(`KCI_${safe}.pdf`);
};
