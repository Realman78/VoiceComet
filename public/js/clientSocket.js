var connected = false
var socket = io("https://voice-comet.herokuapp.com/");

socket.emit('setup', userLoggedIn)

socket.on("connected", ()=>connected=true)
socket.on("message recieved", (newMessage)=>{
    messageRecieved(newMessage)
})
socket.on("notification received", ()=>{
    fetch("/api/notifications/latest").then(res=>{
        return res.json()
    }).then(notificationData=>{
        showNotificationPopup(notificationData)
        refreshNotificationsBadge()
    })
})

function emitNotification(userId){
    if (userId == userLoggedIn._id) return
    socket.emit("notification received", userId)
}