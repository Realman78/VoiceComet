//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("micIcon");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
var isRec = false
var timer = undefined
function startRecording() {
    if (isRec){
        stopRecording()
        return
    }
    isRec = true
	
    let i = 5
    micIcon.innerHTML = `<i class="fas mic" style="color: white;">${i}</i>`
    timer = setInterval(()=>{
        i--;
        if (i < 1){
            startTiming()
            clearInterval(timer)
            return
        }
        recordButton.innerHTML = `<i class="fas mic" style="color: white;">${i}</i>`
    }, 1000)


}
let interval = undefined
function startTiming(){
    var constraints = { audio: true, video:false }

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		audioContext = new AudioContext();

		gumStream = stream;
		
		input = audioContext.createMediaStreamSource(stream);

		rec = new Recorder(input,{numChannels:1})

		rec.record()

		console.log("Recording started");

	}).catch(function(err) {
    	console.log(err)
	});

    let seconds = 0, minutes = 0;
    var recordingTime = "00:00"
    recordButton.innerHTML =`<i class="fas fa-microphone mic" style="color: red;"></i>
                    <i class="fas mic" style="color: red;">00:00</i>`
    interval = setInterval(()=>{

        seconds++;
        minutes = Math.round(seconds/60)
        if (minutes < 10){
            recordingTime = seconds%60 < 10 ? `0${minutes}:0${seconds%60}` : `0${minutes}:${seconds%60}`
        }else{
            recordingTime = seconds%60 < 10 ? `${minutes}:0${seconds%60}` :  `${minutes}:${seconds%60}`
        }
        recordButton.innerHTML =`<i class="fas fa-microphone mic" style="color: red;"></i>
                    <i class="fas mic" style="color: red;">${recordingTime}</i>`
    }, 1000)
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML="Resume";
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML="Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked")
    isRec = false
	rec.stop();
    recordButton.innerHTML =`<i class="fas fa-microphone mic" style="color: white;"></i>`
    clearInterval(interval)
    clearInterval(timer)
	gumStream.getAudioTracks()[0].stop();

	rec.exportWAV(createDownloadLink);
}

const recordingsList = document.getElementById('recordingsList')

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
	
	recordingsList.appendChild(au);
}