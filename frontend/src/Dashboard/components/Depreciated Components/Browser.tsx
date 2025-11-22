
type Props = {
    url: string
}

export default function Browser(props: Props) {

    return (
        <div id='browser' className='h-full'>
            <iframe
                src={props.url}
                style={{ border: "none" }}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="browser-window"
            />
        </div>
    )
}