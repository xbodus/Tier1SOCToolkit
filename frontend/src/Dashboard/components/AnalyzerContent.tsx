import FileInput from "./FileInput.tsx";
import {useEffect, useState} from "react";
import FileData from "./FileData.tsx";
import IPAnalyzer from "./IPAnalyzer.tsx";
import {type DoSInstance, type BruteForceInstance, type SQLiInstance, useAnalyzerContext} from "../ContextWrappers/AnalyzerContext.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";






export default function AnalyzerContent() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const {data, setData} = useAnalyzerContext()
    const {logAlert} = useAlertContext()
    const {logDownloaded, error, setError} = useAnalyzerContext()

    const handleLoading = (loading:boolean) => {
        setIsLoading(loading)
    }

    const handleData = (newData:DoSInstance|BruteForceInstance|SQLiInstance) => {
        setData(newData)
    }

    useEffect(() => {
        if (!error) return
        alert(error)
    }, [error])

    return (
        <div className="analyzer-content">
            {!logAlert.type && (
                <p className={"white center"}>No attack detected. Nothing to analyze. Go back to SIEM and continue monitoring for abnormal traffic.</p>
            )}
            {logAlert.type && !logDownloaded && (
                <p className={"white center"}>Alert Detected! Download the logs to analyze.</p>
            )}
            {logAlert.type && logDownloaded && (
                <>
                    <FileInput setLoading={handleLoading} setData={handleData} setError={setError} />
                    {isLoading && (<p style={{ color: "#39ff14" }}>Loading...</p> )}
                    {!isLoading && data && !error && (
                        <div className={"analyzer-window"}>
                            <FileData data={data} />
                            <IPAnalyzer />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}