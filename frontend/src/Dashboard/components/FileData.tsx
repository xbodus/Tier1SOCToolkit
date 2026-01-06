import type {BruteForceInstance, DoSInstance, SQLiInstance} from "../ContextWrappers/AnalyzerContext.tsx";
import {useState} from "react";
import {formatDuration} from "../Utils/utils.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


interface DataProps {
    data: DoSInstance|BruteForceInstance|SQLiInstance
}

export default function FileData({data}: DataProps) {
    const {logAlert} = useAlertContext()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const logsPerPage:number = 15

    if (logAlert.type === "dos") {
        const dosData = data as DoSInstance
        const totalPages:number = Math.ceil(dosData.results.related_logs.length / logsPerPage)
        const startIndex:number = (currentPage - 1) * logsPerPage
        const endIndex:number = startIndex + logsPerPage
        const currentLogs = dosData.results.related_logs.slice(startIndex, endIndex)

        const goToFirst = () => setCurrentPage(1)
        const goToLast = () => setCurrentPage(totalPages)
        const goToNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
        const goToPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1))
        const goToPage = (page:number) => setCurrentPage(page)

        const getPageNumbers = () => {
            const pages = []
            const showRange = 2

            pages.push(1)

            if (currentPage > showRange + 2) {
                pages.push("...")
            }

            for (let i = Math.max(2, currentPage - showRange);
                 i <= Math.min(totalPages - 1, currentPage + showRange);
                 i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - showRange - 1) {
                pages.push("...")
            }

            if (totalPages > 1) {
                pages.push(totalPages)
            }

            return pages
        }

        const pageNumbers = getPageNumbers()

        return (
            <div className={"analyzer-tool-window overflow-y"}>
                <p style={{ color: "#39ff14" }} className={"pb-3 log-item"}>Suspected DoS Attack from {dosData.results.ip}</p>
                <p style={{ color: "#39ff14" }}>Total Flagged Logs: {dosData.results.related_logs.length}</p>
                <p style={{ color: "#39ff14" }} className={"pb-3 log-item"}>Attack Duration: {formatDuration(dosData.results.time_elapsed)}</p>
                {currentLogs.map((event, index) => (
                    <div key={index} className={"pb-3 log-item"}>
                        <p style={{ color: "#39ff14" }}>{event.timestamp}</p>
                        <p style={{ color: "#39ff14" }}>{event.message}</p>
                    </div>
                ))}
                <div className={"flex gap-30 justify-center"}>
                    <p style={{ color: "#39ff14", cursor: "pointer" }} onClick={() => goToFirst()}>≤≤</p>
                    <p style={{ color: "#39ff14", cursor: "pointer" }} onClick={() => goToPrev()}>≤</p>
                    {pageNumbers.map((page, index) => {
                        if (typeof page === "number") {
                            return (
                                <p
                                    key={index}
                                    style={{
                                        color: "#39ff14",
                                        textDecoration: page === currentPage ? "underline" : "none",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => goToPage(page)}
                                >
                                    {page}
                                </p>
                            )
                        }
                        return (
                            <p key={index} style={{ color: "#39ff14" }}>{page}</p>
                        )
                    })}
                    <p style={{ color: "#39ff14", cursor: "pointer" }} onClick={() => goToNext()}>≥</p>
                    <p style={{ color: "#39ff14", cursor: "pointer" }} onClick={() => goToLast()}>≥≥</p>
                </div>
                <p style={{ color: "#39ff14" }}>Total Analysis Time: {formatDuration(dosData.elapsed)}</p>
            </div>
        )
    }

    if (logAlert.type === "brute-force") {
        const bruteForceData = data as BruteForceInstance
        const logData: {total: number, messages: string[]} = Object.entries(bruteForceData.results.tracked_logs)[0][1]

        return (
            <div className={"analyzer-tool-window overflow-y"}>
                <p style={{ color: "#39ff14" }} className={"pb-3 log-item"}>Alert: {bruteForceData.results.alerts[0]}</p>
                <div className={"pb-3 log-item"}>
                    <p style={{ color: "#39ff14" }}>{logData.total} Related Logs:</p>
                    {logData.messages.map((log, index) => (
                        <p key={index} style={{ color: "#39ff14" }}>{log}</p>
                    ))}
                </div>
                <p style={{ color: "#39ff14" }}>Total Analysis: {formatDuration(bruteForceData.elapsed)}</p>
            </div>
        )
    }

    if (logAlert.type === "sqli") {
        const sqliData = data as SQLiInstance
        return (
            <div className={"analyzer-tool-window overflow-y"}>
                <p style={{ color: "#39ff14" }} className={"pb-5"}>Total Flagged Events: {sqliData.total}</p>
                {sqliData.results.map((data, index) => {
                    return (
                        <div key={index} className={"pb-3 log-item"}>
                            <p style={{ color: "#39ff14" }}>IP: {JSON.stringify(data.ip)}</p>
                            <p style={{ color: "#39ff14", wordWrap: "break-word" }}>Flagged Activity: {JSON.stringify(data.message)}</p>
                            <p style={{ color: "#39ff14" }}>Matched SQL Pattern: {JSON.stringify(data.matched)}</p>
                        </div>
                    )
                })}
                <p style={{ color: "#39ff14" }}>Total Analysis Time: {formatDuration(sqliData.elapsed)}</p>
            </div>
        )
    }

    return (
        <>
            <p style={{ color: "#39ff14" }}>Unable to process attack</p>
        </>
    )
}