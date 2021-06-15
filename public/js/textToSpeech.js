const convertButton = document.getElementById('convertButton')
convertButton.addEventListener('click', async (e)=>{
    e.preventDefault()

    var textbox =  $("#postTextarea")
    const body = {
        content: textbox.val(),
    }
    if (textbox.val().length < 1) return
    if (recordingsList.hasChildNodes()){
        if (confirm('Are you sure you want to delete the previous audio and insert a new one?')){
            recordingsList.innerHTML = ''
        }else{
            return;
        }
    }
    const res = await fetch('/api/posts/getbinary', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const blob = await res.blob()
    blob2 = blob
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
    recordingsList.appendChild(au);
    //
    return
    var file = blob
        var reader = new FileReader();
        reader.readAsDataURL(file); // this is reading as data url
        reader.onload = async (readerEvent) => {    
            let audioFile = readerEvent.target.result; // this is the content!
            body = {
                audioFile
            }
            fetch('/daje', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            }).then(res => console.log('ok'))

        }
})