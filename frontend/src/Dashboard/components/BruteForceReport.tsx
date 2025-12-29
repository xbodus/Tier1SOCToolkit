import React, { useState } from "react";
import FinishedReport from "./FinishedReport.tsx";
import {useReportContext} from "../ContextWrappers/ReportContext.tsx";
import {useAnalyzerContext} from "../ContextWrappers/AnalyzerContext.tsx";





const QuestionOne = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "Brute Force Attack"
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
                <div id={"option-1"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Cross Site Scripting")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Cross Site Scripting</p>
                </div>
                <div id={"option-2"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, "DoS Attack")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>DoS Attack</p>
                </div>
                <div id={"option-3"} className={`option ${input[3] ? "wrong" : ""}`}  onClick={() => handleInput(3, "SQL Injection")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>SQL Injection</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] || isRight ? "correct" : ""}`}   onClick={() => handleInput(4,answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
            </div>
        </div>
    )
})


const QuestionTwo = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const answer = "123.45.67.89"
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
                <div id={"option-3"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "123.60.12.101")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>123.60.12.101</p>
                </div>
                <div id={"option-2"} className={`option ${input[2] || isRight ? "correct" : ""}`}  onClick={() => handleInput(2, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}   onClick={() => handleInput(3,"198.12.60.101")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>198.12.60.101</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "123.12.60.1")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>123.12.60.1</p>
                </div>
            </div>
        </div>
    )
})


const QuestionThree = React.memo(({ isRight, onCorrect }: { isRight: boolean, onCorrect: () => void }) => {
    const {bruteForceAttempts} = useAnalyzerContext()
    const answer = bruteForceAttempts.toString()
    const option1 = (bruteForceAttempts + 2).toString()
    const option2 = Math.max(bruteForceAttempts - 2, 1).toString()
    const option3 = (bruteForceAttempts + 3).toString()
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
            <h4 id={"question-1-title"} className={"border-bottom pb-3"} style={{ color: "#39ff14" }}>Question 3: How many login attempts were flagged?</h4>
            <div className={"flex flex-column gap-10 border-bottom pb-5"}>
                <div id={"option-3"} className={`option ${input[1]  || isRight ? "correct" : ""}`}  onClick={() => handleInput(1, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>{answer}</p>
                </div>
                <div id={"option-2"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, option1)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>{option1}</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}   onClick={() => handleInput(3,option2)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>{option2}</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, option3)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14", wordBreak: "break-word", wordWrap: "break-word" }}>{option3}</p>
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
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Cross Site Scripting")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Russia</p>
                </div>
                <div id={"option-3"} className={`option ${input[2] ? "wrong" : ""}`}  onClick={() => handleInput(2, "DoS Attack")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Argentina</p>
                </div>
                <div id={"option-1"} className={`option ${input[3] ? "wrong" : ""}`}  onClick={() => handleInput(3,"SQL Injection")}>
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
    const answer = "Limit failed login attempts within a certain timeframe"
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
                <div id={"option-2"} className={`option ${input[1] ? "wrong" : ""}`}  onClick={() => handleInput(1, "Cross Site Scripting")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Implement rate limiting on endpoints</p>
                </div>
                <div id={"option-1"} className={`option ${input[2] ? "wrong" : ""}`}   onClick={() => handleInput(2,"SQL Injection")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Set strict Content Security Policy headers</p>
                </div>
                <div id={"option-3"} className={`option ${input[3] || isRight ? "correct" : ""}`}  onClick={() => handleInput(3, answer)}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>{answer}</p>
                </div>
                <div id={"option-4"} className={`option ${input[4] ? "wrong" : ""}`}  onClick={() => handleInput(4, "Brute Force Attack")}>
                    <p className={"pointer w-90"} style={{ color: "#39ff14" }}>Configure firewall rules to block traffic spikes</p>
                </div>
            </div>
        </div>
    )
})



export default function BruteForceReport() {
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