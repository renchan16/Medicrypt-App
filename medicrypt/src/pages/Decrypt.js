import React, { useState, useRef } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { FaUnlock } from "react-icons/fa";
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
  const outputDirpathInputRef = useRef(null);
  const hashInputRef = useRef(null);

  const [algorithm, setAlgorithm] = useState("");
  const [filepaths, setFilepaths] = useState("");
  const [password, setPassword] = useState("");
  const [outputDirpath, setOutputDirpath] = useState("");
  const [hashPath, setHashPath] = useState("");
  const [isFilepathValid, setFilepathValidity] = useState(false);
  const [isPasswordValid, setPasswordValidity] = useState(false);
  const [isOutputDirpathValid, setOutputDirpathValidity] = useState(true);
  const [isHashPathValid, setHashPathValidity] = useState(true);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)

  const processInputData = async () => {
    if (!showAdditionalFields) {
      fileInputRef.current.validate();
      passwordInputRef.current.validate();

      if (isFilepathValid && isPasswordValid) {
        setShowAdditionalFields(true);
      }
      else {
        console.log('Please fill in all required fields correctly.');
      }
    }
    else {
      outputDirpathInputRef.current.validate();
      hashInputRef.current.validate();

      if (isOutputDirpathValid && isHashPathValid){
        navigate('/decrypt/processing', {
          state : {
            processType: 'Decrypt',
            inputs : {algorithm, filepaths, password, outputDirpath, hashPath}
          }
        });
      }
      else {
        console.log('Please fill in all required fields correctly.');
      }
    }
  }
  
  const showPreviousFields = () => {
    console.log(filepaths)
    setShowAdditionalFields(false);
  };

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
          <h1 className="mb-3 text-4xl font-bold text-primary1 ">Decrypt a Video</h1>
          <AlgorithmSelector
            className='mt-4 mb-4' 
            componentHeader="Choose an Algorithm for Decryption" 
            optionOne="FY-Logistic" 
            optionTwo="3D-Cosine" 
            onValueChange={setAlgorithm}
            />
          <div className={`flex h-2/6 mb-8 transition-transform duration-500 ease-in-out transform ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
              <div className='space-y-4'>
                <FilePathInput 
                  ref={fileInputRef}
                  componentHeader="Video File*"
                  placeholderText="C:\Users\YourUsername\Documents\video.mp4..."
                  defaultDisplayText="Enter a valid .avi video file path."  
                  browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
                  browseHandler={window.electron.openEncryptedFilePath}
                  onValueChange={setFilepaths}
                  onValidityChange={setFilepathValidity}
                  isRequired={true}
                  allowMultiple={true}
                  isEnabled={showAdditionalFields ? false : true}
                  />
                <PasswordInput
                  ref={passwordInputRef}
                  componentHeader="Hash Key Password*"
                  defaultDisplayText="Ensure the password matches the one you provided earlier for encryption." 
                  placeholderText="e.g. ILoveM3d!Crypt143"
                  processType="Decrypt"
                  onValueChange={setPassword}
                  onValidityChange={setPasswordValidity}
                  isEnabled={showAdditionalFields ? false : true}
                  />
              </div>
            </div>
            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pl-0' : 'pl-8'}`}>
              <div className='space-y-4'>
                <FilePathInput
                  ref={hashInputRef}
                  componentHeader="Hash Key File *"
                  placeholderText="C:\Users\YourUsername\Documents\HashKey.key..."
                  defaultDisplayText="Enter a valid .key file path."  
                  browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
                  browseHandler={window.electron.openHashKeyPath}
                  onValueChange={setHashPath}
                  onValidityChange={setHashPathValidity}
                  isRequired={true}
                  allowMultiple={true}
                  allowMultipleText1={"keyfiles"}
                  allowMultipleText2={"encrypted videos"}
                  dependencyList={filepaths}
                  isEnabled={showAdditionalFields ? true : false}
                  />
                <FilePathInput
                  ref={outputDirpathInputRef}
                  componentHeader="Decrypted Video File Destination"
                  defaultDisplayText="Enter a valid directory path." 
                  placeholderText="C:\Users\YourUsername\Documents\DecryptedVideoDest..." 
                  browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
                  browseHandler={window.electron.openFolder}
                  onValueChange={setOutputDirpath}
                  onValidityChange={setOutputDirpathValidity}
                  isRequired={false}
                  isEnabled={showAdditionalFields ? true : false}
                  />
              </div>
            </div>
          </div>
          <div className='flex justify-between'>
            <ProcessButton
              className={`w-56 h-14`} 
              buttonText="BACK"
              buttonIcon={MdNavigateBefore}
              iconLocation='left'
              isEnabled={showAdditionalFields ? true : false}
              onClickFunction={showPreviousFields}
              />
            <ProcessButton
              className={`w-56 h-14`}  
              buttonText={`${showAdditionalFields ? "DECRYPT" : "NEXT" }`}
              buttonIcon={showAdditionalFields ? FaUnlock : MdNavigateNext }
              iconLocation={showAdditionalFields ? 'left' : 'right' }
              onClickFunction={processInputData}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Decrypt;