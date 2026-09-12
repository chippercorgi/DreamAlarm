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
    if (currentTime < (time - settings.whiteNoiseSlowFadeTime)) {
        sound.startWhiteNoise(settings.whiteNoiseFastFadeTime, settings.whiteNoiseVolume);
    }

    /* Schedule music to fade in after alarm time */
    if (currentTime < time) {
        const musicDelay = time - Date.now();

        const musicTimer = setTimeout(() => {
            sound.startMusic(settings.whiteNoiseSlowFadeTime, settings.musicSlowFadeTime, settings.musicVolume);
        }, musicDelay);

        timers.push(musicTimer);
    } else {
        console.log("We're already past the alarm time, play music!");
        sound.startMusic(settings.whiteNoiseFastFadeTime, settings.musicFastFadeTime, settings.musicVolume);
    }

    /* Schedule light to fade in 30 minutes before alarm */
    const timeUntilAlarm = alarmTime - currentTime;
    if (timeUntilAlarm > settings.lightSlowFadeTime) {

        light.turnLightOff(settings.lightFastFadeTime);

        const lightOnTime = timeUntilAlarm - settings.lightSlowFadeTime;
        const lightTimer = setTimeout(() => {
            light.turnLightOn(settings.lightSlowFadeTime);
        }, lightOnTime);
        timers.push(lightTimer);

    } else if (timeUntilAlarm > 0) {
        light.turnLightOff(settings.lightFastFadeTime);
        light.turnLightOn(timeUntilAlarm);
    } else {
        light.turnLightOn(settings.lightFastFadeTime);
    }
}

async function turnOffAlarm() {

    const alarmTimePassed = Date.now() > alarmTime;
    alarmTime = 0;
    saveAlarmTime(0);


    timers.forEach(timerId => clearTimeout(timerId));
    timers = [];

    if (sound.isMusicPlaying() == true || sound.isWhiteNoisePlaying() == true) {
        sound.stopAudio(settings.musicFastFadeTime);
    }

    if (alarmTimePassed === false) {
        light.turnLightOff(settings.lightFastFadeTime);
    } else {
        setTimeout(() => {
            light.turnLightOff(settings.lightFastFadeTime);
        }, settings.lightTimeOutTime);
    }
}

function getAlarmTime() {
    return alarmTime;
}

function loadAlarmTime() {
    try {
        const savedAlarmPath = path.join(__dirname, '/data/alarm.json');
        const savedAlarm = JSON.parse(fs.readFileSync(savedAlarmPath, 'utf-8'));

        return savedAlarm.time;
    } catch (error) {
        console.log(error);
    }
}

function saveAlarmTime(alarmTime) {

    try {
        const savedAlarmPath = path.join(__dirname, '/data/alarm.json');
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