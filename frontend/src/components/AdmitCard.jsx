import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ── mm to px at 96dpi (1mm = 3.7795px) ──
const mm = v => v * 3.7795;

// A4 portrait: 210mm × 297mm → 793.7 × 1122.5px at 96dpi
// We render at 794 × 1123 px
const W_PX = 794;
const H_PX = 1123;

async function circularLogo() {
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.crossOrigin = 'anonymous';
      i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
    });
    const sz = 400;
    const cv = document.createElement('canvas'); cv.width = sz; cv.height = sz;
    const cx = cv.getContext('2d');
    cx.beginPath(); cx.arc(sz/2,sz/2,sz/2,0,Math.PI*2); cx.closePath(); cx.clip();
    cx.drawImage(img, 0, 0, sz, sz);
    return cv.toDataURL('image/png');
  } catch { return null; }
}

export async function downloadAdmitCardPDF(student, admitCard, branch) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 8;

  const logo = await circularLogo();

  // ── OUTER BORDER 3px gold ──
  doc.setDrawColor(180, 140, 20); doc.setLineWidth(1.2);
  doc.roundedRect(M, M, W-M*2, H-M*2, 5, 5, 'S');
  doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.4);
  doc.roundedRect(M+1.5, M+1.5, W-M*2-3, H-M*2-3, 4.5, 4.5, 'S');

  // ══ HEADER (38mm) ══
  doc.setFillColor(8, 29, 91);
  doc.roundedRect(M, M, W-M*2, 38, 5, 5, 'F');
  doc.setFillColor(8, 29, 91);
  doc.rect(M, M+33, W-M*2, 5, 'F');
  // gold accent line bottom of header
  doc.setFillColor(212, 175, 55);
  doc.rect(M, M+38, W-M*2, 1.2, 'F');

  // Logo 24×24 circle
  if (logo) doc.addImage(logo, 'PNG', M+5, M+7, 24, 24);

  // Institute name center
  doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('KEERTI COMPUTER INSTITUTE', W/2, M+14, { align:'center' });
  doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(180,210,255);
  doc.text('Government Recognized  |  ISO Certified  |  NIELIT Affiliated', W/2, M+20, { align:'center' });
  doc.setTextColor(160,200,255);
  doc.text('Ayodhya, Uttar Pradesh  |  www.kci.org.in  |  9936384736', W/2, M+26, { align:'center' });

  // Badge top-right: EXAMINATION ADMIT CARD
  doc.setFillColor(212, 175, 55);
  doc.roundedRect(W-M-50, M+4, 48, 28, 3, 3, 'F');
  doc.setTextColor(8, 29, 91); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.text('EXAMINATION', W-M-26, M+14, { align:'center' });
  doc.text('ADMIT CARD', W-M-26, M+21, { align:'center' });
  doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(20,40,100);
  doc.text(new Date().getFullYear().toString(), W-M-26, M+28, { align:'center' });

  // ══ TOP INFO ROW (22mm) — 3 equal columns ══
  const rowY = M + 38 + 2;
  const colW = (W - M*2) / 3;
  const cols = [
    ['ROLL NUMBER', student?.rollNumber || admitCard?.rollNumber || '-'],
    ['SERIAL NUMBER', admitCard?.serialNumber || admitCard?.formNo || student?.formNo || '-'],
    ['SESSION', admitCard?.session || student?.batch || '-'],
  ];
  cols.forEach(([lbl, val], i) => {
    const x = M + i * colW;
    const cx = x + colW / 2;
    doc.setFillColor(i%2===0 ? 245 : 240, i%2===0 ? 248 : 245, 255);
    doc.rect(x, rowY, colW, 20, 'F');
    doc.setDrawColor(210,218,240); doc.setLineWidth(0.3);
    doc.rect(x, rowY, colW, 20, 'S');
    doc.setTextColor(80,100,160); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text(lbl, cx, rowY+7, { align:'center' });
    doc.setTextColor(8,29,91); doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text(String(val), cx, rowY+15, { align:'center' });
  });

  // ══ BODY — left 70% / right 30% ══
  const bodyY = rowY + 22;
  const bodyH = 145;
  const leftW = (W-M*2) * 0.70;
  const rightW = (W-M*2) * 0.30;
  const leftX = M;
  const rightX = M + leftW;

  // body bg
  doc.setFillColor(250, 251, 255);
  doc.rect(leftX, bodyY, W-M*2, bodyH, 'F');
  doc.setDrawColor(210,218,240); doc.setLineWidth(0.3);
  doc.rect(leftX, bodyY, W-M*2, bodyH, 'S');

  // watermark
  if (logo) doc.addImage(logo, 'PNG', W/2-30, bodyY+bodyH/2-30, 60, 60, '', 'NONE', 0, 0.05);

  // divider between left/right
  doc.setDrawColor(200,210,235); doc.setLineWidth(0.3);
  doc.line(rightX, bodyY+3, rightX, bodyY+bodyH-3);

  // ── LEFT FIELDS ──
  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-';
  const fields = [
    ['Candidate Name',  student?.name || '-'],
    ['Enrollment No',   student?.enrollmentNumber || '-'],
    ['Course',          student?.courseName || admitCard?.courseName || '-'],
    ["Father's Name",   student?.fatherName || '-'],
    ["Mother's Name",   student?.motherName || '-'],
    ['Date Of Birth',   dob],
    ['Gender',          student?.gender || '-'],
    ['Category',        student?.category || 'General'],
    ['Batch',           student?.batch || '-'],
    ['Exam Type',       admitCard?.examType || 'Theory'],
    ['Exam Center',     admitCard?.examCenter || branch?.branchName || '-'],
    ['Address',         student?.address || '-'],
  ];
  const fieldH = 10, fieldGap = 3;
  const totalFieldH = fields.length * fieldH + (fields.length - 1) * fieldGap;
  let fy = bodyY + (bodyH - totalFieldH) / 2;

  fields.forEach(([lbl, val], i) => {
    const isLast = i === fields.length - 1;
    // row bg alternating
    doc.setFillColor(i%2===0 ? 248 : 243, i%2===0 ? 250 : 247, 255);
    doc.rect(leftX+2, fy, leftW-4, fieldH, 'F');
    // label
    doc.setTextColor(80,100,160); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text(lbl, leftX+5, fy+4, {});
    doc.text(':', leftX+40, fy+4);
    // value — address wraps to 2 lines
    doc.setTextColor(10,20,60); doc.setFontSize(8); doc.setFont('helvetica','bold');
    if (lbl === 'Address') {
      const lines = doc.splitTextToSize(String(val), leftW - 55);
      doc.text(lines.slice(0,2), leftX+43, fy+4);
    } else {
      doc.text(String(val), leftX+43, fy+4, { maxWidth: leftW-48 });
    }
    if (!isLast) {
      doc.setDrawColor(220,226,245); doc.setLineWidth(0.2);
      doc.line(leftX+2, fy+fieldH, leftX+leftW-2, fy+fieldH);
    }
    fy += fieldH + fieldGap;
  });

  // ── RIGHT SECTION: Photo + QR ──
  const photoX = rightX + (rightW - 45) / 2;
  const photoY = bodyY + 8;
  // Photo box 45×55mm
  doc.setFillColor(220, 232, 248);
  doc.setDrawColor(212, 175, 55); doc.setLineWidth(0.8);
  doc.roundedRect(photoX, photoY, 45, 55, 3, 3, 'FD');
  if (student?.photo) {
    doc.addImage(student.photo, 'JPEG', photoX+1, photoY+1, 43, 53);
  } else {
    doc.setTextColor(150,170,210); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text('PHOTO', photoX+22.5, photoY+30, { align:'center' });
  }

  // QR code 42×42mm
  const qrX = rightX + (rightW - 42) / 2;
  const qrY = photoY + 55 + 8;
  try {
    const qrData = JSON.stringify({
      name: student?.name, roll: student?.rollNumber,
      course: student?.courseName, center: admitCard?.examCenter,
    });
    const qrUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 1, color: { dark:'#081d5b', light:'#ffffff' } });
    doc.setDrawColor(212,175,55); doc.setLineWidth(0.6);
    doc.roundedRect(qrX, qrY, 42, 42, 2, 2, 'S');
    doc.addImage(qrUrl, 'PNG', qrX+1, qrY+1, 40, 40);
  } catch {}
  doc.setTextColor(100,120,180); doc.setFontSize(6); doc.setFont('helvetica','normal');
  doc.text('Scan to Verify', rightX + rightW/2, qrY+44, { align:'center' });

  // ══ EXAM & ACADEMIC DETAILS (28mm) ══
  const examY = bodyY + bodyH + 2;
  doc.setFillColor(8, 29, 91);
  doc.rect(M, examY, W-M*2, 5, 'F');
  doc.setTextColor(212,175,55); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.text('EXAMINATION DETAILS', W/2, examY+3.5, { align:'center' });

  const examColW = (W-M*2) / 4;
  const examDetails = [
    ['Exam Date',      admitCard?.examDate ? new Date(admitCard.examDate).toLocaleDateString('en-IN') : '-'],
    ['Exam Center',    admitCard?.examCenter || branch?.branchName || '-'],
    ['Reporting Time', admitCard?.reportingTime || '9:00 AM'],
    ['Exam Type',      admitCard?.examType || 'Theory'],
  ];
  examDetails.forEach(([lbl, val], i) => {
    const ex = M + i * examColW;
    const ecx = ex + examColW/2;
    doc.setFillColor(245,248,255);
    doc.rect(ex, examY+5, examColW, 23, 'F');
    if (i > 0) { doc.setDrawColor(210,218,240); doc.setLineWidth(0.3); doc.line(ex, examY+5, ex, examY+28); }
    doc.setTextColor(80,100,160); doc.setFontSize(6.5); doc.setFont('helvetica','bold');
    doc.text(lbl, ecx, examY+11, { align:'center' });
    doc.setTextColor(8,29,91); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text(String(val), ecx, examY+21, { align:'center', maxWidth: examColW-4 });
  });

  // ══ IMPORTANT INSTRUCTIONS (38mm) ══
  const instrY = examY + 28 + 2;
  doc.setDrawColor(234, 179, 8); doc.setLineWidth(0.8);
  doc.rect(M, instrY, W-M*2, 38, 'S');
  doc.setFillColor(255, 251, 235);
  doc.rect(M+0.4, instrY+0.4, W-M*2-0.8, 37.2, 'F');

  doc.setFillColor(234,179,8);
  doc.rect(M, instrY, W-M*2, 6, 'F');
  doc.setTextColor(80,50,0); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.text('IMPORTANT INSTRUCTIONS', W/2, instrY+4.2, { align:'center' });

  const instructions = [
    '1. Candidate must carry this Admit Card and a valid Photo ID proof to the examination center.',
    '2. Report at least 30 minutes before the scheduled exam time.',
    '3. Mobile phones, calculators and electronic devices are strictly prohibited.',
    '4. This card is non-transferable. Impersonation is a punishable offence.',
    '5. Candidates without this admit card will not be permitted to appear in the examination.',
  ];
  doc.setTextColor(60,40,0); doc.setFontSize(7); doc.setFont('helvetica','normal');
  instructions.forEach((line, i) => {
    doc.text(line, M+3, instrY+10+i*5.5, { maxWidth: W-M*2-50 });
  });

  // Director signature area (right side of instructions)
  const sigX = W - M - 47;
  doc.setDrawColor(180,140,20); doc.setLineWidth(0.3);
  doc.rect(sigX, instrY+8, 45, 20, 'S');
  if (logo) doc.addImage(logo, 'PNG', sigX+17, instrY+8, 12, 12);
  doc.setDrawColor(100,100,100); doc.setLineWidth(0.3);
  doc.line(sigX+3, instrY+28, sigX+42, instrY+28);
  doc.setTextColor(60,80,140); doc.setFontSize(6.5); doc.setFont('helvetica','bold');
  doc.text('Director / Principal Signature', sigX+22.5, instrY+33, { align:'center' });

  // ══ FOOTER (18mm) ══
  const footY = instrY + 38 + 1;
  doc.setFillColor(8, 29, 91);
  doc.roundedRect(M, footY, W-M*2, 18, 0, 0, 'F');
  doc.roundedRect(M, footY+16, W-M*2, 2, 0, 0, 'F');
  // bottom border radii fix
  doc.setFillColor(8,29,91);
  doc.roundedRect(M, footY, W-M*2, 18, 3, 3, 'F');
  doc.setFillColor(212,175,55);
  doc.roundedRect(M, footY, W-M*2, 1.2, 0,0,'F');

  // Left: Issue Date
  doc.setTextColor(160,200,255); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
  doc.text('Issue Date:', M+4, footY+7);
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text(admitCard?.issueDate ? new Date(admitCard.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), M+4, footY+13);

  // Center: website + seal
  if (logo) doc.addImage(logo, 'PNG', W/2-5, footY+2, 10, 10);
  doc.setTextColor(212,175,55); doc.setFontSize(6.5); doc.setFont('helvetica','bold');
  doc.text('www.kci.org.in', W/2, footY+15, { align:'center' });

  // Right: Serial Number
  doc.setTextColor(160,200,255); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
  doc.text('Serial No:', W-M-40, footY+7);
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text(admitCard?.serialNumber || admitCard?.formNo || student?.formNo || '-', W-M-40, footY+13);

  doc.save(`AdmitCard_${student?.rollNumber || 'KCI'}.pdf`);
  toast.success('Admit Card downloaded!');
}

