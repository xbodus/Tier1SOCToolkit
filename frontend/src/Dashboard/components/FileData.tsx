import type {BruteForceInstance, DoSInstance, SQLiInstance} from "./AnalyzerContent.tsx";
import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";


interface DataProps {
    data: DoSInstance|BruteForceInstance|SQLiInstance
}

export default function FileData({data}: DataProps) {
    const {alert} = useLogsContext()

    if (alert.type === "dos") {
        const dosData = data as DoSInstance
        return (
            <div className={"log-window overflow-y"}>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(dosData.results.alerts)}</p>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(dosData.results.tracked_logs)}</p>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(dosData.total)}</p>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(dosData.elapsed)}</p>
            </div>
        )
    }

    if (alert.type === "brute-force") {
        const bruteForceData = data as BruteForceInstance
        return (
            <div className={"log-window overflow-y"}>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(bruteForceData.results.tracked_logs)}</p>
                <p style={{ color: "#39ff14" }}>{JSON.stringify(bruteForceData.results.alerts)}</p>
                <p style={{ color: "#39ff14" }}>{bruteForceData.total}</p>
                <p style={{ color: "#39ff14" }}>{bruteForceData.elapsed}</p>
            </div>
        )
    }

    if (alert.type === "sqli") {
        const sqliData = data as SQLiInstance
        return (
            <div className={"analyzer-tool-window overflow-y"}>
                <p style={{ color: "#39ff14" }} className={"pb-5"}>Total Flagged Events: {sqliData.total}</p>
                {sqliData.results.map((data, index) => {
                    return (
                        <div key={index} className={"pb-3 log-item"}>
                            <p style={{ color: "#39ff14" }}>IP: {JSON.stringify(data.ip)}</p>
                            <p style={{ color: "#39ff14" }}>Flagged Activity: {JSON.stringify(data.message)}</p>
                            <p style={{ color: "#39ff14" }}>Matched SQL Pattern: {JSON.stringify(data.matched)}</p>
                        </div>
                    )
                })}
                <p style={{ color: "#39ff14" }}>Total Time to Analyze: {sqliData.elapsed}</p>
            </div>
        )
    }

    return (
        <>
            <p style={{ color: "#39ff14" }}>Unable to process attack</p>
        </>
    )
}