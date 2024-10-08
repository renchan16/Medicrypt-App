import React from "react"
import { AnalyticsCard, AnalyticsCardTitle, AnalyticsCardContent } from "./AnalyticsCard";
import { AnalyticsTooltip } from "./AnalysisTooltop";

const metricFullNames = {
    "Entropy": "Information Entropy",
    "UACI": "Unified Average Changing Intensity",
    "NPCR": "Number of Pixels Change Rate",
    "PSNR": "Peak Signal-to-Noise Ratio",
    "MSE": "Mean Squared Error"
};

export const AnalyticsMetrics = ({metric, baselinespeed, value}) => {
    const percentage = metric.name === "Entropy" ? (value[0] / metric.max) * 100 : (value / metric.max) * 100;

    const isGood = 
        (metric.name === 'Entropy' && value[0] > 7.9) ||
        (metric.name === 'UACI' && value > 31 && value < 35) ||
        (metric.name === 'NPCR' && value > 0.99) ||
        (metric.name === 'PSNR' && value > 30) ||
        (metric.name === 'MSE' && value < 0.1) ||
        (metric.name === 'Encryption Time' && value < baselinespeed) ||
        (metric.name === 'Decryption Time' && value < baselinespeed);

    if (metric.name === "Entropy"){
        return (
            <AnalyticsCard>
                <AnalyticsTooltip content={metricFullNames[metric.name] || metric.name}>
                    <AnalyticsCardTitle>
                        {metric.name}
                    </AnalyticsCardTitle>
                </AnalyticsTooltip>
                <AnalyticsCardContent>
                    <h1 className="text-4xl font-bold mb-2">{value[0].toFixed(4)}</h1>
                    <p className="text-sm mt-2">Ideal: {metric.ideal}</p>
                    <h2 className={`mt-2 text-base font-semibold ${isGood ? 'text-primary' : 'text-red-500'}`}>
                        {isGood ? 'Good' : 'Needs Improvement'}
                    </h2>
                </AnalyticsCardContent>
                <div 
                    className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isGood ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </AnalyticsCard>
        );
    }
    else {
        return (
            <AnalyticsCard>
                <AnalyticsTooltip content={metricFullNames[metric.name] || metric.name}>
                    <AnalyticsCardTitle>
                        {metric.name}
                    </AnalyticsCardTitle>
                </AnalyticsTooltip>
                <AnalyticsCardContent>
                    <h1 className="text-4xl font-bold mb-2">
                        {value.toFixed(4)}
                        {metric.name === "NPCR" || metric.name === "UACI" ? "%" : ""}
                        {metric.name === "Encryption Time" || metric.name === "Decryption Time" ? "s" : ""}    
                    </h1>
                        <p className="text-sm mt-2">Ideal: {metric.ideal}</p>
                        <h2 className={`mt-2 text-base font-semibold ${isGood ? 'text-primary' : 'text-red-500'}`}>
                            {isGood ? 'Good' : 'Needs Improvement'}
                        </h2>
                </AnalyticsCardContent>
                <div 
                    className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isGood ? 'bg-green-500' : 'bg-red-500'}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </AnalyticsCard>
        );
    }
};