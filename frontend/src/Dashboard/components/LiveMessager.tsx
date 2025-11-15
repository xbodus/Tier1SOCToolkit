import {useEffect, useRef, useState} from "react";


export default function LiveMessenger() {
    const [messages, setMessages] = useState<string[]>([])
    const [message, setMessage] = useState<string>('')
    const socket = useRef<WebSocket|null>(null)

    useEffect(() => {
        socket.current = new WebSocket("ws://127.0.0.1:8000/ws/test/")
        socket.current.onopen = () => console.log("WS Connected!")
        socket.current.onmessage = (e) => {
                console.log("Received", e.data)
                setMessages(prev => [...prev, e.data])
            }

        return () => socket.current?.close()
    }, [])

    useEffect(() => {
        console.log(messages)
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault()
        if (socket.current) {
            socket.current.send(message)
        }

    }

    const ChatLog = () => {
        return (
            <div>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p>{message}</p>
                    </div>
                ))}
            </div>
        )
    }
    
    return (
        <div>
            <h1>Hello</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Send message' />
                <button type='submit'>Send</button>
            </form>
            {messages && <ChatLog />}
        </div>
    )
}