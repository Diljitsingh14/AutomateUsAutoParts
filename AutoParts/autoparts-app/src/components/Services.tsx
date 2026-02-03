'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileUp, Search, Download } from 'lucide-react';

const services = [
  {
    icon: FileUp,
    title: 'Upload Excel File',
    description: 'Process your auto parts data from Excel or CSV files with automated validation',
    href: '/upload',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Search,
    title: 'Parts by Make',
    description: 'Search and filter auto parts by vehicle make and model',
    href: '/parts-by-make',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Download,
    title: 'Parts by Service Line',
    description: 'Organize parts by service lines for better inventory management',
    href: '/parts-by-service-line',
    color: 'from-purple-500 to-purple-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export default function Services() {
  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Core Services
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Access our main tools and services
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link href={service.href}>
                  <motion.div
                    whileHover={{ y: -8, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-8 h-full"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-6`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold group">
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
