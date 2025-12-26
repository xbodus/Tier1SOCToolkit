


export default function  StatusNotification({alert}: {alert: boolean}) {
    if (alert) {
        return (
        <div className="notification-container">
            <p className="white">Attack detected!</p>
        </div>
    )} else {
        return (
        <div className="notification-container">
            <p className="white">No Data</p>
        </div>
    )}
}