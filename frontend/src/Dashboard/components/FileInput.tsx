import React, {type FormEvent, useState} from "react";
import {getCookie} from "../Utils/utils.tsx";
import type {BruteForceInstance, DoSInstance, SQLiInstance} from "../ContextWrappers/AnalyzerContext.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


interface FileInputProps {
    setLoading: (loading: boolean) => void;
    setData: (newData: DoSInstance | BruteForceInstance | SQLiInstance) => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function FileInput({setLoading, setData, setError}: FileInputProps) {
    const [file, setFile] = useState<File | null>(null)
    const {logAlert} = useAlertContext()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const verifyExtension = (file:File) => {
        if (!file.name.endsWith(".ndjson")) {
            alert("Please upload a .ndjson file")
            setFile(null)
            return false
        }
        return true
    }

    const verifyFileSize = (file:File) => {
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 50MB');
            setFile(null)
            return false
        }
        return true
    }

    const verifyFileType = (file:File) => {
        if (file.type && ['text/plain', 'application/json', ''].includes(file.type)) {
            alert('Invalid file type')
            setFile(null)
            return false
        }
        return true
    }

    const verifyContent = (file:File) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string
                const lines = text.split('\n').slice(0, 5)

                lines.forEach(line => {
                    if (line.trim()) {
                        JSON.parse(line)
                    }
                })
            } catch {
                alert('Invalid NDJSON format')
                setFile(null)
                return false
            }
        }
        reader.readAsText(file.slice(0, 1024 * 3))
        return true
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        if (!file) return

        if (!verifyExtension(file)) return
        if (!verifyFileSize(file)) return
        if (!verifyFileType(file)) return
        if (!verifyContent(file)) return

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

        if (data.error) {
            setError(data.error)
        }

        setError(null)
        setData(data)

        setFile(null)

        return setLoading(false)
    }

    return (
        <div className={"file-input-wrapper"}>
            <p style={{color: "#39ff14"}}>Upload log file to analyze: </p>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input className="custom-file-input" name={"file"} type={"file"} accept={".ndjson"}
                       onChange={(e) => handleFileChange(e)}/>
                <button className="siem-button" type={"submit"}>Analyze File</button>
            </form>
        </div>
    )
}