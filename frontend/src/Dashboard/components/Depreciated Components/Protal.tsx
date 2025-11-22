import {createPortal} from "react-dom";
import {useState, useRef, useEffect} from "react";

type Props = {
    open: boolean;
    x: number;
    y: number;
    id: string;
    children: any;
}

export function Portal(props:Props) {
    const [popupHeight, setPopupHeight] = useState(0)
    const popupRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!popupRef.current) return
        const observer = new ResizeObserver(() => {
            setPopupHeight(popupRef.current!.offsetHeight)
        })
        observer.observe(popupRef.current)

        return () => observer.disconnect()
    }, [props.open, popupRef])

    if (!props.open) return null

    return createPortal(
        <div ref={popupRef} id={'popup'} className='popup' style={{left: props.x, top: props.y - popupHeight}}>
            {props.children}
        </div>,
        document.getElementById(props.id)!
    )
}