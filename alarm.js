import light from './light.js';
import sound from './sound.js';
import settings from './settings.js';

let timers = [];
let alarmTime = settings.getAlarmTime();

if (alarmTime > 0) {
    scheduleAlarm(alarmTime);
}

function scheduleAlarm(time) {
    alarmTime = time;
    settings.setAlarmTime(time);
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

export default {
    scheduleAlarm,
    turnOffAlarm
}