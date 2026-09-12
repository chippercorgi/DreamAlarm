const dgram = require('dgram');
const BULB_IP = '10.0.1.10';
const PORT = 38899;

let lightIsOn = false;

async function turnLightOn(time) {

    lightIsOn = true;

    let delayTime = 1000;
    const frames = time / delayTime;

    for (let i = 0; i <= frames; i++) {

        if (lightIsOn == false) {
            console.log("Light warm up canceled, turning off.");
            return;
        }

        const progress = i / frames;
        const curveProgress = Math.pow(progress, 2);

        const dimming = Math.max(1, Math.round(curveProgress * 100));
        const temp = 2200 + Math.round(2000 * curveProgress);
        sendWizardCommand({ state: true, temp: temp, dimming: dimming });
        await delay(delayTime);
    }
}

async function turnLightOff(time) {

    lightIsOn = false;

    const state = await getWizardState();

    if (!state) {
        console.log("Light is offline or unplugged.");
        return;
    }

    if (state.state == false) {
        return;
    }

    const brightness = state.dimming;

    const delayTime = 100;
    const frames = time / delayTime;

    for (let i = frames; i >= 0; i--) {
        const progress = i / (frames);
        const dimming = Math.round(progress * brightness);
        sendWizardCommand({ state: true, dimming: dimming });
        await delay(delayTime);
    }

    sendWizardCommand({ state: false });
}

function turnOnNightLight() {
    sendWizardCommand({ state: true, r: 200, b: 0, g: 0, dimming: 2 });
}

function turnOffNightLight() {
    sendWizardCommand({ state: false, r: 200, b: 0, g: 0, dimming: 2 });
}

async function isLightOn() {
    const state = await getWizardState();
    return state.state;
}

function sendWizardCommand(paramsObj) {
    const client = dgram.createSocket('udp4');

    const message = JSON.stringify({
        method: 'setPilot',
        params: paramsObj
    });

    const timer = setTimeout(() => {
        client.close();
    }, 2000);

    client.on('message', (msg, rinfo) => {
        clearTimeout(timer);
        client.close();
    });

    client.send(message, 0, message.length, PORT, BULB_IP, (err) => {
        if (err) {
            clearTimeout(timer);
            console.error('Send error:', err);
            client.close();
        }
    });
}

function getWizardState() {
    return new Promise((resolve, reject) => {
        const client = dgram.createSocket('udp4');
        const message = JSON.stringify({
            method: 'getPilot',
            params: {}
        });

        const timer = setTimeout(() => {
            client.close();
            resolve(null);
        }, 2000);

        client.on('message', (msg, rinfo) => {
            clearTimeout(timer);
            client.close();
            try {
                const response = JSON.parse(msg.toString());
                resolve(response.result); // This contains the light's actual state parameters
            } catch (err) {
                resolve(null);
            }
        });

        client.send(message, 0, message.length, PORT, BULB_IP, (err) => {
            if (err) {
                clearTimeout(timer);
                client.close();
                resolve(null);
            }
        });
    });
}

const delay = (durationMs) => {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

module.exports = {
    turnLightOn,
    turnLightOff,
    turnOnNightLight,
    turnOffNightLight,
    isLightOn
};

