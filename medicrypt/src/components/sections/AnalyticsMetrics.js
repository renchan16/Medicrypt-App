/**
 * AnalyticsMetrics Component
 *
 * The `AnalyticsMetrics` component displays various cryptographic metrics in a card format, 
 * providing both a visual representation of the metric's performance and an optional description 
 * of each metric. Users can click on the card to toggle the display of additional information.
 *
 * Props:
 * -------
 * @param {Object} metric - An object representing the metric being displayed, which includes:
 * @param {string} metric.name - The name of the metric (e.g., "UACI", "NPCR").
 * @param {number} metric.min - The minimum acceptable value for the metric.
 * @param {number} metric.max - The maximum acceptable value for the metric.
 * @param {number} metric.ideal - The ideal value that the metric aims for.
 * @param {number} [baselineSpeed=0] - A number representing the baseline speed for comparing 
 *                                      encryption or decryption times. Defaults to `0`.
 * @param {number|Array} value - The current value of the metric being displayed. The format varies 
 *                                depending on the metric (e.g., a single number or an array for "Entropy").
 *
 * Functions:
 * ----------
 * - calculatePercentage: Computes the percentage representation of the metric based on its type 
 *   and current value, applying specific logic for certain metrics like "UACI" and "MSE".
 * - isGood: Evaluates if the current metric value is considered good or acceptable based on 
 *   predefined thresholds. This impacts the visual appearance of the component.
 *
 * Usage:
 * ------
 * The `AnalyticsMetrics` component is intended for use in analytics dashboards where various 
 * cryptographic metrics need to be displayed. It provides a clear visual indicator of each 
 * metric's performance in relation to its ideal state.
 *
 * Example:
 * -------
 * <AnalyticsMetrics metric={{ name: 'UACI', min: 0, max: 100, ideal: 'Close to 33' }} 
 *                   baselineSpeed={0} value={50} />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - AnalyticsCard: Custom card component for displaying metric information.
 * - AnalyticsCardTitle: Custom component for displaying the title of the card.
 * - AnalyticsCardContent: Custom component for displaying the content inside the card.
 * - AnalyticsTooltip: Custom component for providing tooltip information about metrics.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 10/6/2024
 * Last Modified: 11/11/2024
 */

import React, { useState } from "react"
import { AnalyticsCard, AnalyticsCardTitle, AnalyticsCardContent } from "./AnalyticsCard";
import { AnalyticsTooltip } from "./AnalysisTooltip";

const metricFullNames = {
    "UACI": "(Unified Average Changing Intensity)",
    "NPCR": "(Number of Pixels Change Rate)",
    "PSNR": "(Peak Signal-to-Noise Ratio)",
    "MSE": "(Mean Squared Error)"
};

const metricDescriptions = {
    "Entropy": "Metric that measures the randomness of pixel values in a video frame.",
    "UACI": "Metric that measures the resistance to differential attacks.",
    "NPCR": "Metric that measures the resistance to differential attacks.",
    "PSNR": "Metric that measures the quality of decrypted frame.",
    "MSE": "Metric that measures the average squared difference between decrypted and original frames.",
    "Encryption Time": "Time taken to encrypt the image.",
    "Decryption Time": "Time taken to decrypt the image."
};

export const AnalyticsMetrics = ({metric, baselineSpeed = 0, value}) => {
    const [showDescription, setShowDescription] = useState(false);

    // Calculate Percentage of each metric
    const calculatePercentage = () => {
        switch (metric.name) {
            case "Entropy":
                return (value[0] / metric.max) * 100;
            case "UACI":
                // Normalize the UACI value between min and max
                const clampedUACIValue = Math.max(metric.min, Math.min(metric.max, value));
                // Calculate how close the value is to the ideal 33%
                const uaciDeviation = Math.abs(clampedUACIValue - 33);
                // Calculate progress based on how close we are to 33 (small deviation = high percentage)
                const uaciMaxDeviation = Math.max(33 - metric.min, metric.max - 33);
                const uaciProgressValue = (1 - (uaciDeviation / uaciMaxDeviation)) * 100;
                return Math.min(Math.max(uaciProgressValue, 0), 100);
            case "MSE":
                // This will give 100% for 0, and approach 0% as the value increases
                return Math.exp(-value) * 100;
            default:
                return (value / metric.max) * 100;
        }
    };

    const percentage = calculatePercentage();

    // Identify whether values are ideal (For UI Purposes only)
    const isGood = (() => {
        switch (metric.name) {
            case 'Entropy':
                return value[0] > 7.9;
            case 'UACI':
                return percentage >= 50;
            case 'NPCR':
                return value > 0.99;
            case 'PSNR':
                return value > 30;
            case 'MSE':
                return percentage >= 50;
            case 'Encryption Time':
            case 'Decryption Time':
                return value <= baselineSpeed;
            default:
                return false;
        }
    })();

    return (
        <AnalyticsCard
            className={"h-48"}
            onClick={() => setShowDescription(!showDescription)}>
            <AnalyticsTooltip metric={metricFullNames[metric.name] || metric.name}>
                <AnalyticsCardTitle
                    className="font-semibold mb-0 font-avantGarde text-primary0">
                    {metric.name}
                </AnalyticsCardTitle>
            </AnalyticsTooltip>
            {showDescription === true ? 
            <div>
                <AnalyticsCardContent>
                    <div className="text-sm mt-4 text-justify text-secondary">{metricDescriptions[metric.name]}</div>
                </AnalyticsCardContent>
            </div> : 
            <div>
                <AnalyticsCardContent>
                    <div className="text-4xl font-bold mt-6 mb-2 font-avantGarde text-[#202120]">
                        {metric.name === "Entropy" ? value[0].toFixed(3) : value.toFixed(3)}
                        {metric.name === "NPCR" || metric.name === "UACI" ? "%" : ""}
                        {metric.name === "Encryption Time" || metric.name === "Decryption Time" ? "s" : ""}    
                    </div>
                    <div className="text-sm mt-4">Ideal: {metric.ideal}</div>
                </AnalyticsCardContent>
            </div>}
            <div 
                className={`
                    absolute 
                    bottom-0 
                    left-0 
                    h-3 
                    transition-all 
                    duration-500
                    rounded-full 
                    ${isGood ? 'bg-green-500' : 'bg-red-500'}
                `} 
                style={{ width: `${percentage}%` }}
            ></div>
            <div 
                className={`
                    absolute 
                    bottom-0 
                    left-0 
                    h-3 
                    transition-all 
                    duration-500
                    rounded-full 
                    bg-gray-300
                    w-full
                    -z-10
                `} 
            ></div>
        </AnalyticsCard>
    );
};