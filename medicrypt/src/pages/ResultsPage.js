import React, { useState, useEffect } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md';
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import '../pages-css/General.css';
import { AnalyticsMetrics } from '../components/sections/AnalyticsMetrics';
import { AnalyticsCard, AnalyticsCardTitle, AnalyticsCardContent } from '../components/sections/AnalyticsCard';
import logo from '../assets/MedicryptLogo.png';
import NavButton from '../components/buttons/NavButton';
import AnalyticsCCValue from '../components/sections/AnalyticsCCValue';
import AnalyticsSelect from '../components/sections/AnalyticsSelect';
import { FaRegFolder } from "react-icons/fa";

const getResolutionLabel = (width, height) => {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);

    if (isNaN(parsedWidth) || isNaN(parsedHeight)) {
        return ""; // Return empty string if parsing fails
    }

    const sortedDimensions = [parsedWidth, parsedHeight].sort((a, b) => a - b); // Sort dimensions to handle portrait and landscape

    if (sortedDimensions[0] === 240 && sortedDimensions[1] === 320) {
        return "240p";
    } 
    else if (sortedDimensions[0] === 720 && sortedDimensions[1] === 1280) {
        return "720p";
    } 
    else if (sortedDimensions[0] === 1080 && sortedDimensions[1] === 1920) {
        return "1080p";
    } 
    else if (sortedDimensions[0] === 1440 && sortedDimensions[1] === 2560) {
        return "1440p";
    } 
    else if (sortedDimensions[0] === 2160 && sortedDimensions[1] === 3840) {
        return "2160p";
    }

    return ""; // No match if dimensions don't fall in known resolutions
};

function ResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { processType, data } = location.state || {};
    const [parsedCSVData, setParsedCSVData] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);

    let csvFilepaths = data['csvFilepaths'];
    let processedFiles = data['inputFiles'];
    let resolutions = data['resolutions'];

    useEffect(() => {
        const parseCSV = async (filePath) => {
            try {
                const parsedData = await window.electron.parseCSV(filePath);
                const cleanedData = parsedData.filter(entry => entry.Frame !== '');
                setParsedCSVData((prev) => [...prev, cleanedData]);
            } catch (error) {
                console.error('Error parsing CSV:', error);
            }
        };

        csvFilepaths.forEach((filePath) => {
            parseCSV(filePath);
        });
    }, [csvFilepaths]);

    const getBaselineSpeed = (meanSpeed) => {
        return `< ${meanSpeed.toFixed(2)} seconds`;
    }

    const showOtherFields = () => {
        setShowAdditionalFields(!showAdditionalFields);
    }

    const handleFileChange = (event) => {
        setCurrentFileIndex(Number(event.target.value));
    };

    const currentData = parsedCSVData[currentFileIndex];
    const lastValue = currentData && currentData.length > 0 ? currentData[currentData.length - 1] : null;

    let baselineSpeedMetrics = data['baselineSpeedMetrics'][currentFileIndex];
    let meanSpeed = Math.min(...baselineSpeedMetrics);
    let baselineSpeedDesc =  getBaselineSpeed(meanSpeed);

    const encryptionMetrics = [
        { name: 'Correlation Coefficient', subMetrics: ['CC_h_e', 'CC_v_e', 'CC_d_e'], baseline: 0, ideal: 'Close to 0', max: 1 },
        { name: 'Entropy', subMetrics: ['Entropy(Combined)_e', 'Entropy(R)_e', 'Entropy(G)_e', 'Entropy(B)_e'], baseline: 8, ideal: '8', max: 8, isEntropy: true },
        { name: 'UACI', subMetrics: ['UACI'], baseline: 0.33, ideal: 'Close to 33%', min: 31, max: 35, isSingleValue: true },
        { name: 'NPCR', subMetrics: ['NPCR'], baseline: 0.99, ideal: '> 99%', max: 99, isSingleValue: true },
        { name: 'Encryption Time', subMetrics: ['ETime'], baseline: baselineSpeedMetrics, ideal: baselineSpeedDesc, max: meanSpeed, isSingleValue: true }
    ];
      
    const decryptionMetrics = [
        { name: 'MSE', subMetrics: ['MSE'], baseline: 0, ideal: 'Close to 0', max: 0, isSingleValue: true },
        { name: 'PSNR', subMetrics: ['PSNR'], baseline: 30, ideal: '> 30 dB', max: 30, isSingleValue: true },
        { name: 'Decryption Time', subMetrics: ['DTime'], baseline: baselineSpeedMetrics, ideal: baselineSpeedDesc, max: meanSpeed, isSingleValue: true }
    ];

    const metrics = processType === 'Encrypt' ? encryptionMetrics : decryptionMetrics;
    const metrics_div = processType === 'Encrypt' ? "grid grid-cols-4 gap-4 mb-4" : "grid grid-cols-3 gap-4 mb-4";
    
    const resolutionLabel = getResolutionLabel(resolutions[currentFileIndex][0], resolutions[currentFileIndex][1]);

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
                    <h1 className="text-3xl font-bold mb-4">{processType === 'Encrypt' ? 'Encryption' : 'Decryption'} Analysis Results</h1>
                    <h2>Current File:</h2>
                    <AnalyticsSelect 
                        value={currentFileIndex}
                        onChange={handleFileChange}
                        className="mb-2"
                    >
                        {processedFiles.map((file, index) => (
                            <option key={index} value={index}>
                                {file}
                            </option>
                        ))}
                    </AnalyticsSelect>
                    <p className="mb-4 flex">Resolution: {resolutions[currentFileIndex][0]}x{resolutions[currentFileIndex][1]}{resolutionLabel ? " (" + resolutionLabel + ")" : ""}</p>
                    <div className='h-1/4 '></div>
                    <div className={`flex mb-4 transition-transform duration-500 ease-in-out transform ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
                            {lastValue && (
                                <div className={metrics_div}>
                                    {metrics.filter(m => m.isSingleValue || m.isEntropy).map((metric, index) => (
                                        <AnalyticsMetrics
                                            key={index}
                                            metric={metric}
                                            baselineSpeed={meanSpeed}
                                            value={metric.name === "Entropy" 
                                                ? [parseFloat(lastValue[metric.subMetrics[0]]), parseFloat(lastValue[metric.subMetrics[1]]), parseFloat(lastValue[metric.subMetrics[2]]), parseFloat(lastValue[metric.subMetrics[3]])]
                                                : parseFloat(lastValue[metric.subMetrics[0]])}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {processType === "Encrypt" && lastValue && (
                            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pl-0' : 'pl-8'}`}>
                                <AnalyticsCard>
                                    <AnalyticsCardTitle>Correlation Coefficient</AnalyticsCardTitle>
                                    <AnalyticsCardContent>
                                        <div className='mb-2'>
                                            <AnalyticsCCValue
                                                className='mb-1'
                                                value={parseFloat(lastValue['CC_h_e'])}
                                                idealZero={true}
                                                metricLabel={"CCh: "}
                                                min={-1}
                                                max={1}
                                            />
                                            <AnalyticsCCValue
                                                className='mb-1'
                                                value={parseFloat(lastValue['CC_v_e'])}
                                                idealZero={true}
                                                metricLabel={"CCv: "}
                                                min={-1}
                                                max={1}
                                            />
                                            <AnalyticsCCValue
                                                className='mb-1'
                                                value={parseFloat(lastValue['CC_d_e'])}
                                                idealZero={true}
                                                metricLabel={"CCd: "}
                                                min={-1}
                                                max={1}
                                            />
                                        </div>
                                    </AnalyticsCardContent>
                                </AnalyticsCard>
                            </div>
                        )}
                    </div>
                    <div className='space-y-4'>
                        {processType === "Encrypt" && (
                            <NavButton
                                className="w-full h-12 mt-8"
                                buttonText={showAdditionalFields ? "Show Previous Metrics" : "Show Additional Metrics"}
                                buttonColor="primary1"
                                hoverColor="primary0"
                                buttonTextColor="white"
                                buttonIcon={showAdditionalFields ? MdNavigateBefore : MdNavigateNext}
                                onClickFunction={showOtherFields}
                            />
                        )}
                        <NavButton
                            className="w-full h-12"
                            buttonColor="primary1"
                            hoverColor="primary0"
                            buttonText="Show CSV File"
                            buttonTextColor="white"
                            buttonIcon={FaRegFolder}
                            filePath={csvFilepaths[currentFileIndex]}
                            />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;