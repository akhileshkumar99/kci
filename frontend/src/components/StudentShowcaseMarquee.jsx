import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import api from '../utils/api';

const DEFAULT_SHOWCASE_STUDENTS = [
  { _id: 's1', name: 'Rahul Kumar', course: 'Web Development', year: '2026', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 1 },
  { _id: 's2', name: 'Priya Sharma', course: 'Graphic Design', year: '2025', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 2 },
  { _id: 's3', name: 'Aman Singh', course: 'Python', year: '2026', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 3 },
  { _id: 's4', name: 'Neha Gupta', course: 'Tally', year: '2025', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 4 },
  { _id: 's5', name: 'Rohit Verma', course: 'DCA', year: '2026', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 5 },
  { _id: 's6', name: 'Sneha Yadav', course: 'ADCA', year: '2025', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 6 },
  { _id: 's7', name: 'Ankit Raj', course: 'Java', year: '2026', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 7 },
  { _id: 's8', name: 'Kavya Mishra', course: 'Digital Marketing', year: '2025', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80', status: true, displayOrder: 8 },
];

export default function StudentShowcaseMarquee() {
  const [students, setStudents] = useState(DEFAULT_SHOWCASE_STUDENTS);

  useEffect(() => {
    let isMounted = true;
    const fetchShowcases = async () => {
      try {
        const { data } = await api.get('/showcase/public');
        if (isMounted && data.success && data.students && data.students.length > 0) {
          setStudents(data.students);
        }
      } catch (err) {
        // Fallback to default students array if API fetch fails
      }
    };
    fetchShowcases();
    return () => { isMounted = false; };
  }, []);

  // Duplicate items array to ensure seamless infinite auto-sliding marquee loop
  const marqueeList = [...students, ...students, ...students, ...students];

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 py-12 sm:py-16 overflow-hidden border-t border-slate-200/60">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-48 pointer-events-none -z-10 opacity-30 blur-3xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Our Successful <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Students</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1.5 tracking-wide">
            Learning Today, Building Tomorrow
          </p>
          
          {/* Graduation Cap Divider */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-blue-500 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-blue-500 rounded-full" />
          </div>
        </div>

        {/* Marquee Wrapper Container */}
        <div className="relative overflow-hidden group">
          
          {/* Gradient Blur Edges for Seamless Blend */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          {/* Continuous Automatic Infinite Scrolling Track */}
          <div className="overflow-hidden py-4">
            <div className="flex items-center gap-6 sm:gap-10 animate-marquee flex-nowrap hover:[animation-play-state:paused]">
              {marqueeList.map((item, idx) => (
                <div 
                  key={`${item._id || item.name}-${idx}`}
                  className="flex flex-col items-center text-center shrink-0 w-36 sm:w-44 group/card transition-all duration-300 hover:scale-105"
                >
                  {/* Circular Image Container */}
                  <div className="relative mb-3">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-xl shadow-blue-500/15 group-hover/card:shadow-blue-500/30 transition-all">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white bg-slate-100"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                  </div>

                  {/* Student Info */}
                  <h4 className="text-sm font-black text-slate-900 tracking-tight truncate max-w-full group-hover/card:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 truncate max-w-full mt-0.5">
                    {item.course}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-slate-400 mt-0.5">
                    {item.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Auto Marquee CSS Animation Inject */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
