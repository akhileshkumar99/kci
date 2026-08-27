import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Target, Eye, Heart, CheckCircle, Laptop, GraduationCap, Building2, Star, TrendingUp, Shield, Clock, Sparkles, Quote, MapPin, ChevronRight } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';

const milestones = [
  { year: '2005', event: 'KCI Founded in Lucknow with a single branch' },
  { year: '2008', event: 'Received Government Recognition for computer courses' },
  { year: '2012', event: 'Expanded to 5 branches across Uttar Pradesh' },
  { year: '2016', event: 'Crossed 5000+ successful students milestone' },
  { year: '2020', event: 'Launched online learning platform' },
  { year: '2024', event: '10+ branches, 10,000+ students, 25+ courses' },
];

const features = [
  { icon: Shield, title: 'Govt. Recognized', desc: 'Certificates accepted by government & private sector nationwide', color: 'from-blue-500 to-indigo-600', bg: 'hover:bg-blue-50/60', border: 'hover:border-blue-200' },
  { icon: Laptop, title: 'Modern Labs', desc: 'State-of-the-art computer labs with latest hardware & software', color: 'from-emerald-500 to-teal-600', bg: 'hover:bg-emerald-50/60', border: 'hover:border-emerald-200' },
  { icon: GraduationCap, title: 'Expert Faculty', desc: 'Highly qualified & experienced teachers with industry knowledge', color: 'from-violet-500 to-purple-600', bg: 'hover:bg-violet-50/60', border: 'hover:border-violet-200' },
  { icon: TrendingUp, title: '95% Placement', desc: 'Dedicated placement cell helping students get their dream jobs', color: 'from-amber-500 to-orange-600', bg: 'hover:bg-amber-50/60', border: 'hover:border-amber-200' },
  { icon: Clock, title: 'Flexible Batches', desc: 'Morning, evening & weekend batches to suit your schedule', color: 'from-teal-500 to-cyan-600', bg: 'hover:bg-teal-50/60', border: 'hover:border-teal-200' },
  { icon: Star, title: 'Affordable Fees', desc: 'Quality education at the most affordable fee structure', color: 'from-pink-500 to-rose-600', bg: 'hover:bg-pink-50/60', border: 'hover:border-pink-200' },
];

