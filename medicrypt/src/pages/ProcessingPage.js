import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBarChart } from "react-icons/fi";
import { LuHome } from "react-icons/lu";
import { FaRegFolder } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { ClimbingBoxLoader } from 'react-spinners';
import { ProcessAlert, ProcessAlertTitle, ProcessAlertDescription } from '../components/sections/ProcessAlert';
import NavButton from '../components/buttons/NavButton';
import '../pages-css/General.css';
import axios from 'axios';
import logo from '../assets/MedicryptLogo.png';
import { ProcessErrorMessage } from '../utils/ProcessErrorHandler';

function ProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processType, inputs } = location.state || {};
  
  const [inputFile, setInputFile] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentProcess, setCurrentProcess] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [outputLocation, setOutputLocation] = useState("");
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

      const eventSource = new EventSource(`http://localhost:8000/${processType.toLowerCase()}/processing`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Event data:', data);

        setCurrentProcess(data['stdout']); 

        if (data['status'].trim() === "success" || data['status'].trim() === "failure"){
          setIsProcessing(false);
          setProcessStatus(data['status']);
          if (data['status'] === "failure") {
            setProcessDescription(ProcessErrorMessage(data));
          } 
          else {
            setInputFile(data['inputfile']);
            setOutputLocation(data['outputloc']);
            setProcessDescription(`The ${data['inputfile']} has been successfully ${processType}ed! You can either go back to the home page or click "Evaluate ${processType}ion" to analyze the results.`);
          }
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        console.error('EventSource error');
        eventSource.close(); // Close the connection on error
        setIsProcessing(false);
      };
    };

    processData();
  }, [processType, inputs, navigate]);

  const haltProcessing = async () => {
    try {
      const response = await axios.post('http://localhost:8000/halt_processing');
      console.log(`${processType}ion response:`, response.data);
      setProcessStatus(response.data['status']);
      setProcessDescription(ProcessErrorMessage(response.data))
      setIsProcessing(false);
    } 
    catch (error) {
      console.error('Error halting processing:', error);
    }
  };

  const navigateHome = () => {
    navigate('/');
  };

  const navigateProcessPage = () => {
    navigate(`/${processType.toLowerCase()}`);
  };

  return (
    <div className='flex items-center justify-center h-full w-full select-none'>
      <div className="relative h-full w-11/12 p-6">
        <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />
        
        {/* Processing Loader */}
        <div className={`${isProcessing ? 'block' : 'hidden'} w-full h-full flex flex-col items-center justify-center`}>
          {/* Centered Processing Content */}
          <h1 className='mt-6 text-3xl font-bold text-black'>{processType}ing{dots}</h1>
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
            onClickFunction={haltProcessing}
          />
        </div>

        {/* Process Complete Section */}
        <div className={`${isProcessing ? 'hidden' : 'block'} w-11/12 space-y-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
          <h1 className="mb-4 text-4xl text-primary1 font-bold">{processType}ion {processStatus === "success" ? "Complete" : "Failed"}!</h1>

          <ProcessAlert processStatus={processStatus}>
            <ProcessAlertTitle>{processStatus === "success" ? "Success" : "Error"}</ProcessAlertTitle>
            <ProcessAlertDescription>{processDescription}</ProcessAlertDescription>
          </ProcessAlert>

          <p className="text-sm text-gray-600">
            File processed: <span className="font-medium">{inputFile !== "" ? inputFile : "None"}</span>
          </p>

          <div className="flex flex-col gap-4">
            {/* Success Actions */}
            <div className={`${processStatus === "success" ? 'block' : 'hidden'} flex flex-shrink-0 gap-4`}>
              <NavButton
                className={`w-full h-12`}
                buttonText={`Evaluate ${processType}ion`}
                buttonColor={"primary1"}
                hoverColor={"primary0"}
                buttonTextColor={"white"}
                buttonIcon={FiBarChart}
                onClickFunction={navigateHome}
              />
              <NavButton
                className={`w-full h-12`}
                buttonColor={"primary2"}
                buttonText={"View File"}
                buttonTextColor={"black"}
                buttonIcon={FaRegFolder}
                filePath={outputLocation}
              />
            </div>

            {/* Error Action (Try Again) */}
            <div className={`${processStatus === "success" ? 'hidden' : 'block'} flex flex-shrink-0 gap-4`}>
              <NavButton
                className={`w-full h-12`}
                buttonText={`Try Again`}
                buttonColor={"primary1"}
                hoverColor={"primary0"}
                buttonTextColor={"white"}
                buttonIcon={TbReload}
                onClickFunction={navigateProcessPage}
              />
            </div>

            {/* Return Home */}
            <NavButton
              className={`w-full h-12`}
              buttonText={"Return Home"}
              buttonColor={"primary2"}
              buttonTextColor={"black"}
              buttonIcon={LuHome}
              onClickFunction={navigateHome}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessingPage;