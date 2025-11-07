import '@vitejs/plugin-react/preamble'

import Application from './components/Application.tsx'
import { useWindowContext} from "./ContextWrappers/WindowContext.tsx";
import Taskbar from "./components/Taskbar.tsx";
import AppWindow from "./Utils/Window.tsx";

export default function Dashboard() {
    const {windows} = useWindowContext()

    return (
        <section id='react-dashboard' className='fullscreen'>
            <div id='applications'>
                <Application label='Port Scanner' />
                <Application label='Log Analyzer' />
                <Application label='IP Analyzer' />
                <Application label='SIEM' />
            </div>
            {windows && windows.map(w =>
                <AppWindow key={w.id} context={w}>
                    <p>New window</p>
                </AppWindow>
            )}
            <Taskbar />
        </section>
    )
}
