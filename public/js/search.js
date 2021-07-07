$("#searchBox").keydown((e)=>{
    clearTimeout(timer)
    var textbox = $(e.target)
    var value = textbox.val()
    var searchType = textbox.data().search

    timer = setTimeout(()=>{
        value = textbox.val().trim()
        if (value == ""){
            $(".resultsContainer").html("")
        }else{
            search(value, searchType)
        }
    }, 1000)
})
$(document).ready(async ()=>{
    createTab("Posts", `/search`, selectedTab != "users")
    createTab("Users", `/search/users`, selectedTab == "users")
    let value = $("#searchBox").val().trim()
        if (value == ""){
            $(".resultsContainer").html("")
        }else{
            search(value, $("#searchBox").data().search)
        }
})

function createTab(name, href, isSelected){
    const className = isSelected ? "tab active" : "tab"
    const html = `<a class="${className}" href="${href}">${name}</a>`
    document.querySelector('.tabsContainer').innerHTML += html
}

function search(searchTerm, searchType){
    var url = searchType == "users" ? "/api/users" : "/api/posts"
    const body = {
        search: searchTerm
    }
    fetch(url + "?"  + new URLSearchParams(body)).then((res)=>res.json()).then((data)=>{
        if (data.length == 0){
            noResultsFoundHandler(searchTerm, document.querySelector('.resultsContainer'))
            return
        }
        if (searchType == "users"){
            outputUsers(data, document.querySelector('.resultsContainer'))
        }else{
            outputPosts(data, document.querySelector('.resultsContainer'))
        }
    })
}