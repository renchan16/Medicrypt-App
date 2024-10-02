import React, { useState, useRef } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import logo from '../assets/MedicryptLogo.png';
import FilePathInput from '../components/text input/FilePathInput';
import ProcessButton from '../components/buttons/ProcessButton';
import { FaFolder } from 'react-icons/fa6';

function EvaluateEncrypt() {
  const navigate = useNavigate();
  
  const [outputpath, setOutputPath] = useState("");
  const [isOutputPathValid, setOutputPathValidity] = useState(true);
  
  const csvLocationRef = useRef(null);

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
          <h1 className="mb-3 text-4xl font-bold text-primary1 ">Evaluate Encryption</h1>
          <p className='mb-4 text-sm italic text-primary1 text-justify'>This page serves as a tool to help measure the performance metrics of the encryption process including the Correlation Coefficient, Entropy, UACI, NPCR, and Encryption Time.</p>
          <div className='space-y-4'>
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
              className={`relative right-0`}
              buttonText="EVALUATE"
              isEnabled={true}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluateEncrypt;