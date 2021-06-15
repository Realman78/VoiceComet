const pbc = document.querySelector('.profileButtonsContainer')
const coverPhotoContainer = document.querySelector('.coverPhotoContainer')
$(document).ready(async ()=>{
    if (selectedTab === "replies") {
        loadReplies()
    }else{
       loadPosts()     
    }
    if (profileUser._id != userLoggedIn._id){
        createFollowButton(profileUser, userLoggedIn.following && userLoggedIn.following.includes(profileUserId))
    }
    photosHandler()
    createTab("Posts", `/profile/${profileUser.username}`, selectedTab != "replies")
    createTab("Replies", `/profile/${profileUser.username}/replies`, selectedTab == "replies")
})
function createFollowButton(user, isFollowing){
    const text = isFollowing ? "Following" : "Follow"
    const buttonClass = isFollowing ? "followButton following" : "followButton"
    pbc.innerHTML += `<a class="profileButton" href="/messages/${profileUser._id}">
                    <i class="fas fa-envelope"></i>
                    </a>
                    <button class="${buttonClass}" data-user=${user._id}>${text}</button>`
}
function photosHandler(){
    if (profileUser.coverPhoto){
        const img = document.createElement('img')
        img.src=profileUser.coverPhoto
        img.alt = 'User\'s cover photo'
        coverPhotoContainer.appendChild(img)
    }
    if (profileUser._id==userLoggedIn._id){
        coverPhotoContainer.innerHTML += `<button class="coverPhotoButton" data-toggle="modal" data-target="#coverPhotoUploadModal">
        <i class="fas fa-camera" aria-hidden="true"></i>
        </button>`
        document.querySelector('.userImageContainer').innerHTML += `<button class="profilePictureButton" data-toggle="modal" data-target="#imageUploadModal">
        <i class="fas fa-camera" aria-hidden="true"></i>
        </button>`
    }
}
function createTab(name, href, isSelected){
    const className = isSelected ? "tab active" : "tab"
    const html = `<a class="${className}" href="${href}">${name}</a>`
    document.querySelector('.tabsContainer').innerHTML += html
}

async function loadPosts(){
    const body = {
        postedBy: profileUserId,
        isReply: false
    }
    
    const res = await fetch('/api/posts?'+ new URLSearchParams(body))
    const data = await res.json()
    const postsContainer = document.querySelector('.postsContainer')
    //console.log(data)
    outputPosts(data, postsContainer)
}
async function loadReplies(){
    const body = {
        postedBy: profileUserId,
        isReply: true
    }
    
    const res = await fetch('/api/posts?'+ new URLSearchParams(body))
    const data = await res.json()
    const postsContainer = document.querySelector('.postsContainer')
    //console.log(data)
    outputPosts(data, postsContainer)
}