const { execSync } = require('child_process');
const loudness = require('loudness');

async function getVolume() {
    try {
        if (process.platform === 'darwin') {
            return await loudness.getVolume();
        } else if (process.platform === 'linux') {
            return execSync("wpctl get-volume @DEFAULT_SINK@ | awk '{print $2 * 100}'", { encoding: 'utf8' });
        }
        throw new Error('Unsupported platform');
    } catch (error) {
        console.error('Error getting volume:', error.message);
        return 0;
    }
}

async function setVolume(volume) {

    try {
        if (process.platform === 'darwin') {
            await loudness.setVolume(volume);
        } else if (process.platform === 'linux') {
            const percentage = Math.min(Math.max(Math.round(volume), 0), 100);
            execSync(`wpctl set-volume @DEFAULT_SINK@ ${percentage}%`);
        } else {
            throw new Error('Unsupported platform');
        }
    } catch (error) {
        console.error('Error setting volume:', error.message);
    }
}

module.exports = { getVolume, setVolume };