import { useState, useEffect } from "react";

import StartBtn from "./StartBtn.tsx";
import SearchBar from "./SearchBar.tsx";
import BrowserIcon from "./BrowserIcon.tsx";
import FilesManager from "./FilesManager.tsx";
import AccessibilityControls from "./AccessibilityControls.tsx";
import AI from "./AI.tsx";

import {useWindowContext} from "../../ContextWrappers/Depreciated ContextWrappers/WindowContext.tsx";


export default function Taskbar(){
    const [time, setTime] = useState(new Date());
    const {windows, minimizeWindow} = useWindowContext()

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
        <div id='taskbar'>
            <div className='flex h-full'>
                <StartBtn />
                <SearchBar />
                <BrowserIcon />
                <FilesManager />

                {windows.map(w => (
                    <div key={w.id} className='taskbar-application' onClick={(e) => {
                        e.stopPropagation()
                        minimizeWindow(w.id)
                    }}>{w.app}</div>
                ))}
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
    )
}