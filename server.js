const path = require('path');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const alarm = require('./alarm');
const light = require('./light');

const originalLog = console.log;
console.log = function (...args) {

    const stack = new Error().stack.split('\n');
    const callerLine = stack[2] || '';
    const match = callerLine.match(/\((.*):\d+:\d+\)/) || callerLine.match(/at\s+(.*):\d+:\d+/);
    const filePath = match ? match[1] : 'unknown';
    const fileName = path.basename(filePath);

    const timestamp = new Date().toLocaleTimeString();
    originalLog.apply(console, [`[${timestamp}]`, `[${fileName}]`, ...args]);
};


app.get('/', (req, res) => {
    const alarmTime = alarm.getAlarmTime();

    if (alarmTime > 0) {
        const date = new Date(alarmTime);
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const day = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

        res.render('showAlarm', { day, hour, minute });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'setAlarm.html'));
    }
});

app.post('/setAlarm', (req, res) => {

    if (alarm.getAlarmTime() == 0) {
        const alarmTime = Number(req.body.timestamp);
        alarm.scheduleAlarm(alarmTime);
    }
    res.redirect('/');
});

app.get('/setAlarm/:alarmTime', (req, res) => {

    if (alarm.getAlarmTime() == 0) {
        const alarmTime = Number(req.params.alarmTime);
        alarm.scheduleAlarm(alarmTime);
    }
    res.json({
        message: 'Success'
    });
});

app.post('/turnOffAlarm', (req, res) => {
    alarm.turnOffAlarm();
    res.redirect('/');
});

app.get('/turnOffAlarm', (req, res) => {
    alarm.turnOffAlarm();
    res.sendStatus(200);
});

app.get('/nightlightOn', (req, res) => {
    light.turnOnNightLight();
    res.sendStatus(200);
});

app.get('/nightlightOff', (req, res) => {
    light.turnOffNightLight();
    res.sendStatus(200);
});

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:3000`);
});