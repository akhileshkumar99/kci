import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Award, BookOpen, ArrowRight, CheckCircle, Star, Phone, MapPin, TrendingUp, Building2, X, Laptop, Clock, BadgeCheck, Newspaper, PlayCircle, FileText, Wifi, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import SectionTitle from '../components/SectionTitle';

const counterData = [
  { icon: Users, label: 'Students Enrolled', value: 10000, suffix: '+', color: 'from-blue-600 to-indigo-700', bg: 'hover:bg-blue-50/80', border: 'hover:border-blue-300' },
  { icon: BookOpen, label: 'Courses Offered', value: 21, suffix: '+', color: 'from-emerald-600 to-teal-700', bg: 'hover:bg-emerald-50/80', border: 'hover:border-emerald-300' },
  { icon: Award, label: 'Years Experience', value: 18, suffix: '+', color: 'from-violet-600 to-purple-700', bg: 'hover:bg-violet-50/80', border: 'hover:border-violet-300' },
  { icon: Building2, label: 'Branches', value: 30, suffix: '+', color: 'from-amber-600 to-orange-700', bg: 'hover:bg-amber-50/80', border: 'hover:border-amber-300' },
  { icon: TrendingUp, label: 'Placement Rate', value: 95, suffix: '%', color: 'from-cyan-600 to-blue-700', bg: 'hover:bg-cyan-50/80', border: 'hover:border-cyan-300' },
];

function Counter({ value, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 40;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: Users, label: 'Students Enrolled', value: '10,000+' },
  { icon: BookOpen, label: 'Courses Offered', value: '25+' },
  { icon: Award, label: 'Years Experience', value: '18+' },
  { icon: MapPin, label: 'Branches', value: '30+' },
];

const features = [
  'Government Recognized Certificates',
  'Experienced & Qualified Faculty',
  'Modern Computer Labs',
  'Placement Assistance',
  'Affordable Fee Structure',
  'Flexible Batch Timings',
];

const testimonials = [
  { name: 'Akhilesh Infotech', course: 'Fullstack Developer', text: 'Keerti computer institute is the best institute with top-notch faculty and lab facilities.', rating: 5 },
  { name: 'Priya Sharma', course: 'DCA', text: 'KCI helped me get my first IT job. The faculty is excellent and practical hands-on learning is great.', rating: 5 },
  { name: 'Rahul Verma', course: 'Tally with GST', text: 'Best computer training center. Learned Tally GST here and working as an accountant now.', rating: 5 },
  { name: 'Anjali Singh', course: 'Web Design', text: 'The web development course was amazing. Built complete websites within 2 months.', rating: 5 },
];

const govtAffiliations = [
  { name: 'NIELIT', bg: 'bg-blue-50', text: 'text-blue-900', icon: GraduationCap },
  { name: 'Ministry of IT', bg: 'bg-indigo-50', text: 'text-indigo-900', icon: Building2 },
  { name: 'NSDC', bg: 'bg-emerald-50', text: 'text-emerald-900', icon: Award },
  { name: 'Skill India', bg: 'bg-amber-50', text: 'text-amber-900', icon: Zap },
  { name: 'Govt. of UP', bg: 'bg-purple-50', text: 'text-purple-900', icon: ShieldCheck },
  { name: 'Digital India', bg: 'bg-cyan-50', text: 'text-cyan-900', icon: Laptop },
  { name: 'ISO Certified', bg: 'bg-teal-50', text: 'text-teal-900', icon: BadgeCheck },
];

