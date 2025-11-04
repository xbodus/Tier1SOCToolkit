import AppWindow from "../Utils/Window.tsx";
import { useState } from "react";

type Props = {
    label: string
}

export default function Application(props: Props) {
    const [mount, setMount] = useState(false)

    return (
        <div className='application-container' onClick={() => setMount(true)}>
            <div>
                <div></div>
            </div>
            <p>{props.label}</p>
            {mount && (
                <AppWindow>
                    <p>New window</p>
                </AppWindow>
            )}
        </div>
    )
}