import fs from 'fs';
import path from 'path';
import light from './light.js';
import sound from './sound.js';
import settings from './settings.js';

let timers = [];
let alarmTime = loadAlarmTime();

if (alarmTime > 0) {
    scheduleAlarm(alarmTime);
}

function scheduleAlarm(time) {
    alarmTime = time;
    saveAlarmTime(time);
    const currentTime = Date.now();


    /* Start white noise if there's enough time for it to matter */
    if (currentTime < (time - settings.slowAudioFadeTime)) {
        sound.startWhiteNoise(settings.fastAudioFadeTime);
    }

    /* Schedule music to fade in after alarm time */
    if (currentTime < time) {
        const musicDelay = time - currentTime;

        const musicTimer = setTimeout(() => {
            sound.startMusic(settings.slowAudioFadeTime, settings.slowAudioFadeTime);
        }, musicDelay);

        timers.push(musicTimer);
    } else {
        console.log("We're already past the alarm time, play music!");
        sound.startMusic(settings.fastAudioFadeTime, settings.fastAudioFadeTime);
    }

    /* Schedule light to fade in 30 minutes before alarm */
    const timeUntilAlarm = alarmTime - currentTime;
    if (timeUntilAlarm > settings.slowLightFadeTime) {

        light.turnLightOff(settings.fastLightFadeTime);

        const lightOnTime = timeUntilAlarm - settings.slowLightFadeTime;
        const lightTimer = setTimeout(() => {
            light.turnLightOn(settings.slowLightFadeTime);
        }, lightOnTime);
        timers.push(lightTimer);

    } else if (timeUntilAlarm > 0) {
        light.turnLightOff(settings.fastLightFadeTime);
        light.turnLightOn(timeUntilAlarm);
    } else {
        light.turnLightOn(settings.fastLightFadeTime);
    }
}

function turnOffAlarm() {

    const alarmTimePassed = Date.now() > alarmTime;
    alarmTime = 0;
    saveAlarmTime(0);


    timers.forEach(timerId => clearTimeout(timerId));
    timers = [];

    sound.stopAudio(settings.fastAudioFadeTime);

    if (alarmTimePassed === false) {
        light.turnLightOff(settings.fastLightFadeTime);
    } else {
        setTimeout(() => {
            light.turnLightOff(settings.fastLightFadeTime);
        }, settings.lightTimeOutTime);
    }
}

function getAlarmTime() {
    return alarmTime;
}

function loadAlarmTime() {
    try {
        const savedAlarmPath = path.join(import.meta.dirname, 'alarm.json');
        const savedAlarm = JSON.parse(fs.readFileSync(savedAlarmPath, 'utf-8'));
        return savedAlarm.time;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

function saveAlarmTime(alarmTime) {
    try {
        const savedAlarmPath = path.join(import.meta.dirname, 'alarm.json');
        fs.writeFileSync(savedAlarmPath, JSON.stringify({ time: alarmTime }, null, 2), 'utf8');
    } catch (error) {
        console.log(error);
    }
}

export default {
    scheduleAlarm,
    turnOffAlarm,
    getAlarmTime
}