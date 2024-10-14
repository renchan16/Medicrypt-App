import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowCircleLeft, FaLock, FaUnlock, FaChartBar, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, metrics, isActive, onClick }) => (
  <motion.div
    className={`bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
      isActive ? 'ring-4 ring-secondary' : ''
    }`}
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
  >
    <div className="p-6">
      <Icon className={`text-4xl ${isActive ? 'text-secondary' : 'text-gray-500'} mb-4`} />
      <h3 className="text-xl font-semibold text-secondary mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const MetricsDisplay = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-gray-100 rounded-lg p-6 mt-6"
  >
    <h4 className="text-lg font-semibold text-secondary mb-4">Metrics:</h4>
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {metrics.map((metric, index) => (
        <li key={index} className="flex items-center">
          <FaCog className="text-secondary mr-2" />
          <span className="text-sm text-gray-700">{metric}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function Features() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: FaChartBar,
      title: "Chaos-Theory based Video Encryption and Decryption",
      description: "Utilizes chaotic systems to generate unpredictable keys for securing video content, enhancing security and robustness against unauthorized access.",
      metrics: [
        "Fisher-Yates and Logistics Map Algorithm",
        "3D ILM - Cosine Map Algorithm",
      ],
    },
    {
      icon: FaLock,
      title: "Encryption",
      description: "Advanced algorithms for secure video encryption.",
      metrics: [
        "Entropy",
        "Unified Average Changing Intensity (UACI)",
        "Number of Changing Pixel Rate (NPCR)",
        "Encryption Time",
        "Correlation Coefficient (CC)",
      ],
    },
    {
      icon: FaUnlock,
      title: "Decryption",
      description: "Efficient and secure video decryption process.",
      metrics: [
        "Mean Square Error (MSE)",
        "Peak Signal to Noise Ratio (PSNR)",
        "Decryption Time",
        "Correlation Coefficient (CC)",
      ],
    },
  ];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }} // Start off the screen to the right
      animate={{ x: 0, opacity: 1 }} // Move into place and fade in
      exit={{ x: '-100%', opacity: 0 }} // Exit off the screen to the left
      transition={{ duration: 0.5 }} // Duration of the animation
      className="min-h-screen p-6 relative"
    >
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
      >
        <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-5xl font-bold text-center text-secondary mt-16 mb-12"
      >
        Explore Features
      </motion.h1>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              isActive={activeFeature === index}
              onClick={() => setActiveFeature(activeFeature === index ? null : index)}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeFeature !== null && activeFeature !== 0 && ( // Check if it's not the first feature (Chaos)
            <MetricsDisplay metrics={features[activeFeature].metrics} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
