const fs = require('fs');
const path = require('path');
const light = require('./light');
const sound = require('./sound');
const settings = require('./settings');

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
        const musicDelay = time - Date.now();

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

async function turnOffAlarm() {

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
        const savedAlarmPath = path.join(__dirname, 'alarm.json');
        const savedAlarm = JSON.parse(fs.readFileSync(savedAlarmPath, 'utf-8'));

        return savedAlarm.time;
    } catch (error) {
        console.log(error);
    }
}

function saveAlarmTime(alarmTime) {

    try {
        const savedAlarmPath = path.join(__dirname, 'alarm.json');
        fs.writeFileSync(savedAlarmPath, JSON.stringify({ time: alarmTime }, null, 2), 'utf8');
    } catch (error) {
        console.log(error);
    }
}

const delay = (durationMs) => {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

module.exports = {
    scheduleAlarm,
    getAlarmTime,
    turnOffAlarm
};

if (require.main === module) {
    scheduleAlarm(1788134400000);
}