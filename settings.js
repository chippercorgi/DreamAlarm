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
    lightTimeOutTime: minutes(10)
};
