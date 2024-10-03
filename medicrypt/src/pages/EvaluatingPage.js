import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClimbingBoxLoader } from 'react-spinners';
import ProcessComplete from '../components/sections/ProcessComplete';
import NavButton from '../components/buttons/NavButton';
import '../pages-css/General.css';
import logo from '../assets/MedicryptLogo.png';
import axios from 'axios';
import { ProcessErrorMessage } from '../utils/ProcessErrorHandler';

function EvaluatingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { processType, inputs } = location.state || {};
    const [isProcessing, setIsProcessing] = useState(true);
    const [currentProcess, setCurrentProcess] = useState(false);
    const [dots, setDots] = useState(''); 
    
    // Simulate loading text ellipsis effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 625);

        return () => clearInterval(interval);
    }, []);

    // Process video data based on process type
  useEffect(() => {
    const processData = async () => {
      try {
        const response = await axios.post(`http://localhost:8000/init_handler`, inputs);
        console.log(`${processType}ion response:`, response.data);
      } 
      catch (error) {
        console.error(`${processType}ion error:`, error);
      }
    };

    processData();
  }, [processType, inputs, navigate]);

    return (
      <div className='flex items-center justify-center h-full w-full select-none'>
        <div className="relative h-full w-11/12 p-6">
            <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />
          
            {/* Processing Loader */}
            <div className={`${isProcessing ? 'block' : 'hidden'} w-full h-full flex flex-col items-center justify-center`}>
            {/* Centered Processing Content */}
            <h1 className='mt-6 text-4xl font-bold text-black'>{processType}ing{dots}</h1>
            <div className="w-full h-60 flex flex-col items-center justify-center">
                <ClimbingBoxLoader color="#1D1B20" loading={true} size={20} />
                <p className="text-black mt-4">{currentProcess}</p>
            </div>

            {/* Stop Processing Button */}
            <NavButton
                className="w-60 h-12 rounded-lg"
                buttonText="Stop Processing"
                buttonColor="primary1"
                hoverColor="primary0"
                buttonTextColor="white"
            />
            </div>
        </div>
      </div>
    );
  }
  
export default EvaluatingPage;