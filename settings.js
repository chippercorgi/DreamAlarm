import fs from 'fs';
import path from 'path';

const settingsFile = path.join(import.meta.dirname, 'settings.json');

if (fs.existsSync(settingsFile) === false) {
    const defaultData = JSON.stringify({ time: 0 }, null, 2);
    fs.writeFileSync(settingsFile, defaultData, 'utf-8');
}

const alarm = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));


const SECOND = 1000;
const MINUTE = 60 * SECOND;

function seconds(s) {
    return s * SECOND;
}

function minutes(m) {
    return m * MINUTE;
}

export default {
    fastAudioFadeTime: seconds(3),
    slowAudioFadeTime: seconds(90),
    musicVolume: 50,
    whiteNoiseVolume: 50,

    fastLightFadeTime: seconds(5),
    slowLightFadeTime: minutes(30),
    lightTimeOutTime: minutes(10),

    getAlarmTime() {
        return alarm.time;
    },

    setAlarmTime(alarmTime) {

        alarm.time = alarmTime;
        const data = JSON.stringify({ time: alarmTime }, null, 2);
        fs.writeFileSync(settingsFile, data, 'utf8');
    }
};
