import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import settings from './settings.js';


let audioProcess = null;
let currentVolume = 0;
let token = 0;

let playlist = getFiles();

async function startWhiteNoise(fadeInTime) {

    const localToken = ++token;

    if (audioProcess != null) {
        audioProcess.kill();
        audioProcess = null;
    }

    audioProcess = spawn('mpg123', ['-R']);
    audioProcess.stdin.write('volume 0\n');
    audioProcess.stdin.write('load ./noise/waterfall.mp3\n');

    audioProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('@F 2000')) {
            audioProcess.stdin.write('jump 10\n');
        }
    });

    const delayTime = 100;
    const frames = Math.floor(fadeInTime / 100);
    for (let i = 0; i <= frames; i++) {
        if (localToken != token) {
            return;
        }
        currentVolume = i / frames * settings.whiteNoiseVolume;
        audioProcess.stdin.write(`volume ${currentVolume}\n`);
        await delay(delayTime);
    }
}

async function startMusic(fadeOutTime, fadeInTime) {

    const localToken = ++token;

    if (audioProcess != null) {
        const delayTime = 100;
        const frames = Math.floor(fadeOutTime / 100);
        let startingVolume = currentVolume;
        for (let i = frames; i >= 0; i--) {

            if (localToken != token) {
                return;
            }

            currentVolume = i / frames * startingVolume;
            audioProcess.stdin.write(`volume ${currentVolume}\n`);
            await delay(delayTime);
        }

        audioProcess.stdin.write('stop\n');
        audioProcess.stdout.removeAllListeners('data');
    } else {
        audioProcess = spawn('mpg123', ['-R']);
        audioProcess.stdin.write('volume 0\n');
    }

    shufflePlaylist();
    let index = 0;
    audioProcess.stdin.write(`load ${playlist[index++]}\n`);

    audioProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('@P 0')) {
            if (audioProcess) {
                audioProcess.stdin.write(`load ${playlist[index]}\n`);
            }

            index++;
            if (index === playlist.length) {
                index = 0;
            }
        }
    });

    const delayTime = 100;
    const frames = Math.floor(fadeInTime / 100);
    for (let i = 0; i <= frames; i++) {
        if (localToken != token) {
            return;
        }
        currentVolume = i / frames * settings.musicVolume;
        audioProcess.stdin.write(`volume ${currentVolume}\n`);
        await delay(delayTime);
    }
}

async function stopAudio(fadeOutTime) {

    const localToken = ++token;

    if (audioProcess == null) {
        return;
    }

    const delayTime = 100;
    const frames = Math.floor(fadeOutTime / 100);
    let startingVolume = currentVolume;
    for (let i = frames; i >= 0; i--) {

        if (localToken != token) {
            return;
        }

        currentVolume = i / frames * startingVolume;
        audioProcess.stdin.write(`volume ${currentVolume}\n`);
        await delay(delayTime);
    }

    audioProcess.stdin.write(`stop\n`);
    audioProcess.kill();
    audioProcess = null;
}

function getFiles() {
    const musicDir = path.join(import.meta.dirname, 'music');
    const files = fs.readdirSync(musicDir).filter(file => file.toLowerCase().endsWith('.mp3')).map(file => path.join(musicDir, file));
    return files;
}

function shufflePlaylist() {
    for (let i = playlist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
}

const delay = (durationMs) => {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

export default {
    startWhiteNoise,
    startMusic,
    stopAudio
}
