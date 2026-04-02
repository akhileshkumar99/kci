import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, Star, Search, Building2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import SectionTitle from '../components/SectionTitle';

const BRANCHES = [
  { _id: '1', branchNumber: 1, name: 'Head Office – Ayodhya (Faizabad)', city: 'Ayodhya', address: '1st Floor, Near Post Office, Sabji Mandi Road, Ayodhya, Faizabad', isMain: true, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: 'Managing Director', phone: '9936384736 & 9919660880' }, { name: 'Shivam Paswan, Shalu Kumari, Madhu', role: 'Staff', phone: '' }] },
  { _id: '2', branchNumber: 2, name: 'Parshurampur – Basti', city: 'Basti', address: 'Near Central Bank, Parshurampur, Basti, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: '', phone: '9919660880, 9936384736' }, { name: 'Gudiya Gupta', role: '', phone: '' }] },
  { _id: '3', branchNumber: 3, name: 'Shivdayalganj (Katara) – Gonda', city: 'Gonda', address: 'Near Police Chauki, Shivdayalganj (Katara), Gonda, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Rajesh Pandey', role: '', phone: '9919360223' }, { name: 'Siddhi Tiwari', role: '', phone: '' }, { name: 'Priyanka Pandey', role: '', phone: '' }] },
  { _id: '4', branchNumber: 4, name: 'Harraiya Bazar – Basti', city: 'Basti', address: 'In Front of Jagdish Sweets, Gupta Complex, Harraiya Bazar, Basti, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Ravi Kumar', role: '', phone: '9354429858' }] },
  { _id: '5', branchNumber: 5, name: 'Nand Nagar, Chauri Bazar – Basti', city: 'Basti', address: 'Near Indian Petrol Pump, Nand Nagar, Chauri Bazar, Basti, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Pradeep Mishra', role: '', phone: '9984096033, 6394969760' }] },
  { _id: '6', branchNumber: 6, name: 'Chhawani Bazar – Basti', city: 'Basti', address: 'Near Ram Janki Marg Tiraha, Chhawani Bazar, Basti, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Ramesh Kumar', role: '', phone: '9554236619' }] },
  { _id: '7', branchNumber: 7, name: 'Hanumangarhi Chauraha – Ayodhya', city: 'Ayodhya', address: 'Infront of Singh Dwar, Near Hanumangarhi Chauraha, Up to New J.K. Medical Store, Ayodhya, Faizabad', isMain: false, staffDetails: [{ name: 'Mahendra Kumar Pandey', role: '', phone: '9936384736 & 9919660880' }] },
  { _id: '8', branchNumber: 8, name: 'Maqbara Chauraha – Faizabad', city: 'Faizabad', address: 'Maqbara Chauraha, Faizabad', isMain: false, staffDetails: [{ name: 'Mahendra Kumar Pandey', role: '', phone: '9936384736 & 9919660880' }] },
  { _id: '9', branchNumber: 9, name: 'Sheetalganj – Siddharth Nagar', city: 'Siddharth Nagar', address: 'Bilauha Road, Sheetalganj, Near Hanuman Mandir, Bansi, Siddharth Nagar', isMain: false, staffDetails: [{ name: 'Mr. Krishna Dev', role: '', phone: '9616426496, 8299454653' }] },
  { _id: '10', branchNumber: 10, name: 'Gonda', city: 'Gonda', address: 'Gonda, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: '', phone: '9936384736' }] },
  { _id: '11', branchNumber: 11, name: 'Vikramjot Bazar – Basti', city: 'Basti', address: 'Infront of DDS Inter College, Vikramjot Bazar, Basti', isMain: false, staffDetails: [{ name: 'Mr. Rakesh Gupta', role: '', phone: '8920527355' }, { name: 'Mr. Shubham Kumar', role: '', phone: '6393634249' }] },
  { _id: '12', branchNumber: 12, name: 'Sabji Mandi Gali – Ayodhya', city: 'Ayodhya', address: 'Near Aata Chakki, Sabji Mandi Gali, Ayodhya, Faizabad', isMain: false, staffDetails: [{ name: 'Mudita Shukla', role: '', phone: '' }] },
  { _id: '13', branchNumber: 13, name: 'Amauli Bazar – Basti', city: 'Basti', address: 'Amauli Bazar, Basti', isMain: false, staffDetails: [{ name: 'Mr. Mansharam Verma', role: '', phone: '9696293481' }, { name: 'Munita Verma', role: '', phone: '' }] },
  { _id: '14', branchNumber: 14, name: 'Bhadariya Bazar – Siddharth Nagar', city: 'Siddharth Nagar', address: 'Bhadariya Bazar, Dumariya Ganj, Siddharth Nagar', isMain: false, staffDetails: [{ name: 'Afazal Ali Khan', role: '', phone: '' }] },
  { _id: '15', branchNumber: 15, name: 'Nawabganj – Gonda', city: 'Gonda', address: 'Near Gandhi Inter College, In Front of G.C. Academy, Padav Chauraha, Nawabganj, Gonda', isMain: false, staffDetails: [{ name: 'Mr. Krishna Dev Maurya', role: '', phone: '9616426496, 8299454653' }] },
  { _id: '16', branchNumber: 16, name: 'Chandni Chowk – Gonda', city: 'Gonda', address: 'Chandni Chowk, Gonda', isMain: false, staffDetails: [{ name: 'Mohd. Mustakeem Idrisi', role: '', phone: '9919878477 & 9918374821' }] },
  { _id: '17', branchNumber: 17, name: 'Sikanderpur – Basti', city: 'Basti', address: 'Near Chauri Mode, Sikanderpur, Basti', isMain: false, staffDetails: [{ name: 'Mr. Puskar Srivastava', role: '', phone: '9696554357' }] },
  { _id: '18', branchNumber: 18, name: 'Vishweshwar Ganj – Bahraich', city: 'Bahraich', address: 'Vishweshwar Ganj, Bahraich', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: '', phone: '9936384736' }] },
  { _id: '19', branchNumber: 19, name: 'Laxmanpur Bazar – Srawasti', city: 'Srawasti', address: 'Laxmanpur Bazar, Bhinga, Srawasti', isMain: false, staffDetails: [{ name: 'Mr. Satish Kumar', role: '', phone: '' }] },
  { _id: '20', branchNumber: 20, name: 'Kohrayen Bazar – Basti', city: 'Basti', address: 'Near Rajwapur Mode, Kohrayen Bazar, Basti', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: '', phone: '9919660880, 9936384736' }, { name: 'Smita Pandey', role: '', phone: '' }] },
  { _id: '21', branchNumber: 21, name: 'Kolhampur – Gonda', city: 'Gonda', address: 'Kolhampur, Gonda', isMain: false, staffDetails: [{ name: 'Mr. Rajesh Pandey & Siddhi Tiwari', role: '', phone: '9919360223' }] },
  { _id: '22', branchNumber: 22, name: 'Durjanpur Pachumi – Gonti', city: 'Gonti', address: 'Near Gramin Bank, Durjanpur Pachumi, Gonti', isMain: false, staffDetails: [{ name: 'Mr. Saurabh Gupta', role: '', phone: '6387725823' }] },
  { _id: '23', branchNumber: 23, name: 'Sitkohar Gaur – Basti', city: 'Basti', address: 'Gaur Halua Marg, Sitkohar, Gaur, Basti', isMain: false, staffDetails: [{ name: 'Mr. Rajneesh Pathak', role: '', phone: '7379718258' }] },
  { _id: '24', branchNumber: 24, name: 'TutiBheeti (Haseenabad) – Basti', city: 'Basti', address: 'Near State Bank of India, TutiBheeti (Haseenabad), Basti', isMain: false, staffDetails: [{ name: 'Vishnu Sharma', role: '', phone: '' }] },
  { _id: '25', branchNumber: 25, name: 'Ambedkarnagar', city: 'Ambedkarnagar', address: 'Ambedkarnagar, U.P.', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Pandey', role: '', phone: '9919660880' }] },
  { _id: '26', branchNumber: 26, name: 'Ghosiyari Bazar – Siddharth Nagar', city: 'Siddharth Nagar', address: 'Ghosiyari Bazar, Siddharth Nagar', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Pandey', role: '', phone: '9936384736' }] },
  { _id: '27', branchNumber: 27, name: 'Durjanpur Ghat – Gonda', city: 'Gonda', address: 'Durjanpur Ghat, Gonda', isMain: false, staffDetails: [{ name: 'Mr. Krishna Dev Maurya', role: '', phone: '9616426496' }] },
  { _id: '28', branchNumber: 28, name: 'GahmarKunj – Lucknow', city: 'Lucknow', address: 'Near Matiyari, GahmarKunj, Lucknow', isMain: false, staffDetails: [{ name: 'Mr. Mahendra Kumar Pandey', role: '', phone: '9936384736' }] },
  { _id: '29', branchNumber: 29, name: 'Belwa Sengar – Santkabir Nagar', city: 'Santkabir Nagar', address: 'Belwa Sengar Chauraha, Santkabir Nagar', isMain: false, staffDetails: [{ name: 'Mr. Anil Kumar Agrahari', role: '', phone: '8601568705, 9454864987' }] },
  { _id: '30', branchNumber: 30, name: 'Khandasa – Ayodhya', city: 'Ayodhya', address: 'Near Police Chauki, Khandasa, Ayodhya', isMain: false, staffDetails: [{ name: 'Mr. Lalit Ram Yadav', role: '', phone: '7408465327' }] },
];

const cityColors = {
  Ayodhya:           { from: 'from-orange-500', to: 'to-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  Faizabad:          { from: 'from-orange-500', to: 'to-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  Basti:             { from: 'from-blue-500',   to: 'to-blue-600',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  Gonda:             { from: 'from-green-500',  to: 'to-green-600',  light: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  Lucknow:           { from: 'from-purple-500', to: 'to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'Siddharth Nagar': { from: 'from-teal-500',   to: 'to-teal-600',   light: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200' },
  Bahraich:          { from: 'from-pink-500',   to: 'to-pink-600',   light: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-200' },
  Srawasti:          { from: 'from-yellow-500', to: 'to-yellow-600', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  Gonti:             { from: 'from-indigo-500', to: 'to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  Ambedkarnagar:     { from: 'from-red-500',    to: 'to-red-600',    light: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  'Santkabir Nagar': { from: 'from-cyan-500',   to: 'to-cyan-600',   light: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
};

const getColor = (city) => cityColors[city] || { from: 'from-blue-500', to: 'to-blue-700', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };

function BranchCard({ branch, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = getColor(branch.city);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 9) * 0.06 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
    >
      <div className={`bg-gradient-to-r ${color.from} ${color.to} p-4 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="w-6 h-6 bg-white/25 rounded-md flex items-center justify-center text-white text-xs font-black shrink-0">
                {branch.branchNumber}
              </span>
              {branch.isMain && (
                <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  <Star className="w-2.5 h-2.5 fill-yellow-900" /> HEAD OFFICE
                </span>
              )}
            </div>
            <h3 className="text-white font-bold text-sm leading-tight group-hover:text-yellow-100 transition-colors line-clamp-2">
              {branch.name}
            </h3>
          </div>
          <div className="shrink-0 px-2.5 py-1 bg-white/20 rounded-lg text-white text-xs font-semibold whitespace-nowrap">
            {branch.city}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className={`w-7 h-7 ${color.light} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
            <MapPin className={`w-3.5 h-3.5 ${color.text}`} />
          </div>
          <p className="text-gray-600 text-xs leading-relaxed">{branch.address}</p>
        </div>

        {branch.staffDetails?.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            {branch.staffDetails.length === 1 ? (
              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-xs leading-tight">{branch.staffDetails[0].name}</div>
                  {branch.staffDetails[0].role && <div className="text-blue-600 text-[10px]">{branch.staffDetails[0].role}</div>}
                  {branch.staffDetails[0].phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-green-500 shrink-0" />
                      <a href={`tel:${branch.staffDetails[0].phone.split(/[,&]/)[0].trim()}`}
                        className="text-[10px] text-gray-600 hover:text-blue-600 transition-colors font-mono">
                        {branch.staffDetails[0].phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setExpanded(!expanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${color.light} ${color.border} border`}>
                  <div className="flex items-center gap-2">
                    <Users className={`w-3.5 h-3.5 ${color.text}`} />
                    <span className={`text-xs font-bold ${color.text}`}>Staff ({branch.staffDetails.length})</span>
                  </div>
                  {expanded ? <ChevronUp className={`w-3.5 h-3.5 ${color.text}`} /> : <ChevronDown className={`w-3.5 h-3.5 ${color.text}`} />}
                </button>
                {expanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-2">
                    {branch.staffDetails.map((s, j) => (
                      <div key={j} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 text-xs leading-tight">{s.name}</div>
                          {s.role && <div className="text-blue-600 text-[10px]">{s.role}</div>}
                          {s.phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-green-500 shrink-0" />
                              <a href={`tel:${s.phone.split(/[,&]/)[0].trim()}`}
                                className="text-[10px] text-gray-600 hover:text-blue-600 transition-colors font-mono">
                                {s.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Branches() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', ...Array.from(new Set(BRANCHES.map(b => b.city))).sort()];

  const filtered = BRANCHES.filter(b => {
    const q = search.toLowerCase();
    return (b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q) || b.city.toLowerCase().includes(q))
      && (selectedCity === 'All' || b.city === selectedCity);
  });

  return (
    <div className="pt-16">
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-10 text-white text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Building2 className="w-4 h-4 text-yellow-400" /> 30+ Branches Across U.P.
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Our <span className="text-yellow-400">Branches</span></h1>
          <p className="text-blue-200">Find a Keerti Computer Institute branch near you</p>
          <div className="flex justify-center gap-10 mt-6">
            {[['30+', 'Branches'], ['10+', 'Districts'], ['U.P.', 'State']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-yellow-400">{val}</div>
                <div className="text-blue-200 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionTitle title="Branch Locations" subtitle="All KCI branches with address and staff details" />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 mt-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, address or city..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {cities.map(city => {
                const color = city === 'All' ? null : getColor(city);
                return (
                  <button key={city} onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedCity === city
                        ? city === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : `bg-gradient-to-r ${color.from} ${color.to} text-white border-transparent shadow-md`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}>
                    {city}
                    {city !== 'All' && <span className="ml-1 opacity-70">({BRANCHES.filter(b => b.city === city).length})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-5">
            <span className="font-bold text-gray-800">{filtered.length}</span> branch{filtered.length !== 1 ? 'es' : ''} found
            {selectedCity !== 'All' && <span> in <span className="font-semibold text-blue-600">{selectedCity}</span></span>}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((branch, i) => <BranchCard key={branch._id} branch={branch} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
