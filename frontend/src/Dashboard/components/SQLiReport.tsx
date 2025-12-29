import React, { useState } from "react";
import FinishedReport from "./FinishedReport.tsx";
import {useReportContext} from "../ContextWrappers/ReportContext.tsx";





const QuestionOne = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "SQL Injection"
    const [input, setInput] = useState<Record<number, boolean|null>>({
        1: null,
        2: null,
        3: null,
        4: null
    })

    const handleInput = (option:number,input:string) => {
        if (!input) return

        if (input === answer) {
            onCorrect()
        }

        setInput(prev => ({
            ...prev,
            [option]: true
        }))
    }

    return (
        <div id={"question-1"} className={"flex flex-column"}>
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 1: What type of attack was the threat actor performing?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Cross Site Scripting")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Cross Site Scripting</p>
                </div>
                <div id={"option-3"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, "DoS Attack")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>DoS Attack</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] || isRight ? "correct" : ""}`}   onClick={() => handleInput(3,answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "Brute Force Attack")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Brute Force Attack</p>
                </div>
            </div>
        </div>
    )
})


const QuestionTwo = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "123.12.60.101, 123.12.60.60, 123.12.60.220, 123.12.60.10, 123.12.60.50"
    const [input, setInput] = useState<Record<number, boolean|null>>({
        1: null,
        2: null,
        3: null,
        4: null
    })

    const handleInput = (option:number,input:string) => {
        if (!input) return

        if (input === answer) {
            onCorrect()
        }

        setInput(prev => ({
            ...prev,
            [option]: true
        }))
    }

    return (
        <div id={"question-2"} className={"flex flex-column"}>
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 2: What was the IP(s) of the threat actor?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-2"} className={`option ${input[1] || isRight ? "correct" : ""}`}  onClick={() => handleInput(1, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
                <div id={"option-3"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, "123.60.12.101, 123.60.60.60, 123.60.60.10, 123.60.60.50")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>123.60.12.101, 123.60.60.60, 123.60.60.10, 123.60.60.50</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}   onClick={() => handleInput(3,"198.12.60.101, 198.12.60.60")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>198.12.60.101, 198.12.60.60</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "123.12.60.1, 123.12.60.50, 123.12.60.200, 123.12.60.101, 123.12.60.50")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>123.12.60.1, 123.12.60.50, 123.12.60.200, 123.12.60.101, 123.12.60.50</p>
                </div>
            </div>
        </div>
    )
})


const QuestionThree = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "/search?q=1'%20UNION%20SELECT%20NULL,NULL--"
    const [input, setInput] = useState<Record<number, boolean|null>>({
        1: null,
        2: null,
        3: null,
        4: null
    })

    const handleInput = (option:number,input:string) => {
        if (!input) return

        if (input === answer) {
            onCorrect()
        }

        setInput(prev => ({
            ...prev,
            [option]: true
        }))
    }

    return (
        <div id={"question-3"} className={"flex flex-column"}>
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 3: What was one of the SQL patterns used by the threat actor?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "/admin?user='%20ADMIN%20'--")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>/admin?user='%20ADMIN%20'--</p>
                </div>
                <div id={"option-3"} className={`option ${input[2]  || isRight ? "correct" : ""}`}  onClick={() => handleInput(2, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>{answer}</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}   onClick={() => handleInput(3,'/search?user="admin"')}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>/search?user="admin"</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "/dashboard")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>/dashboard</p>
                </div>
            </div>
        </div>
    )
})


const QuestionFour = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "China"
    const [input, setInput] = useState<Record<number, boolean|null>>({
        1: null,
        2: null,
        3: null,
        4: null
    })

    const handleInput = (option:number,input:string) => {
        if (!input) return

        if (input === answer) {
            onCorrect()
        }

        setInput(prev => ({
            ...prev,
            [option]: true
        }))
    }

    return (
        <div id={"question-4"} className={"flex flex-column"}>
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 4: What was the country the threat actor's ip was linked to?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Russia")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Russia</p>
                </div>
                <div id={"option-3"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, "Argentina")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Argentina</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}  onClick={() => handleInput(3,"Romania")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Romania</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] || isRight ? "correct" : ""}`}  onClick={() => handleInput(4, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
            </div>
        </div>
    )
})



const QuestionFive = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "Use parameterized queries and prepared statements"
    const [input, setInput] = useState<Record<number, boolean|null>>({
        1: null,
        2: null,
        3: null,
        4: null
    })

    const handleInput = (option:number,input:string) => {
        if (!input) return

        if (input === answer) {
            onCorrect()
        }

        setInput(prev => ({
            ...prev,
            [option]: true
        }))
    }

    return (
        <div id={"question-5"} className={"flex flex-column"}>
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 5: What actions can be taken to mitigate SQL injection in the future?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Implement rate limiting on login endpoints")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Implement rate limiting on login endpoints</p>
                </div>
                <div id={"option-3"} className={`option ${input[2] || isRight ? "correct" : ""}`}  onClick={() => handleInput(2, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}   onClick={() => handleInput(3,"Set strict Content Security Policy headers")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Set strict Content Security Policy headers</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "Configure firewall rules to block traffic spikes")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Configure firewall rules to block traffic spikes</p>
                </div>
            </div>
        </div>
    )
})



export default function SQLiReport() {
    const {isRight, question, reportFinished, setIsRight, setQuestion, setReportFinished} = useReportContext()

    return (
        <>
            {!reportFinished && (
                <>
                    {question === 1 && (<QuestionOne isRight={isRight[1]} onCorrect={() => setIsRight(prev => ({...prev, [1]: true}))} />)}
                    {question === 2 && (<QuestionTwo isRight={isRight[2]} onCorrect={() => setIsRight(prev => ({...prev, [2]: true}))} />)}
                    {question === 3 && (<QuestionThree isRight={isRight[3]} onCorrect={() => setIsRight(prev => ({...prev, [3]: true}))} />)}
                    {question === 4 && (<QuestionFour isRight={isRight[4]} onCorrect={() => setIsRight(prev => ({...prev, [4]: true}))} />)}
                    {question === 5 && (<QuestionFive isRight={isRight[5]} onCorrect={() => setIsRight(prev => ({...prev, [5]: true}))} />)}
                    <div id={"report-controls"} className={"p-3 flex gap-10 justify-center"}>
                        {question > 1 && <button className={"siem-button"} onClick={() => setQuestion(prev => Math.max(prev - 1, 1))}>Prev</button>}
                        {isRight[question] && question < 5 && (<button className={"siem-button"} onClick={() => setQuestion(prev => Math.min(prev + 1, 5))}>Next</button>)}
                        {isRight[5] && question === 5 && (<button className={"siem-button"} onClick={() => setReportFinished(true)}>Finish Report</button>)}
                    </div>
                </>
            )}
            {reportFinished && (<FinishedReport />)}
        </>
    )
}