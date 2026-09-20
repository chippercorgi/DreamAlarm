import { WizLight } from 'wiz-light';
const wl = new WizLight('10.0.1.10', { statusCheckTimeout: 3000, retryTimes: 1 });

let lightOn = false;

export async function turnLightOn(fadeInTime) {

    const lightState = await getLightState();
    if (lightState === -1) {
        return; // light has no power/isnt' responding, so just give up
    }

    lightOn = true;

    const startingTime = Date.now();
    let errorCount = 0;

    while (true) {

        if (lightOn === false) {
            break; // leave the loop if we've canceled turning the light on
        }

        const timePassed = Date.now() - startingTime;


        if (timePassed < fadeInTime) {

            const progress = timePassed / fadeInTime;
            const curveProgress = Math.pow(progress, 2);

            const dimming = Math.max(1, Math.round(curveProgress * 100));
            const temp = 2200 + Math.round(2000 * curveProgress);
            console.log(temp);
            console.log(dimming);
            try {
                await wl.setLightProps({ state: true, temp: temp, dimming: dimming, c: 0, w: 0 });
                await delay(1000);
                errorCount = 0;
            } catch (e) {
                errorCount++;
                if (errorCount > 5) {
                    break;
                }
            }
        } else {
            await wl.setLightProps({ state: true, temp: 4200, dimming: 100, c: 0, w: 0 });
            break;
        }
    }
}

export async function turnLightOff() {
    try {
        await wl.setLightProps({ state: false });
        lightOn = false;
    } catch (e) {
        return;
    }
}

export async function turnNightLightOn() {
    await wl.setLightProps({ state: true, r: 200, b: 0, g: 0, c: 0, w: 0, dimming: 2 });
}

export async function turnNightLightOff() {
    await wl.setLightProps({ state: false });
}

export async function isLightOn() {
    return await getLightState > 0;
}

async function getLightState() {
    try {
        const status = await wl.getStatus();

        if (status.result.state === true) {
            return 1;
        }

        return 0;
    } catch (e) {
        return -1;
    }
}

const delay = (durationMs) => {
    return new Promise(resolve => setTimeout(resolve, durationMs));
}

await turnLightOn(0);
process.exit(0);