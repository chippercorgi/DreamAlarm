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
    slowAudioFadeTime: seconds(60),
    musicVolume: 40,
    whiteNoiseVolume: 40,

    fastLightFadeTime: seconds(5),
    slowLightFadeTime: minutes(15),
    lightTimeOutTime: minutes(10)
};