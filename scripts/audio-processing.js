let audioContext, audioElement, audioSource, analyser, dataArray, bufferLength;
let amplitudeDisplay, frequencyDisplay, keyDisplay, bpmDisplay;
let playButtonCreated = false; // Track if play button has already been created
let isPlaying = false; // Track if the audio is playing

// Setup Audio Processing
function setupAudioProcessing(file) {
    // Initialize audio context and setup file input
    if (audioContext) {
        audioContext.close();
    }
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio();
    audioElement.src = URL.createObjectURL(file);

    // Create audio source node from the audio element
    audioSource = audioContext.createMediaElementSource(audioElement);

    // Analyzer node for waveform visualization
    analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Set file name on the UI
    document.getElementById('fileName').textContent = `Music File: ${file.name}`;

    // Create play button if it hasn't been created
    if (!playButtonCreated) {
        createPlayButton();
        playButtonCreated = true;
    }

    // Set up playback slider
    setupPlaybackSlider();

    // Ensure setupUIControls is called here before drawing waveform
    setupUIControls(); // This should be the first thing called here

    // Start drawing the waveform
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

// Helper function to create a display element
function createDisplayElement(initialText) {
    const displayElement = document.createElement('div');
    displayElement.textContent = initialText;
    displayElement.style.fontSize = '16px';
    displayElement.style.marginBottom = '5px';
    return displayElement;
}

// Ensure UI display elements are created only once
function createDisplayElementIfNotExists() {
    if (!amplitudeDisplay) {
        amplitudeDisplay = createDisplayElement('Amplitude: 0.00');
    }
    if (!frequencyDisplay) {
        frequencyDisplay = createDisplayElement('Frequency: 0 Hz');
    }
    if (!keyDisplay) {
        keyDisplay = createDisplayElement('Key: N/A');
    }
    if (!bpmDisplay) {
        bpmDisplay = createDisplayElement('BPM: N/A');
    }

    // Append elements to the DOM if they haven't been appended yet
    const controlsContainer = document.getElementById('audioControls');
    if (controlsContainer && !controlsContainer.contains(amplitudeDisplay)) {
        controlsContainer.append(amplitudeDisplay, frequencyDisplay, keyDisplay, bpmDisplay);
    }
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

// Setup the UI for Amplitude, Frequency, Key, BPM
function setupUIControls() {
    createDisplayElementIfNotExists();
    // No need to call updateAudio here, it's handled in ui-controls.js
}

// Update the displays with the latest data
function updateDisplays() {
    // Ensure the display elements are initialized before updating
    createDisplayElementIfNotExists();

    if (audioElement && analyser) {
        // Amplitude: Calculate average of the time-domain data
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const amplitude = sum / dataArray.length;
        amplitudeDisplay.textContent = `Amplitude: ${amplitude.toFixed(2)}`;

        // Frequency: Get frequency bins data to find the dominant frequency
        analyser.getByteFrequencyData(dataArray);
        let maxFreq = 0;
        let maxIndex = 0;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxFreq) {
                maxFreq = dataArray[i];
                maxIndex = i;
            }
        }
        const nyquist = audioContext.sampleRate / 2;
        const frequency = maxIndex * nyquist / dataArray.length;
        frequencyDisplay.textContent = `Frequency: ${frequency.toFixed(2)} Hz`;

        // BPM Detection (You can use Tone.js or Beatdetektor for actual BPM analysis)
        detectBPM();

        // Key Detection (This would require a pitch detection library, simplified for now)
        detectKey();
    }
}

// BPM detection (using Tone.js as an example)
function detectBPM() {
    // Example using Tone.js BPM (you could use Beatdetektor or another method)
    const bpm = Tone.Transport.bpm.value; // This will need Tone.js to be active
    bpmDisplay.textContent = `BPM: ${bpm.toFixed(2)}`;
}

// Key Detection (for now, we can use a simplified placeholder)
function detectKey() {
    const key = 'C Major'; // Example placeholder value (replace with real pitch detection)
    keyDisplay.textContent = `Key: ${key}`;
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

            // Update displays for amplitude, frequency, key, BPM
            updateDisplays();
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
