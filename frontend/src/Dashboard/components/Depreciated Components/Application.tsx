import {useWindowContext} from "../../ContextWrappers/Depreciated ContextWrappers/WindowContext.tsx";



type Props = {
    label: string
}

export default function Application(props: Props) {
    const { openWindow } = useWindowContext()

    const handleContext = () => {
        openWindow(props.label)
        return
    }

    return (
        <>
            <div className='application-container' onClick={() => handleContext()}>
                <div>
                    <div className="application"></div>
                </div>
                <p>{props.label}</p>
            </div>
        </>
    )
}