export default function About() {
  return (
    <div className="pt-24 sm:pt-28 min-h-screen">

      {/* Hero Banner */}
      <section className="bg-slate-950 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        {/* Ambient Glow */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-500/30 pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-indigo-500/30 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-6 text-blue-200 shadow-md">
            <Award className="w-4 h-4 text-amber-400 shrink-0" /> Government Recognized Institute Since 2005
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">
            About <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">KCI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
            18+ years of excellence in computer education and skill development across Uttar Pradesh
          </motion.p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
            <SectionTitle badge="HERITAGE" title="Who We Are" center={false} />
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base font-normal">
              Keerti Computer Institute (KCI) is one of Uttar Pradesh's most trusted and recognized computer training institutes. Founded in 2005, we have been committed to providing quality computer education to students from all walks of life.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base font-normal">
              Our institute is government recognized and affiliated with leading educational boards. We offer a wide range of courses from basic computer literacy to advanced programming and professional certifications.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base font-normal">
              With 10+ branches across Uttar Pradesh, experienced faculty, modern computer labs, and a proven track record of 10,000+ successful students, KCI is the preferred choice for computer education.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Government Recognized Certificates',
                'Experienced & Qualified Faculty',
                'Modern Computer Labs',
                'Placement Assistance',
                'Affordable Fee Structure',
                'Flexible Batch Timings'
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl shadow-2xs">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-gray-800 text-xs sm:text-sm font-semibold">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[
              { icon: Users, value: '10,000+', label: 'Students Trained', color: 'from-blue-500 to-indigo-600' },
              { icon: BookOpen, value: '25+', label: 'Courses Offered', color: 'from-emerald-500 to-teal-600' },
              { icon: Award, value: '18+', label: 'Years Experience', color: 'from-violet-500 to-purple-600' },
              { icon: Building2, value: '95%', label: 'Placement Rate', color: 'from-amber-500 to-orange-600' },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 text-center shadow-xs border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-0.5">{value}</div>
                <div className="text-gray-500 text-xs font-medium">{label}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Director Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="LEADERSHIP" title="Message from Director" subtitle="Leadership vision that drives our academic excellence" />
          
          <motion.div
            initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="grid lg:grid-cols-12">
              
              {/* Director Image & Card */}
              <div className="lg:col-span-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-8 text-white relative">
                <motion.div whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 300 }} className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
                  <img
                    src="/director.jpg"
                    alt="Director KCI"
                    className="relative w-40 h-40 rounded-full object-cover shadow-2xl ring-4 ring-amber-400/40"
                    onError={e => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                  />
                </motion.div>
                <div className="text-center">
                  <div className="text-white font-extrabold text-xl">Mr. Mahendra Kumar Pandey</div>
                  <div className="text-amber-300 font-semibold text-xs uppercase tracking-wider mt-1">Founder & Director</div>
                  <div className="text-blue-200 text-xs mt-0.5">Keerti Computer Institute</div>
                </div>
                <div className="flex gap-1.5 mt-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
              </div>

              {/* Director Message */}
              <div className="lg:col-span-8 p-8 sm:p-12 flex flex-col justify-center">
                <Quote className="w-10 h-10 text-blue-500/20 mb-4" />
                <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-4 font-normal">
                  At Keerti Computer Institute, our mission has always been simple — to empower every student with the digital skills they need to succeed in today's world. Since 2005, we have been dedicated to providing quality, affordable, and practical computer education.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 text-xs sm:text-sm font-normal">
                  We believe that every student deserves access to world-class education regardless of their background. Our government-recognized certificates, experienced faculty, and modern labs ensure that our students are industry-ready from day one.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  {[
                    { label: '18+ Years', sub: 'of Experience' },
                    { label: '10,000+', sub: 'Students Trained' },
                    { label: '30+', sub: 'Branches' },
                  ].map(({ label, sub }) => (
                    <div key={label} className="bg-blue-50/60 rounded-xl p-3 text-center border border-blue-100/60">
                      <div className="text-blue-700 font-black text-base sm:text-lg">{label}</div>
                      <div className="text-gray-500 text-[10px] sm:text-xs font-semibold">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="BENEFITS" title="Why Choose KCI?" subtitle="What makes us the best computer institute in UP" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {features.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 ${bg} ${border}`}
              >
                <div className={`w-12 h-12 mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="CORE VALUES" title="Our Mission & Vision" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Target, title: 'Our Mission', color: 'bg-blue-50 text-blue-600 border-blue-100', text: 'To provide affordable, quality computer education that empowers students with practical skills and knowledge to succeed in the digital world.' },
              { icon: Eye, title: 'Our Vision', color: 'bg-purple-50 text-purple-600 border-purple-100', text: 'To be the leading computer training institute in India, recognized for excellence in education, innovation, and student success.' },
              { icon: Heart, title: 'Our Values', color: 'bg-pink-50 text-pink-600 border-pink-100', text: 'Quality education, student-first approach, integrity, innovation, and commitment to creating successful careers for every student.' },
            ].map(({ icon: Icon, title, color, text }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-8 shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm font-normal">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="MILESTONES" title="Our Journey" subtitle="Key milestones in our growth story" />
          <div className="relative mt-12">

            {/* Background line */}
            <div className="absolute left-4 md:left-1/2 -translate-x-0.5 h-full w-0.5 bg-gray-200" />

            {/* Animated progress line */}
            <motion.div
              className="absolute left-4 md:left-1/2 -translate-x-0.5 w-0.5 bg-gradient-to-b from-blue-600 to-indigo-600 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 6, ease: 'easeInOut' }}
              style={{ height: '100%' }}
            />

            {milestones.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative flex items-center mb-8 flex-row"
              >
                <div className="w-full pl-10 md:w-1/2 md:pl-0 md:pr-10 md:text-right">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition-all"
                  >
                    <div className="text-blue-600 font-black text-xl">{m.year}</div>
                    <div className="text-gray-700 text-xs sm:text-sm font-semibold mt-1">{m.event}</div>
                  </motion.div>
                </div>
                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10" />
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
