import {createContext, useCallback, useContext, useMemo, useState} from "react";



type AlertContextType = {
    logAlert: {detected: boolean, type: string|null};
    setAlert:  React.Dispatch<React.SetStateAction<{
        detected: boolean
        type: string | null
    }>>;
    resetAlert: () => void;
}

const AlertContext = createContext<AlertContextType|null>(null)


export function AlertProvider({children}:{children:any}) {
    const [logAlert, setAlert] = useState<{detected: boolean, type: string|null}>({detected: false, type: null})

    const resetAlert = useCallback(()=> {
        setAlert({detected: false, type: null})
    }, [])

    const AlertValues = useMemo(() => ({
        logAlert,
        setAlert,
        resetAlert,
    }), [logAlert, setAlert, resetAlert])

    return (
        <AlertContext.Provider value={AlertValues}>
            {children}
        </AlertContext.Provider>
    )
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAlertContext() {
    return useContext(AlertContext)!
}