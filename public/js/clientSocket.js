var connected = false
var socket = io("https://voice-comet.herokuapp.com");

socket.emit('setup', userLoggedIn)

socket.on("connected", ()=>connected=true)
socket.on("message recieved", (newMessage)=>{
    messageRecieved(newMessage)
})