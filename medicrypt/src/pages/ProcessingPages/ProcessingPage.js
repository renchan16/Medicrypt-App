/**
 * ProcessingPage Component
 *
 * This component manages the processing phase of a video encryption or decryption operation. 
 * It initiates the process based on user inputs and listens for real-time updates from the server. 
 * The user can also halt the processing if necessary.
 *
 * Functionality:
 * --------------
 * - Receives the process type and inputs from the previous page using `react-router-dom`.
 * - Sends an initial request to the server to initiate the cryptographic handler for the specified process.
 * - Utilizes EventSource to receive real-time updates about the processing status, including 
 *   current progress and success/failure indicators.
 * - Displays a loading spinner and status messages during processing.
 * - Provides a button to halt the ongoing processing if the user chooses to stop the operation.
 * - Once processing is complete, displays a summary of the results and options to navigate to 
 *   the evaluation page or back to the process page.
 *
 * State Variables:
 * -----------------
 * - inputFiles: State variable to store the names of input files being processed.
 * - isProcessing: State variable indicating whether the processing is ongoing.
 * - currentProcess: State variable for holding the current status message from the processing server.
 * - processStatus: State variable for indicating the overall status of the process (success/failure).
 * - processDescription: State variable for detailed description of the processing outcome.
 * - inputFilepaths: State variable for holding the file paths of input files.
 * - algorithm: State variable for storing the name of the algorithm used in the process.
 * - outputDirpath: State variable for holding the output directory path.
 * - outputFilepaths: State variable for storing the paths of the output files generated.
 * - timeFilepaths: State variable for holding the file paths of generated timing files.
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
 *   - Sends a request to initialize the cryptographic handler and sets up an EventSource to listen for 
 *     updates on the processing status from the server.
 *
 * - haltProcessing(): 
 *   - Sends a request to halt the ongoing processing and updates the component state accordingly.
 *
 * - navigateHome(): 
 *   - Navigates the user back to the home page.
 *
 * - navigateProcessPage(): 
 *   - Navigates to the previous process page.
 *
 * - navigateEvaluatePage(): 
 *   - Navigates to the evaluation page with the relevant data collected during processing.
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
 * - ProcessComplete: Component for displaying the completion status and results of the process.
 * - NavButton: Custom button component for navigation actions.
 * - ProcessErrorMessage: Utility function for handling and displaying error messages.
 * - react-icons: For iconography (FaRegStopCircle).
 *
 * Example:
 * -------
 * <ProcessingPage />
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 9/25/2024
 * Last Modified: 11/11/2024
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

function ProcessingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { processType, inputs } = location.state || {};

    const [inputFiles, setInputFiles] = useState("");
    const [isProcessing, setIsProcessing] = useState(true);
    const [currentProcess, setCurrentProcess] = useState(false);
    const [processStatus, setProcessStatus] = useState("");
    const [processDescription, setProcessDescription] = useState("");
    const [inputFilepaths, setInputFilePaths] = useState("");
    const [algorithm, setAlgorithm] = useState("");
    const [outputDirpath, setOutputDirpath] = useState("");
    const [outputFilepaths, setOutputFilepaths] = useState("");
    const [timeFilepaths, setTimeFilepaths] = useState("");
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
                const response = await axios.post(`http://localhost:8000/init_cryptographic_handler`, inputs);
                console.log(`${processType}ion response:`, response.data);
            } 
            catch (error) {
                console.error(`${processType}ion error:`, error);
            }

            // Event source for realtime display of current state of evaluation
            const eventSource = new EventSource(`http://localhost:8000/${processType.toLowerCase()}/processing`);

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
                        setInputFilePaths(data['input_filepaths']);
                        setAlgorithm(data['algorithm']);
                        setOutputDirpath(data['output_dirpath']);
                        setOutputFilepaths(data['output_filepaths']);
                        setTimeFilepaths(data['time_filepaths']);
                        setProcessDescription(`The ${data['input_files'].join(', ')} has been successfully ${processType}ed! You can either go back to the home page or click "Evaluate ${processType}ion" to analyze the results.`);
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

    // Function that allows user to halt the encryption/decryption process
    const haltProcessing = async () => {
        try {
            const response = await axios.post('http://localhost:8000/halt_processing');
            console.log(`${processType}ion response:`, response.data);
            setProcessStatus(response.data['status']);
            setProcessDescription(ProcessErrorMessage(response.data));
            setIsProcessing(false);
        } 
        catch (error) {
            console.error('Error halting processing:', error);
        }
    };

    // Navigates to the Landing Page
    const navigateHome = () => {
        navigate('/');
    };

    // Navigates to the Results Page
    const navigateProcessPage = () => {
        navigate(`/${processType.toLowerCase()}`);
    };

    // Navigates to the Evaluation Page
    const navigateEvaluatePage = () => {
        if (processType === "Encrypt") {
            navigate(`/${processType.toLowerCase()}/evaluate`, {
                state: { data: { algorithm, inputFilepaths, outputFilepaths, timeFilepaths } }
            });
        } 
        else {
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
                    <h1 className='text-4xl font-bold text-secondary font-avantGarde -mb-10'>{processType}ing{dots}</h1>
                    <div className="w-full h-60 flex flex-col items-center justify-center -mb-20">
                        <BarLoader color="#102a6b" loading={true} width={300} />
                        <p className="text-secondary mt-4">{currentProcess}</p>
                    </div>

                    {/* Stop Processing Button with Icon */}
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
                        processType={processType === "Encrypt" ? "Encryption" : "Decryption"}
                        processStatus={processStatus}
                        processDescription={processDescription}
                        inputFiles={inputFiles}
                        outputLocation={outputFilepaths.length > 1 ? outputDirpath : outputFilepaths[0]}
                        nextPageButtonText={`Evaluate ${processType}ion`}
                        viewFileButtonText="View File"
                        navigateNextPage={navigateEvaluatePage}
                        navigatePrevPage={navigateProcessPage}
                        navigateHome={navigateHome}
                    />
                )}
            </div>
        </div>
    );
}

export default ProcessingPage;