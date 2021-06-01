$(document).ready(async ()=>{
    const res = await fetch('/api/posts/' + postId)
    const data = await res.json()
    console.log(data)
    const postsContainer = document.querySelector('.postsContainer')
    //console.log(data)
    outputPostsWithReplies(data, postsContainer)
})
