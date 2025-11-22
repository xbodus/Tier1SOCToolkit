import {useWindowContext} from "../../ContextWrappers/Depreciated ContextWrappers/WindowContext.tsx";


export default function BrowserIcon() {
    const {openWindow} = useWindowContext()

    return (
        <div id='browser-icon' title='Browser' onClick={() => openWindow('Browser', {url: "https://futurebank.local"})}>
            <div></div>
        </div>
    )
}