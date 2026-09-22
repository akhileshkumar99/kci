import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Target, Eye, Heart, CheckCircle, Laptop, GraduationCap, Building2, Star, TrendingUp, Shield, Clock, Sparkles, Quote, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';

const registrations = [
  'Society Registration',
  'MHRD Registration',
  'ISO 9001:2015 Certification',
  'Registered Trademark',
  'Registration with NIELIT',
  'Recognized Skill Development Courses'
];

const majorCourses = [
  'PGDCA', 'O Level', 'ADCA', 'DCA', 'Tally Prime', 'CCC', 'DTP',
  'Graphics Designing', 'Web Designing', 'Computer Fundamentals', 'Programming & IT Courses'
];

const whyChooseUs = [
  {
    title: 'Experience Since 2005',
    desc: 'With a journey beginning on 04 August 2005, the institute has been dedicated to computer education and skill development in Ayodhya, U.P.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    title: 'Practical Learning',
    desc: 'We emphasize hands-on practical training so that students can confidently apply what they learn in real-world scenarios.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Career-Oriented Courses',
    desc: 'Our courses are meticulously designed to develop useful computer and IT skills for academic and professional requirements.',
    color: 'from-purple-500 to-violet-600'
  },
  {
    title: 'Multiple Course Options',
    desc: 'Students can choose from basic computer fundamentals to advanced, specialized IT programs matching their educational goals.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    title: 'Professional Learning Environment',
    desc: 'We strive to provide students with a disciplined, supportive, interactive, and learning-focused academic environment.',
    color: 'from-rose-500 to-pink-600'
  }
];

const missionPoints = [
  'Provide quality and affordable computer education.',
  'Develop practical and job-oriented IT skills.',
  'Promote digital literacy and awareness.',
  'Help students build confidence in using modern technology.',
  'Provide structured learning from basic to advanced computer concepts.',
  'Encourage students to continuously upgrade their technical knowledge.',
  'Create opportunities for learners to build a strong academic and professional foundation.'
];

