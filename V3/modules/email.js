const nodemailer = require('nodemailer');

async function sendMail(user) {
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
        subject: 'Verifiziere deine Email', // Betreff
        text: `Hi ${user.name}\n\nKlicke auf den Link unterhalb um deine Email zu verifizieren:\nhttps://${process.env.url}/verify?id=${user.verify}` // Textinhalt
    };

    // E-Mail senden
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Fehler beim Senden der E-Mail:', error);
        } else {
            console.log('E-Mail erfolgreich gesendet. Serverantwort:', info.response);
        }
    });
}

async function sendPass(user) {
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
        } else {
            console.log('E-Mail erfolgreich gesendet. Serverantwort:', info.response);
        }
    });
}

module.exports = {
    sendMail,sendPass
}