export default function AdmitCard({ student, admitCard, branch }) {
  const cardRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(JSON.stringify({
      name: student?.name, roll: student?.rollNumber,
      course: student?.courseName, center: admitCard?.examCenter,
    }), { width: 168, margin: 1, color: { dark:'#081d5b', light:'#ffffff' } })
      .then(setQrUrl).catch(() => {});
  }, [student, admitCard]);

  const handleDownload = async () => {
    setExporting(true);
    try { await downloadAdmitCardPDF(student, admitCard, branch); }
    catch { toast.error('Download failed'); }
    setExporting(false);
  };

  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-';
  const examDateFmt = admitCard?.examDate ? new Date(admitCard.examDate).toLocaleDateString('en-IN') : '-';
  const issueDateFmt = admitCard?.issueDate ? new Date(admitCard.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  const leftFields = [
    ['Candidate Name',  student?.name],
    ['Enrollment No',   student?.enrollmentNumber],
    ['Course',          student?.courseName || admitCard?.courseName],
    ["Father's Name",   student?.fatherName],
    ["Mother's Name",   student?.motherName],
    ['Date Of Birth',   dob],
    ['Gender',          student?.gender],
    ['Category',        student?.category || 'General'],
    ['Batch',           student?.batch],
    ['Exam Type',       admitCard?.examType || 'Theory'],
    ['Exam Center',     admitCard?.examCenter || branch?.branchName],
    ['Address',         student?.address],
  ];

  const examDetails = [
    ['Exam Date',      examDateFmt],
    ['Exam Center',    admitCard?.examCenter || branch?.branchName || '-'],
    ['Reporting Time', admitCard?.reportingTime || '9:00 AM'],
    ['Exam Type',      admitCard?.examType || 'Theory'],
  ];

  // Rendered at 794px wide (A4 @96dpi)
  const S = W_PX / 210; // scale factor: px per mm

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <button onClick={handleDownload} disabled={exporting}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px',
          background:'linear-gradient(135deg,#081d5b,#1a3a8f)', color:'#fff',
          border:'none', borderRadius:12, fontSize:14, fontWeight:900,
          cursor: exporting?'not-allowed':'pointer', opacity: exporting?0.6:1,
          boxShadow:'0 4px 14px rgba(8,29,91,0.4)' }}>
        <Download size={16}/> {exporting ? 'Generating PDF...' : 'Download Admit Card PDF'}
      </button>

      {/* ── A4 PREVIEW ── */}
      <div style={{ width:'100%', overflowX:'auto', display:'flex', justifyContent:'center' }}>
        <div ref={cardRef} style={{
          width: W_PX, minHeight: H_PX,
          fontFamily:"'Inter','Segoe UI',Poppins,sans-serif",
          background:'#f8f9fc',
          border:`3px solid #d4af37`,
          borderRadius: 18,
          boxSizing:'border-box',
          position:'relative',
          overflow:'hidden',
          transform:'scale(0.75)', transformOrigin:'top center',
          marginBottom: -H_PX*0.25,
        }}>

          {/* ── HEADER ── */}
          <div style={{ background:'#081d5b', height: mm(38), display:'flex', alignItems:'center',
            padding:`0 ${mm(5)}px`, gap: mm(4), borderBottom:`${mm(1.2)}px solid #d4af37`, flexShrink:0 }}>
            {/* Logo */}
            <div style={{ width:mm(24), height:mm(24), borderRadius:'50%', background:'#fff',
              border:'2px solid #d4af37', overflow:'hidden', flexShrink:0, display:'flex',
              alignItems:'center', justifyContent:'center' }}>
              <img src="/logo.png" alt="KCI" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            </div>
            {/* Center */}
            <div style={{ flex:1, textAlign:'center' }}>
              <div style={{ color:'#fff', fontWeight:900, fontSize:22, letterSpacing:1, lineHeight:1.2 }}>
                KEERTI COMPUTER INSTITUTE
              </div>
              <div style={{ color:'#b4c8f0', fontSize:11, marginTop:4 }}>
                Government Recognized &nbsp;|&nbsp; ISO Certified &nbsp;|&nbsp; NIELIT Affiliated
              </div>
              <div style={{ color:'#93b4e8', fontSize:10, marginTop:2 }}>
                Ayodhya, Uttar Pradesh &nbsp;|&nbsp; www.kci.org.in &nbsp;|&nbsp; 9936384736
              </div>
            </div>
            {/* Badge */}
            <div style={{ background:'#d4af37', borderRadius:10, padding:`${mm(4)}px ${mm(5)}px`,
              flexShrink:0, textAlign:'center', minWidth: mm(48) }}>
              <div style={{ color:'#081d5b', fontWeight:900, fontSize:13, lineHeight:1.4 }}>EXAMINATION</div>
              <div style={{ color:'#081d5b', fontWeight:900, fontSize:13, lineHeight:1.4 }}>ADMIT CARD</div>
              <div style={{ color:'#2a4080', fontSize:10, fontWeight:700 }}>{new Date().getFullYear()}</div>
            </div>
          </div>

          {/* ── TOP INFO ROW (3 cols) ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', height: mm(22),
            borderBottom:'1px solid #d0d8f0' }}>
            {[
              ['ROLL NUMBER', student?.rollNumber || admitCard?.rollNumber || '-'],
              ['SERIAL NUMBER', admitCard?.serialNumber || student?.formNo || '-'],
              ['SESSION', admitCard?.session || student?.batch || '-'],
            ].map(([lbl, val], i) => (
              <div key={lbl} style={{ background: i%2===0?'#f5f8ff':'#f0f5ff',
                borderRight: i<2?'1px solid #d0d8f0':'none',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
                <div style={{ color:'#5064a0', fontSize:10, fontWeight:700, letterSpacing:1 }}>{lbl}</div>
                <div style={{ color:'#081d5b', fontSize:18, fontWeight:900, fontFamily:'monospace' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* ── BODY ── */}
          <div style={{ display:'flex', height: mm(145), position:'relative', background:'#fafbff',
            borderBottom:'1px solid #d0d8f0' }}>
            {/* Watermark */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
              width: mm(120), height: mm(120), opacity:0.05, pointerEvents:'none', zIndex:0 }}>
              <img src="/logo.png" alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
            </div>

            {/* LEFT 70% */}
            <div style={{ flex:'0 0 70%', padding:`${mm(4)}px ${mm(5)}px`, zIndex:1,
              display:'grid', gridTemplateRows:`repeat(${leftFields.length}, 1fr)` }}>
              {leftFields.map(([lbl, val], i) => (
                <div key={lbl} style={{ display:'flex', alignItems:'center',
                  background: i%2===0?'rgba(245,248,255,0.8)':'rgba(240,245,255,0.6)',
                  borderBottom: i<leftFields.length-1?'1px solid #e0e8f5':'none',
                  padding:`0 ${mm(2)}px` }}>
                  <span style={{ color:'#5064a0', fontWeight:700, fontSize:11,
                    minWidth: mm(38), flexShrink:0 }}>{lbl}</span>
                  <span style={{ color:'#5064a0', fontWeight:700, fontSize:11, marginRight: mm(2) }}>:</span>
                  <span style={{ color:'#0a1440', fontWeight:700, fontSize:12, flex:1,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace: lbl==='Address'?'normal':'nowrap',
                    display: lbl==='Address'?'-webkit-box':'block',
                    WebkitLineClamp: lbl==='Address'?2:1, WebkitBoxOrient:'vertical' }}>
                    {val || '-'}
                  </span>
                </div>
              ))}
            </div>

            {/* RIGHT 30% */}
            <div style={{ flex:'0 0 30%', borderLeft:'1px solid #d0d8f0',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap: mm(8), padding: mm(4), zIndex:1 }}>
              {/* Photo 45×55mm */}
              <div style={{ width: mm(45), height: mm(55), border:'2px solid #d4af37',
                borderRadius: mm(6), overflow:'hidden', background:'#dce7f8',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {student?.photo
                  ? <img src={student.photo} alt="photo" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <User size={28} color="#8aaad8"/>
                      <span style={{ color:'#8aaad8', fontSize:10, fontWeight:700 }}>PHOTO</span>
                    </div>
                }
              </div>
              {/* QR 42×42mm */}
              <div style={{ width: mm(42), height: mm(42), border:'2px solid #d4af37',
                borderRadius: mm(4), background:'#fff', display:'flex',
                alignItems:'center', justifyContent:'center', flexShrink:0, padding:4 }}>
                {qrUrl
                  ? <img src={qrUrl} alt="QR" style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
                  : <span style={{ color:'#8aaad8', fontSize:10 }}>QR...</span>
                }
              </div>
              <span style={{ color:'#6080c0', fontSize:10, fontWeight:600, textAlign:'center' }}>
                Scan to Verify
              </span>
            </div>
          </div>

          {/* ── EXAM DETAILS (28mm, 4 cols) ── */}
          <div style={{ borderBottom:'1px solid #d0d8f0' }}>
            <div style={{ background:'#081d5b', padding:`${mm(1.5)}px 0`, textAlign:'center' }}>
              <span style={{ color:'#d4af37', fontSize:11, fontWeight:900, letterSpacing:1 }}>
                EXAMINATION DETAILS
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', height: mm(23) }}>
              {examDetails.map(([lbl, val], i) => (
                <div key={lbl} style={{ borderRight: i<3?'1px solid #d0d8f0':'none',
                  background: i%2===0?'#f5f8ff':'#f0f5ff',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3 }}>
                  <div style={{ color:'#5064a0', fontSize:10, fontWeight:700, letterSpacing:0.5 }}>{lbl}</div>
                  <div style={{ color:'#081d5b', fontSize:13, fontWeight:900 }}>{val || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── IMPORTANT INSTRUCTIONS (38mm) ── */}
          <div style={{ border:'2px solid #eab308', margin:`${mm(2)}px`,
            borderRadius: mm(3), background:'#fffbeb', minHeight: mm(38),
            display:'flex', overflow:'hidden' }}>
            {/* Instructions text */}
            <div style={{ flex:1, padding: mm(3) }}>
              <div style={{ background:'#d97706', borderRadius: mm(2), padding:`${mm(1)}px ${mm(2)}px`,
                marginBottom: mm(2), display:'inline-block' }}>
                <span style={{ color:'#fff', fontSize:10, fontWeight:900, letterSpacing:1 }}>
                  IMPORTANT INSTRUCTIONS
                </span>
              </div>
              {[
                '1. Candidate must carry this Admit Card and a valid Photo ID proof.',
                '2. Report at least 30 minutes before the scheduled exam time.',
                '3. Mobile phones and electronic devices are strictly prohibited.',
                '4. This card is non-transferable. Impersonation is punishable.',
                '5. Candidates without this card will not be permitted to appear.',
              ].map((t, i) => (
                <div key={i} style={{ color:'#5c3a00', fontSize:10.5, lineHeight:1.6,
                  marginBottom: mm(0.5) }}>{t}</div>
              ))}
            </div>
            {/* Director Signature */}
            <div style={{ width: mm(55), borderLeft:'1px solid #fbbf24', display:'flex',
              flexDirection:'column', alignItems:'center', justifyContent:'center', padding: mm(3) }}>
              <div style={{ border:'1px solid #d4af37', borderRadius: mm(2),
                width: mm(45), height: mm(20), display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'flex-end', padding: mm(2),
                background:'#fff8e7' }}>
                <img src="/logo.png" alt="seal"
                  style={{ width: mm(12), height: mm(12), borderRadius:'50%', objectFit:'cover',
                    marginBottom: mm(1), border:'1px solid #d4af37' }}/>
                <div style={{ borderTop:'1px solid #888', width:'90%' }}/>
              </div>
              <div style={{ color:'#5c3a00', fontSize:9.5, fontWeight:700, marginTop: mm(1),
                textAlign:'center' }}>Director / Principal<br/>Signature</div>
            </div>
          </div>

          {/* ── FOOTER (18mm) ── */}
          <div style={{ background:'#081d5b', margin:`0 ${mm(2)}px ${mm(2)}px`, borderRadius:`0 0 ${mm(3)}px ${mm(3)}px`,
            height: mm(18), display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:`0 ${mm(5)}px`, borderTop:'2px solid #d4af37' }}>
            {/* Left: Issue Date */}
            <div style={{ textAlign:'left' }}>
              <div style={{ color:'#93b4e8', fontSize:9 }}>Issue Date</div>
              <div style={{ color:'#fff', fontSize:11, fontWeight:900, fontFamily:'monospace' }}>
                {issueDateFmt}
              </div>
            </div>
            {/* Center: logo + website */}
            <div style={{ textAlign:'center', display:'flex', flexDirection:'column',
              alignItems:'center', gap:2 }}>
              <img src="/logo.png" alt="seal"
                style={{ width: mm(10), height: mm(10), borderRadius:'50%', objectFit:'cover',
                  border:'1px solid #d4af37' }}/>
              <div style={{ color:'#d4af37', fontSize:9, fontWeight:700 }}>www.kci.org.in</div>
              <div style={{ color:'#6080c0', fontSize:8 }}>Computer Generated Document</div>
            </div>
            {/* Right: Serial Number */}
            <div style={{ textAlign:'right' }}>
              <div style={{ color:'#93b4e8', fontSize:9 }}>Serial No</div>
              <div style={{ color:'#fff', fontSize:11, fontWeight:900, fontFamily:'monospace' }}>
                {admitCard?.serialNumber || student?.formNo || '-'}
              </div>
            </div>
          </div>

        </div>
      </div>
      <p style={{ color:'#9ca3af', fontSize:11, marginTop:-H_PX*0.25+8 }}>
        Preview (75%) — Download PDF for print-ready A4 admit card
      </p>
    </div>
  );
}
