import React, { useState, useEffect } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import axios from 'axios';
import logo from '../assets/MedicryptLogo.png';
import { ProcessErrorMessage } from '../utils/ProcessErrorHandler';
import ProcessComplete from '../components/sections/ProcessComplete';
import { ClimbingBoxLoader } from 'react-spinners'; // Import the loader

function ProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputFile, setInputFile] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [processStatus, setProcessStatus] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const { processType, inputs } = location.state || {};
  const [dots, setDots] = useState(''); // State for trailing dots in "Loading..."

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
        const response = await axios.post(`http://localhost:8000/${processType.toLowerCase()}/processing`, inputs);
        console.log(`${processType}ion response:`, response.data);

        setIsProcessing(false);
        setProcessStatus(response.data['status'])

        if (response.data['status'] === "failure"){
          setProcessDescription(ProcessErrorMessage(response.data['stdout']));
        }
        else {
          setInputFile(response.data['inputfile'])
          setProcessDescription(`The ${response.data['inputfile']} has been successfully ${processType}ed! You can either go back to the home page or click "Evaluate ${processType}ion" to analyze the results.`);
        }
      } 
      catch (error) {
        console.error(`${processType}ion error:`, error);
      }
    }
    
    processData();
  }, [processType, inputs, navigate]);

  return (
    <div className='flex items-center justify-center h-full w-full select-none'>
      <div className="relative h-full w-11/12 p-6">
        <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />
        <div className={`${isProcessing ? 'block' : 'hidden'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 flex flex-col items-center justify-center`}>
          <ClimbingBoxLoader className='' color="#1D1B20" loading={true} size={20} />
          <p className='mt-6 text-2xl font-bold text-black'>{processType}ing{dots}</p>
        </div>

        <ProcessComplete 
          className={`${isProcessing ? 'hidden' : 'block'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`} 
          inputFile={inputFile}
          processType={processType}
          processStatus={processStatus}
          processDescription={processDescription}
          />
      </div>
    </div>
  );
}

export default ProcessingPage;