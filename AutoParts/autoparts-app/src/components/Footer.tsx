'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <h3 className="text-white font-bold text-lg">AutoParts</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Revolutionizing auto parts management with intelligent technology.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/upload" className="hover:text-white transition">
                  Upload
                </Link>
              </li>
              <li>
                <Link href="/parts-by-make" className="hover:text-white transition">
                  Parts by Make
                </Link>
              </li>
              <li>
                <Link href="/parts-by-service-line" className="hover:text-white transition">
                  Service Lines
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 mb-8" />

        {/* Social & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm mb-4 md:mb-0">
            © {currentYear} AutoParts. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="#" className="hover:text-white transition">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition">
              <Linkedin size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition">
              <Github size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
