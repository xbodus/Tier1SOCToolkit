import {useState} from "react";
import {getCookie} from "../../Utils/utils.tsx";


export default function PortScanner() {
    const [target, setTarget] = useState("")
    const [range, setRange] = useState({start: 1, end: 1024})
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)



    const submitForm = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const response = await fetch("/api/port_scanner", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({target, range})
        })

        const data = await response.json()

        setData(data.data)

        return setIsLoading(false)

    }

    const Results = ({ results }: { results: number[] }) => {
        return (
            <div>
                <h3>Scan Results</h3>
                {results.length > 0 && (results.map((port, i) => (<p key={i}>Port {port.toString()}: Open</p>)))}
                {results.length == 0 && (<p>No open ports found in the selected range.</p>)}
            </div>
        )
    }

    return (
        <div>
            <h2>Port Scanner</h2>
            <p>Legal test scan targets: 127.0.0.1 or scanme.nmap.org</p>
            <form onSubmit={(e) => submitForm(e)}>
                <div>
                    <label htmlFor="target">Target IP or Hostname:</label>
                    <input type="text" id="target" name="target" value={target} onChange={(e) => setTarget(e.target.value)} required/>
                </div>

                <div className='flex'>
                    <label htmlFor="port_range">Port Range (e.g. 1-1024):</label>
                    <input type="number" id="start" value={range.start} onChange={(e) => setRange(prev => ({...prev, start: e.target.value}))}/>
                    <p>-</p>
                    <input type="number" id="end"  value={range.end} onChange={(e) => setRange(prev => ({...prev, end: e.target.value}))}/>
                </div>

                <div>
                    <button type="submit">
                        Scan
                    </button>
                </div>
                {isLoading && (<p>Scanning...</p>)}
                {!isLoading && data?.results && (<Results results={data.results} />)}
                {!isLoading && data?.error && (<p>{data.error}</p>)}
            </form>

        </div>
    )
}