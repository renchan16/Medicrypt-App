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
    "Entropy": "Metric that measures the randomness of pixel values in a video frame",
    "UACI": "Metric that measures the resistance to differential attacks.",
    "NPCR": "Metric that measures the resistance to differential attacks.",
    "PSNR": "Metric that measures the quality of decrypted frame.",
    "MSE": "Metric that measures the average squared difference between decrypted and original frames.",
    "Encryption Time": "Time taken to encrypt the image.",
    "Decryption Time": "Time taken to decrypt the image."
};

export const AnalyticsMetrics = ({metric, baselineSpeed, value}) => {
    const [showDescription, setShowDescription] = useState(false);

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
                    className="font-semibold mb-0">
                    {metric.name}
                </AnalyticsCardTitle>
            </AnalyticsTooltip>
            {showDescription === true ? 
            <div>
                <AnalyticsCardContent>
                    <div className="text-sm mt-4 text-justify">{metricDescriptions[metric.name]}</div>
                </AnalyticsCardContent>
            </div> : 
            <div>
                <AnalyticsCardContent>
                    <div className="text-4xl font-bold mt-6 mb-2">
                        {metric.name === "Entropy" ? value[0].toFixed(4) : value.toFixed(4)}
                        {metric.name === "NPCR" || metric.name === "UACI" ? "%" : ""}
                        {metric.name === "Encryption Time" || metric.name === "Decryption Time" ? "s" : ""}    
                    </div>
                    <div className="text-sm mt-4">Ideal: {metric.ideal}</div>
                </AnalyticsCardContent>
            </div>}
            <div 
                className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isGood ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${percentage}%` }}
            ></div>
        </AnalyticsCard>
    );
};