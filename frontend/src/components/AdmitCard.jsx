import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, Printer, User, Camera, Calendar, MapPin, Clock, BookOpen, FileText, Shield, CheckCircle, Award, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Convert mm to pixels at 96 DPI
const mmToPx = (mm) => mm * 3.7795;

function VerticalAdmitCardContent({ student, admitCard, branch, qrUrl, scale = 1 }) {
  const s = (val) => val * scale;
  const px = (mm) => `${mmToPx(mm) * scale}px`;

  const rollNumber = admitCard?.rollNumber || student?.rollNumber || student?.enrollmentNumber || 'KCI20260001';
  const formNumber = admitCard?.formNo || admitCard?.formNumber || student?.formNo || `KCI-FORM-${admitCard?._id?.toString()?.slice(-6)?.toUpperCase() || '898192'}`;
  const enrollmentNumber = admitCard?.enrollmentNumber || student?.enrollmentNumber || rollNumber;
  const session = admitCard?.session || admitCard?.batch || student?.batch || '2026';
  const studentName = admitCard?.studentName || student?.name || student?.studentName || '—';
  const fatherName = admitCard?.fatherName || student?.fatherName || '—';
  const motherName = admitCard?.motherName || student?.motherName || '—';
  const dob = admitCard?.dob || (student?.dob ? new Date(student.dob).toLocaleDateString('en-IN') : '—');
  const gender = admitCard?.gender || student?.gender || '—';
  const category = admitCard?.category || student?.category || 'General';
  const courseName = admitCard?.courseName || admitCard?.course || student?.courseName || student?.course || '—';
  const examType = admitCard?.examType || 'Regular (Theory + Practical)';
  const address = admitCard?.address || student?.address || '—';
  
  const examDate = admitCard?.examDate
    ? new Date(admitCard.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : (admitCard?.schedule?.examDate ? new Date(admitCard.schedule.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'As Per Schedule');
  
  const examCenter = admitCard?.examCenter || admitCard?.schedule?.examCenter || branch?.branchName || 'Keerti Computer Institute, Main Campus, Ayodhya';
  const reportingTime = admitCard?.reportingTime || admitCard?.schedule?.reportingTime || '9:15 AM';
  const issueDate = admitCard?.updatedAt ? new Date(admitCard.updatedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const serialNo = admitCard?.serialNumber || admitCard?.admitCardSerial || 'KCI-0001';
  const studentPhoto = admitCard?.studentPhoto || student?.photo || null;
  const studentSignature = admitCard?.studentSignature || student?.signature || null;

  const candidateFields = [
    ['Candidate Name', studentName],
    ['Form No', formNumber],
    ['Enrollment No', enrollmentNumber],
    ['Roll Number', rollNumber],
    ['Course Enrolled', courseName],
    ["Father's Name", fatherName],
    ["Mother's Name", motherName],
    ['Date Of Birth', dob],
    ['Gender', gender],
    ['Category', category],
    ['Batch / Session', session],
    ['Exam Type', examType],
    ['Full Address', address],
  ];

  return (
    <div 
      className="admit-card-vertical-container"
      style={{
        width: px(210),            // 210mm (A4 Portrait Width)
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        background: '#F8FAFC',
        border: `${s(3)}px solid #F4C542`,
        borderRadius: `${s(14)}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: `0 ${s(10)}px ${s(25)}px rgba(11,45,92,0.15)`,
      }}
    >

      {/* ── 1. HEADER SECTION (DARK NAVY BANNER) ── */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0B2D5C 0%, #163F73 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: `${s(10)}px ${s(14)}px`,
          gap: `${s(12)}px`,
          borderBottom: `${s(3)}px solid #F4C542`,
          flexShrink: 0,
        }}
      >
        {/* Left: Institute Logo */}
        <div style={{
          width: px(22), height: px(22), borderRadius: '50%',
          background: '#ffffff', border: `${s(2)}px solid #F4C542`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${s(8)}px rgba(244,197,66,0.5)`,
        }}>
          <img src="/logo.png" alt="KCI Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Center: Institute Details */}
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ color: '#FFFFFF', fontWeight: 950, fontSize: `${s(16)}px`, letterSpacing: `${s(0.5)}px`, lineHeight: 1.2 }}>
            KEERTI COMPUTER INSTITUTE
          </div>
          <div style={{ color: '#F4C542', fontSize: `${s(10)}px`, fontWeight: 800, marginTop: `${s(1)}px` }}>
            The College of IT
          </div>
          <div style={{ color: '#CBD5E1', fontSize: `${s(7.5)}px`, marginTop: `${s(2)}px`, lineHeight: 1.4 }}>
            ISO Reg.: UAS/2017/155491 &nbsp;|&nbsp; MHRD Regd. &nbsp;|&nbsp; Society Reg.: 1373/2005
          </div>
          <div style={{ color: '#94A3B8', fontSize: `${s(7.5)}px`, lineHeight: 1.4 }}>
            info@kci.org.in &nbsp;|&nbsp; Mob: 9936384736 / 9919660880 &nbsp;|&nbsp; www.kci.org.in
          </div>
        </div>

        {/* Right: Gold Badge Header */}
        <div style={{
          background: 'linear-gradient(135deg, #F4C542 0%, #D4A325 100%)',
          borderRadius: `${s(8)}px`,
          padding: `${s(6)}px ${s(10)}px`,
          flexShrink: 0, textAlign: 'center',
          border: `${s(1)}px solid #FFE485`,
          boxShadow: `0 ${s(2)}px ${s(6)}px rgba(0,0,0,0.2)`,
        }}>
          <div style={{ color: '#0B2D5C', fontWeight: 950, fontSize: `${s(11)}px`, lineHeight: 1.2, whiteSpace: 'nowrap' }}>EXAMINATION</div>
          <div style={{ color: '#0B2D5C', fontWeight: 950, fontSize: `${s(11)}px`, lineHeight: 1.2, whiteSpace: 'nowrap' }}>ADMIT CARD</div>
          <div style={{ color: '#163F73', fontSize: `${s(9)}px`, fontWeight: 800, marginTop: `${s(1)}px` }}>{new Date().getFullYear()}</div>
        </div>
      </div>

      {/* ── 2. QUICK INFO BAR (3 EQUAL CARDS) ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        background: '#FFFFFF', borderBottom: `${s(1.5)}px solid #CBD5E1`, flexShrink: 0,
      }}>
        {[
          { icon: '👤', label: 'ROLL NUMBER', value: rollNumber, color: '#0B2D5C' },
          { icon: '📄', label: 'FORM NO', value: formNumber, color: '#163F73' },
          { icon: '📅', label: 'SESSION', value: session, color: '#0B2D5C' },
        ].map((card, i) => (
          <div key={card.label} style={{
            background: i % 2 === 0 ? '#F8FAFC' : '#F1F5F9',
            borderRight: i < 2 ? `${s(1.5)}px solid #CBD5E1` : 'none',
            padding: `${s(6)}px ${s(8)}px`,
            display: 'flex', alignItems: 'center', gap: `${s(8)}px`,
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: `${s(12)}px` }}>{card.icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#64748B', fontSize: `${s(7.5)}px`, fontWeight: 800, letterSpacing: `${s(0.5)}px` }}>{card.label}</span>
              <span style={{ color: card.color, fontSize: `${s(11.5)}px`, fontWeight: 950, fontFamily: 'monospace' }}>{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. MAIN CONTENT SECTION (LEFT 68% / RIGHT 32%) ── */}
      <div style={{
        display: 'flex',
        position: 'relative', background: '#FFFFFF',
        borderBottom: `${s(1.5)}px solid #CBD5E1`, flexShrink: 0,
      }}>

        {/* Dynamic Website Logo Center Watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '34%',
          transform: 'translate(-50%, -50%)',
          width: px(85), height: px(85),
          opacity: 0.06, pointerEvents: 'none', zIndex: 0,
        }}>
          <img src="/logo.png" alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* LEFT 68%: CANDIDATE DETAILS */}
        <div style={{
          flex: '0 0 68%',
          padding: `${s(8)}px ${s(10)}px`,
          zIndex: 1, display: 'flex', flexDirection: 'column', gap: `${s(2)}px`,
          borderRight: `${s(1.5)}px solid #CBD5E1`,
        }}>
          {/* Section Header */}
          <div style={{
            background: '#0B2D5C', color: '#FFFFFF',
            padding: `${s(4)}px ${s(8)}px`, borderRadius: `${s(5)}px`,
            fontSize: `${s(9)}px`, fontWeight: 900, letterSpacing: `${s(0.8)}px`,
            display: 'flex', alignItems: 'center', gap: `${s(5)}px`, marginBottom: `${s(4)}px`,
          }}>
            <span>👤 CANDIDATE DETAILS</span>
          </div>

          {/* Structured Field Rows - Comfortable Line Heights (NO OVERLAP) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${s(3.5)}px` }}>
            {candidateFields.map(([label, value], i) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center',
                minHeight: `${s(17)}px`,
                background: i % 2 === 0 ? '#F8FAFC' : '#F1F5F9',
                borderBottom: `${s(1)}px solid #E2E8F0`,
                padding: `${s(2.5)}px ${s(6)}px`,
                borderRadius: `${s(4)}px`,
              }}>
                <span style={{ color: '#0B2D5C', fontWeight: 800, fontSize: `${s(9.5)}px`, width: `${s(105)}px`, shrink: 0 }}>{label}</span>
                <span style={{ color: '#0B2D5C', fontWeight: 900, fontSize: `${s(9.5)}px`, margin: `0 ${s(4)}px` }}>:</span>
                <span style={{ color: '#1E293B', fontWeight: 700, fontSize: `${s(9.5)}px`, lineHeight: 1.3, wordBreak: 'break-word', flex: 1 }}>
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 32%: CANDIDATE PHOTO + QR + SIGNATURE */}
        <div style={{
          flex: '0 0 32%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: `${s(8)}px ${s(8)}px`, zIndex: 1, background: '#F8FAFC',
          gap: `${s(10)}px`,
        }}>
          
          {/* Candidate Photo Card */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: '#0B2D5C', color: '#FFFFFF', width: '100%',
              padding: `${s(3)}px 0`, borderRadius: `${s(4)}px`, textAlign: 'center',
              fontSize: `${s(8)}px`, fontWeight: 900, marginBottom: `${s(6)}px`,
            }}>
              📷 CANDIDATE PHOTO
            </div>

            <div style={{
              width: px(30), height: px(40), // 3:4 portrait aspect ratio
              border: `${s(2)}px solid #F4C542`, borderRadius: `${s(6)}px`,
              overflow: 'hidden', background: '#E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 ${s(2)}px ${s(6)}px rgba(0,0,0,0.1)`,
            }}>
              {studentPhoto ? (
                <img src={studentPhoto} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                  <User size={s(20)} style={{ margin: '0 auto' }} />
                  <span style={{ fontSize: `${s(7.5)}px`, fontWeight: 800, display: 'block' }}>PHOTO</span>
                </div>
              )}
            </div>
          </div>

          {/* Real Dynamic QR Verification Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${s(3)}px` }}>
            <div style={{
              width: px(30), height: px(30),
              border: `${s(1.5)}px solid #F4C542`, borderRadius: `${s(6)}px`,
              background: '#FFFFFF', padding: `${s(2)}px`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 ${s(2)}px ${s(6)}px rgba(0,0,0,0.08)`,
            }}>
              {qrUrl ? (
                <img src={qrUrl} alt="Verification QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: `${s(7.5)}px`, color: '#94A3B8' }}>QR Code</span>
              )}
            </div>
            <span style={{ color: '#0B2D5C', fontSize: `${s(7)}px`, fontWeight: 900, letterSpacing: `${s(0.5)}px` }}>
              🔒 SCAN TO VERIFY
            </span>
          </div>

          {/* Candidate Signature Box */}
          <div style={{
            width: '92%', border: `${s(1)}px solid #F4C542`,
            borderRadius: `${s(5)}px`, background: '#FFFDF5',
            padding: `${s(4)}px ${s(4)}px`, textAlign: 'center',
          }}>
            {studentSignature ? (
              <img src={studentSignature} alt="Signature" style={{ height: px(9), objectFit: 'contain', margin: '0 auto' }} />
            ) : (
              <div style={{ height: px(9), borderBottom: `${s(1)}px dashed #CBD5E1`, marginBottom: `${s(2)}px` }} />
            )}
            <span style={{ color: '#0B2D5C', fontSize: `${s(7.5)}px`, fontWeight: 800 }}>CANDIDATE SIGNATURE</span>
          </div>

        </div>
      </div>

      {/* ── 4. EXAMINATION DETAILS SECTION (4 CARDS) ── */}
      <div style={{ borderBottom: `${s(1.5)}px solid #CBD5E1`, flexShrink: 0 }}>
        <div style={{ background: '#0B2D5C', padding: `${s(3)}px 0`, textAlign: 'center' }}>
          <span style={{ color: '#F4C542', fontSize: `${s(9)}px`, fontWeight: 950, letterSpacing: `${s(1)}px` }}>
            📋 EXAMINATION DETAILS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: '#FFFFFF' }}>
          {[
            { icon: '📅', label: 'EXAM DATE', value: examDate },
            { icon: '🏢', label: 'EXAM CENTER', value: examCenter },
            { icon: '⏰', label: 'REPORTING TIME', value: reportingTime },
            { icon: '📄', label: 'EXAM TYPE', value: examType },
          ].map((item, i) => (
            <div key={item.label} style={{
              borderRight: i < 3 ? `${s(1.5)}px solid #CBD5E1` : 'none',
              background: i % 2 === 0 ? '#F8FAFC' : '#F1F5F9',
              padding: `${s(6)}px ${s(6)}px`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textCenter: 'center',
            }}>
              <span style={{ color: '#64748B', fontSize: `${s(7.5)}px`, fontWeight: 800, letterSpacing: `${s(0.5)}px` }}>{item.icon} {item.label}</span>
              <span style={{ color: '#0B2D5C', fontSize: `${s(9.5)}px`, fontWeight: 950, marginTop: `${s(2)}px`, textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {item.value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. IMPORTANT INSTRUCTIONS & CONTROLLER SECTION ── */}
      <div style={{
        display: 'flex',
        border: `${s(1.5)}px solid #F4C542`,
        margin: `${s(4)}px ${s(6)}px`,
        borderRadius: `${s(8)}px`,
        background: '#FFFDF5',
        flexShrink: 0,
      }}>
        {/* Left: 5 Numbered Instructions */}
        <div style={{ flex: 1, padding: `${s(6)}px ${s(8)}px` }}>
          <div style={{
            background: '#F4C542', color: '#0B2D5C',
            borderRadius: `${s(4)}px`, padding: `${s(2)}px ${s(6)}px`,
            display: 'inline-block', marginBottom: `${s(3)}px`,
          }}>
            <span style={{ fontSize: `${s(8)}px`, fontWeight: 950, letterSpacing: `${s(0.5)}px` }}>
              IMPORTANT INSTRUCTIONS
            </span>
          </div>
          {[
            '1. Candidate must carry this Admit Card and a valid original Photo ID proof.',
            '2. Report at least 30 minutes before the scheduled examination time.',
            '3. Mobile phones, smartwatches, and electronic devices are strictly prohibited.',
            '4. This Admit Card is non-transferable. Impersonation is a punishable offense.',
            '5. Candidates without this Admit Card will not be permitted to enter the exam hall.',
          ].map((inst, idx) => (
            <div key={idx} style={{ color: '#1E293B', fontSize: `${s(7.5)}px`, lineHeight: 1.35, fontWeight: 600 }}>
              {inst}
            </div>
          ))}
        </div>

        {/* Right: Controller of Examination Area */}
        <div style={{
          width: px(45),
          borderLeft: `${s(1.5)}px solid #F4C542`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: `${s(4)}px`, background: '#FFFFFF',
          borderRadius: `0 ${s(7)}px ${s(7)}px 0`,
        }}>
          <div style={{
            width: px(34), height: px(12),
            border: `${s(1)}px solid #CBD5E1`, borderRadius: `${s(4)}px`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#FFFDF5', position: 'relative',
          }}>
            <img src="/logo.png" alt="Seal" style={{ width: px(7), height: px(7), opacity: 0.8 }} />
            <div style={{ width: '85%', borderTop: `${s(1)}px solid #64748B`, marginTop: `${s(2)}px` }} />
          </div>
          <span style={{ color: '#0B2D5C', fontSize: `${s(7.5)}px`, fontWeight: 900, textAlign: 'center', marginTop: `${s(2)}px`, lineHeight: 1.2 }}>
            CONTROLLER OF<br />EXAMINATION
          </span>
        </div>
      </div>

      {/* ── 6. PREMIUM FOOTER ── */}
      <div style={{
        background: '#0B2D5C',
        margin: `0 ${s(6)}px ${s(5)}px`,
        borderRadius: `0 0 ${s(8)}px ${s(8)}px`,
        padding: `${s(4)}px ${s(10)}px`,
        display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
        borderTop: `${s(2)}px solid #F4C542`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${s(3)}px` }}>
          <span style={{ color: '#F4C542', fontSize: `${s(7.5)}px` }}>📅</span>
          <div>
            <span style={{ color: '#94A3B8', fontSize: `${s(7)}px`, display: 'block' }}>ISSUE DATE</span>
            <span style={{ color: '#FFFFFF', fontSize: `${s(8.5)}px`, fontWeight: 900, fontFamily: 'monospace' }}>{issueDate}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#F4C542', fontSize: `${s(8)}px`, fontWeight: 900, letterSpacing: `${s(0.5)}px`, display: 'block' }}>
            Skills Today, Better Tomorrow
          </span>
          <span style={{ color: '#CBD5E1', fontSize: `${s(7)}px` }}>www.kci.org.in</span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#94A3B8', fontSize: `${s(7)}px`, display: 'block' }}>SERIAL NO</span>
          <span style={{ color: '#FFFFFF', fontSize: `${s(8.5)}px`, fontWeight: 900, fontFamily: 'monospace' }}>{serialNo}</span>
        </div>
      </div>

    </div>
  );
}

export default function AdmitCard({ student, admitCard, branch }) {
  const pdfRef = useRef(null);
  const printRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [exporting, setExporting] = useState(false);

  // Generate dynamic QR code targeting real verification URL
  useEffect(() => {
    const token = admitCard?.verificationToken || student?.verificationToken || admitCard?.enrollmentNumber || student?.rollNumber || 'kci-verify-token';
    const verifyUrl = `${window.location.origin}/verify-admit-card/${encodeURIComponent(token)}`;

    QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#0B2D5C', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => {});
  }, [student, admitCard]);

  // High-Quality A4 Portrait PDF Export
  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    try {
      const el = pdfRef.current;
      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 100));

      // Pre-load all images inside el
      const imgs = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = resolve;
              img.onerror = resolve;
            })
        )
      );

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
        width: mmToPx(210),
        windowWidth: mmToPx(210),
      });

      el.style.display = 'none';
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Create A4 Portrait PDF with natural content height
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgHeightMm = (canvas.height / canvas.width) * 210;
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, Math.min(imgHeightMm, 297));
      
      const fileName = `AdmitCard_${(admitCard?.enrollmentNumber || student?.rollNumber || 'KCI').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      toast.success('Admit Card downloaded in clean A4 Portrait PDF format!');
    } catch (err) {
      console.error('Admit Card download error:', err);
      toast.error('PDF download failed. Please try again.');
    } finally {
      if (pdfRef.current) pdfRef.current.style.display = 'none';
      setExporting(false);
    }
  };

  // Dedicated Print Function
  const handlePrint = async () => {
    if (!printRef.current) return;
    const el = printRef.current;
    el.style.display = 'block';
    await new Promise(r => setTimeout(r, 100));

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admit Card — Keerti Computer Institute</title>
            <style>
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .admit-card-vertical-container { margin: 0 auto; box-shadow: none !important; }
            </style>
          </head>
          <body>
            ${el.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          el.style.display = 'none';
        }, 2000);
      }, 300);
    } catch (err) {
      console.error('Admit Card print error:', err);
      toast.error('Print failed. Please try again.');
      el.style.display = 'none';
    }
  };

  // Preview Scale Factor for Screen
  const previewScale = typeof window !== 'undefined'
    ? (window.innerWidth < 480 ? 0.38 : window.innerWidth < 768 ? 0.55 : 0.85)
    : 0.85;

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating PDF...' : 'Download PDF (A4 Portrait)'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Admit Card</span>
        </button>
      </div>

      {/* Screen Preview Container */}
      <div className="w-full overflow-hidden flex justify-center py-2">
        <div 
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top center',
            width: mmToPx(210),
            marginBottom: `-${mmToPx(297) * (1 - previewScale)}px`,
          }}
        >
          <VerticalAdmitCardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
        </div>
      </div>
      <p className="text-xs text-slate-400 font-bold -mt-2">
        A4 Official Admit Card Preview — Zero text overlap. Scan QR code to verify.
      </p>

      {/* Hidden Container for High Resolution PDF Capture */}
      <div 
        ref={pdfRef} 
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: mmToPx(210),
          zIndex: -1,
        }}
      >
        <VerticalAdmitCardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
      </div>

      {/* Hidden Container for Print Execution */}
      <div 
        ref={printRef} 
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: mmToPx(210),
          zIndex: -1,
        }}
      >
        <VerticalAdmitCardContent student={student} admitCard={admitCard} branch={branch} qrUrl={qrUrl} scale={1} />
      </div>

    </div>
  );
}
