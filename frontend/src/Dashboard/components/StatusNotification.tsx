


export default function  StatusNotification({alert}: {alert: boolean}) {
    if (alert) {
        return (
        <div className="notification-container">
            <p>No Data</p>
        </div>
    )} else {
        return (
        <div className="notification-container">
            <p>No Data</p>
        </div>
    )}
}