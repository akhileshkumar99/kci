import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="KCI Logo" className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-blue-500/30 shrink-0" />
              <div>
                <div className="text-white font-bold text-lg leading-tight">KEERTI</div>
                <div className="text-blue-400 text-xs tracking-wider">COMPUTER INSTITUTE</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Empowering students with quality computer education since 2005. Government recognized institute with 30+ branches.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[['Home', '/'], ['About Us', '/about'], ['Courses', '/courses'], ['Admission', '/admission'], ['Gallery', '/gallery'], ['Contact', '/contact']].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-blue-400 transition-colors">→ {label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Courses</h3>
            <ul className="space-y-2 text-sm">
              {['Basic Computer', 'DCA', 'ADCA', 'Tally with GST', 'Web Design', 'Python Programming'].map((c) => (
                <li key={c}>
                  <Link to="/courses" className="hover:text-blue-400 transition-colors">→ {c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span>1st Floor, Near Post Office, Sabji Mandi Road, Ayodhya, Faizabad, UP</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+919936384736" className="hover:text-blue-400 transition-colors">+91 9936384736</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+919919660880" className="hover:text-blue-400 transition-colors">+91 9919660880</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:info@kci.org.in" className="hover:text-blue-400 transition-colors">info@kci.org.in</a>
              </li>
            </ul>
          </div>

          {/* Google Map */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Our Location</h3>
            <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
              <iframe
                title="KCI Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.123456789!2d82.1996!3d26.7922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a07b1234abcde%3A0xabcdef1234567890!2sAyodhya%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Ayodhya,Faizabad,UttarPradesh"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <MapPin className="w-3 h-3" /> View on Google Maps
            </a>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Keerti Computer Institute. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/result" className="hover:text-blue-400 transition-colors">Check Result</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
