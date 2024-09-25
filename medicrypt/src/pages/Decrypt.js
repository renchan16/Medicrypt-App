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

function Decrypt() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const outputPathInputRef = useRef(null);
  const hashInputRef = useRef(null);

  const [algorithm, setAlgorithm] = useState("");
  const [filepath, setFilePath] = useState("");
  const [password, setPassword] = useState("");
  const [outputpath, setOutputPath] = useState("");
  const [hashpath, setHashPath] = useState("");
  const [isFilePathValid, setFilePathValidity] = useState(false);
  const [isPasswordValid, setPasswordValidity] = useState(false);
  const [isOutputPathValid, setOutputPathValidity] = useState(true);
  const [isHashPathValid, setHashPathValidity] = useState(true);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)

  const processInputData = async () => {
    if (!showAdditionalFields) {
      fileInputRef.current.validate();
      passwordInputRef.current.validate();

      if (isFilePathValid && isPasswordValid) {
        setShowAdditionalFields(true);
      }
      else {
        console.log('Please fill in all required fields correctly.');
      }
    }
    else {
      outputPathInputRef.current.validate();
      hashInputRef.current.validate();

      if (isOutputPathValid && isHashPathValid){
        navigate('/decrypt/processing', {
          state : {
            processType: 'Decrypt',
            inputs : {algorithm, filepath, password, outputpath, hashpath}
          }
        });
      }
      else {
        console.log('Please fill in all required fields correctly.');
      }
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

        <h1 className="mt-32 mb-3 text-3xl font-bold text-primary1 ">Decrypt a Video</h1>
        <AlgorithmSelector
          className='mt-4 mb-4' 
          componentHeader="Choose an Algorithm for Decryption" 
          optionOne="FY-Logistic" 
          optionTwo="ILM-Cosine" 
          onValueChange={setAlgorithm}
          />
        <div className={`flex mb-4 transition-transform duration-500 ease-in-out transform ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
            <div className='space-y-4'>
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
              <PasswordInput
                ref={passwordInputRef}
                componentHeader="Hash Key Password"
                placeholderText="e.g. ILoveM3d!Crypt143"
                processType="Decrypt"
                onValueChange={setPassword}
                onValidityChange={setPasswordValidity}
                />
            </div>
          </div>
          <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pl-0' : 'pl-8'}`}>
            <div className='space-y-4'>
              <FilePathInput
                ref={hashInputRef}
                componentHeader="Hash Key File"
                placeholderText="C:\Users\YourUsername\Documents\HashKey.key..." 
                browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
                browseHandler={window.electron.openHashKeyPath}
                onValueChange={setHashPath}
                onValidityChange={setHashPathValidity}
                isRequired={true}
                />
              <FilePathInput
                ref={outputPathInputRef}
                componentHeader="Output File Destination"
                placeholderText="C:\Users\YourUsername\Documents\DecryptedVideoDest..." 
                browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
                browseHandler={window.electron.openFolder}
                onValueChange={setOutputPath}
                onValidityChange={setOutputPathValidity}
                isRequired={false}
                />
            </div>
          </div>
        </div>
        <ProcessButton 
            className="my-1"
            buttonText={`${showAdditionalFields ? "DECRYPT" : "NEXT" }`}
            onClickFunction={processInputData}
            />
      </div>
    </div>
  );
}

export default Decrypt;