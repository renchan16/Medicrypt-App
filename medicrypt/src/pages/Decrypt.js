import React, { useState } from 'react';
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
  const [algorithm, setAlgorithm] = useState("");
  const [filepath, setFilePath] = useState("");
  const [hashpath, setHashPath] = useState("");
  const [password, setPassword] = useState("");
  const [isFilePathValid, setFilePathValidity] = useState(true);
  const [isHashPathValid, setHashPathValidity] = useState(true);
  const [isPasswordValid, setPasswordValidity] = useState(true);

  const processInputData = () => {
    console.log(algorithm);

    if (isFilePathValid){
      console.log(filepath);
    }
    
    if (isHashPathValid) {
      console.log(hashpath);
    }
      
    if (isPasswordValid) {
      console.log(isPasswordValid)
    }
  }
  
  return (
    <div className='flex items-center justify-center h-full w-full'>
      <div className="relative h-full w-11/12 p-6">
        <button
          onClick={() => navigate('/')} 
          className="absolute top-8 left-4 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl"
          >
          <MdArrowBackIosNew className="mr-2" />
        </button>

        <img src={logo} alt="Medicrypt Logo" className="absolute w-15 h-16 right-1" />

        <div className="flex flex-col gap-4 mt-20">
          <h1 className="flex items-center col-span-3 mb-3 text-3xl font-bold text-primary1 ">Decrypt a Video</h1>
          <AlgorithmSelector 
            componentHeader="Choose an Algorithm for Decryption" 
            optionOne="FY-Logistic" 
            optionTwo="ILM-Cosine" 
            onValueChange={setAlgorithm}
            />
          <FilePathInput 
            componentHeader="Video File"
            placeholderText="C:\Users\YourUsername\Documents\video.mp4..." 
            browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
            browseHandler={window.electron.openFilePath}
            onValueChange={setFilePath}
            onValidityChange={setFilePathValidity}
            isRequired={true}
            />
          <FilePathInput
            componentHeader="Hash File"
            placeholderText="C:\Users\YourUsername\Documents\HashFolder..." 
            browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
            browseHandler={window.electron.openKeyPath}
            onValueChange={setHashPath}
            onValidityChange={setHashPathValidity}
            isRequired={true}
            />
          <PasswordInput 
            componentHeader="Password"
            placeholderText="e.g. ILoveM3d!Crypt143"
            onValueChange={setPassword}
            onValidityChange={setPasswordValidity}
            />
          <ProcessButton 
            className="my-1"
            buttonText="DECRYPT"
            onClickFunction={processInputData}
            />
        </div>
      </div>
    </div>
  );
}

export default Decrypt;
