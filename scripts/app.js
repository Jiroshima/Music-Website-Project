document.addEventListener('DOMContentLoaded', () => {
    console.log("App initialized");

    const fileInput = document.getElementById('fileInput');
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            setupAudioProcessing(file);
        }
    });

    // Initialize the UI controls
    setupUIControls();
});

function setupUIControls() {
    const gui = new dat.GUI();
    gui.add(controls, 'pitch', 0.5, 2.0).step(0.01).onChange(updateAudio);
    gui.add(controls, 'playbackRate', 0.5, 2.0).step(0.01).onChange(updateAudio);
    gui.add(controls, 'volume', 0.0, 1.0).step(0.01).onChange(updateAudio);

    console.log("UI controls initialized");
}

function updateAudio() {
    if (audioElement) {
        audioElement.playbackRate = controls.playbackRate;
        audioElement.volume = controls.volume;
    }
}
