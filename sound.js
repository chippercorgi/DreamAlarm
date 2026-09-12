const { spawn } = require("child_process");

const audio = require('./audio');

let audioProcess = null;
let musicPlaying = false;
let whiteNoisePlaying = false;

async function startWhiteNoise(fadeInTime, volume) {

    await audio.setVolume(0);

    if (audioProcess != null) {
        audioProcess.stdout.removeAllListeners();
        audioProcess.kill();
        audioProcess = null;
    }

    musicPlaying = false;
    whiteNoisePlaying = true;

    audioProcess = spawn('mpg123', ['-R']);

    audioProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('@F 1000')) {
            audioProcess.stdin.write('JUMP 10\n');
        }
    });

    audioProcess.stdin.write('load ./noise/waterfall.mp3\n');
    await fadeInVolume(fadeInTime, volume);

}

async function startMusic(fadeOutTime, fadeInTime, volume) {

    if (whiteNoisePlaying) {
        await fadeOutVolume(fadeOutTime);
    }

    if (audioProcess != null) {
        audioProcess.stdout.removeAllListeners();
        audioProcess.kill();
        audioProcess = null;
    }

    musicPlaying = true;
    whiteNoisePlaying = false;

    audioProcess = spawn('mpg123', ['-Z', '-@', './data/playlist.txt']);
    console.log("Fading music in!");
    await fadeInVolume(fadeInTime, volume);
    console.log("Music now playing at full volume!");
}

async function stopAudio(time) {

    await fadeOutVolume(time);

    if (audioProcess != null) {
        audioProcess.stdout.removeAllListeners();
        audioProcess.kill();
        audioProcess = null;
    }

    musicPlaying = false;
    whiteNoisePlaying = false;
}

async function fadeInVolume(time, targetVolume) {

    const delayTime = time > 30000 ? 5000 : 100;

    const frames = Math.floor(time / delayTime);
    console.log("Fade started!");
    for (let i = 0; i <= frames; i++) {
        const percent = (i / frames);
        const volume = percent * targetVolume;
        await audio.setVolume(volume);
        await delay(delayTime)
    }
    console.log("Fade Ended");
}

async function fadeOutVolume(time) {
    const startingVolume = await audio.getVolume();

    const delayTime = time > 30000 ? 5000 : 100;

    const frames = Math.floor(time / delayTime);
    for (let i = 0; i <= frames; i++) {
        const percent = 1 - (i / frames);
        const volume = percent * startingVolume;
        await audio.setVolume(volume);
        await delay(delayTime);
    }
}

function isWhiteNoisePlaying() {
    return whiteNoisePlaying;
}

function isMusicPlaying() {
    return musicPlaying;
}

const delay = (durationMs) => {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

module.exports = {
    startWhiteNoise,
    startMusic,
    stopAudio,
    isWhiteNoisePlaying,
    isMusicPlaying
};