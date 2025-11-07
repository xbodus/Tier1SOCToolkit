import { Rnd } from "react-rnd";
import {useWindowContext} from "../ContextWrappers/WindowContext.tsx";
import {useEffect, useState} from "react";
import Browser from "../components/Browser.tsx";

type Props = {
    children: any;
    key: string;
    context: {
        id: string,
        app: string,
        minimize: boolean,
        zIndex: number,
    };
}

export default function AppWindow(props:Props) {
    const {closeWindow, minimizeWindow, bringToFront} = useWindowContext()
    const [fullscreen, setFullscreen] = useState<boolean>(false);
    const [position, setPosition] = useState<{x: number, y: number}>({x: 400, y:50})
    const [dimensions, setDimensions] = useState<{height: number, width: number}>({height: 800, width: 1000})
    const [savedState, setSavedState] = useState<{x: number, y: number}>({x: 200, y: 300})

    useEffect(() => {
        if (props.context.app === "Browser") {
            setFullscreen(true)
        }
    }, [])
    

    const handleMaximize = () => {
        if (!fullscreen) {
            setSavedState({ x: position.x, y: position.y})
        }

        if (fullscreen) {
            setPosition({ x: savedState.x, y: savedState.y })
        }

        setFullscreen(prev => !prev)
    }

    return (
        <Rnd
            size={{
                height: fullscreen ? window.innerHeight : dimensions.height,
                width: fullscreen ? window.innerWidth : dimensions.width
            }}
            position={{
                x: fullscreen ? 0 : position.x,
                y: fullscreen ? 0 : position.y
            }}
            style={{
                zIndex: props.context.zIndex,
                opacity: props.context.minimize ? 0 : 1,
            }}
            bounds="window"
            minWidth={300}
            minHeight={200}
            className="app-window"
            dragHandleClassName="window-controls"
            onDragStop={(e, data) => setPosition({x: data.x, y: data.y})}
            onResizeStop={(e, direction, ref, delta, pos) => {
                setDimensions({height: ref.offsetHeight, width: ref.offsetWidth})
                setPosition({x: pos.x, y: pos.y})
            }}
            onMouseDown={() => bringToFront(props.context.id)}
        >
            <div className="window">
                <div className="window-controls">
                    <button className='minimize-control' onClick={(e) => {
                        e.stopPropagation()
                        minimizeWindow(props.context.id)
                    }}>-</button>
                    <button className='fullscreen-control' onClick={() => handleMaximize()}>&#9633;</button>
                    <button onClick={(e) => {
                        e.stopPropagation()
                        closeWindow(props.context.id)
                    }} className='close-control'>X</button>
                </div>
                <div className="window-content">
                    {props.context.app === "Browser" && <Browser url={"http://192.168.56.101"} />}
                    {props.context.app === "Port Scanner" && <p>Placeholder content</p>}
                    {props.context.app === "Log Analyzer" && <p>Placeholder content</p>}
                    {props.context.app === "IP Analyzer" && <p>Placeholder content</p>}
                    {props.context.app === "SIEM" && <p>Placeholder content</p>}
                </div>
            </div>
        </Rnd>
    );
}


