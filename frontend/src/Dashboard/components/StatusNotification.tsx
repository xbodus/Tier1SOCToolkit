


export default function  StatusNotification({alert}: {alert: boolean}) {

    if (alert) {
        return (
        <div className="notification-container">
            <p>Attack detected!</p>
        </div>
    )} else {
        return (
        <div className="notification-container">
            <p>No Data</p>
        </div>
    )}
}