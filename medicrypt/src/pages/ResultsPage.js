import React, { useState, useEffect } from 'react';
import { MdArrowBackIosNew } from 'react-icons/md'; // Import the back arrow icon
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for navigation
import '../pages-css/General.css';
import { AnalyticsMetrics } from '../components/sections/AnalyticsMetrics';
import { AnalyticsCard, AnalyticsCardTitle, AnalyticsCardContent } from '../components/sections/AnalyticsCard';
import logo from '../assets/MedicryptLogo.png';
import NavButton from '../components/buttons/NavButton';
import AnalyticsCCValue from '../components/sections/AnalyticsCCValue';

function ResultsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { processType, data } = location.state || {};
    const [parsedCSVData, setParsedCSVData] = useState([]); // Array of arrays to hold parsed data
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false)


    let csvfilepath = data['csvfilepath'];

    useEffect(() => {
        // Function to parse CSV files using Electron
        const parseCSV = async (filePath) => {
            try {
                const parsedData = await window.electron.parseCSV(filePath);
                const cleanedData = parsedData.filter(entry => entry.Frame !== '');

                setParsedCSVData((prev) => {
                    const newData = [...prev]; 
                    newData.push(cleanedData);
                    return newData; 
                });
            } 
            catch (error) {
                console.error('Error parsing CSV:', error);
            }
        };

        // Parse each file in the csvfilepath array
        csvfilepath.forEach((filePath) => {
            parseCSV(filePath);
        });
    }, [csvfilepath]);

    const getBaselineSpeed = (meanSpeed) => {
        // Create the ideal string
        const idealString = `< ${meanSpeed.toFixed(2)} seconds`;

        return idealString;
    }

    const showOtherFields = () => {
        if (processType === "Encrypt") {
            if (showAdditionalFields) {
                setShowAdditionalFields(false)
            }
            else {
                setShowAdditionalFields(true)
            }
        }        
    }

    const handlePrevious = () => {
        if (currentFileIndex > 0) {
            setCurrentFileIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentFileIndex < parsedCSVData.length - 1) {
            setCurrentFileIndex((prevIndex) => prevIndex + 1);
        }
    };

    const currentData = parsedCSVData[currentFileIndex];

    // Get the Mean Value
    const lastValue = currentData && currentData.length > 0 ? currentData[currentData.length - 1] : null;

    let baselinespeed = data['baselinespeed'][currentFileIndex];
    let meanSpeed = baselinespeed.reduce((acc, speed) => acc + speed, 0) / baselinespeed.length;
    let baselinespeedDesc =  getBaselineSpeed(meanSpeed);

    const encryptionMetrics = [
        { name: 'Correlation Coefficient', subMetrics: ['CC_h_e', 'CC_v_e', 'CC_d_e'], baseline: 0, ideal: 'Close to 0', max: 1 },
        { name: 'Entropy', subMetrics: ['Entropy(Combined)_e', 'Entropy(R)_e', 'Entropy(G)_e', 'Entropy(B)_e'], baseline: 8, ideal: '8', max: 8, isEntropy: true },
        { name: 'UACI', subMetrics: ['UACI'], baseline: 0.33, ideal: '33%', max: 1, isSingleValue: true },
        { name: 'NPCR', subMetrics: ['NPCR'], baseline: 0.99, ideal: '> 99%', max: 1, isSingleValue: true },
        { name: 'Encryption Time', subMetrics: ['ETime'], baseline: baselinespeed, ideal: baselinespeedDesc, max: 10, isSingleValue: true }
    ];
      
    const decryptionMetrics = [
        { name: 'MSE', subMetrics: ['MSE'], baseline: 100, ideal: 'Close to 0', max: 1000, isSingleValue: true },
        { name: 'PSNR', subMetrics: ['PSNR'], baseline: 30, ideal: '> 30 dB', max: 100, isSingleValue: true },
        { name: 'Decryption Time', subMetrics: ['DTime'], baseline: baselinespeed, ideal: baselinespeedDesc, max: 10, isSingleValue: true }
    ];

    const metrics = processType === 'Encrypt' ? encryptionMetrics : decryptionMetrics;
    const metrics_div = processType === 'Encrypt' ? "grid grid-cols-4 gap-4 mb-4" : "grid grid-cols-3 gap-4 mb-4";
    
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
                    <p className="mb-4">Current File: {csvfilepath[currentFileIndex]}</p>
                    <div className='h-1/4 '></div>
                    <div className={`flex h-2/6 mb-8 transition-transform duration-500 ease-in-out transform ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
                            {lastValue && (
                                <div className={metrics_div}>
                                    {metrics.filter(m => m.isSingleValue || m.isEntropy).map((metric) => ( // Use curly braces to execute the map function
                                        <AnalyticsMetrics
                                            metric={metric}
                                            baselinespeed={meanSpeed}
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
                                                min={-5}
                                                max={5}
                                                />
                                            <AnalyticsCCValue
                                                className='mb-1'
                                                value={parseFloat(lastValue['CC_v_e'])}
                                                idealZero={true}
                                                metricLabel={"CCv: "}
                                                min={-5}
                                                max={5}
                                                />
                                            <AnalyticsCCValue
                                                className='mb-1'
                                                value={parseFloat(lastValue['CC_d_e'])}
                                                idealZero={true}
                                                metricLabel={"CCd: "}
                                                min={-5}
                                                max={5}
                                                />
                                        </div>
                                    </AnalyticsCardContent>
                                </AnalyticsCard>
                            </div>
                        )}
                    </div>
                    {processType === "Encrypt" && (
                        <NavButton
                        className="w-full h-12 mt-8"
                        buttonText={showAdditionalFields ? "Show Previous Metrics" : "Show Additional Metrics"}
                        buttonColor="primary1"
                        hoverColor="primary0"
                        buttonTextColor="white"
                        onClickFunction={showOtherFields}
                        />
                    )}
                    <div className="flex gap-2 shrink-0 justify-between mt-2">
                        <NavButton
                            className={`w-full h-12 ${currentFileIndex === 0 ? "opacity-70 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
                            buttonText={"Previous Video File"}
                            buttonColor="primary1"
                            hoverColor="primary0"
                            buttonTextColor="white"
                            onClickFunction={handlePrevious}
                            />
                        <NavButton
                            className={`w-full h-12 ${currentFileIndex === parsedCSVData.length - 1 ? "opacity-70 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
                            buttonText={"Next Video File"}
                            buttonColor="primary1"
                            hoverColor="primary0"
                            buttonTextColor="white"
                            onClickFunction={handleNext}
                            />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;