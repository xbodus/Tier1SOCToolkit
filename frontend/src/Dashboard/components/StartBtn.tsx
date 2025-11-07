import {Portal} from "../Utils/Protal.tsx";
import {useState, useRef} from "react";


export default function StartBtn() {
    const [openPortal, setOpenPortal] = useState<boolean>(false)
    const [portalPos, setPortalPos] = useState<{x: number, y: number}>({x: 0, y: 0})
    const startRef = useRef<HTMLDivElement | null>(null)

    const handleClick = () => {
        if (!startRef) return

        if (startRef.current) {
            const rect = startRef.current.getBoundingClientRect()

            setPortalPos({
                x: rect.x,
                y: rect.y
            })
        }


        return setOpenPortal(prev => !prev)
    }

    return (
        <>
            <Portal open={openPortal} x={portalPos.x} y={portalPos.y} id={'start-popup'}>
                <ul>
                    <a href={'#'}><li>Home</li></a>
                </ul>
            </Portal>
            <div id='start-popup'></div>
            <div ref={startRef} id='start-btn' onClick={() => handleClick()}>
                <div></div>
            </div>
        </>
    )
}