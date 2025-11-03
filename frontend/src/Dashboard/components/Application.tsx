

type Props = {
    label: string
}

export default function Application(props: Props) {
    return (
        <div className='application-container'>
            <div>
                <div></div>
            </div>
            <p>{props.label}</p>
        </div>
    )
}