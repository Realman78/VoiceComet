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
    return data
}

$("#submitPostButton").click(async (event)=>{
    const textbox = $("#postTextarea")
    var button = $(event.target)
    let audioFile = ""
    if (recordingsList.hasChildNodes()){
        //audioFile = recordingsList.firstChild.src.substr(5)
        var file = blob2
        var reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url
        reader.onload = async (readerEvent) => {    
            audioFile = readerEvent.target.result; // this is the content!
            const body = {
                content: textbox.val(),
                audioFile
            }
            await putPostOnWall(await post(body), button)
        }
    }else{
        const body = {
            content: textbox.val(),
        }
        await putPostOnWall(await post(body), button)
    }

})
async function putPostOnWall(data, button){
    const textbox = $("#postTextarea")
    const html = await createPostHtml(data)
    $(".postsContainer").prepend(html);
    textbox.val('')
    button.prop("disabled",true);
    document.getElementById('recordingsList').innerHTML = ''
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
var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
// $(document).on("click", ".postBody", async (e)=>{
//     const postId = getPostId($(e.target))
//     const res = await fetch('/api/posts/' + postId)
//     const data = await res.blob()

//     var reader = new FileReader();
//     reader.onload = function() {
//         console.log(reader.result);
//         var binary= convertDataURIToBinary(reader.result);
//         var blob=new Blob([binary], {type : 'audio/ogg'});
//         var blobUrl = URL.createObjectURL(blob);
//         return `<span><audio controls="" src="${blobUrl}"></audio></span>`
//     }
//     reader.readAsText(data);
    
//})

async function getAudioElement(postId){
    const res = await fetch('/api/posts/' + postId)
    const data = await res.blob()

    let r = `<span><audio controls="" src="" id="audio-${postId}"></audio></span>`
    var reader = new FileReader();
    reader.readAsText(data);
    reader.onload = async function() {
        var binary= convertDataURIToBinary(reader.result);
        var blob=new Blob([binary], {type : 'audio/wav'});
        var blobUrl = URL.createObjectURL(blob);
        document.getElementById('audio-'+postId).src = blobUrl
        //r = `<span><audio controls="" src="${blobUrl}"></audio></span>`
    }
    
    return r
}

async function createPostHtml(postData, largeFont = false) {
    if (!postData) return alert("Post object is null")

    var postedBy = postData.postedBy;

    if (postedBy._id === undefined){
        return console.log('User obj not populated')
    }
    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(),new Date(postData.createdAt));

    var audioPart = ''
    if (postData.audioFile){
        audioPart = await getAudioElement(postData._id)
    }

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
                            <span>${postData.content}</span>
                            ${audioPart}
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

async function outputPosts(results, container){
    //container.html("")
    container.innerHTML = ''
    //for(let i = 0; i < results.length;  i++) {
    for(let i in results) {
        let result = results[i];
        var html = await createPostHtml(result)
        
        container.innerHTML += html
    }
    /*results.forEach(async result => {
        console.log(timeDifference(new Date(),new Date(result.createdAt)));
        var html = await createPostHtml(result)
        
        container.innerHTML += html
    });*/
    if (results.length == 0){
        container.append("<span class='noResults'>No results found</span>")
    }
}