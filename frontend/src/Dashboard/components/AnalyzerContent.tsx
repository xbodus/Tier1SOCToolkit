import FileInput from "./FileInput.tsx";
import {useState} from "react";
import FileData from "./FileData.tsx";
import IPAnalyzer from "./IPAnalyzer.tsx";



export type DoSInstance = {
    elapsed: string;
    results: {
        ip: string;
        related_logs: {timestamp: string, message: string}[];
        time_elapsed: string;
    };
    total: number;
}


export type BruteForceInstance = {
    elapsed: string;
    results: {
        alerts: string[];
        tracked_logs: Record<number, {messages: string[], total: number}>;
    };
    total: number;
}

type SQLiEvent = {
    ip: string;
    message: string;
    matched: string;
}

export type SQLiInstance = {
    elapsed: string;
    results: SQLiEvent[];
    total: number;
}


export default function AnalyzerContent() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [data, setData] = useState<DoSInstance|BruteForceInstance|SQLiInstance|null>(null)

    const handleLoading = (loading:boolean) => {
        setIsLoading(loading)
    }

    const handleData = (newData:DoSInstance|BruteForceInstance|SQLiInstance) => {
        setData(newData)
    }

    return (
        <div className="siem-content">
            <FileInput setLoading={handleLoading} setData={handleData} />
            {isLoading && (<p style={{ color: "#39ff14" }}>Loading...</p> )}
            {!isLoading && data && (
                <div className={"analyzer-window"}>
                    <FileData data={data} />
                    <IPAnalyzer />
                </div>
            )}
        </div>
    )
}