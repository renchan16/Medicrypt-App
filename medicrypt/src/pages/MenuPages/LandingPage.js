import React, { useState } from 'react';
import { FaChevronCircleRight } from "react-icons/fa";
import Card from '../../components/Cards';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../pages-css/LandingPage.css';
import logo from '../../assets/MedicryptLogo.png';
import InstructionsPNG from '../../assets/InstructionsAnimation.png';
import LearnMoreAnimationPNG from '../../assets/LearnMoreAnimation.png';
import DecryptAnimationPNG from '../../assets/DecryptAnimation.png';
import EncryptAnimationPNG from '../../assets/EncryptAnimation.png';

function LandingPage() {
    const navigate = useNavigate();
    const [inProp, setInProp] = useState(true);

    const handleNavigate = (path) => {
        setInProp(false);
        setTimeout(() => navigate(path), 300);
    };

    // Pan animation variants for motion
    const panVariants = {
        hidden: { x: '-100vw', opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: 'spring', duration: 2, bounce: 0.5 },
        },
        exit: { x: '80vw', opacity: 0, transition: { duration: 0.5 } },
    };

    return (
        // Ensure the outermost div has a full screen background
        <div className="min-h-screen landing-background flex justify-center items-center overflow-hidden">
            <motion.div
                className="flex flex-col justify-center items-center min-h-screen"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={panVariants}
            >
                <div className="flex items-center mb-3">
                    <img src={logo} alt="Medicrypt Logo" className="w-20 mt-2" />
                    <h1 className="text-7xl font-bold text-white bg-clip-text leading-tight pb-1 font-avantGarde">medicrypt</h1>
                </div>

                <motion.div
                    className="sibling-fade grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-1"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={panVariants}
                >
                    {/* Instructions Card */}
                    <Card width="col-span-1 row-span-5" height="h-[350px]">
                        <motion.div
                            className="bg-primary3 h-full flex flex-col justify-between p-4 rounded-[18px] relative transition-all duration-300 hover:bg-secondary hover:shadow-lg hover:scale-105 z-10"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleNavigate('/howtouse')}
                        >
                            <div className="flex-grow flex justify-center items-center">
                                <div className="w-50 h-40 mt-20 mb-5 overflow-hidden z-10">
                                    <img src={InstructionsPNG} alt="Instructions Animation" className="w-full h-40 object-contain" />
                                </div>
                            </div>
                            <div className="flex-grow flex items-end">
                                <p className="text-white font-bold text-2xl transition-colors duration-300 hover:text-gray-200">Instructions</p>
                            </div>
                            <div className="inline-block">
                                <button className='bg-white text-primary3 text-xxs rounded-[10px] w-15 px-2 py-0.5 font-bold mt-1'>HOW TO USE THE APP</button>
                            </div>
                            <FaChevronCircleRight className="text-white text-3xl absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
                        </motion.div>
                    </Card>

                    {/* Explore Features Card */}
                    <Card width="col-span-2 row-span-3" height="h-[120px]">
                        <motion.div
                            className="bg-white h-full flex justify-between items-center p-3 rounded-[18px] relative transition-all duration-300 hover:border-primary hover:bg-gray-100 hover:shadow-lg hover:scale-105 z-10"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleNavigate('/explore')}
                        >
                            <div className="flex flex-col justify-center items-start">
                                <p className="text-primary0 font-bold text-2xl transition-colors duration-300">
                                    Explore Features
                                </p>
                                <button className="bg-primary3 text-white text-xxs rounded-[10px] w-15 px-2 py-0.5 font-bold mt-1">
                                    LEARN MORE
                                </button>
                            </div>
                            <div className="w-40 h-30">
                                <img
                                    src={LearnMoreAnimationPNG}
                                    alt="Learn More Animation"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <FaChevronCircleRight className="text-primary0 text-3xl font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
                        </motion.div>
                    </Card>

                    {/* Encrypt Card */}
                    <Card width="col-span-1 row-span-2" height="h-[190px]">
                        <motion.div
                            className="bg-primary h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-secondary1 hover:shadow-lg hover:scale-105 z-10"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleNavigate('/encrypt')}
                        >
                            <div className="flex-grow flex justify-center items-center mb-8">
                                <div className="w-40 h-20 z-10">
                                    <img src={EncryptAnimationPNG} alt="Encrypt Animation" className="w-full h-29 object-scale-down" />
                                </div>
                            </div>
                            <div className="flex-grow flex items-end">
                                <p className="text-white font-bold text-2xl transition-colors duration-300 hover:text-gray-200">Encrypt</p>
                            </div>
                            <div className="inline-block">
                                <button className='bg-white text-primary1 text-xxs rounded-[10px] w-15 px-2 py-0.5 font-bold mt-1 '>SECURE YOUR VIDEOS</button>
                            </div>
                            <FaChevronCircleRight className="text-white text-3xl font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
                        </motion.div>
                    </Card>

                    {/* Decrypt Card */}
                    <Card width="col-span-1 row-span-2" height="h-[190px]">
                        <motion.div
                            className="bg-black h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#0f0f0f] hover:shadow-lg hover:scale-105 z-10"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleNavigate('/decrypt')}
                        >
                            <div className="flex-grow flex justify-center items-center mb-2">
                                <div className="w-40 h-20 z-10">
                                    <img src={DecryptAnimationPNG} alt="Decrypt Animation" className="w-full h-30 mb-3 object-fill" />
                                </div>
                            </div>
                            <div className="items-end">
                                <p className="text-white font-bold text-2xl transition-colors duration-300 hover:text-gray-200">Decrypt</p>
                            </div>
                            <div className="inline-block">
                                <button className='bg-white text-black text-xxs rounded-[10px] w-15 px-2 py-0.5 font-bold mt-1'>ACCESS YOUR VIDEOS</button>
                            </div>
                            <FaChevronCircleRight className="text-white text-3xl font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
                        </motion.div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default LandingPage;