"use client";

import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';

// This object holds all the legal text so we don't clutter the HTML
const legalContent: Record<string, { title: string, body: React.ReactNode }> = {
  about: {
    title: "About & Contact",
    body: (
      <div className="space-y-4">
        <p>Welcome to ThinkNest, India's premier platform for competitive exam preparation. Our mission is to democratize high-quality education by connecting ambitious students with expert faculty.</p>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 mt-4">
          <ul className="space-y-2">
            <li><strong>Email:</strong> support@thinknest.in</li>
            <li><strong>Phone:</strong> +91 98765 43210</li>
            <li><strong>Address:</strong> 123 Education Hub, Sector 4, Bengaluru, India</li>
          </ul>
        </div>
      </div>
    )
  },
  terms: {
    title: "Terms and Conditions",
    body: (
      <div className="space-y-4">
        <p>By accessing ThinkNest, you agree to be bound by these terms.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">1. User Accounts</h4>
        <p>You must provide accurate information. Sharing premium account access with multiple individuals is strictly prohibited.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">2. Intellectual Property</h4>
        <p>All video lectures and materials are the exclusive property of ThinkNest. You may not download or redistribute any content.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-white">1. Information We Collect</h4>
        <p>We collect your name, email, and usage data to improve your learning experience.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">2. Payment Information</h4>
        <p>We do not store your credit card details. All payments are processed securely through our PCI-DSS compliant partner, Razorpay.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">3. Data Sharing</h4>
        <p>We do not sell, trade, or rent your personal identification information to others.</p>
      </div>
    )
  },
  refund: {
    title: "Refund and Cancellation Policy",
    body: (
      <div className="space-y-4">
        <h4 className="font-bold text-gray-900 dark:text-white">1. Digital Goods</h4>
        <p>Due to the nature of digital educational content, <strong>all sales are final</strong>. Once a Premium Pass is activated, we cannot offer a refund.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">2. Technical Malfunctions</h4>
        <p>If a technical error prevents access for an extended period, contact support within 48 hours for a pro-rated extension.</p>
        <h4 className="font-bold text-gray-900 dark:text-white mt-4">3. Cancellations</h4>
        <p>Since passes do not auto-renew, no formal cancellation is required. Simply do not renew your pass when it expires.</p>
      </div>
    )
  }
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Prevent background scrolling when modal is open
  if (typeof document !== 'undefined') {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  return (
    <>
      {/* The Footer Bar */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">ThinkNest</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            {/* Buttons instead of Links to trigger the modal */}
            <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About & Contact</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms & Conditions</button>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('refund')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Refund Policy</button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} ThinkNest. All rights reserved.
          </p>

        </div>
      </footer>

      {/* The Popup Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Dark blurred background overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveModal(null)}
          ></div>
          
          {/* The actual popup box */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {legalContent[activeModal].title}
              </h2>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto text-gray-600 dark:text-gray-300">
              {legalContent[activeModal].body}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-800/30 rounded-b-2xl">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}