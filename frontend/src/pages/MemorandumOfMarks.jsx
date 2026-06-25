import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

const SUBJECTS = [
  'Computer Fundamentals (MS-DOS, Windows & I/O System)',
  'Microsoft Office (Word, Excel, PowerPoint & Access)',
  'Desktop Publishing (PageMaker, CorelDraw & Photoshop)',
  'Tally A/c (Tally ERP)',
  'C & C++ Language',
  'HTML & DHTML',
  'JAVA & Visual Basic',
  'Printing, Multimedia & Internet',
  'Practical',
];

const GRADE_SCALE = [
  { range: 'Above 90%', grade: 'S' },
  { range: '70% - 90%', grade: 'A' },
  { range: '60% - 69%', grade: 'B' },
  { range: '50% - 59%', grade: 'C' },
  { range: '40% - 49%', grade: 'D' },
  { range: 'Below 40%', grade: 'Fail' },
];

function getGrade(pct) {
  if (pct > 90) return 'S';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'Fail';
}

const LINE = { borderTop: '1px solid #111111', width: '100%', margin: '10px 0' };

export default function MemorandumOfMarks({ result }) {
  const subjects = SUBJECTS.map((name, i) => {
    const db = result?.subjects?.[i];
    return { name, max: db?.maxMarks ?? 100, obtained: db?.obtainedMarks ?? '—' };
  });

  const totalMax = subjects.reduce((a, s) => a + (typeof s.max === 'number' ? s.max : 0), 0);
  const totalObtained = subjects.reduce((a, s) => a + (typeof s.obtained === 'number' ? s.obtained : 0), 0);
  const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  const grade = result?.grade || getGrade(pct);
  const issueDate = result?.examDate
    ? new Date(result.examDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, PAD = 8;

    // Load logo
    let logoB64 = null;
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image(); i.crossOrigin = 'anonymous';
        i.onload = () => res(i); i.onerror = rej; i.src = '/logo.png';
      });
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth || 400; cv.height = img.naturalHeight || 400;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      logoB64 = cv.toDataURL('image/png');
    } catch (_) {}

    // Outer red border
    doc.setDrawColor(214, 40, 40); doc.setLineWidth(1.5);
    doc.rect(PAD, PAD, W - PAD * 2, H - PAD * 2);
    // Inner black border
    doc.setDrawColor(17, 17, 17); doc.setLineWidth(0.4);
    doc.rect(PAD + 3, PAD + 3, W - PAD * 2 - 6, H - PAD * 2 - 6);

    // Watermark - centered, full logo, behind all content
    if (logoB64) {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.05 }));
      const wmSize = 148; // ~480px in mm scale
      doc.addImage(logoB64, 'PNG', W / 2 - wmSize / 2, H / 2 - wmSize / 2, wmSize, wmSize);
      doc.restoreGraphicsState();
    }

    let y = PAD + 8;
    const L = PAD + 6, R = W - PAD - 6;

    const line = (yy) => {
      doc.setDrawColor(17, 17, 17); doc.setLineWidth(0.4);
      doc.line(L, yy, R, yy);
    };

    // Govt bar
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80);
    doc.text('Under Govt. of U.P. Soc. Reg. No.  |  Under Govt. of India (MHRD)  |  ISO Reg. No.', W / 2, y, { align: 'center' });
    y += 5;

    // Header: Logo | Name | Right text
    const logoSize = 22;
    if (logoB64) doc.addImage(logoB64, 'PNG', L, y, logoSize, logoSize);

    doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(8, 29, 91);
    doc.text('KEERTI COMPUTER INSTITUTE', W / 2, y + 7, { align: 'center' });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(17, 17, 17);
    doc.text('AN ISO 9001 : 2015 CERTIFIED ORGANIZATION', W / 2, y + 13, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Regd. No: UP/2006/0012345  |  MHRD Regd.  |  ISO: 9001:2015', W / 2, y + 18, { align: 'center' });

    doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(8, 29, 91);
    doc.text('The College Of IT.....', R, y + 7, { align: 'right' });

    y += logoSize + 5;
    line(y); y += 5;

    // Center headings
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(17, 17, 17);
    doc.text('Registered Under Govt. Copyright Act', W / 2, y, { align: 'center' }); y += 5;
    doc.text('Ministry of Human Resource Development', W / 2, y, { align: 'center' }); y += 5;
    doc.text('Government of India', W / 2, y, { align: 'center' }); y += 6;

    // Single line above green
    line(y); y += 5;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(11, 125, 31);
    doc.text('(Department of Secondary and Higher Education)', W / 2, y, { align: 'center' }); y += 5;

    // Single line below green / above orange
    line(y); y += 5;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(255, 140, 0);
    doc.text('MEMORANDUM OF MARKS', W / 2, y, { align: 'center' }); y += 6;

    // Single line below orange
    line(y); y += 6;

    // Student details
    const mid = W / 2;
    const lw = 38, cv2 = 3, vx = 42;
    const rh = 7;
    const left = [
      ['Student Name', result?.studentName || '—'],
      ["Father's Name", result?.fatherName || '—'],
      ['Course', result?.courseName || result?.course?.title || '—'],
    ];
    const right = [
      ['Enrollment No', result?.rollNumber || '—'],
      ['Reg. No', result?.batch || '—'],
      ['District', result?.branchName || '—'],
    ];

    doc.setFontSize(8.5);
    left.forEach(([lbl, val], i) => {
      const ry = y + i * rh;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
      doc.text(lbl, L, ry);
      doc.text(':', L + lw + cv2, ry);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val), L + vx, ry, { maxWidth: mid - L - vx - 2 });
    });
    right.forEach(([lbl, val], i) => {
      const ry = y + i * rh;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
      doc.text(lbl, mid + 4, ry);
      doc.text(':', mid + 4 + lw + cv2, ry);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val), mid + 4 + vx, ry, { maxWidth: R - mid - vx - 4 });
    });

    y += left.length * rh + 5;
    line(y); y += 4;

    // Subject table
    autoTable(doc, {
      startY: y,
      head: [['S.No', 'Subjects', 'Max Marks', 'Obtained Marks']],
      body: subjects.map((s, i) => [i + 1, s.name, s.max, s.obtained]),
      theme: 'grid',
      headStyles: {
        fillColor: [8, 29, 91], textColor: [255, 255, 255],
        fontStyle: 'bold', fontSize: 9, halign: 'center',
        minCellHeight: 10, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
      },
      bodyStyles: {
        fontSize: 8.5, textColor: [17, 17, 17],
        minCellHeight: 9, cellPadding: { top: 2, bottom: 2, left: 3, right: 2 },
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 13 },
        1: { halign: 'left', cellWidth: 109 },
        2: { halign: 'center', cellWidth: 26 },
        3: { halign: 'center', cellWidth: 30 },
      },
      margin: { left: L, right: PAD + 6 },
    });

    y = doc.lastAutoTable.finalY;

    // Total row
    autoTable(doc, {
      startY: y,
      body: [[
        { content: `Grade: ${grade}`, styles: { fontStyle: 'bold', halign: 'center', fillColor: [224, 224, 224] } },
        { content: 'Total', styles: { fontStyle: 'bold', halign: 'center', fillColor: [224, 224, 224] } },
        { content: String(totalMax), styles: { fontStyle: 'bold', halign: 'center', fillColor: [224, 224, 224] } },
        { content: String(totalObtained), styles: { fontStyle: 'bold', halign: 'center', fillColor: [224, 224, 224] } },
      ]],
      theme: 'grid',
      bodyStyles: { fontSize: 9, textColor: [17, 17, 17], minCellHeight: 10, cellPadding: { top: 3, bottom: 3 } },
      columnStyles: {
        0: { cellWidth: 13 },
        1: { cellWidth: 109 },
        2: { cellWidth: 26 },
        3: { cellWidth: 30 },
      },
      margin: { left: L, right: PAD + 6 },
    });

    y = doc.lastAutoTable.finalY + 4;
    line(y); y += 5;

    // Grade scale
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(17, 17, 17);
    doc.text('Grade Scale :', L, y);
    doc.setFont('helvetica', 'normal');
    doc.text('S=Above 90%  |  A=70-90%  |  B=60-69%  |  C=50-59%  |  D=40-49%  |  Fail=Below 40%', L + 28, y);
    y += 10;
    line(y); y += 6;

    // Bottom: Date | Seal | MD Signature
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(17, 17, 17);
    doc.text('Date of Issue:', L, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.text(issueDate, L, y + 6);

    if (logoB64) doc.addImage(logoB64, 'PNG', W / 2 - 8, y, 16, 16);
    doc.setDrawColor(8, 29, 91); doc.setLineWidth(0.5);
    doc.circle(W / 2, y + 8, 11);
    doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(8, 29, 91);
    doc.text('OFFICIAL SEAL', W / 2, y + 20, { align: 'center' });

    doc.setDrawColor(17, 17, 17); doc.setLineWidth(0.4);
    doc.line(R - 46, y + 18, R, y + 18);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(17, 17, 17);
    doc.text('Managing Director', R - 23, y + 22, { align: 'center' });

    y += 28;
    line(y); y += 3;

    // Footer
    doc.setFillColor(214, 40, 40);
    doc.rect(PAD + 3, y, W - PAD * 2 - 6, 18, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
    doc.text('Near Head Post Office, Sabji Mandi Road, Sringarhat, Ayodhya, Faizabad-224123, Uttar Pradesh', W / 2, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text('Website: www.kci.org.in  |  Email: kci14@ymail.com', W / 2, y + 12, { align: 'center' });

    doc.save(`KCI_Memorandum_${result?.rollNumber || 'Result'}.pdf`);
    toast.success('Memorandum downloaded!');
  };

  return (
    <div style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* A4 Preview */}
      <div style={{
        width: '210mm', minHeight: '297mm', margin: '0 auto',
        background: '#fff', position: 'relative', boxSizing: 'border-box',
        padding: '11mm 11mm 10mm',
        border: '4px solid #d62828',
        outline: '2px solid #111111',
        outlineOffset: '-7mm',
      }}>

        {/* WATERMARK - dedicated absolute layer, no overflow hidden */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          height: 520,
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: 'none',
        }}>
          <img
            src="/logo.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Govt bar */}
          <div style={{ textAlign: 'center', fontSize: 10, color: '#555', marginBottom: 8 }}>
            Under Govt. of U.P. Soc. Reg. No. &nbsp;|&nbsp; Under Govt. of India (MHRD) &nbsp;|&nbsp; ISO Reg. No.
          </div>

          {/* Header: Logo | Name | Right */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px', alignItems: 'center', gap: 8, height: 90 }}>
            <img src="/logo.png" alt="KCI" style={{ width: 75, height: 75, borderRadius: '50%', border: '2px solid #081d5b', objectFit: 'cover' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#081d5b', letterSpacing: 1, lineHeight: 1.15 }}>KEERTI COMPUTER INSTITUTE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginTop: 4 }}>AN ISO 9001 : 2015 CERTIFIED ORGANIZATION</div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>Regd. No: UP/2006/0012345 &nbsp;|&nbsp; MHRD Regd. &nbsp;|&nbsp; ISO: 9001:2015</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, fontStyle: 'italic', color: '#081d5b', fontWeight: 700 }}>The College Of IT.....</div>
          </div>

          <div style={LINE} />

          {/* Center headings */}
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.8 }}>Registered Under Govt. Copyright Act</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.8 }}>Ministry of Human Resource Development</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.8 }}>Government of India</div>
          </div>

          {/* Single line above green */}
          <div style={LINE} />

          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0b7d1f' }}>(Department of Secondary and Higher Education)</div>
          </div>

          {/* Single line below green / above orange */}
          <div style={LINE} />

          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#ff8c00', letterSpacing: 2 }}>MEMORANDUM OF MARKS</div>
          </div>

          {/* Single line below orange */}
          <div style={LINE} />

          {/* Student details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: '4px 0' }}>
            <div style={{ paddingRight: 12, borderRight: '1px solid #ccc' }}>
              {[
                ['Student Name', result?.studentName || '—'],
                ["Father's Name", result?.fatherName || '—'],
                ['Course', result?.courseName || result?.course?.title || '—'],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '150px 20px 1fr', height: 30, alignItems: 'center', borderBottom: '1px dotted #ddd' }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{lbl}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>:</span>
                  <span style={{ fontSize: 12 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingLeft: 12 }}>
              {[
                ['Enrollment No', result?.rollNumber || '—'],
                ['Reg. No', result?.batch || '—'],
                ['District', result?.branchName || '—'],
              ].map(([lbl, val]) => (
                <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '150px 20px 1fr', height: 30, alignItems: 'center', borderBottom: '1px dotted #ddd' }}>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{lbl}</span>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>:</span>
                  <span style={{ fontSize: 12 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={LINE} />

          {/* Subject Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #111' }}>
            <thead>
              <tr style={{ background: '#081d5b', color: '#fff', height: 38 }}>
                <th style={{ width: '8%', textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111' }}>S.No</th>
                <th style={{ width: '52%', textAlign: 'left', padding: '0 8px', fontSize: 12, border: '1px solid #111' }}>Subjects</th>
                <th style={{ width: '20%', textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111' }}>Max Marks</th>
                <th style={{ width: '20%', textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111' }}>Obtained Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={i} style={{ height: 34, background: '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 11.5, border: '1px solid #111' }}>{i + 1}</td>
                  <td style={{ textAlign: 'left', padding: '0 8px', fontSize: 11.5, border: '1px solid #111' }}>{s.name}</td>
                  <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 11.5, border: '1px solid #111' }}>{s.max}</td>
                  <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 11.5, border: '1px solid #111' }}>{s.obtained}</td>
                </tr>
              ))}
              <tr style={{ height: 34, background: '#e0e0e0', fontWeight: 700 }}>
                <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111', fontWeight: 700 }}>Grade: {grade}</td>
                <td style={{ textAlign: 'left', padding: '0 8px', fontSize: 12, border: '1px solid #111', fontWeight: 700 }}>Total</td>
                <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111', fontWeight: 700 }}>{totalMax}</td>
                <td style={{ textAlign: 'center', padding: '0 6px', fontSize: 12, border: '1px solid #111', fontWeight: 700 }}>{totalObtained}</td>
              </tr>
            </tbody>
          </table>

          <div style={LINE} />

          {/* Grade scale */}
          <div style={{ fontSize: 11, color: '#111', display: 'flex', flexWrap: 'wrap', gap: 14, padding: '4px 0' }}>
            <strong>Grade Scale :</strong>
            {GRADE_SCALE.map(g => <span key={g.grade}><strong>{g.grade}</strong> = {g.range}</span>)}
          </div>

          <div style={LINE} />

          {/* Bottom: Date | Seal | MD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'flex-end', padding: '8px 0 10px' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Date of Issue:</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{issueDate}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', border: '2px solid #081d5b', margin: '0 auto', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Seal" style={{ width: 62, height: 62, objectFit: 'contain', opacity: 0.75 }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#081d5b', marginTop: 3 }}>OFFICIAL SEAL</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 48 }} />
              <div style={{ borderTop: '1.5px solid #111', paddingTop: 4, fontSize: 12, fontWeight: 700 }}>Managing Director</div>
            </div>
          </div>

          <div style={LINE} />

          {/* Footer */}
          <div style={{ background: '#d62828', color: '#fff', textAlign: 'center', padding: '8px 12px', borderRadius: 3 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Near Head Post Office, Sabji Mandi Road, Sringarhat, Ayodhya, Faizabad-224123, Uttar Pradesh</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Website: www.kci.org.in &nbsp;|&nbsp; Email: kci14@ymail.com</div>
          </div>

        </div>
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button onClick={handleDownloadPDF} style={{
          background: '#081d5b', color: '#fff', border: 'none',
          padding: '12px 36px', fontSize: 15, fontWeight: 700,
          borderRadius: 6, cursor: 'pointer', letterSpacing: 1,
        }}>
          ⬇ Download Memorandum PDF
        </button>
      </div>
    </div>
  );
}
