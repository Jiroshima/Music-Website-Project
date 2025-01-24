const controls = {
    pitch: 1.0, // Initial pitch (playback rate)
    playbackRate: 1.0,
    volume: 1.0
};

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the DOM is fully loaded
    console.log('DOM Content Loaded');
    
    const gui = new dat.GUI({
        autoPlace: false,  // Disable automatic placement of the GUI panel
        closeOnTop: false, // Ensure the panel cannot be closed
    });

    // Append the GUI to the container div for the controls
    const controlsContainer = document.getElementById('audioControls');
    controlsContainer.appendChild(gui.domElement);

    // Add sliders for pitch, playbackRate, and volume
    const pitchControl = gui.add(controls, 'pitch', 0.5, 2.0).step(0.01).name('Pitch');
    
    pitchControl.onChange((value) => {
        console.log('Pitch changed to:', value);  // Should print when slider changes
        updateAudio();
    });

    gui.add(controls, 'playbackRate', 0.5, 2.0).step(0.01).name('Playback Rate').onChange(updateAudio);
    gui.add(controls, 'volume', 0.0, 1.0).step(0.01).name('Volume').onChange(updateAudio);
});

// Update the audio playback rate and volume without restarting the audio
function updateAudio() {
    if (audioElement) {
        // Log the values
        console.log('Updating Audio:', controls.pitch, controls.volume);

        // Adjust playback rate (pitch) and volume
        audioElement.playbackRate = controls.playbackRate;
        audioElement.volume = controls.volume;

        // Log the updated playback rate
        console.log('Updated playback rate:', audioElement.playbackRate);
    } else {
        console.log('Audio element not found!');
    }
}
