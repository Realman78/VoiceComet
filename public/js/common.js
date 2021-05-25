$("#postTextarea, #replyTextArea").keyup(event =>{
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;
    
    submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

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
    if (recordingsList.hasChildNodes()){
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
}
//OVO JE ZA DELETE POST
// $(document).on("click", ".postBody", (ev)=>{
//     const postId = getPostId($(ev.target))
//     fetch('/api/posts/' + postId,{
//         method: "DELETE",
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//             }
//     }).then(res=>{
//         location.reload()
//     })
//     .catch(e=>{console.log(e)})
// })

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

function getPostId(el){
    var isRoot = el.hasClass("post")
    const rootEl = isRoot ? el : el.closest(".post")
    var postId = rootEl.data().id
    if (postId === undefined) return alert("Error")
    return postId
}

function createPostHtml(postData, largeFont = false) {
    if (!postData) return alert("Post object is null")

    const isShare = postData.shareData !== undefined;
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

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${shareText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                            ${audioPart}
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
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