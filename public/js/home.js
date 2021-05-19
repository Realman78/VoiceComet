$(document).ready(async ()=>{
    const res = await fetch('/api/posts')
    const data = await res.json()
    const postsContainer = document.querySelector('.postsContainer')
    outputPosts(data, postsContainer)
    
})