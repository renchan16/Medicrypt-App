import React, { useState } from 'react';
import { HiArrowRight } from 'react-icons/hi';
import Card from '../components/Cards';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../pages-css/LandingPage.css';
import logo from '../assets/MedicryptLogo.png';

function LandingPage() {
  const navigate = useNavigate();
  const [inProp, setInProp] = useState(true);

  const handleNavigate = (path) => {
    setInProp(false);
    setTimeout(() => navigate(path), 300);
  };

  // Animation variants for motion
  const fadeIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center min-h-screen"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
    >
      <div className="flex items-center mb-7">
        <img src={logo} alt="Medicrypt Logo" className="w-20 mt-2" />
        <h1 className="text-7xl font-bold text-transparent bg-clip-text gradient-text leading-tight pb-2">medicrypt.</h1>
      </div>

      <motion.div
        className="sibling-fade grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-1"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
      >
        <Card width="col-span-1 row-span-5" height="h-[350px]">
          <motion.div
            className="bg-primary h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#3a72bb] hover:shadow-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate('/howtouse')}
          >
            <div className="flex-grow flex items-end">
              <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Instructions</p>
            </div>
            <HiArrowRight className="text-white font-[10px] absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </motion.div>
        </Card>

        <Card width="col-span-1 row-span-2" height="h-[165px]">
          <motion.div
            className="bg-primary1 h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#101e31] hover:shadow-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate('/encrypt')}
          >
            <div className="flex-grow flex items-end">
              <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Encrypt</p>
            </div>
            <div>
              <p className="text-white text-xxs">Encrypt a video file</p>
            </div>
            <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </motion.div>
        </Card>

        <Card width="col-span-1 row-span-2" height="h-[165px]">
          <motion.div
            className="bg-black h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#0d0d0e] hover:shadow-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate('/decrypt')}
          >
            <div className="flex-grow flex items-end">
              <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Decrypt</p>
            </div>
            <div>
              <p className="text-white text-xxs">Decrypt a video file</p>
            </div>
            <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </motion.div>
        </Card>

        <Card width="col-span-2 row-span-3" height="h-[170px]">
          <motion.div
            className="section-transparent border-2 border-black h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:border-[#000000] hover:bg-gray-100 hover:shadow-lg hover:scale-105"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate('/explore')}
          >
            <div className="flex-grow flex items-end">
              <p className="text-black font-bold text-xl transition-colors duration-300">Explore Features</p>
            </div>
            <HiArrowRight className="text-black font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default LandingPage;
