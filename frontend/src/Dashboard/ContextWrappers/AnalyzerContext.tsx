import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useAlertContext} from "./AlertContext.tsx";



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



export type IpResult = {
    ip: string;
    results: {
        data: {
            data: {
                abuseConfidenceScore: number;
                countryCode: string;
                domain: string;
                hostname: string[];
                ipAddress: string;
                ipVersion: number;
                isPublic: boolean;
                isTor: boolean;
                isWhitelisted: boolean|null;
                isp: string;
                lastReportedAt: string|null;
                numDistinctUsers: number;
                totalReports: number;
                usageType: string;
            }
        }
        enriched_data?: {
            as_domain: string;
            asn: string;
            continent_code: string;
            country: string;
            org: string;
        }
        malicious: boolean;
    }
}



type AnalyzerContextType = {
    data: DoSInstance|BruteForceInstance|SQLiInstance|null;
    ipData: IpResult|null;
    continent: string|undefined|null;
    logDownloaded: boolean;
    timeframe: string|null;
    bruteForceAttempts: number;
    setData: React.Dispatch<React.SetStateAction<DoSInstance | BruteForceInstance | SQLiInstance | null>>;
    setIpData:  React.Dispatch<React.SetStateAction<IpResult | null>>;
    setContinent:  React.Dispatch<React.SetStateAction<string | null | undefined>>;
    setLogDownloaded: React.Dispatch<React.SetStateAction<boolean>>
}



const AnalyzerContext = createContext<AnalyzerContextType|null>(null)


export function AnalyzerProvider({children}: {children: any}) {
    const [data, setData] = useState<DoSInstance|BruteForceInstance|SQLiInstance|null>(null)
    const [ipData, setIpData] = useState<IpResult|null>(null)
    const [continent, setContinent] = useState<string|undefined|null>(null)
    const [logDownloaded, setLogDownloaded] = useState<boolean>(false)
    const [timeframe, setTimeframe] = useState<string|null>(null)
    const [bruteForceAttempts, setBruteForceAttempts] = useState(0)
    const {logAlert} = useAlertContext()


    useEffect(() => {
        const handleAttackTimeframe = () => {
            if (!logAlert.type || logAlert.type === "sqli" || !data) return

            if (logAlert.type === "dos") {
                try {
                    if (!data) return
                    const dosData = data as DoSInstance
                    const timeframe = dosData.results.time_elapsed
                    setTimeframe(timeframe)
                } catch {
                    throw new Error("Unable to unpack dos data")
                }
            }

            if (logAlert.type === "brute-force") {
                try {
                    const bruteForceData = data as BruteForceInstance
                    const tracked_logs = Object.entries(bruteForceData.results.tracked_logs)
                    const attempts = tracked_logs[0][1].total

                    setBruteForceAttempts(attempts)
                } catch {
                    throw new Error("Unable to unpack brute force data")
                }
            }
        }

        handleAttackTimeframe()
    }, [data, logAlert])


    const AnalyzerValues = useMemo(() => ({
        data,
        ipData,
        continent,
        logDownloaded,
        timeframe,
        bruteForceAttempts,
        setData,
        setIpData,
        setContinent,
        setLogDownloaded
    }), [data, ipData, continent, logDownloaded, timeframe, bruteForceAttempts, setData, setIpData, setContinent, setLogDownloaded])

    return (
        <AnalyzerContext.Provider value={AnalyzerValues}>
            {children}
        </AnalyzerContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalyzerContext() {
    return useContext(AnalyzerContext)!
}