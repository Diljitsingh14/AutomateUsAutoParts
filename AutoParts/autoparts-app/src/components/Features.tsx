'use client';

import { motion } from 'framer-motion';
import { Upload, Database, ShoppingCart, Zap, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Upload,
    title: 'Smart Data Upload',
    description: 'Upload Excel/CSV files with automatic validation and preprocessing',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Database,
    title: 'MongoDB Integration',
    description: 'Robust database management with optimized queries and indexing',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: ShoppingCart,
    title: 'Shopify Plugin Ready',
    description: 'Seamless integration with Shopify for direct product syncing',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Real-time MSRP',
    description: 'Automatic MSRP updates and price tracking from multiple sources',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Detailed reports and insights on parts performance and inventory',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with encryption and access control',
    color: 'from-indigo-500 to-indigo-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage auto parts efficiently
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
