/**
 * HowToUse Component
 *
 * This component provides step-by-step instructions for users to understand how to use 
 * the encryption and decryption features of the application. It displays two sets of instructions: 
 * one for encryption and one for decryption. Users can toggle between these tabs and interact 
 * with individual steps to reveal more detailed information. The component uses smooth animations 
 * to guide the user through the instructions, and includes a reminder about secure key exchange practices.
 *
 * Functionality:
 * --------------
 * - Displays two tabs: "Encryption" and "Decryption", allowing users to toggle between the two instruction sets.
 * - Each instruction is clickable and expands to show detailed content.
 * - Instructions include relevant icons, titles, and descriptions for each step.
 * - Implements a timed animation that cycles through instructions every 3 seconds for demo purposes.
 * - Includes a back button to navigate to the previous page.
 * - Provides a reminder about the importance of secure key exchange at the bottom of the page.
 *
 * Functions:
 * ----------
 * - HowToUse:
 *   - Manages the state for active tabs and active instructions.
 *   - Handles the dynamic rendering of instruction sets based on the active tab.
 *   - Displays detailed instruction content with animations when a step is clicked.
 *   - Automatically cycles through instruction steps using `useEffect` with a 3-second interval.
 *   - Navigates back to the previous page when the back button is clicked.
 *
 * Global Variables:
 * -----------------
 * - activeTab: The currently active tab, either 'encrypt' or 'decrypt'.
 * - activeInstruction: The index of the currently expanded instruction, or null if none is selected.
 * - encryptInstructions: An array containing the steps for encryption instructions.
 * - decryptInstructions: An array containing the steps for decryption instructions.
 *
 * Props:
 * -------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering and state management.
 * - react-router-dom: For handling navigation and routing.
 * - framer-motion: For animations and transitions between instruction steps.
 * - react-icons: For iconography (FaArrowCircleLeft, HiOutlineLightBulb, Lock, Unlock, Key, Shield, FileText, AlertTriangle).
 *
 * Example:
 * -------
 * <HowToUse />
 *
 * Code Author:
 * ------------
 * - Renz Carlo T. Caritativo
 * 
 * Date Created: 9/12/2024
 * Last Modified: 11/11/2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowCircleLeft } from "react-icons/fa";
import { HiOutlineLightBulb } from "react-icons/hi";
import { Lock, Unlock, Key, Shield, FileText, AlertTriangle } from 'lucide-react';

function HowToUse() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('encrypt');
    const [activeInstruction, setActiveInstruction] = useState(null);

    const encryptInstructions = [
        { 
            title: "Select Encryption Method", 
            content: "Choose between Fisher-Yates Logistic Map Algorithm and ILM - Cosine Map Algorithm.",
            icon: Key
        },
        { 
            title: "Input Your Video", 
            content: "Enter the video you want to encrypt in our secure input field.",
            icon: FileText
        },
        { 
            title: "Provide a Password", 
            content: "Create a password that follows our rules to ensure safety.",
            icon: Shield
        },
        { 
            title: "Encrypt", 
            content: "Click 'Encrypt' to transform your message into ciphertext.",
            icon: Lock
        },
        { 
            title: "Evaluate Encryption", 
            content: "Assess the encryption effectiveness and performance metrics of your encrypted video.",
            icon: Shield
        },
        { 
            title: "View Analytics Summary", 
            content: "Get a summary of the encryption process, including time taken and encryption performance.",
            icon: FileText
        },
    ];

    const decryptInstructions = [
        { 
            title: "Choose Decryption Method", 
            content: "Select the same method used for encryption (FY-Logistics or ILM-Cosine).",
            icon: Key
        },
        { 
            title: "Enter the Encrypted Video", 
            content: "Provide the path to the encrypted video file.",
            icon: FileText
        },
        { 
            title: "Provide Decryption Key", 
            content: "Upload the .key file and enter the password used during encryption.",
            icon: Shield
        },
        { 
            title: "Decrypt", 
            content: "Click 'Decrypt' to reveal the original video.",
            icon: Unlock
        },
        { 
            title: "Evaluate Decryption", 
            content: "Assess the decryption effectiveness and any potential data loss.",
            icon: Shield
        },
        { 
            title: "View Analytics Summary", 
            content: "Get a summary of the decryption process, including time taken and decryption performance.",
            icon: FileText
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveInstruction((prev) => (prev === null ? 0 : (prev + 1) % 4));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const glitchAnimation = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: "spring",
                damping: 12,
                stiffness: 200,
            }
        },
        exit: { 
            opacity: 0,
            y: 20,
            transition: { duration: 0.2 }
        }
    };

    const pageAnimation = {
        initial: { x: '-100%' }, // Start from the left
        animate: { x: 0, transition: { type: 'spring', stiffness: 300 } }, // Move to the center
        exit: { x: '100%', transition: { ease: 'easeInOut' } }, // Exit to the right
    };

    return (
        <motion.div
            className="relative h-full w-11/12 p-6 overflow-hidden"
            variants={pageAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <button
                onClick={() => navigate('/')}
                className={`
                    absolute 
                    top-8 
                    left-4 
                    flex 
                    items-center 
                    text-black 
                    hover:text-[#0f0f0f] 
                    transition-colors 
                    duration-300 
                    text-3xl
                `}
            >
                <FaArrowCircleLeft 
                    className={`
                        mr-2 
                        text-secondary 
                        transition-transform 
                        duration-300 
                        transform hover:-translate-x-2
                    `}/>
            </button>

            <div className="mt-10 text-left overflow-hidden">
                <h1 className="text-4xl font-bold text-secondary flex items-center justify-center">
                    <HiOutlineLightBulb className="mr-2 text-4xl text-secondary" />
                    Instructions
                </h1>

                <div className="flex justify-center mt-6 mb-8">
                    <button 
                        className={`
                            px-3 
                            py-1.5 
                            mx-2 
                            rounded-full 
                            font-bold 
                            transition-colors 
                            duration-300 
                            ${activeTab === 'encrypt' ? 
                                'bg-secondary text-white' : 
                                'bg-white text-secondary border border-secondary'}
                        `}
                        onClick={() => setActiveTab('encrypt')}
                    >
                        Encryption
                    </button>
                    <button 
                        className={`
                            px-3 
                            py-1.5 
                            mx-2 
                            rounded-full 
                            font-bold 
                            transition-colors 
                            duration-300 
                            ${activeTab === 'decrypt' ?
                                'bg-secondary text-white' :
                                'bg-white text-secondary border border-secondary'}
                        `}
                        onClick={() => setActiveTab('decrypt')}
                    >
                        Decryption
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mx-4">
                    {(activeTab === 'encrypt' ? encryptInstructions : decryptInstructions).map((instruction, index) => (
                        <motion.div
                            key={index}
                            className="bg-secondary2 rounded-lg p-4 cursor-pointer shadow-md border-2 border-secondary"
                            whileHover={{ scale: 1.05, boxShadow: '0px 0px 10px rgba(21, 131, 254, 0.5)' }}
                            onClick={() => setActiveInstruction(activeInstruction === index ? null : index)}
                        >
                            <instruction.icon className="w-6 h-6 mb-3 text-secondary" />
                            <h2 className="text-lg font-semibold mb-2 text-secondary">{instruction.title}</h2>
                            <AnimatePresence>
                                {activeInstruction === index && (
                                    <motion.p
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={glitchAnimation}
                                        className="text-sm text-secondary"
                                    >
                                        {instruction.content}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-6 text-center text-xs text-secondary">
                    <AlertTriangle className="inline mr-2 text-primary" />
                    Always use secure channels for key exchange and never share your encryption keys!
                </div>
            </div>
        </motion.div>
    );
}

export default HowToUse;