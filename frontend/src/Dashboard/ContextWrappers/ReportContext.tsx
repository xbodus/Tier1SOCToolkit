import React, {createContext, useContext, useMemo, useState} from "react";





type ReportContextType = {
    question: number;
    setQuestion: React.Dispatch<React.SetStateAction<number>>;
    isRight: Record<number, boolean>;
    setIsRight:  React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    reportFinished: boolean;
    setReportFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReportContext = createContext<ReportContextType|null>(null)


export function ReportProvider({children}: {children:any}) {
    const [question, setQuestion] = useState<number>(1)
    const [isRight, setIsRight] = useState<Record<number, boolean>>({
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
    })
    const [reportFinished, setReportFinished] = useState<boolean>(false)

    const ReportValues = useMemo(() => ({
        isRight,
        question,
        reportFinished,
        setIsRight,
        setQuestion,
        setReportFinished,
    }), [isRight, question, reportFinished, setIsRight, setQuestion, setReportFinished])

    return (
        <ReportContext.Provider value={ReportValues}>
            {children}
        </ReportContext.Provider>
    )
}


// eslint-disable-next-line react-refresh/only-export-components
export function useReportContext() {
    return useContext(ReportContext)!
}