function TestimonialsSection() {
  const [reviews, setReviews] = useState(testimonials);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', course: '', text: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.text.trim()) return;
    setReviews(prev => [{ ...newReview }, ...prev]);
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setNewReview({ name: '', course: '', text: '', rating: 5 }); }, 2000);
  };

  return (
    <section className="py-16 bg-slate-100/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Student Feedback
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Student Reviews</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">What our students say about their learning experience at KCI</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 self-start sm:self-auto">
            <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-8">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Thank you for your review! 🎉</h3>
                  <p className="text-slate-600 text-xs mt-1">Your feedback has been added successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Share Your Experience</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Your Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setNewReview(r => ({ ...r, rating: s }))} className="focus:outline-none hover:scale-110 transition-transform duration-150">
                          <Star className={`w-7 h-7 ${s <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Your Name *</label>
                      <input value={newReview.name} onChange={e => setNewReview(r => ({ ...r, name: e.target.value }))} placeholder="Full name" required
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-xs sm:text-sm font-medium text-slate-900" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Course Name</label>
                      <input value={newReview.course} onChange={e => setNewReview(r => ({ ...r, course: e.target.value }))} placeholder="e.g. DCA, Tally, Web Design"
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-xs sm:text-sm font-medium text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Review *</label>
                    <textarea value={newReview.text} onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))} placeholder="Share your experience at KCI..." rows={3} required
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-xs sm:text-sm font-medium text-slate-900 resize-none" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-150">
                    Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding Reviews */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {reviews.map((t, i) => (
              <div key={i} className="w-full flex-shrink-0 px-2">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  </div>
                  <blockquote className="text-base sm:text-xl text-slate-900 font-bold leading-relaxed mb-4 italic">
                    "{t.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                      {t.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{t.name}</div>
                      {t.course && <div className="text-blue-700 text-xs font-bold">{t.course}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-1.5 mt-6">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-200 ${i === currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const notices = [
  { text: 'New Batch Starting: DCA & ADCA — 1st of Every Month', badge: '📢 BATCH' },
  { text: 'KCI Students Achieved 95% Placement Rate', badge: '🏆 PLACEMENT' },
  { text: 'Free Demo Class Available — Register Now!', badge: '⚡ DEMO' },
  { text: 'Government Recognized Certificates Accepted Nationwide', badge: '🎓 CERTIFIED' },
  { text: 'Admission Open for All Courses — Limited Seats!', badge: '📅 ADMISSION' },
];

const steps = [
  { icon: FileText, stepNum: '01', title: 'Fill Admission Form', desc: 'Online ya offline form bharo, simple process hai', color: 'from-blue-600 to-indigo-700' },
  { icon: BadgeCheck, stepNum: '02', title: 'Course Select Karo', desc: '25+ courses mein se apni pasand ka course chuno', color: 'from-violet-600 to-purple-700' },
  { icon: Laptop, stepNum: '03', title: 'Classes Join Karo', desc: 'Modern labs mein expert faculty se seekho', color: 'from-emerald-600 to-teal-700' },
  { icon: Award, stepNum: '04', title: 'Certificate Pao', desc: 'Government recognized certificate haasil karo', color: 'from-amber-600 to-orange-700' },
];

const certBadges = [
  { label: 'ISO Certified', icon: ShieldCheck },
  { label: 'Govt. Recognized', icon: BadgeCheck },
  { label: 'NIELIT Affiliated', icon: GraduationCap },
  { label: 'Nationally Accepted', icon: Award },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [popup, setPopup] = useState(false);
  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);

  useEffect(() => {
    api.get('/courses?featured=true').then(({ data }) => {
      const excluded = ['CCA', 'COPT', 'CIF'];
      setCourses((data.courses || []).filter(c => !excluded.some(code => c.title?.includes(code))));
    }).catch(() => { });
    api.get('/admit-card/setting').then(({ data }) => setAdmitCardEnabled(data.enabled)).catch(() => { });
    const timer = setTimeout(() => setPopup(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50 text-slate-900">

      {/* Welcome Popup */}
      {popup && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPopup(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full"
          >
            <button
              onClick={() => setPopup(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white hover:bg-slate-100 text-slate-900 rounded-full flex items-center justify-center shadow-xl transition-all duration-150 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/popup.jpg"
              alt="KCI Welcome Notice"
              className="w-full h-auto object-contain rounded-3xl shadow-2xl border-4 border-white/20"
            />
          </div>
        </div>
      )}

      {/* Premium Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-950 pt-6 pb-16 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-900/95 to-indigo-950/95" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-white text-xs sm:text-sm mb-5 border border-white/15 bg-white/10 backdrop-blur-md shadow-md">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-extrabold tracking-wide">Government Recognized Institute</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] mb-5 tracking-tight">
              Shape Your Future with{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent block mt-1">
                Digital Skills
              </span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base mb-7 leading-relaxed font-medium max-w-2xl">
              Join Keerti Computer Institute — top rated computer training center with <strong className="text-amber-300 font-black">18+ years</strong> of excellence, <strong className="text-amber-300 font-black">10,000+</strong> successful students, and <strong className="text-amber-300 font-black">25+</strong> industry-relevant courses.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3.5 mb-8">
              <Link to="/admission"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-xs sm:text-sm transition-all duration-150">
                Apply for Admission <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl border border-white/25 bg-white/10 backdrop-blur-md text-xs sm:text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-150">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-3 pt-5 border-t border-white/15 max-w-xl">
              {[
                { val: '10K+', lbl: 'Students' },
                { val: '25+', lbl: 'Courses' },
                { val: '18+', lbl: 'Years' },
                { val: '95%', lbl: 'Placement' },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="text-left group cursor-default">
                  <div className="text-lg sm:text-2xl font-black text-amber-300 group-hover:text-yellow-200 transition-colors">{val}</div>
                  <div className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{lbl}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Featured Programs
                </div>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">2026 Academic</span>
              </div>

              {[
                { icon: GraduationCap, title: 'DCA / ADCA', desc: 'Diploma in Computer Application', badge: '12 Months', color: 'from-blue-600 to-indigo-700' },
                { icon: Award, title: 'Tally with GST', desc: 'Professional Accounting Course', badge: '4 Months', color: 'from-emerald-600 to-teal-700' },
                { icon: BookOpen, title: 'Web Design', desc: 'HTML, CSS, JavaScript & More', badge: '6 Months', color: 'from-purple-600 to-violet-700' },
              ].map(({ icon: Icon, title, desc, badge, color }) => (
                <div key={title}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-black text-xs sm:text-sm truncate">{title}</div>
                    <div className="text-slate-300 text-[11px] font-medium truncate">{desc}</div>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md shrink-0 border border-amber-400/20">{badge}</span>
                </div>
              ))}

              <div className="pt-1 text-center">
                <Link to="/courses" className="text-amber-300 text-xs font-bold hover:underline inline-flex items-center gap-1">
                  + 22 more courses available <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Announcement Marquee Ticker */}
      <div className="bg-slate-900 text-white py-2.5 border-y border-slate-800 overflow-hidden">
        <div className="animate-marquee flex items-center gap-0">
          {[...notices, ...notices].map((n, i) => (
            <div key={i} className="flex items-center gap-3 px-6 whitespace-nowrap text-xs font-semibold text-slate-200 border-r border-slate-800">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">{n.badge}</span>
              <span>{n.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <section className="py-14 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {counterData.map(({ icon: Icon, label, value, suffix, color, bg, border }) => (
              <div key={label}
                className={`bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-150 ${bg} ${border}`}>
                <div className={`w-11 h-11 mx-auto mb-2.5 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black text-slate-900 mb-0.5">
                  <Counter value={value} suffix={suffix} />
                </div>
                <div className="text-xs text-slate-700 font-extrabold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="PROCESS" title="How It Works" subtitle="4 simple steps to start your computer training journey" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {steps.map(({ icon: Icon, stepNum, title, desc, color }, i) => (
              <div key={i}
                className="relative bg-white rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-150 text-center border border-slate-200/80 flex flex-col items-center"
              >
                <span className="absolute -top-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  STEP {stepNum}
                </span>
                <div className={`w-12 h-12 mx-auto mb-3 mt-1 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-6 text-white shadow-xl">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 text-amber-300 border border-white/20 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Certification
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Nationally Recognized Certificates</h2>
              <p className="text-slate-100 text-xs sm:text-sm mb-5 leading-relaxed font-medium">
                Our certificates are accepted in both government and private sector jobs across India.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {certBadges.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/15 hover:bg-white/20 transition-all duration-150">
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-white font-bold text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex flex-col items-center justify-center text-center p-3 shadow-xl">
                <BadgeCheck className="w-10 h-10 text-amber-400 mb-1" />
                <div className="text-white font-black text-sm">Govt.</div>
                <div className="text-amber-300 font-bold text-xs">Recognized</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Board & Online Services */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Notices */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-xs">
                  <Newspaper className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Notice Board</h2>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-full border border-red-200">LIVE</span>
              </div>
              <div className="space-y-2.5">
                {notices.map((n, i) => (
                  <div key={i}
                    className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-2xs border border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <span className="text-[10px] font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded shrink-0 border border-blue-200">
                      {n.badge}
                    </span>
                    <p className="text-slate-900 text-xs sm:text-sm font-bold">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Services */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Online Student Services</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: PlayCircle, label: 'Online Classes Available', color: 'text-blue-700', bg: 'bg-blue-50/80 border-blue-200' },
                  { icon: FileText, label: 'Digital Study Material', color: 'text-purple-700', bg: 'bg-purple-50/80 border-purple-200' },
                  { icon: Award, label: 'Online Result Verification', color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-200' },
                  { icon: BadgeCheck, label: 'Certificate Verification', color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-200' },
                  { icon: Clock, label: 'Flexible Batch Timings', color: 'text-teal-700', bg: 'bg-teal-50/80 border-teal-200' },
                  { icon: Phone, label: '24/7 Student Support', color: 'text-pink-700', bg: 'bg-pink-50/80 border-pink-200' },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div key={label} className={`flex items-center gap-3 ${bg} border rounded-xl px-3.5 py-2.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}>
                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                    <span className="text-slate-900 text-xs sm:text-sm font-extrabold">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="CATALOG" title="Featured Courses" subtitle="Industry-relevant computer programs designed to boost your career" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {courses.map((course, i) => <CourseCard key={course._id} course={course} index={i} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/courses" className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 text-xs sm:text-sm">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionTitle badge="ADVANTAGES" title="Why Choose KCI?" subtitle="We provide the best computer education with modern lab facilities" center={false} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 p-3 bg-white rounded-xl shadow-2xs border border-slate-200/80 hover:shadow-xs hover:border-blue-200 transition-all duration-150">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-900 text-xs sm:text-sm font-bold">{f}</span>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150 shadow-md text-xs sm:text-sm">
              Learn More About Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-xl font-black mb-5">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Check Examination Result', path: '/result', icon: Award },
                { label: 'Apply for Admission', path: '/admission', icon: GraduationCap },
                { label: 'Contact Us', path: '/contact', icon: Phone },
              ].map(({ label, path, icon: Icon }) => (
                <Link key={path} to={path} className="flex items-center gap-3 p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all duration-150 group border border-white/10 hover:shadow-md">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm">{label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admit Card Download */}
      {admitCardEnabled && (
        <section className="py-14 bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3.5 py-1 text-xs font-bold mb-3">
                  <FileText className="w-4 h-4 text-amber-300" /> Exam Season Active
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2">Download Your Admit Card</h2>
                <p className="text-slate-100 text-xs sm:text-sm max-w-md font-medium">Admit cards are now available. Enter your enrollment number to download your examination admit card instantly.</p>
              </div>
              <Link to="/admit-card"
                className="flex items-center gap-2 px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150 text-xs sm:text-sm whitespace-nowrap">
                <FileText className="w-4.5 h-4.5" /> Download Admit Card
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Government Affiliations */}
      <section className="py-14 bg-white overflow-hidden border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="TRUSTED" title="Government Recognized & Affiliated" subtitle="Recognized by government bodies and national skill development councils" />

          <div className="relative overflow-hidden mt-6">
            <div className="flex gap-4 animate-marquee">
              {['0', '1'].map((repeatKey) =>
                govtAffiliations.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={`${repeatKey}-${i}`} className={`flex-shrink-0 flex items-center gap-2.5 ${item.bg} rounded-xl px-4 py-3 shadow-2xs border border-slate-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}>
                      <ItemIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className={`font-black text-xs sm:text-sm ${item.text} whitespace-nowrap`}>{item.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
