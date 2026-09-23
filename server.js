import path from 'path';
import express from 'express';
import alarm from './alarm.js';
import light from './light.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const alarmTime = alarm.getAlarmTime();

    if (alarmTime > 0) {
        const date = new Date(alarmTime);
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const day = date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

        res.render('showAlarm', { day, hour, minute });
    } else {
        res.sendFile(path.join(import.meta.dirname, 'public', 'setAlarm.html'));
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