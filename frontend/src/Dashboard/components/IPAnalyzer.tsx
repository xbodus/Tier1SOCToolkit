import {type FormEvent, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";
import IPThreatMap from "./IPThreatMap.tsx";
import {type IpResult, useAnalyzerContext} from "../ContextWrappers/AnalyzerContext.tsx";






export default function IPAnalyzer() {
    const [ip, setIp] = useState<string>("")
    const [checked, setChecked] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const {ipData, continent, setIpData, setContinent} = useAnalyzerContext()


    const handleChecked = () => {
        setChecked(prev => !prev)
    }

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIp("")
        setChecked(false)
        setIsLoading(true)

        if (ip) {
            const formData = new FormData()
            formData.append("ip", ip)
            formData.append("enrich", checked.toString())

            const response = await fetch("api/ip_reputation",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "X-CSRFToken": getCookie("csrftoken") as string
                    },
                    body: formData
                })

            const data = await response.json()

            if (data.error) {
                console.log(data)
                setError(data.error)
            } else {
                setError(null)

                const ipData = data as IpResult
                setIpData(ipData)

                const cont = data.results.enriched_data?.continent_code

                setContinent(cont)
            }
        }

        return setIsLoading(false)
    }

    return (
        <div className="analyzer-tool-window" style={{ display: "flex", flexDirection: "column"}}>
            <form className={"form"} onSubmit={(e) => handleSubmit(e)}>
                <div className={"flex align-center"}>
                    <label htmlFor={"ip-input"} style={{ color: "#39ff14", marginRight: ".5rem" }}>Search IP: </label>
                    <input className="custom-input" name={"ip-input"} type={"text"} placeholder={"Enter IP"} value={ip}
                           onChange={(e) => setIp(e.target.value)}
                    />
                    <div>
                        <label htmlFor={"enrich-input"} style={{ color: "#39ff14", marginRight: ".5rem" }}>Enrich search:</label>
                        <input className={"custom-input"} name={"enrich-input"} type={"checkbox"} checked={checked} onChange={() => handleChecked()} />
                    </div>
                </div>
                <button className="siem-button" type={"submit"}>Analyze</button>
            </form>
            <div className={"overflow-y"} style={{ height: "100%" }}>
                {isLoading && (<p style={{ color: "#39ff14" }}>Loading...</p>)}
                {!isLoading && error && (<p className={"white center"}>{error}</p>)}
                {!isLoading && ipData && !error && (
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "10px"}}>
                        <div style={{ borderBottom: "2px solid #39ff14"}}>
                            <p style={{ color: "#39ff14" }}>Results for {ipData.ip}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Abuse Confidence Score: {ipData.results?.data?.data?.abuseConfidenceScore}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Country Code: {ipData.results?.data?.data?.countryCode}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Domain: {ipData.results?.data?.data?.domain}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>ISP: {ipData.results?.data?.data?.isp}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Total Reports: {ipData.results?.data?.data?.totalReports}</p>
                        </div>
                        {ipData.results.enriched_data && (
                            <div style={{ borderBottom: "2px solid #39ff14"}}>
                                <p style={{ color: "#39ff14" }}>Enriched Data</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>ASN: {ipData.results?.enriched_data.asn}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Continent Code: {ipData.results?.enriched_data.continent_code}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Country: {ipData.results?.enriched_data.country}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Org: {ipData.results?.enriched_data.org}</p>
                            </div>
                        )}
                        <p style={{ color: "#39ff14" }}>Suspected Malicious: {ipData.results.malicious ? "True" : "False"}</p>
                    </div>
                )}
                {!isLoading && ipData && !error && (<IPThreatMap continent={continent} />)}
            </div>
        </div>
    )
}