import {getCookie} from "../../Utils/utils.tsx";
import React, {type FormEvent, useState} from "react";


export default function LogAnalyzer() {
    const [file, setFile] = useState<File|null>(null)
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // just grab the first file for now
    }
  }

    const submitForm = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/log_analyzer", {
            method: "POST",
            credentials: "include",
            headers: {
                'X-CSRFToken': getCookie('csrftoken') as string
            },
            body: formData
        })

        const data = await response.json()

        setData(data)

        return setIsLoading(false)

    }

    const Results = () => {
        return (
            <div>
                <h2>Analysis Complete: { data?.total } Potential Malicious Alerts Found</h2>
                {data?.results.map((result, i) => (
                    <div key={i}>
                        <h3>{ result.ip } reported potentially malicious</h3>
                        <ul>
                            <li>Abuse Score: { result.data.abuse_confidence_score }</li>
                            <li>Country Code: { result.data.country_code }</li>
                            <li>ISP: { result.data.isp }</li>
                            <li>Last Reported: { result.data.last_reported_at }</li>
                        </ul>
                        <p>Found in log { result.seen } times at:</p>
                        {result.lines.map((line, ind) => (<p key={ind}>{ line }</p>))}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            <h2>Log Analyzer</h2>
            <form onSubmit={(e) => submitForm(e)}>
                <label htmlFor="file">Upload log file to analyze: </label>
                <input id="file" name="file" type="file" accept=".log" onChange={(e) => handleFileChange(e)}/>
                <button type="submit">Submit</button>
            </form>
            {isLoading && <p>Analyzing file...</p>}
            {!isLoading && data?.results && (<Results />)}
            {!isLoading && data?.error && (<p>{data.error}</p>)}
        </div>
    )
}