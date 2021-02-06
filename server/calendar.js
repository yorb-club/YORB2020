// https://developers.google.com/calendar/quickstart/nodejs

const fs = require('fs');
const { google } = require('googleapis');

const TOKEN_PATH = 'token.json';
const CALENDAR_ID = 'nyu.edu_jmn8eqiarfitb8fd1crpne27ik@group.calendar.google.com';

function listEvents() {
    return new Promise((resolve, reject) => {
        try {
            const credentialsJSON = fs.readFileSync('credentials.json');
            const credentials = JSON.parse(credentialsJSON);
            const { client_secret, client_id, redirect_uris } = credentials.web;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            // check for an existing token
            const tokenJSON = fs.readFileSync(TOKEN_PATH);
            const token = JSON.parse(tokenJSON);
            oAuth2Client.setCredentials(token);

            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
            calendar.events.list(
                {
                    calendarId: CALENDAR_ID,
                    timeMin: new Date().toISOString(),
                    maxResults: 100,
                    singleEvents: true,
                    orderBy: 'startTime',
                },
                (err, res) => {
                    if (err) return console.log('The API returned an error: ' + err);
                    const events = res.data.items;
                    resolve(events);
                    // io.sockets.emit('calendarEvents', events);

                    // if (events.length) {
                    //     console.log('Upcoming 10 events:');
                    //     events.map((event, i) => {
                    //         const start = event.start.dateTime || event.start.date;
                    //         console.log(`${start} - ${event.summary}`);
                    //         console.log(event);
                    //     });
                    // } else {
                    //     console.log('No upcoming events found.');
                    // }
                }
            );
        } catch (err) {
            console.error(err);
            reject();
        }
    });
}

module.exports = {
    listEvents,
};
