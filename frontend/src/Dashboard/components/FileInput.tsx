import React, {type FormEvent, useEffect, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";


export default function FileInput() {
    const [file, setFile] = useState<File|null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [data, setData] = useState(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/log_analyzer", {
            method: "POST",
            credentials: "include",
            headers: {
                'X-CSRFToken': getCookie("csrftoken") as string
            },
            body: formData
        })

        const data = await response.json()

        setData(data)

        return setIsLoading(false)
    }

    useEffect(() => {
        console.log(data)
    }, [data])

    return (
        <>
            {!isLoading && (
                <>
                    <p style={{ color: "#39ff14" }}>Upload log file to analyze: </p>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <input name={"file"} type={"file"} placeholder={"Input Log"} onChange={(e) => handleFileChange(e)} />
                        <button type={"submit"}>Analyze</button>
                    </form>
                </>
            )}
            {isLoading && (<p style={{ color: "#39ff14" }}>Loading...</p> )}
            {!isLoading && data && (<p style={{ color: "#39ff14" }}>Data found</p>)}
        </>
    )
}