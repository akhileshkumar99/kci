import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ── 1mm = 3.7795px at 96 dpi ──
const mm = v => `${v * 3.7795}px`;
const mmn = v => v * 3.7795;          // numeric version

// ── Shared card content as a pure function ──
// Renders the same JSX for both preview and PDF container.
// `scale` is 1 for PDF container, 0.75 for preview.
function CardContent({ student, admitCard, branch, qrUrl, scale = 1 }) {
  const s = v => v * scale;           // scale any px value
  const dob = student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '-';
  const examDateFmt = admitCard?.examDate
    ? new Date(admitCard.examDate).toLocaleDateString('en-IN') : '-';
  const issueDateFmt = admitCard?.issueDate
    ? new Date(admitCard.issueDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

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

  // All dimensions in mm, converted to px with scale applied
  const p = v => `${mmn(v) * scale}px`;   // mm → scaled px string
  const pn = v => mmn(v) * scale;          // mm → scaled px number

  return (
    <div style={{
      width: `${mmn(210) * scale}px`,
      minHeight: `${mmn(297) * scale}px`,
      fontFamily: "'Inter','Segoe UI','Poppins',sans-serif",
      background: '#f8f9fc',
      border: `${s(3)}px solid #d4af37`,
      borderRadius: s(18),
      boxSizing: 'border-box',
      overflow: 'visible',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── HEADER 38mm ── */}
      <div style={{
        background: '#081d5b',
        height: p(38),
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${p(5)}`,
        gap: p(4),
        borderBottom: `${s(2)}px solid #d4af37`,
        flexShrink: 0,
        borderRadius: `${s(15)}px ${s(15)}px 0 0`,
      }}>
        {/* Logo */}
        <div style={{
          width: p(24), height: p(24), borderRadius: '50%',
          background: '#fff', border: `${s(2)}px solid #d4af37`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo.png" alt="KCI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Center */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: s(22), letterSpacing: s(1), lineHeight: 1.2 }}>
            KEERTI COMPUTER INSTITUTE
          </div>
          <div style={{ color: '#b4c8f0', fontSize: s(11), marginTop: s(3) }}>
            Government Recognized &nbsp;|&nbsp; ISO Certified &nbsp;|&nbsp; NIELIT Affiliated
          </div>
          <div style={{ color: '#93b4e8', fontSize: s(10), marginTop: s(2) }}>
            Ayodhya, Uttar Pradesh &nbsp;|&nbsp; www.kci.org.in &nbsp;|&nbsp; 9936384736
          </div>
        </div>

        {/* Badge */}
        <div style={{
          background: '#d4af37', borderRadius: s(10),
          padding: `${s(8)}px ${s(10)}px`,
          flexShrink: 0, textAlign: 'center', minWidth: p(48),
        }}>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(13), lineHeight: 1.4 }}>EXAMINATION</div>
          <div style={{ color: '#081d5b', fontWeight: 900, fontSize: s(13), lineHeight: 1.4 }}>ADMIT CARD</div>
          <div style={{ color: '#2a4080', fontSize: s(10), fontWeight: 700 }}>{new Date().getFullYear()}</div>
        </div>
      </div>

      {/* ── TOP INFO ROW 22mm ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        height: p(22), borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0,
      }}>
        {[
          ['ROLL NUMBER',   student?.rollNumber || admitCard?.rollNumber || '-'],
          ['SERIAL NUMBER', admitCard?.serialNumber || student?.formNo || '-'],
          ['SESSION',       admitCard?.session || student?.batch || '-'],
        ].map(([lbl, val], i) => (
          <div key={lbl} style={{
            background: i % 2 === 0 ? '#f5f8ff' : '#f0f5ff',
            borderRight: i < 2 ? `${s(1)}px solid #d0d8f0` : 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: s(3),
          }}>
            <div style={{ color: '#5064a0', fontSize: s(10), fontWeight: 700, letterSpacing: s(1) }}>{lbl}</div>
            <div style={{ color: '#081d5b', fontSize: s(18), fontWeight: 900, fontFamily: 'monospace' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{
        display: 'flex', minHeight: p(145),
        position: 'relative', background: '#fafbff',
        borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0,
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: p(120), height: p(120),
          opacity: 0.05, pointerEvents: 'none', zIndex: 0,
        }}>
          <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* LEFT 70% — flex column, rows grow with content */}
        <div style={{
          flex: '0 0 70%',
          padding: `${s(6)}px ${s(12)}px`,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: `${s(4)}px`,
        }}>
          {leftFields.map(([lbl, val], i) => (
            <div key={lbl} style={{
              display: 'grid',
              gridTemplateColumns: `${s(140)}px ${s(20)}px 1fr`,
              alignItems: 'start',
              minHeight: s(36),
              background: i % 2 === 0 ? 'rgba(245,248,255,0.9)' : 'rgba(240,245,255,0.7)',
              borderBottom: i < leftFields.length - 1 ? `${s(1)}px solid #e0e8f5` : 'none',
              padding: `${s(6)}px ${s(8)}px`,
              boxSizing: 'border-box',
            }}>
              {/* Label */}
              <span style={{
                color: '#081d5b',
                fontWeight: 700,
                fontSize: s(15),
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
              }}>{lbl}</span>
              {/* Colon */}
              <span style={{
                color: '#081d5b',
                fontWeight: 700,
                fontSize: s(15),
                lineHeight: 1.5,
                textAlign: 'center',
              }}>:</span>
              {/* Value */}
              <span style={{
                color: '#111111',
                fontWeight: 600,
                fontSize: s(15),
                lineHeight: 1.5,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
              }}>
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
          gap: p(8), padding: p(4), zIndex: 1,
        }}>
          {/* Photo 45×55mm */}
          <div style={{
            width: p(45), height: p(55),
            border: `${s(2)}px solid #d4af37`, borderRadius: p(6),
            overflow: 'hidden', background: '#dce7f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {student?.photo
              ? <img src={student.photo} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(4) }}>
                  <User size={s(28)} color="#8aaad8" />
                  <span style={{ color: '#8aaad8', fontSize: s(10), fontWeight: 700 }}>PHOTO</span>
                </div>
            }
          </div>

          {/* QR 42×42mm */}
          <div style={{
            width: p(42), height: p(42),
            border: `${s(2)}px solid #d4af37`, borderRadius: p(4),
            background: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, padding: s(4),
          }}>
            {qrUrl
              ? <img src={qrUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ color: '#8aaad8', fontSize: s(10) }}>QR...</span>
            }
          </div>
          <span style={{ color: '#6080c0', fontSize: s(10), fontWeight: 600, textAlign: 'center' }}>
            Scan to Verify
          </span>
        </div>
      </div>

      {/* ── EXAM DETAILS 28mm ── */}
      <div style={{ borderBottom: `${s(1)}px solid #d0d8f0`, flexShrink: 0 }}>
        <div style={{ background: '#081d5b', padding: `${p(1.5)} 0`, textAlign: 'center' }}>
          <span style={{ color: '#d4af37', fontSize: s(11), fontWeight: 900, letterSpacing: s(1) }}>
            EXAMINATION DETAILS
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', height: p(23) }}>
          {examDetails.map(([lbl, val], i) => (
            <div key={lbl} style={{
              borderRight: i < 3 ? `${s(1)}px solid #d0d8f0` : 'none',
              background: i % 2 === 0 ? '#f5f8ff' : '#f0f5ff',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: s(3),
            }}>
              <div style={{ color: '#5064a0', fontSize: s(10), fontWeight: 700, letterSpacing: s(0.5) }}>{lbl}</div>
              <div style={{ color: '#081d5b', fontSize: s(13), fontWeight: 900 }}>{val || '-'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── IMPORTANT INSTRUCTIONS 38mm ── */}
      <div style={{
        border: `${s(2)}px solid #eab308`,
        margin: p(2), borderRadius: p(3),
        background: '#fffbeb', flexShrink: 0,
        display: 'flex', overflow: 'visible',
      }}>
        {/* Text */}
        <div style={{ flex: 1, padding: p(3) }}>
          <div style={{
            background: '#d97706', borderRadius: p(2),
            padding: `${p(1)} ${p(2)}`,
            marginBottom: p(2), display: 'inline-block',
          }}>
            <span style={{ color: '#fff', fontSize: s(10), fontWeight: 900, letterSpacing: s(1) }}>
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
            <div key={i} style={{ color: '#5c3a00', fontSize: s(10.5), lineHeight: 1.7, marginBottom: p(0.5) }}>{t}</div>
          ))}
        </div>

        {/* Director Signature */}
        <div style={{
          width: p(55), borderLeft: `${s(1)}px solid #fbbf24`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: p(3),
        }}>
          <div style={{
            border: `${s(1)}px solid #d4af37`, borderRadius: p(2),
            width: p(45), height: p(20),
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            padding: p(2), background: '#fff8e7',
          }}>
            <img src="/logo.png" alt="seal" style={{
              width: p(12), height: p(12), borderRadius: '50%',
              objectFit: 'cover', marginBottom: p(1),
              border: `${s(1)}px solid #d4af37`,
            }} />
            <div style={{ borderTop: `${s(1)}px solid #888`, width: '90%' }} />
          </div>
          <div style={{ color: '#5c3a00', fontSize: s(9.5), fontWeight: 700, marginTop: p(1), textAlign: 'center' }}>
            Director / Principal<br />Signature
          </div>
        </div>
      </div>

      {/* ── FOOTER 18mm ── */}
      <div style={{
        background: '#081d5b',
        margin: `0 ${p(2)} ${p(2)}`,
        borderRadius: `0 0 ${p(15)} ${p(15)}`,
        height: p(18), flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${p(5)}`,
        borderTop: `${s(2)}px solid #d4af37`,
      }}>
        <div>
          <div style={{ color: '#93b4e8', fontSize: s(9) }}>Issue Date</div>
          <div style={{ color: '#fff', fontSize: s(11), fontWeight: 900, fontFamily: 'monospace' }}>{issueDateFmt}</div>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s(2) }}>
          <img src="/logo.png" alt="seal" style={{
            width: p(10), height: p(10), borderRadius: '50%',
            objectFit: 'cover', border: `${s(1)}px solid #d4af37`,
          }} />
          <div style={{ color: '#d4af37', fontSize: s(9), fontWeight: 700 }}>www.kci.org.in</div>
          <div style={{ color: '#6080c0', fontSize: s(8) }}>Computer Generated Document</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#93b4e8', fontSize: s(9) }}>Serial No</div>
          <div style={{ color: '#fff', fontSize: s(11), fontWeight: 900, fontFamily: 'monospace' }}>
            {admitCard?.serialNumber || student?.formNo || '-'}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Main export component ──
