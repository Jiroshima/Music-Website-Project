// Wait until the DOM is fully loaded
window.addEventListener('DOMContentLoaded', (event) => {
    setupUIControls();
});

function setupUIControls() {
    // Get the playback slider and check if it exists
    const playbackSlider = document.getElementById('playbackSlider');
    
    if (!playbackSlider) {
        console.error('Playback slider not found!');
        return;
    }

    // Set default values for playback slider
    playbackSlider.min = 0;
    playbackSlider.max = 100;
    playbackSlider.value = 0;
    playbackSlider.step = 0.1;

    // Add an event listener to update time on playback slider change
    playbackSlider.addEventListener('input', (e) => {
        const currentTimeDisplay = document.getElementById('currentTime');
        const durationTimeDisplay = document.getElementById('durationTime');
        
        // Assuming you have an audio object to get current time and duration
        const audioDuration = 120; // Replace with actual audio duration
        const currentTime = (e.target.value / 100) * audioDuration;
        
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        currentTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        const minutesDuration = Math.floor(audioDuration / 60);
        const secondsDuration = Math.floor(audioDuration % 60);
        durationTimeDisplay.textContent = `${minutesDuration}:${secondsDuration < 10 ? '0' : ''}${secondsDuration}`;
    });
}
