const SECOND = 1000;
const MINUTE = 60 * SECOND;

function seconds(s) {
    return s * SECOND;
}

function minutes(m) {
    return m * MINUTE;
}

module.exports = {
    whiteNoiseFastFadeTime: seconds(5),
    whiteNoiseSlowFadeTime: seconds(90),
    whiteNoiseVolume: 100,

    musicFastFadeTime: seconds(5),
    musicSlowFadeTime: seconds(90),
    musicVolume: 100,

    lightSlowFadeTime: minutes(30),
    lightFastFadeTime: seconds(5),
    lightTimeOutTime: minutes(15)
};