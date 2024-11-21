/**
 * App Component
 *
 * This is the main entry point for the MediCrypt frontend application. It sets up routing 
 * for various pages and handles the loading state for the app. It fetches a message from 
 * the backend API to display a "Loading..." message with a trailing dot animation while 
 * the app is fetching data.
 *
 * Functionality:
 * --------------
 * - Sets up routes for the entire application using `react-router-dom` to navigate 
 *   between different pages.
 * - Fetches a message from the backend API and displays it once the data is retrieved.
 * - Displays a loading spinner (`PropagateLoader`) during the initial loading state.
 * - Simulates a "Loading..." message with trailing dots, which are updated every 500ms.
 * - Once the data is fetched, the loading state is turned off, and the app renders the 
 *   content based on the active route.
 *
 * State Variables:
 * -----------------
 * - message: State variable holding the message retrieved from the backend API.
 * - loading: State variable indicating whether the app is in a loading state or not.
 * - dots: State variable holding the trailing dots for the "Loading..." message.
 *
 * Refs:
 * ------
 * None.
 *
 * Functions:
 * ----------
 * - useEffect (Loading Simulation):
 *   - Initializes an interval to simulate the loading effect by appending dots to the 
 *     "Loading..." message every 500ms. The interval is cleared when the component is unmounted.
 *
 * - useEffect (API Data Fetching):
 *   - Makes an HTTP GET request to the backend API (`http://127.0.0.1:8000/`) to fetch 
 *     a message and stops the loading spinner once the data is fetched.
 *
 * Global Variables:
 * -----------------
 * - None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering and state management.
 * - react-router-dom: For routing and navigation between different pages.
 * - axios: For making HTTP requests to the backend API.
 * - react-spinners: For displaying a loading spinner (`PropagateLoader`).
 *
 * Pages/Components:
 * ------------------
 * - LandingPage: Displays the initial landing page.
 * - Encrypt: Handles video encryption process.
 * - Decrypt: Handles video decryption process.
 * - Explore: Provides an option to explore the encryption/decryption process.
 * - HowToUse: Displays usage instructions for the application.
 * - ProcessingPage: Shows progress of encryption/decryption processes.
 * - EvaluateEncrypt: Displays encryption evaluation results.
 * - EvaluateDecrypt: Displays decryption evaluation results.
 * - EvaluatingPage: Displays the evaluation process during encryption/decryption.
 * - ResultsPage: Displays the results of the evaluation.
 *
 * Example:
 * -------
 * <App />
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created: 9/11/2024
 * Last Modified: 11/11/2024
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import LandingPage from './pages/MenuPages/LandingPage';  
import Decrypt from './pages/CryptographyPages/Decrypt';
import Encrypt from './pages/CryptographyPages/Encrypt';
import Explore from './pages/MenuPages/Explore';
import HowToUse from './pages/MenuPages/HowToUse';
import ProcessingPage from './pages/ProcessingPages/ProcessingPage';
import EvaluateEncrypt from './pages/AnalysisPages/EvaluateEncrypt';
import EvaluateDecrypt from './pages/AnalysisPages/EvaluateDecrypt';
import EvaluatingPage from './pages/ProcessingPages/EvaluatingPage';
import ResultsPage from './pages/AnalysisPages/ResultsPage';
import { PropagateLoader } from 'react-spinners'; // Import the loader

function App() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // State for loading spinner
    const [dots, setDots] = useState(''); // State for trailing dots in "Loading..."

    // Simulate loading text ellipsis effect
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots.length < 3 ? prevDots + '.' : ''));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/')
            .then(response => {
                setMessage(response.data.message);
                setLoading(false); // Stop loading once the data is fetched
            })
            .catch(error => {
                console.error("There was an error!", error);
                setLoading(false); // Stop loading even if there's an error
            });
    }, []);

    return (
        <Router>
            <div className="h-screen flex flex-col justify-center items-center">
                {/* Show spinner while loading */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <PropagateLoader color="#1D1B20" loading={loading} size={15} />
                        <p className="mt-10 text-xl font-bold text-black">
                            Loading{dots}
                        </p>
                    </div>
                ) : (
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/encrypt" element={<Encrypt />} />
                        <Route path="/decrypt" element={<Decrypt />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/howtouse" element={<HowToUse />} />
                        <Route path="/encrypt/processing" element={<ProcessingPage />} />
                        <Route path="/decrypt/processing" element={<ProcessingPage />} />
                        <Route path="/encrypt/evaluate" element={<EvaluateEncrypt />} />
                        <Route path="/decrypt/evaluate" element={<EvaluateDecrypt />} />
                        <Route path="/encrypt/evaluating" element={<EvaluatingPage />} />
                        <Route path="/decrypt/evaluating" element={<EvaluatingPage />} />
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
}

export default App;