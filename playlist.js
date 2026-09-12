const fs = require('fs');
const path = require('path');

function generatePlaylist() {
    const musicDir = path.join(__dirname, 'music');
    const playlistPath = path.join(__dirname, '/data/playlist.txt');

    const files = fs.readdirSync(musicDir)
        .filter(file => file.toLowerCase().endsWith('.mp3'))
        .map(file => path.join(musicDir, file));

    fs.writeFileSync(playlistPath, files.join('\n'), 'utf-8');
}

module.exports = { generatePlaylist };