import '@vitejs/plugin-react/preamble'
import { useState, useEffect } from "react";
import Application from './components/Application.tsx'
import StartBtn from "./components/StartBtn.tsx";
import SearchBar from "./components/SearchBar.tsx";
import AI from "./components/AI.tsx";
import AccessibilityControls from "./components/AccessibilityControls.tsx";
import Browser from "./components/Browser.tsx";
import FilesManager from "./components/FilesManager.tsx";

export default function Dashboard() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
    }).format(time);

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        timeStyle: "short",
    }).format(time);

    return (
        <>
            <section id='react-dashboard' className='fullscreen'>
                <div id='applications'>
                    <Application label='Port Scanner' />
                    <Application label='Log Analyzer' />
                    <Application label='IP Analyzer' />
                    <Application label='SIEM' />
                </div>
                <div id='toolbar'>
                    <div className='flex h-full'>
                        <StartBtn />
                        <SearchBar />
                        <Browser />
                        <FilesManager />
                    </div>
                    <div className='flex h-full gap-10'>
                        <AccessibilityControls />
                        <div id='date-and-time'>
                            <p>{timeFormatter}</p>
                            <p>{dateFormatter}</p>
                        </div>
                        <AI />
                    </div>
                </div>
            </section>
        </>
    )
}
