import SQLiReport from "./SQLiReport.tsx";
import DoSReport from "./DoSReport.tsx";
import BruteForceReport from "./BruteForceReport.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


export default function SimReport() {
    const {logAlert} = useAlertContext()
    return (
        <div className={"flex flex-column justify-center align-center h-full w-full"}>
            <h3 style={{ color: "#39ff14" }}>Findings Report</h3>
            <div className={"report-window"}>
                {!logAlert.type && (<p className={"white center"}>No attack detected. Nothing to report. Go back to SIEM and continue monitoring for abnormal traffic.</p>)}
                {logAlert.type === "dos" && (<DoSReport />)}
                {logAlert.type === "brute-force" && (<BruteForceReport />)}
                {logAlert.type === "sqli" && (<SQLiReport />)}
            </div>
        </div>
    )
}