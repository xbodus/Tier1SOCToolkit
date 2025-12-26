import {type FormEvent, useEffect, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";


export default function IPAnalyzer() {
    const [ip, setIp] = useState<string>("")
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIp("")
        setIsLoading(true)

        if (ip) {
            const formData = new FormData()
            formData.append("ip", ip)

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
            setData(data)
        }

        return setIsLoading(false)
    }

    useEffect(() => {
        console.log(data)
    }, [data]);

    return (
        <div className="analyzer-tool-window">
            <form onSubmit={(e) => handleSubmit(e)}>
                <input className="custom-file-input" name={"ip-input"} type={"text"} placeholder={"Enter IP"} value={ip}
                       onChange={(e) => setIp(e.target.value)}/>
                <button className="siem-button" type={"submit"}>Analyze</button>
            </form>
            {isLoading && (<p style={{ color: "#39ff14" }}>Loading...</p>)}
            {!isLoading && data && (
                <div>
                    <p style={{ color: "#39ff14", whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: "break-word"}}>{JSON.stringify(data)}</p>
                </div>
            )}
        </div>
    )
}