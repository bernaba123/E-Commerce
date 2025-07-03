import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Contact', href: '/contact' },
    ],
    services: [
      // Only show Product Requests for non-admin users
      ...(isAdmin ? [] : [{ name: 'Product Requests', href: '/request' }]),
      { name: 'Ethiopian Products', href: '/products' },
      { name: 'Order Tracking', href: '/tracking' },
      { name: 'Customer Support', href: '/support' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Return Policy', href: '/returns' },
      { name: 'FAQ', href: '/faq' },
    ],
  };

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EthioConnect</span>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Bridging Ethiopia and Germany through seamless e-commerce. 
              Connecting cultures, delivering dreams.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info and Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-400">support@ethioconnect.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-400">+49 30 12345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-400">Berlin, Germany</span>
              </div>
            </div>
            
            <h4 className="text-md font-semibold mb-2">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} EthioConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;