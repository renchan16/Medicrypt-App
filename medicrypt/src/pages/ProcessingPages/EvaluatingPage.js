/**
 * EvaluatingPage Component
 *
 * This component handles the evaluation process of a video encryption or decryption operation. 
 * It listens for real-time updates from the server regarding the status of the process and displays 
 * the results once the evaluation is complete. Users can also halt the processing if needed.
 *
 * Functionality:
 * --------------
 * - Sends an initial request to the server to start the analysis process based on the inputs provided.
 * - Uses EventSource to receive real-time updates about the ongoing evaluation process, including 
 *   success/failure status and relevant metrics.
 * - Displays a loading spinner and status messages during the processing phase.
 * - Provides a button to halt the ongoing processing if the user chooses to stop the operation.
 * - After processing, displays a summary of the evaluation results and options to navigate to 
 *   the analytics summary or home page.
 *
 * State Variables:
 * -----------------
 * - isProcessing: State variable indicating whether the processing is ongoing.
 * - currentProcess: State variable for holding the current status message from the processing server.
 * - processStatus: State variable for indicating the overall status of the process (success/failure).
 * - processDescription: State variable for detailed description of the processing outcome.
 * - inputFiles: State variable for storing the input file names that were evaluated.
 * - resolutions: State variable for holding the resolutions of the input files.
 * - baselineSpeedMetrics: State variable for storing metrics related to baseline speed.
 * - csvFilepaths: State variable for holding the file paths of generated CSV files.
 * - dots: State variable used to create a loading ellipsis effect for the process description.
 *
 * Refs:
 * ------
 * - navigate: Hook from `react-router-dom` for programmatic navigation between pages.
 * - location: Hook from `react-router-dom` for accessing location state passed from previous pages.
 *
 * Functions:
 * ----------
 * - processData():
 *   - Sends a request to initiate the analysis handler and sets up an EventSource to listen for 
 *     process updates from the server.
 *
 * - haltProcessing(): 
 *   - Sends a request to halt the ongoing process and updates the component state accordingly.
 *
 * - navigateEvaluateSummary(): 
 *   - Navigates to the results summary page with the relevant data collected during evaluation.
 *
 * - navigateHome(): 
 *   - Navigates the user back to the home page.
 *
 * - navigateEvaluatePage(): 
 *   - Navigates to the evaluation page based on the process type and passes necessary data.
 *
 * Global Variables:
 * -----------------
 * - navigate: Hook from `react-router-dom` for programmatic navigation between pages.
 * - location: Hook from `react-router-dom` for accessing location state passed from previous pages.
 *
 * Props:
 * -------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering and state management.
 * - react-router-dom: For navigation and accessing the navigate and location hooks.
 * - axios: For making HTTP requests to the backend server.
 * - react-spinners: For displaying a loading spinner during processing.
 * - ProcessComplete: Component for displaying the completion status and results of the evaluation.
 * - NavButton: Custom button component for navigation actions.
 * - ProcessErrorMessage: Utility function for handling and displaying error messages.
 * - react-icons: For iconography (FaRegStopCircle).
 *
 * Example:
 * -------
 * <EvaluatingPage />
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created:
 * Last Modified:
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarLoader } from 'react-spinners';  
import ProcessComplete from '../../components/sections/ProcessComplete';
import NavButton from '../../components/buttons/NavButton';
import '../../pages-css/General.css';
import axios from 'axios';
import { ProcessErrorMessage } from '../../utils/ProcessErrorHandler';
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
    const processData = async () => {
      try {
        const response = await axios.post(`http://localhost:8000/init_analysis_handler`, inputs);
        console.log(`${processType}ion response:`, response.data);
      } 
      catch (error) {
        console.error(`${processType}ion error:`, error);
      }

      // Event source for realtime display of current state of evaluation
      const eventSource = new EventSource(`http://localhost:8000/${processType.toLowerCase()}/evaluating`);

      /* Sets data['stdout'] as the display message in the UI, if status is success or failure, display
         completion or error message with appropriate descriptions
      */
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

  // Function that allows user to halt the evaluation process
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

  // Navigates Back to Landing Page
  const navigateHome = () => {
    navigate('/');
  };

  // Navigates to the Results Page
  const navigateEvaluateSummary = () => {
    navigate('/results', {
      state : {
        processType: processType,
        data: {inputFiles, resolutions, csvFilepaths, baselineSpeedMetrics}
      }
    })
  }

  // Navigates Back to Evaluation Page upon Error
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