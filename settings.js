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
    slowAudioFadeTime: seconds(60),
    musicVolume: 40,
    whiteNoiseVolume: 40,

    fastLightFadeTime: seconds(5),
    slowLightFadeTime: minutes(3),
    lightTimeOutTime: minutes(10)
};
