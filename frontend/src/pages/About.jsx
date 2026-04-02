import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Target, Eye, Heart, CheckCircle, Laptop, GraduationCap, Building2, Star, TrendingUp, Shield, Clock } from 'lucide-react';
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
  { icon: Shield, title: 'Govt. Recognized', desc: 'Certificates accepted by government & private sector nationwide', color: 'from-blue-500 to-blue-600', bg: 'hover:bg-blue-50', border: 'hover:border-blue-200' },
  { icon: Laptop, title: 'Modern Labs', desc: 'State-of-the-art computer labs with latest hardware & software', color: 'from-emerald-500 to-emerald-600', bg: 'hover:bg-emerald-50', border: 'hover:border-emerald-200' },
  { icon: GraduationCap, title: 'Expert Faculty', desc: 'Highly qualified & experienced teachers with industry knowledge', color: 'from-violet-500 to-violet-600', bg: 'hover:bg-violet-50', border: 'hover:border-violet-200' },
  { icon: TrendingUp, title: '95% Placement', desc: 'Dedicated placement cell helping students get their dream jobs', color: 'from-orange-500 to-orange-600', bg: 'hover:bg-orange-50', border: 'hover:border-orange-200' },
  { icon: Clock, title: 'Flexible Batches', desc: 'Morning, evening & weekend batches to suit your schedule', color: 'from-teal-500 to-teal-600', bg: 'hover:bg-teal-50', border: 'hover:border-teal-200' },
  { icon: Star, title: 'Affordable Fees', desc: 'Quality education at the most affordable fee structure', color: 'from-pink-500 to-pink-600', bg: 'hover:bg-pink-50', border: 'hover:border-pink-200' },
];

export default function About() {
  return (
    <div className="pt-16">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 text-white text-center relative overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full bg-white/5"
            style={{ width: 100 + i * 100, height: 100 + i * 100, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4 relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
            <Award className="w-4 h-4 text-yellow-400" /> Government Recognized Institute Since 2005
          </div>
          <h1 className="text-4xl sm:text-6xl font-black mb-4">About <span className="text-yellow-400">KCI</span></h1>
          <p className="text-blue-200 text-lg">18+ years of excellence in computer education</p>
        </motion.div>
        {/* Wave bottom shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <SectionTitle title="Who We Are" center={false} />
            <p className="text-gray-600 leading-relaxed mb-4">
              Keerti Computer Institute (KCI) is one of Uttar Pradesh's most trusted and recognized computer training institutes. Founded in 2005, we have been committed to providing quality computer education to students from all walks of life.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our institute is government recognized and affiliated with leading educational boards. We offer a wide range of courses from basic computer literacy to advanced programming and professional certifications.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              With 10+ branches across Uttar Pradesh, experienced faculty, modern computer labs, and a proven track record of 10,000+ successful students, KCI is the preferred choice for computer education.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Government Recognized Certificates', 'Experienced & Qualified Faculty', 'Modern Computer Labs', 'Placement Assistance', 'Affordable Fee Structure', 'Flexible Batch Timings'].map(f => (
                <div key={f} className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-gray-700 text-xs font-medium">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, value: '10,000+', label: 'Students Trained', color: 'from-blue-500 to-blue-600' },
              { icon: BookOpen, value: '25+', label: 'Courses', color: 'from-emerald-500 to-emerald-600' },
              { icon: Award, value: '18+', label: 'Years Experience', color: 'from-violet-500 to-violet-600' },
              { icon: Building2, value: '95%', label: 'Placement Rate', color: 'from-orange-500 to-orange-600' },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.04 }}
                className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900">{value}</div>
                <div className="text-gray-500 text-sm">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Director Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Message from Director" subtitle="Leadership vision that drives our excellence" />
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100"
          >
            <div className="grid lg:grid-cols-3">
              {/* Director Image */}
              <div className="relative bg-gradient-to-br from-blue-700 to-indigo-800 flex flex-col items-center justify-center p-10">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="relative">
                  <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl" />
                  <img
                    src="/director.jpg"
                    alt="Director KCI"
                    className="relative w-44 h-44 rounded-full object-cover shadow-2xl ring-4 ring-yellow-400/50"
                    onError={e => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                  />
                </motion.div>
                <div className="text-center mt-6">
                  <div className="text-white font-black text-xl">Mr. Mahendra Kumar Pandey</div>
                  <div className="text-yellow-400 font-semibold text-sm mt-1">Founder & Director</div>
                  <div className="text-blue-200 text-xs mt-1">Keerti Computer Institute</div>
                </div>
                <div className="flex gap-2 mt-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>

              {/* Director Message */}
              <div className="lg:col-span-2 p-8 sm:p-12 flex flex-col justify-center">
                <div className="text-5xl text-blue-200 font-serif leading-none mb-4">"</div>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  At Keerti Computer Institute, our mission has always been simple — to empower every student with the digital skills they need to succeed in today's world. Since 2005, we have been dedicated to providing quality, affordable, and practical computer education.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We believe that every student deserves access to world-class education regardless of their background. Our government-recognized certificates, experienced faculty, and modern labs ensure that our students are industry-ready from day one.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: '18+ Years', sub: 'of Experience' },
                    { label: '10,000+', sub: 'Students Trained' },
                    { label: '10+', sub: 'Branches' },
                  ].map(({ label, sub }) => (
                    <div key={label} className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="text-blue-700 font-black text-lg">{label}</div>
                      <div className="text-gray-500 text-xs">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Why Choose KCI?" subtitle="What makes us the best computer institute in UP" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {features.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default ${bg} ${border}`}
              >
                <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Our Mission & Vision" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Target, title: 'Our Mission', color: 'blue', text: 'To provide affordable, quality computer education that empowers students with practical skills and knowledge to succeed in the digital world.' },
              { icon: Eye, title: 'Our Vision', color: 'purple', text: 'To be the leading computer training institute in India, recognized for excellence in education, innovation, and student success.' },
              { icon: Heart, title: 'Our Values', color: 'red', text: 'Quality education, student-first approach, integrity, innovation, and commitment to creating successful careers for every student.' },
            ].map(({ icon: Icon, title, color, text }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-8 shadow-md text-center hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-${color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 text-${color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Our Journey" subtitle="Key milestones in our growth story" />
          <div className="relative mt-10">

            {/* Static background line */}
            <div className="absolute left-1/2 -translate-x-0.5 h-full w-0.5 bg-blue-100" />

            {/* Animated growing line */}
            <motion.div
              className="absolute left-1/2 -translate-x-0.5 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-500 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 7, ease: 'linear' }}
              style={{ height: '100%' }}
            />

            {/* Car running along the line */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 z-20 text-2xl select-none"
              style={{ top: 0 }}
              initial={{ top: '0%' }}
              whileInView={{ top: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 7, ease: 'linear' }}
            >
              🚗
            </motion.div>

            {milestones.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 1.1, duration: 0.6, ease: 'easeOut' }}
                className={`relative flex items-center mb-10 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-1/2 ${i % 2 === 0 ? 'pr-10 text-right' : 'pl-10 text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                  >
                    <div className="text-blue-600 font-black text-xl">{m.year}</div>
                    <div className="text-gray-700 text-sm mt-1">{m.event}</div>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 1.1 + 0.3, type: 'spring', stiffness: 300 }}
                  className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"
                />
                <div className="w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
