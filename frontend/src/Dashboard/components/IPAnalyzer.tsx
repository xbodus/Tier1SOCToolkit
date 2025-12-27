import {type FormEvent, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";
import IPThreatMap from "./IPThreatMap.tsx";



type IpResult = {
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


export default function IPAnalyzer() {
    const [ip, setIp] = useState<string>("")
    const [checked, setChecked] = useState<boolean>(false)
    const [data, setData] = useState<IpResult|null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [continent, setContinent] = useState<string|undefined|null>(null)


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

            const data:IpResult = await response.json()
            setData(data)

            const cont = data.results.enriched_data?.continent_code

            setContinent(cont)
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
                {!isLoading && data && (
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "10px"}}>
                        <div style={{ borderBottom: "2px solid #39ff14"}}>
                            <p style={{ color: "#39ff14" }}>Results for {data.ip}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Abuse Confidence Score: {data.results?.data?.data?.abuseConfidenceScore}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Country Code: {data.results?.data?.data?.countryCode}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Domain: {data.results?.data?.data?.domain}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>ISP: {data.results?.data?.data?.isp}</p>
                            <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Total Reports: {data.results?.data?.data?.totalReports}</p>
                        </div>
                        {data.results.enriched_data && (
                            <div style={{ borderBottom: "2px solid #39ff14"}}>
                                <p style={{ color: "#39ff14" }}>Enriched Data</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>ASN: {data.results?.enriched_data.asn}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Continent Code: {data.results?.enriched_data.continent_code}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Country: {data.results?.enriched_data.country}</p>
                                <p style={{ color: "#39ff14", paddingLeft: "2rem" }}>Org: {data.results?.enriched_data.org}</p>
                            </div>
                        )}
                        <p style={{ color: "#39ff14" }}>Suspected Malicious: {data.results.malicious ? "True" : "False"}</p>
                    </div>
                )}
                {!isLoading && data && (<IPThreatMap continent={continent} />)}
            </div>
        </div>
    )
}