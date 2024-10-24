import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import FilePathInput from '../components/text input/FilePathInput';
import ProcessButton from '../components/buttons/ProcessButton';
import { FaPaperclip } from "react-icons/fa6";
import { FaFolder } from 'react-icons/fa6';
import { FaArrowCircleLeft } from "react-icons/fa";


function EvaluateDecrypt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};

  let algorithm= data['algorithm'];
  let processedFilepaths = data['outputFilepaths'];
  let timeFilepaths = data['timeFilepaths'];

  const origFileInputRef = useRef(null);
  const csvOutputLocationRef = useRef(null);

  const [origFilepaths, setOrigFilepaths] = useState("");
  const [areOrigFilepathsValid, setOrigFilepathsValidity] = useState(false);
  const [outputDirpath, setOutputDirpath] = useState("");
  const [isOutputDirpathValid, setOutputDirpathValidity] = useState(true);
  
  const processInputData = () => {
    csvOutputLocationRef.current.validate();
    origFileInputRef.current.validate();

    if (areOrigFilepathsValid && isOutputDirpathValid) {
      navigate('/encrypt/evaluating', {
        state : {
          processType: 'Decrypt',
          inputs : { algorithm, origFilepaths, processedFilepaths, timeFilepaths, outputDirpath }
        }
      });
    }
  }

  return (
    <div className='flex items-center justify-center h-full w-full select-none'>
      <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
        >
          <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
        </button>
                
        <div className='relative top-1/2 transform -translate-y-1/2'>
          <h1 className="mb-4 text-4xl font-bold text-secondary font-avantGarde">Evaluate Decryption</h1>
          <p className='mb-4 text-sm italic text-secondary text-justify'>This page serves as a tool to help identify the performance metrics of the decryption process including the PSNR and Decryption Time.</p>
          <div className='space-y-4'>
            <FilePathInput 
              ref={origFileInputRef}
              componentHeader="Original Video File*"
              placeholderText="C:\Users\YourUsername\Documents\video.mp4..."
              defaultDisplayText="Enter a valid video file path." 
              browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
              browseHandler={window.electron.openFilePath}
              onValueChange={setOrigFilepaths}
              onValidityChange={setOrigFilepathsValidity}
              isRequired={true}
              dependencyList = {processedFilepaths}
              allowMultiple={true}
              allowMultipleText1={"original videos"}
              allowMultipleText2={"encrypted videos"}
              />
            <FilePathInput
              ref={csvOutputLocationRef}
              componentHeader="CSV File Destination*"
              placeholderText="C:\Users\YourUsername\MetricPerVideoForlder\..."
              defaultDisplayText="Enter a valid directory."
              browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
              browseHandler={window.electron.openFolder}
              onValueChange={setOutputDirpath}
              onValidityChange={setOutputDirpathValidity}
              isRequired={true}
              />
            <ProcessButton
              className={`relative right-0 w-full h-14`}
              buttonText="EVALUATE"
              buttonSize='w-full h-14'
              isEnabled={true}
              onClickFunction={processInputData}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluateDecrypt;