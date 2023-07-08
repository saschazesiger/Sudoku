const nodemailer = require('nodemailer');

async function sendMail(user) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ch', 
            port: 587,
            secure: false, 
            auth: {
                user: 'no-scam-login@mail.ch', 
                pass: process.env.smtp_password 
            }
        });
        const mailOptions = {
            from: 'no-scam-login@mail.ch', 
            to: user.email, 
            subject: 'Verifiziere deine Email',
            text: `Hi ${user.name}\n\nKlicke auf den Link unterhalb um deine Email zu verifizieren:\nhttps://${process.env.url}/verify?id=${user.verify}` // Textinhalt
        };

        // E-Mail senden
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Fehler beim Senden der E-Mail:', error);
                reject(error); // Fehler an den Aufrufer weitergeben
            } else {
                console.log('E-Mail erfolgreich gesendet. Serverantwort:', info.response);
                resolve(info.response); // Erfolgreiche Antwort an den Aufrufer weitergeben
            }
        });
    });
}

async function sendPass(user) {
    return new Promise((resolve, reject) => {
        // SMTP-Konfiguration
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ch', // Hier den SMTP-Server deines E-Mail-Anbieters eintragen
            port: 587,
            secure: false, // Setze auf "true", wenn du eine SSL-Verbindung verwenden möchtest
            auth: {
                user: 'no-scam-login@mail.ch', // Hier deine E-Mail-Adresse eintragen
                pass: process.env.smtp_password // Hier dein E-Mail-Passwort eintragen
            }
        });

        // E-Mail-Optionen
        const mailOptions = {
            from: 'no-scam-login@mail.ch', // Absender
            to: user.email, // Empfänger
            subject: 'Passwort zurücksetzen', // Betreff
            text: `Hi ${user.name}\n\nKlicke auf den Link unterhalb um dein Passwort zurückzusetzen:\nhttps://${process.env.url}/password?id=${user.verify}` // Textinhalt
        };

        // E-Mail senden
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Fehler beim Senden der E-Mail:', error);
                reject(error); // Fehler an den Aufrufer weitergeben
            } else {
                console.log('E-Mail erfolgreich gesendet. Serverantwort:', info.response);
                resolve(info.response); // Erfolgreiche Antwort an den Aufrufer weitergeben
            }
        });
    });
}


module.exports = {
    sendMail,sendPass
}
