import React from 'react';
import { HiArrowRight } from 'react-icons/hi'; 
import Card from '../components/Cards';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate(); 

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-primary"> 
      <h1 className="text-3xl font-bold text-white">MediCrypt</h1>
      <p className="text-regular text-white mb-6">Where your videos go undercover</p>
      <div className="grid grid-cols-3 grid-rows-2 gap-x-3 gap-y-3">
        
        <Card width="col-span-1 row-span-5 w-full" height="h-[300px]">
          <div
            className="bg-[#EF943B] h-full flex flex-col justify-center items-start p-6 rounded-[18px] relative transition-all duration-300 hover:bg-[#E37A14]"
            onClick={() => navigate('/howtouse')} // Navigate to HowToUse page
          >
            <p className="text-black font-semibold text-lg">How to Use</p>
            <HiArrowRight className="text-black font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </div>
        </Card>

        <Card width="col-span-1 row-span-2" height="h-[150px]">
          <div
            className="bg-[#4C7AF7] h-full flex justify-between items-center p-6 rounded-[18px] relative transition-all duration-300 hover:bg-[#3B63D5]"
            onClick={() => navigate('/encrypt')} // Navigate to Encrypt page
          >
            <div>
              <p className="text-white font-semibold text-lg">Encrypt</p>
              <p className="text-white text-xs">Encrypt a video file</p>
            </div>
            <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </div>
        </Card>

        <Card width="col-span-1 row-span-2" height="h-[150px]">
          <div
            className="bg-[#5D25E2] h-full flex justify-between items-center p-6 rounded-[18px] relative transition-all duration-300 hover:bg-[#4A1DBA]"
            onClick={() => navigate('/decrypt')} // Navigate to Decrypt page
          >
            <div>
              <p className="text-white font-semibold text-lg">Decrypt</p>
              <p className="text-white text-xs">Decrypt a video file</p>
            </div>
            <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </div>
        </Card>

        <Card width="col-span-2 row-span-3" height="h-[130px]">
          <div
            className="bg-[#B22B42] h-full flex justify-between items-center p-6 rounded-[18px] relative transition-all duration-300 hover:bg-[#931C33]"
            onClick={() => navigate('/explore')} // Navigate to Explore page
          >
            <div>
              <p className="text-white font-semibold text-lg">Explore Features</p>
            </div>
            <HiArrowRight className="text-white font-semibold absolute bottom-4 right-4 transition-transform duration-300 transform hover:translate-x-2" />
          </div>
        </Card>
        
      </div>
    </div>
  );
}

export default LandingPage;
