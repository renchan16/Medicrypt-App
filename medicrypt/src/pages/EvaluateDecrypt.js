import React, { useState, useRef } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import logo from '../assets/MedicryptLogo.png';
import FilePathInput from '../components/text input/FilePathInput';
import ProcessButton from '../components/buttons/ProcessButton';
import { FaPaperclip } from "react-icons/fa6";
import { FaFolder } from 'react-icons/fa6';

function EvaluateDecrypt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};

  let timeFileLocation = data['timeFileLocation']

  const fileInputRef = useRef(null);
  const csvLocationRef = useRef(null);

  const [filepath, setFilePath] = useState("");
  const [isFilePathValid, setFilePathValidity] = useState(false);
  const [outputpath, setOutputPath] = useState("");
  const [isOutputPathValid, setOutputPathValidity] = useState(true);
  
  const processInputData = () => {
    csvLocationRef.current.validate();
    fileInputRef.current.validate();
    
    if (isFilePathValid && isOutputPathValid) {
      navigate('/encrypt/evaluating', {
        state : {
          processType: 'Decrypt',
          inputs : { timeFileLocation, filepath, outputpath }
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
          <MdArrowBackIosNew className="mr-2" />
        </button>

        <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />
        
        <div className='relative top-1/2 transform -translate-y-1/2'>
          <h1 className="mb-4 text-4xl font-bold text-primary1 ">Evaluate Decryption</h1>
          <p className='mb-4 text-sm italic text-primary1 text-justify'>This page serves as a tool to help identify the performance metrics of the decryption process including the PSNR and Decryption Time.</p>
          <div className='space-y-4'>
            <FilePathInput 
              ref={fileInputRef}
              componentHeader="Original Video File*"
              placeholderText="C:\Users\YourUsername\Documents\video.mp4..."
              defaultDisplayText="Enter a valid video file path." 
              browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
              browseHandler={window.electron.openFilePath}
              onValueChange={setFilePath}
              onValidityChange={setFilePathValidity}
              isRequired={true}
              />
            <FilePathInput
              ref={csvLocationRef}
              componentHeader="CSV File Destination*"
              placeholderText="C:\Users\YourUsername\MetricPerVideoForlder\..."
              defaultDisplayText="Enter a valid directory."
              browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
              browseHandler={window.electron.openFolder}
              onValueChange={setOutputPath}
              onValidityChange={setOutputPathValidity}
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