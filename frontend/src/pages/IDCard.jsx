import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, User, QrCode, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function IDCardPage() {
  const { user } = useAuth();
  const cardRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!user) return toast.error('Please login first');
    setDownloading(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
      const w = 85.6, h = 54;

      // Background
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, w, h, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, w, 14, 'F');

      // Header
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text('KEERTI COMPUTER INSTITUTE', w / 2, 6, { align: 'center' });
      doc.setFontSize(5); doc.setFont('helvetica', 'normal');
      doc.text('Government Recognized | Ayodhya, U.P.', w / 2, 10, { align: 'center' });

      // Photo placeholder
      doc.setFillColor(200, 200, 200);
      doc.rect(4, 16, 18, 22, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(4);
      doc.text('PHOTO', 13, 28, { align: 'center' });

      // Student Info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text(user.name || 'Student Name', 26, 20);
      doc.setFontSize(5); doc.setFont('helvetica', 'normal');
      doc.text(`Father: ${user.fatherName || 'N/A'}`, 26, 25);
      doc.text(`Course: ${user.courseName || 'N/A'}`, 26, 29);
      doc.text(`DOB: ${user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'N/A'}`, 26, 33);
      doc.text(`Roll No: ${user.rollNumber || 'N/A'}`, 26, 37);
      doc.text(`Form No: ${user.formNo || 'N/A'}`, 26, 41);

      // QR placeholder
      doc.setFillColor(255, 255, 255);
      doc.rect(68, 16, 14, 14, 'F');
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(3.5);
      doc.text('QR CODE', 75, 25, { align: 'center' });

      // Footer
      doc.setFillColor(250, 204, 21);
      doc.rect(0, 46, w, 8, 'F');
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(5); doc.setFont('helvetica', 'bold');
      doc.text('Ph: 9936384736 | www.kci.org.in', w / 2, 51, { align: 'center' });

      doc.save(`KCI_ID_${user.rollNumber || 'card'}.pdf`);
      toast.success('ID Card downloaded!');
    } catch (err) {
      toast.error('Download failed');
    }
    setDownloading(false);
  };

  if (!user) return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><p className="text-gray-500 mb-4">Please login to view your ID card</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold">Login</a></div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-teal-600 to-cyan-700 py-12 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Student <span className="text-yellow-400">ID Card</span></h1>
          <p className="text-teal-200">Download your official KCI student ID card</p>
        </motion.div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* ID Card Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          ref={cardRef}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8"
          style={{ aspectRatio: '85.6/54', maxWidth: '500px', margin: '0 auto 2rem' }}>

          {/* Card Header */}
          <div className="bg-white px-4 py-3 flex items-center gap-3 border-b-4 border-blue-700">
            <img src="/logo.png" alt="KCI" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-blue-800 font-black text-sm">KEERTI COMPUTER INSTITUTE</div>
              <div className="text-blue-500 text-[10px]">Government Recognized | Ayodhya, U.P.</div>
            </div>
          </div>

          {/* Card Body */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-4 flex gap-4">
            {/* Photo */}
            <div className="w-20 h-24 bg-white/20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/30">
              {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-white/60" />}
            </div>

            {/* Info */}
            <div className="flex-1 text-white space-y-1">
              <div className="font-black text-base">{user.name}</div>
              <div className="text-xs text-blue-200">Father: {user.fatherName || 'N/A'}</div>
              <div className="text-xs text-blue-200">Course: {user.courseName || 'N/A'}</div>
              <div className="text-xs text-blue-200">DOB: {user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'N/A'}</div>
              <div className="text-xs text-yellow-300 font-bold">Roll No: {user.rollNumber || 'N/A'}</div>
              <div className="text-xs text-blue-200">Form No: {user.formNo || 'N/A'}</div>
            </div>

            {/* QR */}
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-blue-800" />
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-yellow-400 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-800" />
              <span className="text-blue-800 text-xs font-bold">Govt. Recognized</span>
            </div>
            <span className="text-blue-800 text-xs font-bold">Ph: 9936384736</span>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.button onClick={handleDownload} disabled={downloading}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60">
          {downloading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-6 h-6" />}
          {downloading ? 'Generating PDF...' : 'Download ID Card PDF'}
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-4">
          * This is an official KCI student ID card. Keep it safe.
        </p>
      </div>
    </div>
  );
}
