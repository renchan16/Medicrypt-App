import React, { useState, useRef } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import logo from '../assets/MedicryptLogo.png';
import AlgorithmSelector from '../components/switches/AlgorithmSelector';
import FilePathInput from '../components/text input/FilePathInput';
import PasswordInput from '../components/text input/PasswordInput';
import ProcessButton from '../components/buttons/ProcessButton';
import BackgroundImage from '../assets/background.png';
import { FaPaperclip } from "react-icons/fa6";
import { FaFolder } from 'react-icons/fa6';

function Encrypt() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const hashInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [algorithm, setAlgorithm] = useState("");
  const [filepath, setFilePath] = useState("");
  const [hashpath, setHashPath] = useState("");
  const [password, setPassword] = useState("");
  const [isFilePathValid, setFilePathValidity] = useState(true);
  const [isHashPathValid, setHashPathValidity] = useState(true);
  const [isPasswordValid, setPasswordValidity] = useState(true);

  const processInputData = async () => {
    fileInputRef.current.validate();
    hashInputRef.current.validate();
    passwordInputRef.current.validate();

    if (isFilePathValid && isHashPathValid && isPasswordValid) {
      navigate('/encrypt/processing', {
        state : {
          processType: 'Encrypt',
          inputs : {algorithm, filepath, hashpath, password}
        }
      });
    } 
    else {
      console.log('Please fill in all required fields correctly.');
    }
  }
  
  return (
    <div className='flex items-center justify-center h-full w-full select-none'>
      <div className="relative h-full w-11/12 p-6">
        <button
          onClick={() => navigate('/')} 
          className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
          >
          <MdArrowBackIosNew className="mr-2" />
        </button>

        <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />

        <div className="flex flex-col gap-4 mt-20">
          <h1 className="flex items-center col-span-3 mb-3 text-3xl font-bold text-primary1 ">Encrypt a Video</h1>
          <AlgorithmSelector 
            componentHeader="Choose an Algorithm for Encryption" 
            optionOne="FY-Logistic" 
            optionTwo="ILM-Cosine" 
            onValueChange={setAlgorithm}
            />
          <FilePathInput 
            ref={fileInputRef}
            componentHeader="Video File"
            placeholderText="C:\Users\YourUsername\Documents\video.mp4..." 
            browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
            browseHandler={window.electron.openFilePath}
            onValueChange={setFilePath}
            onValidityChange={setFilePathValidity}
            isRequired={true}
            />
          <FilePathInput
            ref={hashInputRef}
            componentHeader="Hash File Destination"
            placeholderText="C:\Users\YourUsername\Documents\HashFolder..." 
            browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
            browseHandler={window.electron.openFolder}
            onValueChange={setHashPath}
            onValidityChange={setHashPathValidity}
            isRequired={false}
            />
          <PasswordInput
            ref={passwordInputRef}
            componentHeader="Password"
            placeholderText="e.g. ILoveM3d!Crypt143"
            processType="Encrypt"
            onValueChange={setPassword}
            onValidityChange={setPasswordValidity}
            />
          <ProcessButton 
            className="my-1"
            buttonText="ENCRYPT"
            onClickFunction={processInputData}
            />
        </div>
      </div>
    </div>
  );
}

export default Encrypt;