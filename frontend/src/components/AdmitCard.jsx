import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, Printer, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const mmn = v => v * 3.7795;

function CardContent({ student, admitCard, branch, qrUrl, scale = 1 }) {
  const s = v => v * scale;
  const p = v => `${mmn(v) * scale}px`;
  const pn = v => mmn(v) * scale;

  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-';
  const examDateFmt = admitCard?.examDate
    ? new Date(admitCard.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';
  const issueDateFmt = new Date().toLocaleDateString('en-IN');

  const leftFields = [
    ['Candidate Name',  admitCard?.studentName  || student?.name],
    ['Form No',         admitCard?.formNo        || student?.formNo],
    ['Enrollment No',   admitCard?.enrollmentNumber || student?.enrollmentNumber],
    ['Roll Number',     admitCard?.rollNumber    || student?.rollNumber],
    ['Course',          admitCard?.courseName    || student?.courseName],
    ["Father's Name",   admitCard?.fatherName    || student?.fatherName],
    ["Mother's Name",   admitCard?.motherName    || student?.motherName],
    ['Date Of Birth',   admitCard?.dob           || dob],
    ['Gender',          admitCard?.gender        || student?.gender],
    ['Category',        admitCard?.category      || student?.category || 'General'],
    ['Batch / Session', admitCard?.session       || admitCard?.batch  || student?.batch],
    ['Exam Type',       admitCard?.examType      || 'Theory'],
    ['Address',         admitCard?.address       || student?.address],
  ];

  const examDetails = [
    ['Exam Date',      examDateFmt],
    ['Exam Center',    admitCard?.examCenter    || branch?.branchName || '-'],
    ['Reporting Time', admitCard?.reportingTime || '9:00 AM'],
    ['Exam Type',      admitCard?.examType      || 'Theory'],
  ];

  return (
    <div style={{
      width: `${mmn(210) * scale}px`,
      minHeight: `${mmn(297) * scale}px`,
      fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
      background: '#f8f9fc',
      border: `${s(3)}px solid #d4af37`,
      borderRadius: s(18),
      boxSizing: 'border-box',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── OFFICIAL HEADER ── */}
      <div style={{
        background: '#081d5b',
        display: 'flex',
        alignItems: 'center',
        padding: `${s(10)}px ${s(14)}px`,
        gap: s(12),
        borderBottom: `${s(3)}px solid #d4af37`,
        flexShrink: 0,
        borderRadius: `${s(15)}px ${s(15)}px 0 0`,
      }}>
        {/* Logo */}
        <div style={{
          width: p(22), height: p(22), borderRadius: '50%',
          background: 'transparent', border: `${s(2)}px solid #d4af37`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
        </div>

        {/* Center text */}
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ color: '#ffffff', fontWeight: 900, fontSize: s(20), letterSpacing: s(0.5), lineHeight: 1.2 }}>
            KEERTI COMPUTER INSTITUTE
          </div>
          <div style={{ color: '#d4af37', fontSize: s(11), fontWeight: 700, marginTop: s(2) }}>
            The College of IT
          </div>
          <div style={{ color: '#b4c8f0', fontSize: s(9.5), marginTop: s(3), lineHeight: 1.6 }}>
            ISO Reg. No.: UAS/2017/155491 &nbsp;|&nbsp; MHRD Regd. &nbsp;|&nbsp; Society Reg. No.: 1373/2005
          </div>
          <div style={{ color: '#93b4e8', fontSize: s(9.5), lineHeight: 1.6 }}>
            info@kci.org.in &nbsp;|&nbsp; Mob: 9936384736 / 9919660880 &nbsp;|&nbsp; www.kci.org.in
          </div>
        </div>

        {/* Badge */}
        <div style={{
          background: '#d4af37', borderRadius: s(10),
          padding: `${s(8)}px ${s(10)}px`,
          flexShrink: 0, textAlign: 'center',
          border: `1.5px solid #f0d060`,
        }}>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(13), lineHeight: 1.4, whiteSpace: 'nowrap' }}>EXAMINATION</div>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(13), lineHeight: 1.4, whiteSpace: 'nowrap' }}>ADMIT CARD</div>
          <div style={{ color: '#2a4080', fontSize: s(10), fontWeight: 700 }}>{new Date().getFullYear()}</div>
        </div>
      </div>

      {/* ── TOP INFO ROW ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        height: p(20), borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0,
      }}>
        {[
          ['ROLL NUMBER',   admitCard?.rollNumber    || student?.rollNumber    || '-'],
          ['FORM NO',       admitCard?.formNo        || student?.formNo        || '-'],
          ['SESSION',       admitCard?.session       || student?.batch         || '-'],
        ].map(([lbl, val], i) => (
          <div key={lbl} style={{
            background: i % 2 === 0 ? '#f5f8ff' : '#f0f5ff',
            borderRight: i < 2 ? `${s(1)}px solid #d0d8f0` : 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: s(2),
          }}>
            <div style={{ color: '#5064a0', fontSize: s(9), fontWeight: 700, letterSpacing: s(0.8) }}>{lbl}</div>
            <div style={{ color: '#081d5b', fontSize: s(16), fontWeight: 900, fontFamily: 'monospace' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{
        display: 'flex', minHeight: p(148),
        position: 'relative', background: '#fafbff',
        borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0,
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: p(110), height: p(110),
          opacity: 0.05, pointerEvents: 'none', zIndex: 0,
        }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', borderRadius: '50%' }} />
        </div>

        {/* LEFT 70% */}
        <div style={{
          flex: '0 0 70%',
          padding: `${s(5)}px ${s(10)}px`,
          zIndex: 1, display: 'flex', flexDirection: 'column', gap: `${s(3)}px`,
        }}>
          {leftFields.map(([lbl, val], i) => (
            <div key={lbl} style={{
              display: 'grid',
              gridTemplateColumns: `${s(130)}px ${s(18)}px 1fr`,
              alignItems: 'start',
              minHeight: s(30),
              background: i % 2 === 0 ? 'rgba(245,248,255,0.9)' : 'rgba(240,245,255,0.7)',
              borderBottom: i < leftFields.length - 1 ? `${s(1)}px solid #e0e8f5` : 'none',
              padding: `${s(4)}px ${s(6)}px`,
              boxSizing: 'border-box',
            }}>
              <span style={{ color: '#081d5b', fontWeight: 700, fontSize: s(13), lineHeight: 1.5, whiteSpace: 'nowrap' }}>{lbl}</span>
              <span style={{ color: '#081d5b', fontWeight: 700, fontSize: s(13), lineHeight: 1.5, textAlign: 'center' }}>:</span>
              <span style={{ color: '#111', fontWeight: 600, fontSize: s(13), lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {val || '-'}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT 30% */}
        <div style={{
          flex: '0 0 30%', borderLeft: `${s(1)}px solid #d0d8f0`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: p(6), padding: p(4), zIndex: 1,
        }}>
          {/* Photo */}
          <div style={{
            width: p(44), height: p(54),
            border: `${s(2)}px solid #d4af37`, borderRadius: p(5),
            overflow: 'hidden', background: '#dce7f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {student?.photo
              ? <img src={student.photo} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(4) }}>
                  <User size={s(26)} color="#8aaad8" />
                  <span style={{ color: '#8aaad8', fontSize: s(9), fontWeight: 700 }}>PHOTO</span>
                </div>
            }
          </div>

          {/* QR */}
          <div style={{
            width: p(40), height: p(40),
            border: `${s(2)}px solid #d4af37`, borderRadius: p(4),
            background: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, padding: s(3),
          }}>
            {qrUrl
              ? <img src={qrUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ color: '#8aaad8', fontSize: s(9) }}>QR...</span>
            }
          </div>
          <span style={{ color: '#6080c0', fontSize: s(9), fontWeight: 600, textAlign: 'center' }}>Scan to Verify</span>

          {/* Candidate Signature box */}
          <div style={{
            width: p(44), border: `${s(1)}px solid #d4af37`,
            borderRadius: p(3), background: '#fff8e7',
            padding: `${s(4)}px ${s(6)}px`, textAlign: 'center',
          }}>
            <div style={{ borderTop: `${s(1)}px solid #aaa`, marginTop: p(8), marginBottom: p(1) }} />
            <div style={{ color: '#5c3a00', fontSize: s(8.5), fontWeight: 700 }}>Candidate Signature</div>
          </div>
        </div>
      </div>

      {/* ── EXAM DETAILS ── */}
      <div style={{ borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0 }}>
        <div style={{ background: '#081d5b', padding: `${p(1.5)} 0`, textAlign: 'center' }}>
          <span style={{ color: '#d4af37', fontSize: s(10), fontWeight: 900, letterSpacing: s(1) }}>
            EXAMINATION DETAILS
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', height: p(22) }}>
          {examDetails.map(([lbl, val], i) => (
            <div key={lbl} style={{
              borderRight: i < 3 ? `${s(1)}px solid #d0d8f0` : 'none',
              background: i % 2 === 0 ? '#f5f8ff' : '#f0f5ff',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: s(2),
            }}>
              <div style={{ color: '#5064a0', fontSize: s(9), fontWeight: 700, letterSpacing: s(0.5) }}>{lbl}</div>
              <div style={{ color: '#081d5b', fontSize: s(12), fontWeight: 900 }}>{val || '-'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INSTRUCTIONS + CONTROLLER SIGNATURE ── */}
      <div style={{
        border: `${s(2)}px solid #eab308`,
        margin: p(2), borderRadius: p(3),
        background: '#fffbeb', flexShrink: 0,
        display: 'flex', overflow: 'visible',
      }}>
        <div style={{ flex: 1, padding: p(3) }}>
          <div style={{
            background: '#d97706', borderRadius: p(2),
            padding: `${p(1)} ${p(2)}`, marginBottom: p(2), display: 'inline-block',
          }}>
            <span style={{ color: '#fff', fontSize: s(9.5), fontWeight: 900, letterSpacing: s(1) }}>
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
            <div key={i} style={{ color: '#5c3a00', fontSize: s(10), lineHeight: 1.7 }}>{t}</div>
          ))}
        </div>

        {/* Controller of Examination Signature */}
        <div style={{
          width: p(52), borderLeft: `${s(1)}px solid #fbbf24`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: p(3), gap: p(2),
        }}>
          <div style={{
            border: `${s(1)}px solid #d4af37`, borderRadius: p(2),
            width: p(44), height: p(18),
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            padding: p(2), background: '#fff8e7',
          }}>
            <img src="/logo.png" alt="seal" style={{
              width: p(11), height: p(11), borderRadius: '50%',
              objectFit: 'cover', objectPosition: 'center', display: 'block', marginBottom: p(1),
              border: `${s(1)}px solid #d4af37`,
            }} />
            <div style={{ borderTop: `${s(1)}px solid #888`, width: '90%' }} />
          </div>
          <div style={{ color: '#5c3a00', fontSize: s(9), fontWeight: 700, textAlign: 'center', lineHeight: 1.4 }}>
            Controller of<br />Examination
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: '#081d5b',
        margin: `0 ${p(2)} ${p(2)}`,
        borderRadius: `0 0 ${p(14)} ${p(14)}`,
        height: p(16), flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${p(5)}`,
        borderTop: `${s(2)}px solid #d4af37`,
      }}>
        <div>
          <div style={{ color: '#93b4e8', fontSize: s(8) }}>Issue Date</div>
          <div style={{ color: '#fff', fontSize: s(10), fontWeight: 900, fontFamily: 'monospace' }}>{issueDateFmt}</div>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(2) }}>
          <img src="/logo.png" alt="seal" style={{
            width: p(9), height: p(9), borderRadius: '50%',
            objectFit: 'cover', objectPosition: 'center', display: 'block', border: `${s(1)}px solid #d4af37`,
          }} />
          <div style={{ color: '#d4af37', fontSize: s(8), fontWeight: 700 }}>www.kci.org.in</div>
          <div style={{ color: '#6080c0', fontSize: s(7.5) }}>Computer Generated Document</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#93b4e8', fontSize: s(8) }}>Serial No</div>
          <div style={{ color: '#fff', fontSize: s(10), fontWeight: 900, fontFamily: 'monospace' }}>
            {admitCard?.serialNumber || student?.formNo || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdmitCard({ student, admitCard, branch }) {
  const pdfRef  = useRef(null);
  const printRef = useRef(null);
  const [qrUrl, setQrUrl]       = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        name:   student?.name,
        formNo: admitCard?.formNo || student?.formNo,
        roll:   student?.rollNumber,
        course: student?.courseName,
        center: admitCard?.examCenter,
      }),
      { width: 300, margin: 1, color: { dark: '#081d5b', light: '#ffffff' } }
    ).then(setQrUrl).catch(() => {});
  }, [student, admitCard]);

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    try {
      const el = pdfRef.current;
      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 80));
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 4, useCORS: true, allowTaint: true,
        backgroundColor: '#ffffff', logging: false,
        width: mmn(210), windowWidth: mmn(210),
      });
      el.style.display = 'none';
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height / canvas.width) * 210);
      pdf.save(`AdmitCard_${admitCard?.formNo || student?.rollNumber || 'KCI'}.pdf`);
      toast.success('Admit Card downloaded!');
    } catch { toast.error('Download failed'); }
    setExporting(false);
  };

  const handlePrint = async () => {
    if (!printRef.current) return;
    const el = printRef.current;
    el.style.display = 'block';
    await new Promise(r => setTimeout(r, 80));
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <html><head><title>Admit Card — KCI</title>
      <style>
        body { margin: 0; padding: 0; background: #fff; }
        @media print { body { margin: 0; } @page { size: A4; margin: 0; } }
      </style></head>
      <body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
    el.style.display = 'none';
  };

  // Responsive scale for preview
  const previewScale = typeof window !== 'undefined'
    ? (window.innerWidth < 480 ? 0.36 : window.innerWidth < 768 ? 0.46 : 0.72)
    : 0.72;
  const previewH = mmn(297) * previewScale;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleDownload} disabled={exporting} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 22px',
          background: 'linear-gradient(135deg,#081d5b,#1a3a8f)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 14, fontWeight: 900,
          cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.6 : 1,
          boxShadow: '0 4px 14px rgba(8,29,91,0.4)',
        }}>
          <Download size={16} />
          {exporting ? 'Generating...' : 'Download PDF'}
        </button>

        <button onClick={handlePrint} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 22px',
          background: 'linear-gradient(135deg,#065f46,#047857)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 14, fontWeight: 900, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(6,95,70,0.4)',
        }}>
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Screen Preview */}
      <div style={{ width: '100%', overflowX: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          transform: `scale(${previewScale})`,
          transformOrigin: 'top center',
          width: mmn(210),
          marginBottom: -(mmn(297) * (1 - previewScale)),
        }}>
          <CardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
        </div>
      </div>
      <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
        Preview — Download PDF or Print for official A4 admit card
      </p>

      {/* Hidden PDF container */}
      <div ref={pdfRef} style={{
        display: 'none', position: 'fixed', top: 0, left: '-9999px',
        width: mmn(210), boxSizing: 'border-box', zIndex: -1,
      }}>
        <CardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
      </div>

      {/* Hidden Print container */}
      <div ref={printRef} style={{
        display: 'none', position: 'fixed', top: 0, left: '-9999px',
        width: mmn(210), boxSizing: 'border-box', zIndex: -1,
      }}>
        <CardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
      </div>
    </div>
  );
}
