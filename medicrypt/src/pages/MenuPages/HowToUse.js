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
                className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
            >
                <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
            </button>

            <div className="mt-10 text-left overflow-hidden">
                <h1 className="text-4xl font-bold text-secondary flex items-center justify-center">
                    <HiOutlineLightBulb className="mr-2 text-4xl text-secondary" />
                    Instructions
                </h1>

                <div className="flex justify-center mt-6 mb-8">
                    <button 
                        className={`px-3 py-1.5 mx-2 rounded-full font-bold transition-colors duration-300 ${activeTab === 'encrypt' ? 'bg-secondary text-white' : 'bg-white text-secondary border border-secondary'}`}
                        onClick={() => setActiveTab('encrypt')}
                    >
                        Encryption
                    </button>
                    <button 
                        className={`px-3 py-1.5 mx-2 rounded-full font-bold transition-colors duration-300 ${activeTab === 'decrypt' ? 'bg-secondary text-white' : 'bg-white text-secondary border border-secondary'}`}
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