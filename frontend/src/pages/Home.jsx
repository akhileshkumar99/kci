import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, Award, BookOpen, ArrowRight, CheckCircle, Star, Phone, MapPin, TrendingUp, Building2, X, Laptop, Clock, BadgeCheck, Newspaper, PlayCircle, FileText, Wifi } from 'lucide-react';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import SectionTitle from '../components/SectionTitle';

const counterData = [
  { icon: Users, label: 'Students Enrolled', value: 10000, suffix: '+', color: 'from-blue-500 to-blue-600', bg: 'hover:bg-blue-50', border: 'hover:border-blue-200' },
  { icon: BookOpen, label: 'Courses Offered', value: 21, suffix: '+', color: 'from-emerald-500 to-emerald-600', bg: 'hover:bg-emerald-50', border: 'hover:border-emerald-200' },
  { icon: Award, label: 'Years Experience', value: 18, suffix: '+', color: 'from-violet-500 to-violet-600', bg: 'hover:bg-violet-50', border: 'hover:border-violet-200' },
  { icon: Building2, label: 'Branches', value: 30, suffix: '+', color: 'from-orange-500 to-orange-600', bg: 'hover:bg-orange-50', border: 'hover:border-orange-200' },
  { icon: TrendingUp, label: 'Placement Rate', value: 95, suffix: '%', color: 'from-teal-500 to-teal-600', bg: 'hover:bg-teal-50', border: 'hover:border-teal-200' },
];

