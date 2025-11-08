import {getCookie} from "../Utils/utils.tsx";
import {useState, useRef} from "react";


export default function IPAnalyzer() {
    const [ip, setIp] = useState("")
    const enrich = useRef(false)
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const submitForm = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const enrichData = enrich.current

        const response = await fetch("/api/ip_reputation", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ip, enrichData})
        })

        const data = await response.json()

        setData(data)

        return setIsLoading(false)
    }

    const toggleEnrich = () => {
        return enrich.current = !enrich.current
    }

    const Enrich = () => {
        return (
            <div>
                <h4>Geo Data:</h4>
                <ul>
                    <li>Country: { data?.results?.enriched_data?.country }</li>
                    <li>Continent Code: { data?.results?.enriched_data?.continent_code }</li>
                    <li>ASN: { data?.results?.enriched_data?.asn }</li>
                    <li>Org: { data?.results?.enriched_data?.org }</li>
                    <li>Domain: { data?.results?.enriched_data?.as_domain }</li>
                </ul>
            </div>
        )
    }

    const Results = () => {
        return (
            <div>
                <h2>Reputation Results</h2>
                {data.results.malicious ? <h3>Potential Malicious IP: { data.ip }({data.results.data.data.abuseConfidenceScore }) - Reported { data.results.data.data.totalReports } times</h3> :
                <h3>IP Non-Malicious: { data.ip }({ data.results.data.data.abuseConfidenceScore })</h3>}
                {!isLoading && enrich.current && (<Enrich />)}
            </div>
        )
    }

    return (
        <div>
            <h2>IP Reputation Check</h2>

            <p>Test IP: 185.220.101.1</p>
            <form onSubmit={(e) => submitForm(e)}>
                <div>
                    <label htmlFor="ip">Enter IP for check: </label>
                    <input id="ip" name="ip" type="text" value={ip} onChange={(e) => setIp(e.target.value)} />
                    <label htmlFor="enrich">Enrich IP data: </label>
                    <input id="enrich" name="enrich" type="checkbox" onClick={() => toggleEnrich()} />
                </div>
                <button type="submit">Submit</button>
            </form>
            {isLoading && <p>Checking IP...</p>}
            {!isLoading && data?.results && (<Results />)}
            {!isLoading && data?.error && (<p>{data.error}</p>)}
        </div>
    )
}