export default function About() {
  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">

      {/* Hero Banner */}
      <section className="bg-slate-950 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        {/* Ambient Glow */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-500/30 pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-indigo-500/30 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm mb-6 text-blue-200 shadow-md">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" /> Established 04 August 2005 | Ayodhya, Uttar Pradesh
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
            Keerti Computer Institute <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              – The College of IT
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-300 text-sm sm:text-lg font-normal leading-relaxed max-w-3xl mx-auto">
            Empowering Students Through Quality, Practical, Affordable & Career-Oriented Computer Education & Technology
          </motion.p>
        </div>
      </section>

      {/* Message from Director Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="LEADERSHIP" title="Director KCI" subtitle="Visionary guidance behind Keerti Computer Institute" />
          
          <motion.div
            initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800"
          >
            <div className="grid lg:grid-cols-12">
              
              {/* Director Image & Title */}
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col items-center justify-center text-white text-center relative border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950/50">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="relative mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 to-blue-600 blur-lg opacity-40" />
                  <img
                    src="/mahendra-pandey.jpeg"
                    alt="Director KCI - Mr. Mahendra Kumar Pandey"
                    className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl object-cover shadow-2xl ring-4 ring-amber-400/40 border-2 border-white/20"
                    onError={e => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                  />
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  Mr. Mahendra Kumar Pandey
                </h3>
                <div className="text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-widest mt-1.5 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Founder & Director
                </div>
                <div className="text-blue-200 text-xs sm:text-sm mt-2 font-medium">
                  Keerti Computer Institute – The College of IT
                </div>

                <div className="flex gap-1.5 mt-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
              </div>

              {/* Director Statement */}
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center text-gray-200">
                <Quote className="w-12 h-12 text-amber-400/30 mb-4" />
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
                  "Empowering Every Learner with Practical Digital Skills & Industry-Ready Confidence"
                </h4>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                  Keerti Computer Institute – The College of IT is a professionally managed computer education and training institute established on 04 August 2005 in Ayodhya, Uttar Pradesh. Since its inception, the institute has been working with the vision of providing quality, practical, affordable and career-oriented computer education to students and learners.
                </p>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Over the years, Keerti Computer Institute has focused on developing computer skills, digital awareness and technical knowledge among students so that they can confidently meet the requirements of today’s academic, professional and digital environment.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <div className="text-amber-400 font-black text-lg sm:text-xl">Since 2005</div>
                    <div className="text-gray-400 text-xs">Ayodhya, U.P.</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <div className="text-amber-400 font-black text-lg sm:text-xl">ISO 9001:2015</div>
                    <div className="text-gray-400 text-xs">Certified Institute</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10 col-span-2 sm:col-span-1">
                    <div className="text-amber-400 font-black text-lg sm:text-xl">NIELIT</div>
                    <div className="text-gray-400 text-xs">Registered Partner</div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-7">
              <SectionTitle badge="OUR JOURNEY" title="Building Excellence Since 2005" center={false} />
              <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base font-normal">
                Established on 04 August 2005, Keerti Computer Institute has continued its journey with a commitment to quality education, professional training and student development. The institute provides a learning environment where students can understand computer concepts from basic to advanced levels through structured courses and practical training.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base font-normal">
                Our objective is not only to provide course completion certificates but also to help students develop practical computer knowledge, technical skills, confidence and career-oriented capabilities.
              </p>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100/80">
                <div className="flex items-center gap-3 text-blue-900 font-bold text-base mb-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  Key Highlights of Our Journey
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-gray-700 font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Established 04 August 2005</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Headquartered in Ayodhya, U.P.</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Practical Lab Focus</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Career & Job Oriented</div>
                </div>
              </div>
            </motion.div>

            {/* Registration & Recognition Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  <Shield className="w-4 h-4 text-blue-600" /> OFFICIAL ACCREDITATION
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Registration & Recognition</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Keerti Computer Institute has established its institutional identity through various registrations, certifications and affiliations:
                </p>

                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div key={reg} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </div>
                      <span className="text-gray-800 text-xs sm:text-sm font-semibold">{reg}</span>
                    </div>
                  ))}
                </div>

                <p className="text-gray-500 text-xs italic mt-6 leading-normal border-t pt-4">
                  These registrations and certifications reflect our commitment towards maintaining a structured and professional approach to computer education.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Our Courses Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="OFFERINGS" title="Our Courses" subtitle="Comprehensive IT programs designed for real-world application" />
          
          <div className="mt-8 max-w-4xl mx-auto text-center">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 font-normal">
              Keerti Computer Institute offers a wide range of computer and IT-related courses designed for students, job seekers, professionals and individuals who wish to improve their digital and technical skills.
            </p>

            {/* Course Badges */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
              {majorCourses.map((c) => (
                <span key={c} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border border-blue-200/80 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xs hover:shadow-md transition-all">
                  {c}
                </span>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md text-left sm:text-center border border-slate-800">
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                The courses are designed to provide a combination of theoretical knowledge and practical computer training, enabling learners to apply their knowledge in real-world situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="CORE VALUES" title="Our Vision & Mission" />
          
          <div className="grid lg:grid-cols-12 gap-8 mt-10">
            
            {/* Our Vision */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-normal mb-4">
                  Our vision is to become a trusted centre for computer education and skill development by providing accessible, practical and quality-oriented IT education.
                </p>
                <p className="text-gray-600 leading-relaxed text-xs sm:text-sm font-normal">
                  We aim to prepare students for a rapidly changing digital world by continuously improving our teaching methods, course content and learning environment.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
                Keerti Computer Institute – Vision 2026+
              </div>
            </motion.div>

            {/* Our Mission */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-md border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-4">
                Our mission is focused on student-centric growth and digital empowerment:
              </p>
              <div className="space-y-3">
                {missionPoints.map((mp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-gray-800 text-xs sm:text-sm font-medium">{mp}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Why Choose KCI? */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle badge="BENEFITS" title="Why Choose Keerti Computer Institute?" subtitle="Key pillars that set us apart" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {whyChooseUs.map(({ title, desc, color }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 mb-4 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                    0{i + 1}
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">{title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-amber-400/30 uppercase tracking-wider mb-4 inline-block">
            Our Commitment
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mb-4">
            Keerti Computer Institute – The College of IT
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto mb-6">
            At Keerti Computer Institute, we believe that computer education is an essential part of modern education and professional development. Our commitment is to provide students with relevant knowledge, practical skills and a strong foundation in information technology.
          </p>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto mb-8">
            We continuously work towards improving the quality of education and creating better learning opportunities for our students.
          </p>
          <div className="inline-flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm bg-white/10 px-5 py-2.5 rounded-xl border border-white/15">
            <Sparkles className="w-4 h-4" /> Empowering Students Through Computer Education & Technology | Established 04 August 2005 (Ayodhya, UP)
          </div>
        </div>
      </section>

    </div>
  );
}
