const recordingsList = document.getElementById('recordingsList')

let Scontent = ''
var selectedUsers = []
document.addEventListener('keyup', (e) => {
  if (e.code === "KeyP"){
      if(document.activeElement.tagName === "BODY"){
        if (isListening){
            recognition.stop()
            isListening = false
            startButton.innerHTML = `<i class="fab fa-speakap"></i>`
            return
        }
        if (Scontent.length){
            Scontent += ''
        }
        recognition.start()
      }
  }
});

function OnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
}
$("#postTextarea, #replyTextArea").keyup(event =>{
    var textbox = $(event.target);
    var value = textbox.val().trim();
    Scontent += event.key

    var isModal = textbox.parents(".modal").length == 1;
    
    let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);
})

async function post(body){
    const res = await fetch('/api/posts', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const data = await res.json()
    console.log(data)
    return data
}

$("#submitPostButton, #submitReplyButton").click(async (event)=>{
    var button = $(event.target)
    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextArea") : $("#postTextarea")
    let audioFile = ""
    button.prop("disabled", true)
    const body = {
        content: textbox.val(),
    }
    if (isModal){
        var id = button.data().id
        if (id == null) return alert("error")
        body.replyTo = id
    }
    if (recordingsList && recordingsList.hasChildNodes()){
        var file = blob2
        var reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url
        reader.onload = async (readerEvent) => {    
            audioFile = readerEvent.target.result; // this is the content!
            body.audioFile = audioFile
            await putPostOnWall(await post(body), button)
        }
    }else{
        await putPostOnWall(await post(body), button)
    }

})
async function putPostOnWall(data, button){
    if (data.replyTo) return location.reload()
    const textbox = $("#postTextarea")
    const html = createPostHtml(data)
    $(".postsContainer").prepend(html);
    textbox.val('')
    button.prop("disabled",true);
    document.getElementById('recordingsList').innerHTML = ''
    Scontent = ''
}
$("#deletePostButton").click(()=>{
    const id = $(event.target).data("id");

    fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(async ()=>{
        location.reload()
    })
    .catch((err)=>{
        console.log(err)
    })
})
$("#deletePostModal").on("show.bs.modal", async (event)=>{
    const button = $(event.relatedTarget)
    const postId = getPostId(button)
    $("#deletePostButton").data("id", postId)
})

$(document).on("click", ".post", (ev)=>{
    const element = $(ev.target)
    const postId = getPostId(element)

    if (postId !== undefined && !element.is("button")){
        console.log('heok')
        window.location.href = '/posts/' + postId
    }
})

$(document).on("click", ".likeButton", async (e)=>{
    const button = $(e.target)
    const postId = getPostId(button)

    if (postId === undefined) return;

    fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(async (res)=>{
        const data = await res.json()

        button.find("span").text(data.likes.length || "")

        if (data.likes.includes(userLoggedIn._id)){
            button.addClass("active")
        }else{
            button.removeClass("active")
        }
    })
    .catch((err)=>{
        console.log(err)
    })
})

$(document).on("click", ".retweetButton", async (e)=>{
    const button = $(e.target)
    const postId = getPostId(button)

    if (postId === undefined) return;
    fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(async (res)=>{
        const data = await res.json()
        button.find("span").text(data.shareUsers.length || "")

        if (data.shareUsers.includes(userLoggedIn._id)){
            button.addClass("active")
        }else{
            button.removeClass("active")
        }
    })
    .catch((err)=>{
        console.log(err)
    })
})

$("#replyModal").on("show.bs.modal", async (event)=>{
    const button = $(event.relatedTarget)
    const postId = getPostId(button)
    $("#submitReplyButton").data("id", postId)
    let OGPostConteiner = document.getElementById('originalPostContainer')
    
    const res = await fetch('/api/posts/' + postId)
    const data = await res.json()
    outputPosts(data.postData, OGPostConteiner)
})
$("#replyModal").on("hidden.bs.modal", (event)=>{
    let OGPostConteiner = document.getElementById('originalPostContainer')
    OGPostConteiner.innerHTML = ''
})

$(document).on("click", ".followButton", async (e)=>{
    const button = $(e.target)
    const userId = button.data().user

    fetch(`/api/users/${userId}/follow`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(async (res)=>{
        const data = await res.json()
        if (res.status == 400) return alert("User not found")

        var difference = 1
        if (data.following && data.following.includes(userId)){
            button.addClass("following")
            button.text("following")
        }else{
            button.removeClass("following")
            button.text("follow")
            difference = -1
        }
        var followersLabel = $("#followersValue")
        if (followersLabel.length != 0){
            var followersText = parseInt(followersLabel.text())
            followersLabel.text(followersText+difference)
        }
    })
    .catch((err)=>{
        console.log(err)
    })
    
})
var cropper;
$("#filePhoto").change(function(){
    if (this.files && this.files[0]){
        var reader = new FileReader()
        reader.onload = (e)=>{
            var image = document.getElementById('imagePreview')
            image.src = e.target.result
            //Cropping dio
            if (cropper !== undefined) cropper.destroy()

            cropper = new Cropper(image, {
                aspectRatio: 1/1,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }else{
        console.log('no')
    }
})
$("#coverPhoto").change(function(){
    if (this.files && this.files[0]){
        var reader = new FileReader()
        reader.onload = (e)=>{
            var image = document.getElementById('coverPreview')
            image.src = e.target.result
            //Cropping dio
            if (cropper !== undefined) cropper.destroy()

            cropper = new Cropper(image, {
                aspectRatio: 16/9,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})
$("#imageUploadButton").click(()=>{
    var canvas = cropper.getCroppedCanvas()
    if (!canvas) return alert('Something\'s wrong I can feel it')
    const file = canvas.toDataURL()
    var formData = new FormData()
    formData.append('croppedImage', file)
    fetch('/api/users/profilePicture', {
        method: "POST",
        body: formData
    }).then((res)=> location.reload())
    return
})
$("#coverPhotoButton").click(()=>{
    var canvas = cropper.getCroppedCanvas()
    if (!canvas) return alert('Something\'s wrong I can feel it')
    const file = canvas.toDataURL()
    var formData = new FormData()
    formData.append('croppedImage', file)
    fetch('/api/users/coverPhoto', {
        method: "POST",
        body: formData
    }).then((res)=> location.reload())
    return
})

var timer
$("#userSearchTextbox").keydown((e)=>{
    clearTimeout(timer)
    var textbox = $(e.target)
    var value = textbox.val()
    if (value == "" && (event.which == 8 || e.keyCode == 8)){
        selectedUsers.pop()
        updateSelectedUsersHtml()
        $(".resultsContainer").html("")
        if (selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true)
        }
        return
    }
    timer = setTimeout(()=>{
        value = textbox.val().trim()
        if (value == ""){
            $(".resultsContainer").html("")
        }else{
            searchUsers(value)
        }
    }, 1000)
})

$("#createChatButton").click(()=>{
    var data = JSON.stringify({
        users: selectedUsers
    })
    fetch('/api/chats', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: data
    }).then((res)=>res.json()).then((data)=>{
        window.location.href = `/messages/${data._id}`
    })
})
function getPostId(el){
    var isRoot = el.hasClass("post")
    const rootEl = isRoot ? el : el.closest(".post")
    var postId = rootEl.data().id
    if (postId === undefined) return alert("Error")
    return postId
}

function createPostHtml(postData, largeFont = false) {
    if (!postData) return alert("Post object is null")

    const isShare = postData.shareData !== undefined && postData.shareData;
    const sharedBy = isShare ? postData.postedBy.username : null
    postData = isShare ? postData.shareData : postData;

    var postedBy = postData.postedBy;

    if (postedBy._id === undefined){
        return console.log('User obj not populated')
    }
    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(),new Date(postData.createdAt));

    var audioPart = ''
    if (postData.audioFile){
        audioPart = `<span class='audioContainer'><audio controls="" src="${postData.audioFile}"></audio></span>`
    }

    const likeButtonActiveCLass = postData.likes.includes(userLoggedIn._id) ? "active": ""
    const shareButtonActiveCLass = postData.shareUsers.includes(userLoggedIn._id) ? "active": ""
    var largeFontClass = largeFont ? "largeFont" : ""

    var shareText = ''
    if (isShare){
        shareText = `<span>
                <i class='fas fa-retweet'></i>
                Shared by <a href='/profile/${sharedBy}'>@${sharedBy}</a>
            </span>`
    }
    var replyFlag = ""

    if (postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }
        else if(!postData.replyTo.postedBy._id) {
            return alert("Posted by is not populated");
        }
        const replyToUsername = postData.replyTo.postedBy.username
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }

    var buttons = ""
    if (postData.postedBy._id == userLoggedIn._id && !isShare){
        buttons = `<button data-id="${postData._id}" class="trashCanButton" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash"></i></button>`
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>${shareText}</div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                            ${audioPart}
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer blue'>
                                <button data-toggle='modal' data-target='#replyModal' class='replyButton'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${shareButtonActiveCLass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.shareUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveCLass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed/1000 < 30){
            return 'Just now'
        }
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
        let minutes = Math.round(elapsed/msPerMinute)
        return minutes > 1 ? minutes + ' minutes ago': minutes + ' minute ago';  
    }

    else if (elapsed < msPerDay ) {
        let hours = Math.round(elapsed/msPerHour)
        return hours > 1 ? hours + ' hours ago': hours + ' hour ago';   
    }

    else if (elapsed < msPerMonth) {
        let days = Math.round(elapsed/msPerDay)
        return days > 1 ? days + ' days ago': days + ' day ago';   
    }

    else if (elapsed < msPerYear) {
        let months = Math.round(elapsed/msPerMonth)
        return months > 1 ? months + ' months ago': months + ' month ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    if (!Array.isArray(results)){
        results = [results]
    }

    //container.html("")
    container.innerHTML = ''
    results.forEach(result => {
        var html = createPostHtml(result)
        container.innerHTML += html
    });
    if (results.length == 0){
        container.append("<span class='noResults'>No results found</span>")
    }
}

function outputPostsWithReplies(results, container){
    container.innerHTML = ''
    if (results.replyTo && results.replyTo._id !== undefined){
        const html = createPostHtml(results.replyTo)
        container.innerHTML += html
    }

    var mainPostHTML = createPostHtml(results.postData, true)
    container.innerHTML += mainPostHTML

    results.replies.forEach(result => {
        const html = createPostHtml(result)
        container.innerHTML += html
    });
    if (results.length == 0){
        container.append("<span class='noResults'>No results found</span>")
    }
}

function outputUsers(data,container){
    container.innerHTML = ''

    data.forEach(data =>{
        var html = createUserHtml(data, true)
        container.innerHTML += html
    })
    if(data.length == 0) {
        container.innerHTML += `<span class='noResults'>No results found</span>`
    }
}
function createUserHtml(userData, showFollowButton) {

    var name = userData.firstName + " " + userData.lastName;
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
    var text = isFollowing ? "Following" : "Follow"
    var buttonClass = isFollowing ? "followButton following" : "followButton"
    var followButton = ''
    if (showFollowButton && userLoggedIn._id != userData._id){
        followButton = `<div class="followButtonContainer">
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}
function noResultsFoundHandler(term, container){
        container.innerHTML = `<span class='noResults'>
                No results found for term "${term}"
            </span>`
}
function outputSelectableUsers(data,container){
    container.html("")

    data.forEach(res =>{
        if (res._id == userLoggedIn._id || selectedUsers.some(u=>u._id == res._id)){
            return
        }
        var html = createUserHtml(res, false)
        var element = $(html)
        element.click(()=>userSelected(res))
        container.append(element)
    })
    if(data.length == 0) {
        container.innerHTML += `<span class='noResults'>No results found</span>`
    }
}
function searchUsers(searchTerm){
    const body = {
        search: searchTerm
    }
    fetch("/api/users?"  + new URLSearchParams(body)).then((res)=>res.json()).then((data)=>{
        outputSelectableUsers(data, $('.resultsContainer'))
    })
}
function userSelected(res){
    selectedUsers.push(res)
    updateSelectedUsersHtml()
    $("#userSearchTextbox").val("").focus()
    $(".resultsContainer").html("")
    $("#createChatButton").prop("disabled", false)
}
function updateSelectedUsersHtml(){
    var elements = []

    selectedUsers.forEach(user=>{
        var name = user.firstName + " " + user.lastName
        var userElement = $(`<span class='selectedUser'>${name}</span>`)
        elements.push(userElement)
    })

    $(".selectedUser").remove()
    $("#selectedUsers").prepend(elements)
}
function getChatName(chatData){
    var chatName = chatData.chatName
    if (!chatName) {
        var otherChatUsers = getOtherChatUsers(chatData.users)
        var namesArray = otherChatUsers.map(user => user.firstName + ' ' + user.lastName)
        chatName = namesArray.join(', ')
    }
    return chatName
}

function getOtherChatUsers(users){
    if (users.length == 1) return users
    return users.filter(user=>user._id != userLoggedIn._id)
}
function messageRecieved(newMessage){
    if ($(".chatContainer").length == 0){
        //Show popup
    }else{
        addChatMessageHtml(newMessage)
    }
}