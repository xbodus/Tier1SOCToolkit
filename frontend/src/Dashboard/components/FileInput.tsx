import React, {type FormEvent, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";
import type {BruteForceInstance, DoSInstance, SQLiInstance} from "../ContextWrappers/AnalyzerContext.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


interface FileInputProps {
    setLoading: (loading: boolean) => void;
    setData: (newData: DoSInstance | BruteForceInstance | SQLiInstance) => void;
}

export default function FileInput({setLoading, setData}: FileInputProps) {
    const [file, setFile] = useState<File | null>(null)
    const {logAlert} = useAlertContext()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`/api/log_analyzer?type=${encodeURIComponent(logAlert.type || "")}`, {
            method: "POST",
            credentials: "include",
            headers: {
                'X-CSRFToken': getCookie("csrftoken") as string
            },
            body: formData
        })

        const data = await response.json()
        setData(data)

        setFile(null)

        return setLoading(false)
    }

    return (
        <div className={"flex gap-30 align-center m-center"}>
            <p style={{color: "#39ff14"}}>Upload log file to analyze: </p>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input className="custom-file-input" name={"file"} type={"file"} accept={".ndjson"}
                       onChange={(e) => handleFileChange(e)}/>
                <button className="siem-button" type={"submit"}>Analyze</button>
            </form>
        </div>
    )
}