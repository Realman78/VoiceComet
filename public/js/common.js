$("#postTextarea").keyup(event =>{
    const textbox = event.target
    const value = textbox.value.trim()

    const submitButton = $("#submitPostButton");

    if (value == ""){
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false)
})

$("#submitPostButton").click(async (event)=>{
    const textbox = $("#postTextarea")
    var button = $(event.target)
    const body = {
        content: textbox.val()
    }

    const res = await fetch('/api/posts', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const data = await res.json()
    const html = createPostHtml(data)
    $(".postsContainer").prepend(html);
    textbox.val('')
    button.prop("disabled",true);
})

const micIcon = document.getElementById('micIcon');
let isRecording = false
let timer = undefined
micIcon.addEventListener('click', (e)=>{
    if (isRecording){
        stopRecording()
        return
    }
    isRecording = true
    let i = 5
    micIcon.innerHTML = `<i class="fas mic" style="color: white;">${i}</i>`
    timer = setInterval(()=>{
        i--;
        if (i < 1){
            startRecording()
            clearInterval(timer)
            return
        }
        micIcon.innerHTML = `<i class="fas mic" style="color: white;">${i}</i>`
    }, 1000)
    
})
let interval = undefined
function startRecording(){
    let seconds = 0, minutes = 0;
    var recordingTime = "00:00"
    micIcon.innerHTML =`<i class="fas fa-microphone mic" style="color: red;"></i>
                    <i class="fas mic" style="color: red;">00:00</i>`
    interval = setInterval(()=>{

        seconds++;
        minutes = Math.round(seconds/60)
        if (minutes < 10){
            recordingTime = seconds%60 < 10 ? `0${minutes}:0${seconds%60}` : `0${minutes}:${seconds%60}`
        }else{
            recordingTime = seconds%60 < 10 ? `${minutes}:0${seconds%60}` :  `${minutes}:${seconds%60}`
        }
        micIcon.innerHTML =`<i class="fas fa-microphone mic" style="color: red;"></i>
                    <i class="fas mic" style="color: red;">${recordingTime}</i>`
    }, 1000)
}

function stopRecording(){
    isRecording = false
    micIcon.innerHTML =`<i class="fas fa-microphone mic" style="color: white;"></i>`
    clearInterval(interval)
    clearInterval(timer)
}

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
        console.log(data)
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

function getPostId(el){
    var isRoot = el.hasClass("post")
    const rootEl = isRoot ? el : el.closest(".post")
    var postId = rootEl.data().id
    if (postId === undefined) return alert("Error")
    return postId
}


function createPostHtml(postData, largeFont = false) {
    if (!postData) return alert("Post object is null")

    var postedBy = postData.postedBy;

    if (postedBy._id === undefined){
        return console.log('User obj not populated')
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(),new Date(postData.createdAt));

    const likeButtonActiveCLass = postData.likes.includes(userLoggedIn._id) ? "active": ""


    return `<div class='post' data-id='${postData._id}'>
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
                        <div class='postBody'>
                            <span'>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton'>
                                    <i class='fas fa-retweet'></i>
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
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
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