function Counter({ value, suffix, duration = 3500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
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
  { icon: MapPin, label: 'Branches', value: '10+' },
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
  { name: 'Akhilesh Infotech', course: 'Fullstack Developer', text: 'Keerti computer is institute best in india good faculty and facility', rating: 5 },
  { name: 'Priya Sharma', course: 'DCA', text: 'KCI helped me get my first job in IT. The faculty is excellent and the course content is very practical.', rating: 5 },
  { name: 'Rahul Verma', course: 'Tally with GST', text: 'Best institute for computer courses. I learned Tally here and now working as an accountant.', rating: 5 },
  { name: 'Anjali Singh', course: 'Web Design', text: 'The web design course was amazing. I built my first website within 2 months of joining.', rating: 5 },
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
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Student Reviews</h2>
            <p className="text-gray-500 mt-2">What our students say about us</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap">
            <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
            {showForm ? 'Cancel' : 'Write a Review'}
          </motion.button>
        </div>

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 mb-10">
              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Thank you for your review! 🎉</h3>
                  <p className="text-gray-500 text-sm mt-1">Your review has been added.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Share Your Experience</h3>
                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setNewReview(r => ({ ...r, rating: s }))}
                          className="transition-transform hover:scale-125">
                          <Star className={`w-8 h-8 transition-colors ${s <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Your Name *</label>
                      <input value={newReview.name} onChange={e => setNewReview(r => ({ ...r, name: e.target.value }))}
                        placeholder="Enter your name" required
                        className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 transition-all" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Course Name</label>
                      <input value={newReview.course} onChange={e => setNewReview(r => ({ ...r, course: e.target.value }))}
                        placeholder="e.g. DCA, Tally, Web Design"
                        className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Your Review *</label>
                    <textarea value={newReview.text} onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))}
                      placeholder="Share your experience at KCI..." rows={3} required
                      className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 transition-all resize-none" />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                    Submit Review
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding Reviews */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {reviews.map((t, i) => (
              <div key={i} className="w-full flex-shrink-0 px-4">
                <div className="text-center max-w-4xl mx-auto">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-5 h-5 ${j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                  </div>
                  <blockquote className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed mb-6 italic">
                    "{t.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{t.name}</div>
                      {t.course && <div className="text-blue-600 text-sm font-medium">{t.course}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const notices = [
  '🔔 New Batch Starting: DCA & ADCA — 1st of Every Month',
  '🏆 KCI Students Achieved 95% Placement Rate in 2024',
  '📢 Free Demo Class Available — Register Now!',
  '🎓 Government Recognized Certificates Accepted Nationwide',
  '💻 New Course Added: Artificial Intelligence & Machine Learning',
  '📅 Admission Open for All Courses — Limited Seats!',
];

const steps = [
  { icon: FileText, title: 'Fill Admission Form', desc: 'Online ya offline form bharo, simple process hai', color: 'from-blue-500 to-blue-600' },
  { icon: BadgeCheck, title: 'Course Select Karo', desc: '25+ courses mein se apni pasand ka course chuno', color: 'from-violet-500 to-violet-600' },
  { icon: Laptop, title: 'Classes Join Karo', desc: 'Modern labs mein expert faculty se seekho', color: 'from-emerald-500 to-emerald-600' },
  { icon: Award, title: 'Certificate Pao', desc: 'Government recognized certificate haasil karo', color: 'from-orange-500 to-orange-600' },
];

const certBadges = [
  { label: 'ISO Certified', icon: '🏅' },
  { label: 'Govt. Recognized', icon: '🏛️' },
  { label: 'NIELIT Affiliated', icon: '🎓' },
  { label: 'Nationally Accepted', icon: '🇮🇳' },
];

function MarqueeTicker() {
  return (
    <div className="bg-blue-700 text-white py-2 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {[...notices, ...notices].map((n, i) => (
          <span key={i} className="text-sm font-medium px-4">{n}</span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    api.get('/courses?featured=true').then(({ data }) => {
      const excluded = ['CCA', 'COPT', 'CIF'];
      setCourses((data.courses || []).filter(c => !excluded.some(code => c.title?.includes(code))));
    }).catch(() => {});
    const timer = setTimeout(() => setPopup(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-16">

      {/* Welcome Popup */}
      {popup && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
          onClick={() => setPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative"
          >
            <button
              onClick={() => setPopup(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
            <img
              src="/popup.jpg"
              alt="KCI Popup"
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Marquee Ticker */}
      <MarqueeTicker />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-blue-800/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white text-sm mb-6">
              <Award className="w-4 h-4 text-yellow-400" />
              Government Recognized Institute
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Shape Your Future with
              <span className="text-yellow-400"> Digital Skills</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Join Keerti Computer Institute — most trusted computer training center with 18+ years of excellence, 10,000+ successful students, and 25+ industry-relevant courses.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admission" className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                Apply for Admission
              </Link>
              <Link to="/courses" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-all duration-200 flex items-center gap-2">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Stats Mobile */}
      <section className="lg:hidden bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-blue-50 rounded-2xl p-4 text-center">
              <Icon className="w-7 h-7 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-500 text-xs">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Counters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {counterData.map(({ icon: Icon, label, value, suffix, color, bg, border }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.04 }}
                className={`bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default ${bg} ${border}`}>
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                  <Counter value={value} suffix={suffix} />
                </div>
                <div className="text-sm text-gray-500 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="How It Works" subtitle="4 simple steps mein apna career shuru karo" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {steps.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-center border border-gray-100"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex items-center justify-center shadow-lg">{i + 1}</div>
                <div className={`w-16 h-16 mx-auto mb-4 mt-2 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-blue-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate & Recognition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <div className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-2">Certifications</div>
              <h2 className="text-3xl font-black mb-3">Nationally Recognized Certificates</h2>
              <p className="text-blue-100 mb-6">Hamare certificates government aur private sector dono mein accepted hain. Apna career secure karo KCI ke saath.</p>
              <div className="grid grid-cols-2 gap-3">
                {certBadges.map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
                    <span className="text-xl">{icon}</span>
                    <span className="text-white font-semibold text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="flex-shrink-0"
            >
              <div className="w-48 h-48 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center text-center p-4">
                <BadgeCheck className="w-16 h-16 text-yellow-400 mb-2" />
                <div className="text-white font-black text-lg">Govt.</div>
                <div className="text-yellow-400 font-bold text-sm">Recognized</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notice Board */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Notices */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Notice Board</h2>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse">LIVE</span>
              </div>
              <div className="space-y-3">
                {notices.map((notice, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <p className="text-gray-700 text-sm font-medium">{notice}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Online Features */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Online Services</h2>
              </div>
              <div className="space-y-3">
                {[
                  { icon: PlayCircle, label: 'Online Classes Available', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: FileText, label: 'Digital Study Material', color: 'text-violet-600', bg: 'bg-violet-50' },
                  { icon: Award, label: 'Online Result Check', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: BadgeCheck, label: 'Certificate Verification', color: 'text-orange-600', bg: 'bg-orange-50' },
                  { icon: Clock, label: 'Flexible Batch Timings', color: 'text-teal-600', bg: 'bg-teal-50' },
                  { icon: Phone, label: '24/7 Student Support', color: 'text-pink-600', bg: 'bg-pink-50' },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div key={label} className={`flex items-center gap-3 ${bg} rounded-xl px-4 py-3`}>
                    <Icon className={`w-5 h-5 ${color} shrink-0`} />
                    <span className="text-gray-700 text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Featured Courses" subtitle="Industry-relevant courses designed to boost your career" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => <CourseCard key={course._id} course={course} index={i} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/courses" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionTitle title="Why Choose KCI?" subtitle="We provide the best computer education with modern facilities" center={false} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Learn More About Us <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Check Your Result', path: '/result', icon: Award },
                { label: 'Apply for Admission', path: '/admission', icon: GraduationCap },
                { label: 'Contact Us', path: '/contact', icon: Phone },
              ].map(({ label, path, icon: Icon }) => (
                <Link key={path} to={path} className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group">
                  <Icon className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Partners & Government Affiliations */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Our Partners & Affiliations" subtitle="Trusted by government bodies and leading companies" />

          {/* Government Bodies */}
          <div className="mb-8">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Government Recognized & Affiliated</p>
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-marquee">
                {[...Array(2)].map((_, repeat) =>
                  [
                    { name: 'NIELIT', bg: 'bg-blue-50', text: 'text-blue-700', emoji: '🏛️' },
                    { name: 'Ministry of IT', bg: 'bg-indigo-50', text: 'text-indigo-700', emoji: '🇮🇳' },
                    { name: 'NSDC', bg: 'bg-green-50', text: 'text-green-700', emoji: '🎓' },
                    { name: 'Skill India', bg: 'bg-orange-50', text: 'text-orange-700', emoji: '⚡' },
                    { name: 'Govt. of UP', bg: 'bg-yellow-50', text: 'text-yellow-700', emoji: '🏅' },
                    { name: 'Digital India', bg: 'bg-teal-50', text: 'text-teal-700', emoji: '💻' },
                    { name: 'ISO Certified', bg: 'bg-purple-50', text: 'text-purple-700', emoji: '✅' },
                  ].map((item, i) => (
                    <div key={`${repeat}-${i}`} className={`flex-shrink-0 flex items-center gap-3 ${item.bg} rounded-2xl px-6 py-4 shadow-sm border border-white`}>
                      <span className="text-3xl">{item.emoji}</span>
                      <span className={`font-bold text-sm ${item.text} whitespace-nowrap`}>{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Company Partners - reverse direction */}
          <div>
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Industry & Corporate Partners</p>
            <div className="relative overflow-hidden">
              <div className="flex gap-8 animate-marquee-reverse">
                {[...Array(2)].map((_, repeat) =>
                  [
                    { name: 'TCS', bg: 'bg-blue-50', text: 'text-blue-800', emoji: '🔵' },
                    { name: 'Infosys', bg: 'bg-indigo-50', text: 'text-indigo-800', emoji: '🟣' },
                    { name: 'Wipro', bg: 'bg-cyan-50', text: 'text-cyan-800', emoji: '🔷' },
                    { name: 'HCL Tech', bg: 'bg-green-50', text: 'text-green-800', emoji: '🟢' },
                    { name: 'Tech Mahindra', bg: 'bg-red-50', text: 'text-red-800', emoji: '🔴' },
                    { name: 'Accenture', bg: 'bg-purple-50', text: 'text-purple-800', emoji: '🟪' },
                    { name: 'IBM', bg: 'bg-blue-50', text: 'text-blue-900', emoji: '💠' },
                    { name: 'Microsoft', bg: 'bg-sky-50', text: 'text-sky-800', emoji: '🪟' },
                  ].map((item, i) => (
                    <div key={`${repeat}-${i}`} className={`flex-shrink-0 flex items-center gap-3 ${item.bg} rounded-2xl px-6 py-4 shadow-sm border border-white`}>
                      <span className="text-3xl">{item.emoji}</span>
                      <span className={`font-bold text-sm ${item.text} whitespace-nowrap`}>{item.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
