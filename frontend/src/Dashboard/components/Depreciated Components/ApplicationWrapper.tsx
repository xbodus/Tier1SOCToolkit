

type Props = {
    children: any
}

export default function AppWrapper(props:Props) {

    return (
        <div className="p-3">
            {props.children}
        </div>
    )
}