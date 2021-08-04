$(document).ready(async ()=>{
    const res = await fetch('/api/notifications')
    const data = await res.json()
    outputNotificationList(data, $(".resultsContainer"))
})

$("#markNotificationsAsRead").click(()=>markNotificationAsOpened())
