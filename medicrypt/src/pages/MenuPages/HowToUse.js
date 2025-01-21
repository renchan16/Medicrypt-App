/**
 * HowToUse Component
 *
 * This component provides users with instructions for utilizing encryption and decryption features
 * in the application. It displays two processes: "Encryption" and "Decryption," each with
 * step-by-step instructions and relevant details. Users can interact with these instructions
 * through a clean and responsive UI.
 *
 * Features:
 * ---------
 * - Displays tabs for "Encryption" and "Decryption" processes.
 * - Each process contains clickable steps with icons, titles, and descriptions.
 * - Uses a visually appealing design with Tailwind CSS for styling.
 * - A back button is included for navigation to the previous page.
 * - Animations are implemented with Framer Motion for a smooth user experience.
 * - Includes a "Security Notice" to remind users of secure key exchange practices.
 *
 * Props:
 * ------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: For rendering the component and managing state.
 * - react-router-dom: To enable navigation functionality.
 * - framer-motion: For animations and transitions.
 * - react-icons & lucide-react: For providing icons for the instructions and UI elements.
 *
 * Example Usage:
 * --------------
 * <HowToUse />
 *
 * Authors:
 * --------
 * - Renz Carlo T. Caritativo
 * - Charles Andre C. Bandala
 * 
 * Date Created: 9/12/2024
 * Last Modified: 1/21/2025
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowCircleLeft } from "react-icons/fa";
import { TbShieldQuestion } from "react-icons/tb";
import { GrSecure, GrInsecure  } from "react-icons/gr";
import { Video, FolderOutput, Key, Lock, ChevronRight, Info } from 'lucide-react';

const HowToUse = () => {
    const navigate = useNavigate();

    const InstructionCard = ({ processType, processTitle, processSteps }) => {
        const isEncryption = processType === "encrypt";
        const baseColor = isEncryption ? 'border-primary' : 'border-black';
        return (
            <div
                className = {`border-4 ${baseColor} rounded-2xl p-5`}
            >
                <div className = {
                    `inline-flex 
                    items-center 
                    space-x-2 
                    px-4 
                    py-2 
                    rounded-lg 
                    ${isEncryption ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-black'} mb-4`}
                >
                    {isEncryption ? <GrSecure className="w-4 h-4" /> : <GrInsecure className="w-4 h-4" />}
                    <span className="font-light font-avantGarde text-md">{processTitle}</span>
                </div>
                <div className={`space-y-6`}>
                    {
                        processSteps.map((processStep, index) => (
                            <div key={index} className="relative">
                                 <div className="flex items-start space-x-4">
                                    <div className={`w-8 h-8 rounded-full ${isEncryption ? 'bg-blue-50' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                                        <processStep.icon className={`w-4 h-4 ${isEncryption ? 'text-primary' : 'text-black'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <h3 className={`font-semibold ${isEncryption ? 'text-primary3' : 'text-gray-900'}`}>
                                                {processStep.title}
                                            </h3>
                                            <ChevronRight className={`w-4 h-4 mx-2 ${isEncryption ? 'text-blue-300' : 'text-gray-300'}`} />
                                            <span className="text-sm text-gray-500">{processStep.detail}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">{processStep.description}</p>
                                    </div>
                                 </div>
                                {index < processSteps.length - 1 && (
                                    <div className={`absolute left-4 top-8 w-0.5 h-6 ${isEncryption ? 'bg-blue-100' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))
                    }
                </div>
            </div>
        );  
    };

    const pageAnimation = {
        initial: {
            opacity: 0,
            y: '40vh',
        },
        in: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 40 }
        },
        out: {
            opacity: 0,
            y: '-100vh',
            transition: { ease: 'easeInOut', duration: 0.3 }
        }
    };

    const encryptSteps = [
        {
          icon: Lock,
          title: "Method",
          detail: "Choose Algorithm",
          description: "Select your preferred encryption algorithm"
        },
        {
          icon: Video,
          title: "Source",
          detail: "Select Input",
          description: "Choose the video file you want to encrypt"
        },
        {
          icon: FolderOutput,
          title: "Destination",
          detail: "Set Location",
          description: "Select where to save the encrypted video file"
        },
        {
          icon: Key,
          title: "Security",
          detail: "Set Password",
          description: "Create a strong password to secure your video"
        }
      ];
    
      const decryptSteps = [
        {
          icon: Lock,
          title: "Method",
          detail: "Match Algorithm",
          description: "Select the same method used during encryption"
        },
        {
          icon: Video,
          title: "Source",
          detail: "Select File",
          description: "Choose the encrypted video file to decrypt"
        },
        {
          icon: FolderOutput,
          title: "Destination",
          detail: "Set Location",
          description: "Choose where to save the decrypted video"
        },
        {
          icon: Key,
          title: "Authentication",
          detail: "Key & Password",
          description: "Provide both the decryption key file and password"
        }
    ];

    return (
        <div className="h-full w-full flex justify-center items-center overflow-hidden">
            <button
                onClick={() => navigate('/')}
                className="absolute top-10 left-14 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl z-10"
            >
                <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
            </button>
            <motion.div
                className="flex items-center justify-center h-full w-full select-none"
                variants={pageAnimation}
                initial="initial"
                animate="in"
                exit="out"
            >
                <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
                    <div className='relative top-1/2 transform -translate-y-1/2'>
                        <h1 className="mb-4 text-4xl font-bold text-secondary font-avantGarde flex items-center">
                            <TbShieldQuestion className="mr-2 text-5xl text-secondary" />
                            Instructions
                        </h1>
                        <div className={"max-w-full mx-auto grid grid-cols-2 gap-8"}>
                            <InstructionCard processType={'encrypt'} processTitle={'Encryption Process'} processSteps={encryptSteps}/>
                            <InstructionCard processType={'decrypt'} processTitle={'Decryption Process'} processSteps={decryptSteps}/>
                        </div>
                        <div className="max-w-full mx-auto mt-8">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Info className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium font-avantGarde text-yellow-800">Security Notice</h4>
                                        <p className="text-sm text-yellow-700">
                                            Always use secure channels for key exchange and never share your encryption keys!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default HowToUse;