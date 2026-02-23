/**
 * @file components/views/main/ContactSection/index.tsx
 * @description Contact and location section for customer main page
 */

import React from "react";
import { MapPin, Phone } from "lucide-react";

// ==========================================
// TYPES
// ==========================================

export interface ContactSectionProps {
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function ContactSection({ className }: ContactSectionProps) {
  return (
    <section id="contact" className={`py-16 sm:py-20 lg:py-24 bg-white ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Hubungi Kami</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Kunjungi toko kami atau hubungi untuk informasi lebih lanjut</p>

            <div className="space-y-4 sm:space-y-6">
              {/* Address */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Alamat Toko</h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Jl. Raya Contoh No. 123
                    <br />
                    Kecamatan Contoh, Kota Contoh
                    <br />
                    Jawa Barat 12345
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Telepon / WhatsApp</h3>
                  <p className="text-sm sm:text-base text-gray-500">+62 812 3456 7890</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-64 sm:h-80 lg:h-full min-h-64 lg:min-h-80 bg-gray-100 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400 font-medium">Peta Lokasi</p>
                <p className="text-xs sm:text-sm text-gray-400">(Google Maps akan ditampilkan di sini)</p>
              </div>
            </div>
            {/* Decorative grid overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
