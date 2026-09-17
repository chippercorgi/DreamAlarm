const SECOND = 1000;
const MINUTE = 60 * SECOND;

function seconds(s) {
    return s * SECOND;
}

function minutes(m) {
    return m * MINUTE;
}

module.exports = {
    fastAudioFadeTime: seconds(5),
    slowAudioFadeTime: seconds(30),
    musicVolume: 40,
    whiteNoiseVolume: 40,

    lightSlowFadeTime: minutes(3),
    lightFastFadeTime: seconds(5),
    lightTimeOutTime: minutes(3)
};