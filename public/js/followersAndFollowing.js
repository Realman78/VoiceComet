$(document).ready(()=>{
    if (selectedTab === "followers") {
        loadFollowers()
    }else{
       loadFollowing()     
    }
    createTab("Following", `/profile/${profileUser.username}/following`, selectedTab != "followers")
    createTab("Followers", `/profile/${profileUser.username}/followers`, selectedTab == "followers")
})
function createTab(name, href, isSelected){
    const className = isSelected ? "tab active" : "tab"
    const html = `<a class="${className}" href="${href}">${name}</a>`
    document.querySelector('.tabsContainer').innerHTML += html
}

async function loadFollowers(){
    const res = await fetch(`/api/users/${profileUserId}/followers`)
    const data = await res.json()
    const resultsContainer = document.querySelector('.resultsContainer')
    //console.log(data)
    outputUsers(data.followers, resultsContainer)
}
async function loadFollowing(){
    const res = await fetch(`/api/users/${profileUserId}/following`)
    const data = await res.json()
    const resultsContainer = document.querySelector('.resultsContainer')
    //console.log(data)
    outputUsers(data.following, resultsContainer)
}
function outputUsers(data,container){
    container.innerHTML = ''

    data.forEach(data =>{
        var html = createUserHtml(data, true)
        container.innerHTML += html
    })
    if(results.length == 0) {
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