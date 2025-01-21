/**
 * Features Component
 *
 * This component showcases a list of features related to video encryption and decryption.
 * It highlights the use of chaos-based encryption techniques and provides users 
 * with the ability to explore the associated metrics for each feature in detail.
 * Smooth animations and an intuitive UI enhance the user experience.
 *
 * Functionality:
 * --------------
 * - Renders a list of clickable feature cards, each displaying:
 *   - An icon, title, short description, and associated performance metrics.
 * - Displays detailed metrics for the selected feature using animations.
 * - Includes a back button to navigate to the previous page.
 *
 * Additional Details:
 * -------------------
 * - Highlights the use of chaos-based encryption for robust and secure video content protection.
 * - Utilizes animations for feature transitions and metric displays.
 *
 * Functions:
 * ----------
 * - FeatureCard: 
 *   - Parameters:
 *     - `icon` (component): Icon for the feature (e.g., FaLock, FaUnlock).
 *     - `title` (string): Title of the feature.
 *     - `description` (string): Short description of the feature.
 *     - `metrics` (array): List of metrics associated with the feature.
 *     - `isActive` (boolean): Flag to indicate if the feature is active (selected).
 *     - `onClick` (function): Function to handle feature selection.
 *   - Renders a feature card with an icon, title, description, and optional metrics.
 *
 * - MetricsDisplay:
 *   - Parameters:
 *     - `metrics` (array): List of metrics to display.
 *   - Renders a list of metrics for the active feature.
 *
 * Global Variables:
 * -----------------
 * - `activeFeature`: The index of the currently selected feature (or null if none is selected).
 * - `features`: Array of feature objects containing icons, titles, descriptions, and metrics.
 *
 * Props:
 * ------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - framer-motion: For animations and transitions.
 * - react-router-dom: For navigation and routing.
 * - react-icons: For feature and UI icons (e.g., FaLock, FaUnlock, FaArrowCircleLeft, LiaAtomSolid).
 *
 * Example:
 * --------
 * <Features />
 *
 * Code Author:
 * ------------
 * - Renz Carlo T. Caritativo
 *
 * Date Created: 9/12/2024
 * Last Modified: 1/22/2025
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowCircleLeft, FaLock, FaUnlock, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { VscTools } from "react-icons/vsc";
import { LiaAtomSolid } from "react-icons/lia";
const FeatureCard = ({ icon: Icon, title, description, metrics, isActive, onClick }) => (
    <motion.div
        className={` 
            border-4
            rounded-2xl 
            overflow-hidden 
            cursor-pointer 
            transition-all 
            duration-300 
            ${ isActive ? 'border-primary' : 'border-gray-500'
        }`}
        whileHover={{ scale: 1.025 }}
        onClick={onClick}
    >
        <div className="p-5">
            <Icon className={`text-3xl ${isActive ? 'text-primary' : 'text-gray-500'} mb-4`} />
            <h3 className={`text-xl font-base font-avantGarde ${isActive ? 'text-primary' : 'text-gray-500'} mb-1`}>{title}</h3>
            <p className={`text-sm font-base text-gray-500 ${isActive ? 'text-primary' : 'text-gray-500'}`}>{description}</p>
        </div>
    </motion.div>
);

const MetricsDisplay = ({ metrics }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="bg-gray-100 border-4 rounded-2xl p-6 h-full -z-10"
    >
        <h4 className="text-xl font-semibold font-avantGarde text-black mb-4">Calculable Performance Metrics</h4>
        <ul className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {metrics.map((metric, index) => (
                <li key={index} className="flex items-center">
                    <FaCog className="text-black mr-2" />
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
            ],
        },
    ];

    const pageAnimation = {
        initial: {
            opacity: 0,
            x: '60vw',
        },
        in: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 50 }
        },
        out: {
            opacity: 0,
            x: '-100vw',
            transition: { ease: 'easeInOut', duration: 0.3 }
        }
    };

    useEffect(() => {
        setActiveFeature(0);
    }, []);

    return (
        <div className="h-full w-full flex justify-center items-center overflow-hidden">
            <button
                onClick={() => navigate('/')}
                className="absolute top-10 left-14 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl z-10"
            >
                <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
            </button>
            <motion.div
                variants={pageAnimation}
                initial="initial"
                animate="in"
                exit="out"
                className="flex items-center justify-center h-full w-full select-none"
            >
                <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
                    <div className='relative top-1/2 transform -translate-y-1/2'>
                        <motion.h1 
                            className="mb-4 text-4xl font-bold text-secondary font-avantGarde flex items-center"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <VscTools className="mr-2 text-5xl text-secondary" />
                            Explore Features
                        </motion.h1>
                        <div className="max-w-full mx-auto mb-5 z-10">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <LiaAtomSolid className="w-5 h-5 text-primary0" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium font-avantGarde text-primary0">Chaos-Based Encryption</h4>
                                        <p className="text-sm text-secondary">
                                        Utilizes chaotic systems to generate unpredictable keys for securing video content, enhancing security and robustness against unauthorized access.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-full">
                                {features.map((feature, index) => (
                                    <FeatureCard
                                        key={index}
                                        {...feature}
                                        isActive={activeFeature === index}
                                        onClick={() => setActiveFeature(activeFeature === index ? index : index)}
                                    />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeFeature !== null && (
                                    <MetricsDisplay metrics={features[activeFeature].metrics} />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
            </motion.div>
        </div>
    );
}