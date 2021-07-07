$(document).ready(async ()=>{
    const body = {
        followingOnly: true
    }
    const res = await fetch('/api/posts?'+ new URLSearchParams(body))
    const data = await res.json()
    const postsContainer = document.querySelector('.postsContainer')
    outputPosts(data, postsContainer)
})

const tx = document.getElementById("postTextarea");
tx.setAttribute("style", "height:" + (tx.scrollHeight) + "px;overflow-y:hidden;");
tx.addEventListener("input", OnInput, false);