import React from 'react';
import { HiArrowRight } from 'react-icons/hi'; 
import Card from '../components/Cards';
import { useNavigate } from 'react-router-dom';
import '../pages-css/LandingPage.css';
import logo from '../assets/MedicryptLogo.png';
import { CSSTransition } from 'react-transition-group';
import { useState } from 'react';


function LandingPage() {
  const navigate = useNavigate();
  const [inProp, setInProp] = useState(true); 

  const handleNavigate = (path) => {
    setInProp(false); 
    setTimeout(() => navigate(path), 300);
  };

  return (
    <CSSTransition
      in={inProp}
      timeout={300}
      classNames="fade"
      unmountOnExit
    >
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="flex items-center mb-7">
          <img src={logo} alt="Medicrypt Logo" className="w-20 mt-2" />
          <h1 className="text-6xl font-bold text-transparent bg-clip-text gradient-text">medicrypt.</h1>
        </div>

        <div className="sibling-fade grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-1">
          <Card width="col-span-1 row-span-5" height="h-[350px]">
            <div
              className="bg-primary h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#3a72bb] hover:shadow-lg hover:scale-105"
              onClick={() => handleNavigate('/howtouse')}
            >
              <div className="flex-grow flex items-end">
                <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Instructions</p>
              </div>
              <HiArrowRight className="text-white font-[10px] absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
            </div>
          </Card>

          <Card width="col-span-1 row-span-2" height="h-[165px]">
            <div
              className="bg-primary1 h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#101e31] hover:shadow-lg hover:scale-105"
              onClick={() => handleNavigate('/encrypt')}
            >
              <div className="flex-grow flex items-end">
                <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Encrypt</p>
              </div>
              <div>
                <p className="text-white text-xxs">Encrypt a video file</p>
              </div>
              <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
            </div>
          </Card>

          <Card width="col-span-1 row-span-2" height="h-[165px]">
            <div
              className="bg-black h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:bg-[#0d0d0e] hover:shadow-lg hover:scale-105"
              onClick={() => handleNavigate('/decrypt')}
            >
              <div className="flex-grow flex items-end">
                <p className="text-white font-bold text-xl transition-colors duration-300 hover:text-gray-200">Decrypt</p>
              </div>
              <div>
                <p className="text-white text-xxs">Decrypt a video file</p>
              </div>
              <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
            </div>
          </Card>

          <Card width="col-span-2 row-span-3" height="h-[170px]">
            <div
              className="section-transparent border-2 border-black h-full flex flex-col justify-between p-3 rounded-[18px] relative transition-all duration-300 hover:border-[#000000] hover:bg-gray-100 hover:shadow-lg hover:scale-105"
              onClick={() => handleNavigate('/explore')}
            >
              <div className="flex-grow flex items-end">
                <p className="text-black font-bold text-xl transition-colors duration-300">Explore Features</p>
              </div>
              <HiArrowRight className="text-black font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
            </div>
          </Card>
        </div>
      </div>
    </CSSTransition>
  );
}

export default LandingPage;
