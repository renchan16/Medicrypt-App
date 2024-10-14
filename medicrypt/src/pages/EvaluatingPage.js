import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarLoader } from 'react-spinners';  
import ProcessComplete from '../components/sections/ProcessComplete';
import NavButton from '../components/buttons/NavButton';
import '../pages-css/General.css';
import axios from 'axios';
import { ProcessErrorMessage } from '../utils/ProcessErrorHandler';
import { FaRegStopCircle } from 'react-icons/fa'; 


function EvaluatingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { processType, inputs } = location.state || {};
    const [isProcessing, setIsProcessing] = useState(true);
    const [currentProcess, setCurrentProcess] = useState(false);
    const [processStatus, setProcessStatus] = useState("");
    const [processDescription, setProcessDescription] = useState("");
    const [inputFiles, setInputFiles] = useState("");
    const [resolutions, setResolutions] = useState("")
    const [baselineSpeedMetrics, setBaselineSpeedMetrics] = useState("")
    const [csvFilepaths, setCSVFilepaths] = useState("");
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
    console.log(inputs);
    const processData = async () => {
      try {
        const response = await axios.post(`http://localhost:8000/init_analysis_handler`, inputs);
        console.log(`${processType}ion response:`, response.data);
      } 
      catch (error) {
        console.error(`${processType}ion error:`, error);
      }

      const eventSource = new EventSource(`http://localhost:8000/${processType.toLowerCase()}/evaluating`);

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
            setInputFiles(data['input_files']);
            setResolutions(data['resolutions'])
            setBaselineSpeedMetrics(data['baseline_speed_metrics'])
            setCSVFilepaths(data['output_filepaths']);
            setProcessDescription(`The ${processType}ion for the ${data['input_files'].join(', ')} has been successfully evaluated! You can either go back to the home page or click "View Analytics Summary" or "View CSV File" to view the results.`);
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

  const navigateEvaluateSummary = () => {
    navigate('/results', {
      state : {
        processType: processType,
        data: {inputFiles, resolutions, csvFilepaths, baselineSpeedMetrics}
      }
    })
  }

  const navigateHome = () => {
    navigate('/');
  };

  const navigateEvaluatePage = () => {
    if (processType === "Encrypt") {
      let algorithm= inputs['algorithm'];
      let inputFilepaths = inputs['origFilepaths']
      let outputFilepaths = inputs['processedFilepaths']
      let timeFilepaths = inputs['timeFilepaths']

      navigate(`/${processType.toLowerCase()}/evaluate`, {
        state: { data: {algorithm, inputFilepaths, outputFilepaths, timeFilepaths} }
      });
    }
    else {
      let algorithm= inputs['algorithm'];
      let outputFilepaths = inputs['processedFilepaths']
      let timeFilepaths = inputs['timeFilepaths']
      navigate(`/${processType.toLowerCase()}/evaluate`, {
        state: { data: { algorithm, outputFilepaths, timeFilepaths } }
      });
    }
  };

  return (
    <div className='flex items-center justify-center h-full w-full select-none'>
      <div className="relative h-full w-11/12 p-6">        
          {/* Processing Loader */}
          <div className={`${isProcessing ? 'block' : 'hidden'} w-full h-full flex flex-col items-center justify-center`}>
          {/* Centered Processing Content */}
          <h1 className='text-4xl font-bold text-secondary -mb-10'>Analyzing {processType}ion{dots}</h1>
          <div className="w-full h-60 flex flex-col items-center justify-center -mb-20">
            <BarLoader color="#102a6b" loading={true} width={300} />
            <p className="text-secondary mt-4">{currentProcess}</p>
          </div>

          {/* Stop Processing Button */}
          <NavButton
            className="w-60 h-12 rounded-lg mt-5 flex items-center justify-center border-2 border-secondary "
            buttonText="Stop Processing"
            buttonColor="white"
            hoverColor="secondary1"
            buttonTextColor="secondary"
            hoverTextColor= "white"
            buttonIcon={FaRegStopCircle}
            onClickFunction={haltProcessing}
            />
          </div>
          
          {!isProcessing && (
          <ProcessComplete
            processType={"Evaluation"}
            processStatus={processStatus}
            processDescription={processDescription}
            inputFiles={inputFiles}
            nextPageButtonText="View Analytics Summary"
            navigateNextPage={navigateEvaluateSummary}
            navigatePrevPage={navigateEvaluatePage}
            navigateHome={navigateHome}
          />
        )}
      </div>
    </div>
  );
}
  
export default EvaluatingPage;