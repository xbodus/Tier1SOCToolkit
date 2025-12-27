import {useEffect, useRef, useState} from "react";


interface MapProps {
    continent: string| undefined | null;
}

export default function IPThreatMap({continent}: MapProps) {
const [markerPos, setMarkerPos] = useState({ x: '0%', y: '0%' });
    const imgRef = useRef<HTMLImageElement>(null);

    const continentCoords: Record<string, {lat: number, lng: number}> = {
        'NA': { lat: 47, lng: -105 },
        'SA': { lat: -15, lng: -70 },
        'EU': { lat: 60, lng: 15 },
        'AF': { lat: 10, lng: 13 },
        'AS': { lat: 55, lng: 80 },
        'OC': { lat: -29, lng: 122 },
        'AN': { lat: -80, lng: 0 }
    }

    const updateMarkerPosition = () => {
        if (!imgRef.current) return

        if (!continent) return
        const coords = continentCoords[continent]
        const img = imgRef.current

        // Get actual rendered image dimensions (accounting for object-fit: contain)
        const imgAspect = img.naturalWidth / img.naturalHeight
        const containerAspect = img.offsetWidth / img.offsetHeight

        let renderedWidth, renderedHeight, offsetX, offsetY

        if (imgAspect > containerAspect) {
            // Image is wider - letterboxed top/bottom
            renderedWidth = img.offsetWidth;
            renderedHeight = img.offsetWidth / imgAspect;
            offsetX = 0;
            offsetY = (img.offsetHeight - renderedHeight) / 2
        } else {
            // Image is taller - letterboxed left/right
            renderedHeight = img.offsetHeight;
            renderedWidth = img.offsetHeight * imgAspect;
            offsetX = (img.offsetWidth - renderedWidth) / 2
            offsetY = 0
        }

        // Calculate position within the actual image
        const xPercent = (coords.lng + 180) / 360
        const yPercent = (90 - coords.lat) / 180

        const x = offsetX + (xPercent * renderedWidth)
        const y = offsetY + (yPercent * renderedHeight)

        setMarkerPos({ x: `${x}px`, y: `${y}px` })
    }

    useEffect(() => {
        updateMarkerPosition()
        window.addEventListener('resize', updateMarkerPosition)
        return () => window.removeEventListener('resize', updateMarkerPosition)
    }, [continent])

    return (
        <div className={"form"} style={{ height: "50%", width: "100%", padding: "0", overflow: "auto" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                    ref={imgRef}
                    src={"static/dist/Globe_Halftone.png"}
                    alt={"Globe PNG"}
                    height={"100%"}
                    width={"100%"}
                    style={{ objectFit: "contain", display: "block", opacity: "80%" }}
                    onLoad={updateMarkerPosition}
                />
                {!continent && (<p style={{
                                    color: "#39ff14",
                                    position: "absolute",
                                    zIndex: 100,
                                    left: 0,
                                    right: 0,
                                    bottom: "50%",
                                    textAlign: "center",
                                    textShadow: "0 0 10px rgba(0, 0, 0, 1"}}>Enrich search to get geo data</p>)}
                {continent && (
                    <svg
                        id={"marker"}
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            position: "absolute",
                            left: markerPos.x,
                            top: markerPos.y,
                            height: 40,
                            width: 40,
                            transform: "translate(-50%, -50%)",
                            zIndex: 100,
                            pointerEvents: "none"
                        }}
                    >
                        <circle cx="50" cy="50" r="30" fill={"#39ff14"} />
                    </svg>
                )}
            </div>
        </div>
    )
}