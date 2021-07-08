const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

var recognition = new SpeechRecognition();

var textbox = document.getElementById('postTextarea')

var startButton = document.getElementById('startButton')

var isListening = false
recognition.continuous = true

recognition.onstart = function(){
    isListening = true
    startButton.innerHTML = `<i class="fab fa-speakap" style="color: red;"></i>`
}

recognition.onspeechend = function(){
    if (isListening){
        recognition.stop()
        isListening = false
        startButton.innerHTML = `<i class="fab fa-speakap"></i>`
    }
}

recognition.onerror = function(){
    startButton.textContent = 'Try again'
}
recognition.onresult = function (event){
    var current = event.resultIndex
    //console.log('current - ' + current)

    var transcript = event.results[current][0].transcript
    //console.log('tr - ' + transcript)
    Scontent += transcript
    //const textbox = $("#postTextarea")
    $('#postTextarea').val(function(i, text) {
        return Scontent;
    });
}

startButton.addEventListener('click', (event)=>{
    if (isListening){
        recognition.stop()
        isListening = false
        startButton.innerHTML = `<i class="fab fa-speakap"></i>`
        return
    }
    if (Scontent.length){
        Scontent = ''
    }
    recognition.start()
})