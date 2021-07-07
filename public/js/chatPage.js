$(document).ready(()=>{
    fetch('/api/chats/'+chatData._id).then((res)=>res.json()).then((data)=>{
        $("#chatName").text(getChatName(data))
    })
    
    if (!chatData)
        return
    var i = 0
    var maxImagesToShow = 3
    var remainingUsers = chatData.users.length - maxImagesToShow
    remainingUsers--
    const imgContainer = document.querySelector('.chatImagesContainer')
    if (remainingUsers > 0){
        const userCountDiv = document.createElement('div')
        userCountDiv.className = "userCount"
        const userCountSpan = document.createElement('span')
        userCountDiv.textContent = "+" + remainingUsers
        userCountDiv.appendChild(userCountSpan)
        imgContainer.appendChild(userCountDiv)

    }
    for(let user of chatData.users){
        if (chatData.users.length != 1 && user._id == userLoggedIn._id)
            continue
        else if (i >= maxImagesToShow) 
            break 
        const tmpImg = document.createElement('img')
        tmpImg.src = user.profilePic
        tmpImg.alt = "User's profile picture"
        tmpImg.title = user.firstName
        imgContainer.appendChild(tmpImg)
        i++
    };

    fetch('/api/chats/'+chatData._id+"/messages").then((res)=>res.json()).then((data)=>{
        var messages = []
        var lastSenderId = ""
        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index+1], lastSenderId)
            messages.push(html)

            lastSenderId = message.sender._id
        });
        var messagesHtml = messages.join("")
        addMessagesHtmlToPage(messagesHtml)
        scrollToBottom(false)
        $(".loadingSpinnerContainer").remove()
        $(".chatContainer").css("visibility", "visible")
    })
})
function addMessagesHtmlToPage(html){
    $(".chatMessages").append(html);
}

$("#chatNameButton").click(()=>{
    var name = $("#chatNameTextbox").val().trim()

    fetch(`/api/chats/${chatData._id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            chatName: name
        })
    }
    ).then((res)=>{
        if (res.status != 204){
            alert('Something went wrong')
        }else{
            location.reload()
        }
    })
})
$(".inputTextbox").keydown((event)=>{
    if (event.which === 13){
        messageSubmitted()
        return false
    }
})
$(".sendMessageButton").click(()=>{
    messageSubmitted()
})

function messageSubmitted(){
    var content = $(".inputTextbox").val().trim()
    if (content != ""){
        sendMessage(content)
        $(".inputTextbox").val("")
    }

}

function sendMessage(content){
    fetch(`/api/messages`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            content,
            chatId: chatData._id
        })
    }
    ).then((res)=>res.json()).then((data)=>{
        addChatMessageHtml(data)
    })
}
function addChatMessageHtml(message) {
    if(!message || !message._id) {
        alert("Message is not valid");
        return;
    }

    var messageDiv = createMessageHtml(message, null, "");

    addMessagesHtmlToPage(messageDiv)
    scrollToBottom(true)
}

function createMessageHtml(message, nextMessage, lastSenderId) {
    var sender = message.sender
    var senderName = sender.firstName + " " + sender.lastName
    var currentSenderId = sender._id
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : ""
    var isFirst = lastSenderId != currentSenderId
    var isLast = nextSenderId != currentSenderId
    var isMine = message.sender._id == userLoggedIn._id;
    var liClassName = isMine ? "mine" : "theirs";

    var nameElement = ""
    if (isFirst) {
        liClassName += " first"
        if (!isMine){
            nameElement = `<span class='senderName'>${senderName}</span>`
        }
    }
    var profileImg = ""
    if (isLast) {
        liClassName += " last"
        profileImg = `<img src='${sender.profilePic}'></img>`
    }
    var imageContainer = ""
    if (!isMine){
        imageContainer = `<div class='imageContainer'>
                            ${profileImg}
                            </div>`
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated){
    var container = $(".chatMessages")
    var scrollHeight = container[0].scrollHeight
    if (animated){
        container.animate({scrollTop: scrollHeight}, "slow")
    }else{
        container.scrollTop(scrollHeight)
    }
}