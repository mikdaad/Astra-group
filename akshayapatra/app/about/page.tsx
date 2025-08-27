'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const ventures = [
    {
      title: "Film Productions",
      description: "We bring powerful stories to life through our film production arm, focusing on creative storytelling, high-quality cinematography, and meaningful narratives that resonate with audiences worldwide. Our goal is to inspire, entertain, and leave a lasting impression through films that matter.",
      icon: (
        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      title: "Ice Cream Outlets",
      description: "Our ice cream outlets are designed to bring joy to every scoop. Offering a wide range of unique and classic flavors, we craft each treat with the finest ingredients to create unforgettable, indulgent experiences for all ages.",
      icon: (
        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Cafes",
      description: "Our cafes are more than just places to grab a coffee—they are spaces where people can connect, relax, and enjoy curated menus filled with handcrafted beverages and delicious food. We aim to create a cozy, welcoming atmosphere where every visit feels special.",
      icon: (
        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    },
    {
      title: "Charity Initiatives",
      description: "At Astra Groups, we believe in giving back. Through our charitable endeavors, we actively support various causes, from education and healthcare to community development. We are dedicated to making a positive impact on society, striving to uplift and empower those in need.",
      icon: (
        <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  const values = [
    {
      title: "Excellence",
      description: "We are committed to delivering top-quality services and products in everything we do."
    },
    {
      title: "Innovation",
      description: "We embrace creativity and forward-thinking solutions in our businesses."
    },
    {
      title: "Community",
      description: "We believe in building strong, lasting relationships within our team, with our customers, and in the communities we serve."
    },
    {
      title: "Social Responsibility",
      description: "Through our charity work, we aim to make a tangible difference and contribute to a better world."
    }
  ];

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-amber-600 hover:text-amber-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              About Astra Groups
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A dynamic and multi-faceted company committed to making a meaningful impact across industries
            </motion.p>
          </div>

          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="prose prose-amber max-w-none text-gray-700">
              <p className="text-lg mb-4">
                At Astra Groups, we are a dynamic and multi-faceted company committed to making a meaningful impact across industries. Our diverse ventures reflect our passion for innovation, creativity, and social responsibility, all while delivering exceptional experiences for our customers and communities.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Ventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ventures.map((venture, index) => (
                <motion.div 
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-start mb-4">
                    <div className="mr-4 mt-1">
                      {venture.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{venture.title}</h3>
                  </div>
                  <p className="text-gray-700">{venture.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <div className="prose prose-amber max-w-none text-gray-700 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <p className="text-lg">
                We are driven by the belief that businesses should not only be profitable but purposeful. Our mission is to integrate creativity, customer satisfaction, and social responsibility across all our endeavors, ensuring that we contribute positively to every industry we engage with. By combining innovation with heart, Astra Groups continues to expand its vision of shaping a better tomorrow.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div 
                  key={index}
                  className="bg-white border border-amber-200 rounded-xl p-6 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                >
                  <h3 className="text-xl font-bold text-amber-600 mb-2">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">We provide awesomness!</h2>
              <p className="text-xl opacity-90">Exceptional experiences across all our ventures</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}