export default function AdmitCard({ student, admitCard, branch }) {
  const pdfRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        name: student?.name,
        roll: student?.rollNumber,
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
      // Temporarily make PDF container visible off-screen
      const el = pdfRef.current;
      el.style.display = 'block';

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: mmn(210),
        height: mmn(297),
        windowWidth: mmn(210),
        windowHeight: mmn(297),
      });

      el.style.display = 'none';

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`AdmitCard_${student?.rollNumber || 'KCI'}.pdf`);
      toast.success('Admit Card downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Download failed');
    }
    setExporting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

      {/* ── Download button ── */}
      <button
        onClick={handleDownload}
        disabled={exporting}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 28px',
          background: 'linear-gradient(135deg,#081d5b,#1a3a8f)',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 14, fontWeight: 900,
          cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.6 : 1,
          boxShadow: '0 4px 14px rgba(8,29,91,0.4)',
        }}
      >
        <Download size={16} />
        {exporting ? 'Generating PDF...' : 'Download Admit Card PDF'}
      </button>

      {/* ── SCREEN PREVIEW — scaled 75%, no overflow issues ── */}
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          transform: 'scale(0.75)',
          transformOrigin: 'top center',
          marginBottom: `${mmn(297) * -0.25}px`,
        }}>
          <CardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
        </div>
      </div>

      <p style={{ color: '#9ca3af', fontSize: 11 }}>
        Preview (75%) — Download PDF for print-ready A4 admit card
      </p>

      {/* ── PDF EXPORT CONTAINER — off-screen, full A4 size, NO scaling ── */}
      <div
        ref={pdfRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0, left: '-9999px',
          width: `${mmn(210)}px`,
          height: `${mmn(297)}px`,
          overflow: 'visible',
          boxSizing: 'border-box',
          zIndex: -1,
        }}
      >
        <CardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
      </div>

    </div>
  );
}
