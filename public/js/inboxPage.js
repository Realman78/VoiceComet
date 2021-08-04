$(document).ready(async ()=>{
    const res = await fetch('/api/chats')
    const data = await res.json()
    if (!data){
        return alert('Something went wrong')
    }
    $(".loadingSpinnerContainer").remove()
    outputChatList(data, $(".resultsContainer"))
})

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    })

    if(chatList.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

