let audioContext, audioElement, audioSource, analyser, dataArray, bufferLength;
let playButtonCreated = false; // Track if play button has already been created
let isPlaying = false; // Track if the audio is playing

// Setup Audio Processing
function setupAudioProcessing(file) {
    if (audioContext) {
        audioContext.close();
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio();
    audioElement.src = URL.createObjectURL(file);

    // Hide the default controls to prevent two play buttons
    audioElement.controls = false; 
    document.body.appendChild(audioElement);

    // Create audio source node from the audio element
    audioSource = audioContext.createMediaElementSource(audioElement);

    // Analyzer node for waveform visualization
    analyser = audioContext.createAnalyser();
    
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Update the file name on the UI when a file is selected
    document.getElementById('fileName').textContent = `Music File: ${file.name}`;

    // Create play button only once
    if (!playButtonCreated) {
        createPlayButton();
        playButtonCreated = true;
    }

    // Create and set up the playback slider
    setupPlaybackSlider();

    drawWaveform();
}

// Create the Play Button
function createPlayButton() {
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Audio';
    playButton.id = 'playButton';
    playButton.classList.add('playButton');
    playButton.addEventListener('click', () => {
        if (audioElement) {
            if (audioElement.paused) {
                audioElement.play();
                playButton.textContent = 'Pause Audio';
                isPlaying = true; // Set the state to playing
            } else {
                audioElement.pause();
                playButton.textContent = 'Play Audio';
                isPlaying = false; // Set the state to paused
            }
        }
    });

    // Append the play button to the audio controls section
    document.getElementById('audioControls').appendChild(playButton);
}

// Set up the playback slider and update progress
function setupPlaybackSlider() {
    const playbackSlider = document.getElementById('playbackSlider');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationTimeDisplay = document.getElementById('durationTime');

    // When metadata is loaded (duration known)
    audioElement.addEventListener('loadedmetadata', () => {
        // Set the max value of the slider to the audio duration
        playbackSlider.max = audioElement.duration;
        // Display the total duration of the audio
        durationTimeDisplay.textContent = formatTime(audioElement.duration);
    });

    // When the time updates (audio is playing)
    audioElement.addEventListener('timeupdate', () => {
        // Update the current time display and slider position
        playbackSlider.value = audioElement.currentTime;
        currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    });

    // When the user changes the slider position
    playbackSlider.addEventListener('input', () => {
        audioElement.currentTime = playbackSlider.value;
    });
}

// Format time into MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Draw the waveform
function drawWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = 400;

    // Handle resizing of the canvas
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
    });

    function renderFrame() {
        // Only clear and redraw the waveform if playing
        if (isPlaying) {
            analyser.getByteTimeDomainData(dataArray);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff0000';
            ctx.beginPath();
            let sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0;
                let y = v * canvas.height / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
        // Continue the loop to draw the waveform, whether paused or playing
        requestAnimationFrame(renderFrame);
    }

    renderFrame(); // Start the drawing process
}

// Event listener for file input to trigger setup when a file is chosen
document.getElementById('fileInput').addEventListener('change', (event) => {
    setupAudioProcessing(event.target.files[0]);
});
