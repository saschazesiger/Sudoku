const { generator, Sudoku } = require('@forfuns/sudoku');
const hbs = require('hbs')
const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { sendMail, sendPass } = require('./modules/email.js')

const log = msg => console.log(new Date(), msg);

const app = express();
app.use(cookieParser());
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'static')))


app.get('/', async (req, res) => {
    let logged = false
    let verified = false
    let sqluser
    let sudokus
    if (req.cookies.auth) {
        let authHeader = req.cookies.auth;
        try {
            user = await jwt.verify(authHeader, process.env.express_secret)
            log("userid:" + JSON.stringify(user))
            sqluser = await sql(`SELECT * FROM user WHERE email = "${user.id}"`)
            sudokus = await sql(`SELECT * FROM sudoku WHERE id_user = "${sqluser.results[0].id}"`)
            for (const sudoku in sudokus.results) {
                sudokus.results[sudoku].updated = formatDateRelativeToNow(sudokus.results[sudoku].updated)
                sudokus.results[sudoku].created = formatDateRelativeToNow(sudokus.results[sudoku].created)
                
            }
            if (!sqluser.results[0].verify) {
                verified = true
            }
            if (sqluser.results.length !== 0) {
                logged = true
            }
        } catch (e) {
            res.clearCookie('auth');
            log("Signing error")
            return res.render('login.hbs', { error: "Setzen des Cookies nicht möglich" })
        }
    }
    if (logged !== true) {
        return res.render('login.hbs')

    } else if (verified !== true) {
        return res.render('verify.hbs')
    } else {

        return res.render('index.hbs', { user: sqluser.results[0].name, sudokus: sudokus.results })
    }
});

app.get('/api', async (req, res) => {
    let logged = false
    let verified = false
    let sqluser
    if (req.cookies.auth) {
        let authHeader = req.cookies.auth;
        try {
            user = await jwt.verify(authHeader, process.env.express_secret)
            log("userid:" + JSON.stringify(user))
            sqluser = await sql(`SELECT * FROM user WHERE email = "${user.id}"`)
            if (!sqluser.results[0].verify) {
                verified = true
            }
            if (sqluser.results.length !== 0) {
                logged = true
            }
        } catch (e) {
            res.clearCookie('auth');
            log("Signing error")
        }
    }
    if (logged !== true) {
        return res.json({ success: 0 })

    } else if (verified !== true) {
        return res.json({ success: 0 })
    } else {
        if (req.query?.reason === "get") {
            sqluser = await sql(`SELECT * FROM sudoku WHERE id_user = "${sqluser.results[0].id}"`)
            return res.json({ success: 1, sudoku: sqluser.results })
        } else if (req.query?.reason === "save" && req.query?.progress && req.query?.solution) {
            const existing = await sql(`SELECT * FROM sudoku WHERE solution = "${req.query?.solution}"`)
            if (existing.results.length !== 0) {
                await sql(`UPDATE sudoku SET progress = "${req.query?.progress}", updated = NOW() WHERE solution = "${req.query?.solution}"`)
            } else {
                await sql(`INSERT INTO sudoku (id_user, progress, solution) VALUES ("${sqluser.results[0].id}","${req.query?.progress}","${req.query?.solution}")`)
            }
            return res.json({ success: 1 })
        } else {
            return res.json({ success: 0 })
        }
    }
});


app.get('/login', async (req, res) => {
    res.render('login.hbs')
})

app.post('/login', async (req, res) => {
    if (!req.body?.username && !req.body?.password) {
        return res.render('login.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if (!/^[0-9a-zA-Z-.@]+$/.test(req.body?.username)) {
        return res.render('login.hbs', { error: "Email beinhaltet ungültige Zeichen" })
    }
    const user = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if (user.results.length === 0) {
        return res.render('login.hbs', { error: "Es existiert kein Benutzer mit dieser Email" })
    }
    const match = await bcrypt.compare(req.body?.password, user.results[0].password)

    log(match)
    if (match == true) {
        const token = jwt.sign({ id: user.results[0].email }, process.env.express_secret)
        res.cookie('auth', token, { secure: true, overwrite: true });
        res.redirect('/')
    } else {
        res.render('login.hbs', { error: "Passwort falsch" })
    }
})

app.get('/register', async (req, res) => {
    res.render('register.hbs')
})

app.post('/register', async (req, res) => {

    if (!req.body?.username && !req.body?.password && !req.body?.repeatpassword && !req.body?.name) {
        return res.render('register.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if (!/^[0-9a-zA-Z-. @]+$/.test(req.body?.username) && !/^[0-9a-zA-Z-. ]+$/.test(req.body?.name)) {
        return res.render('register.hbs', { error: "Name oder Email beinhalten ungültige Zeichen" })
    }
    if (req.body?.password !== req.body?.repeatpassword) {
        return res.render('register.hbs', { error: "Passwörter stimmen nicht überein" })
    }

    const result = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if (result.results.length === 0) {
        const hash = await bcrypt.hash(req.body?.password, 10)
        const verify = uuid.v4()
        await sql(`INSERT INTO user (email, password, verify, name) VALUES ("${req.body?.username}","${hash}","${verify}","${req.body?.name}")`)
        await sendMail({ email: req.body?.username, verify, name: req.body?.name })


    } else {
        return res.render('register.hbs', { error: "Benutzer existiert bereits" })
    }
    res.redirect('/ok')
})

app.get('/reset', async (req, res) => {
    res.render('reset.hbs')
})

app.post('/reset', async (req, res) => {
    const verify = uuid.v4()
    let user
    if (!req.body?.username) {
        return res.render('reset.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if (!/^[0-9a-zA-Z-.@]+$/.test(req.body?.username)) {
        return res.render('reset.hbs', { error: "Email beinhaltet ungültige Zeichen" })
    }
    user = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if (user.results.length === 0) {
        return res.render('reset.hbs', { error: "Es existiert kein Benutzer mit dieser Email" })
    }
    await sql(`UPDATE user SET passwordverify = "${verify}" WHERE email = "${req.body?.username}"`)
    await sendPass({ email: req.body?.username, verify, name: user.results[0].name })
    return res.render('reset.hbs', { error: "Email erfolgreich versendet" })
})

app.get('/password', async (req, res) => {
    const verify = req.query.id
    log(verify)
    const user = await sql(`SELECT * FROM user WHERE passwordverify = "${verify}"`)
    if (user.results.length === 0) {
        return res.render('reset.hbs', { error: "Ungültiger Link" })
    } else {
        log(verify)
        return res.render('reset2.hbs', { id: verify })
    }
})

app.post('/password', async (req, res) => {

    if (!req.body?.token && !req.body?.password && !req.body?.repeatpassword) {
        return res.render('reset.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if (req.body?.password !== req.body?.repeatpassword) {
        return res.render('reset.hbs', { error: "Passwörter stimmen nicht überein" })
    }
    log(req.body?.token)
    const result = await sql(`SELECT * FROM user WHERE passwordverify = "${req.body?.token}"`)
    log(result)
    if (result.results.length === 0) {
        return res.render('reset.hbs', { error: "Link ungültig" })
    } else {
        const hash = await bcrypt.hash(req.body?.password, 10)

        await sql(`UPDATE user SET password = "${hash}", passwordverify = NULL WHERE passwordverify = "${req.body?.token}"`)
        return res.render('login.hbs', { error: "Passwort erfolgreich aktualisiert" })
    }
})



app.get('/ok', async (req, res) => {
    res.render('verify.hbs')
})

app.get('/verify', async (req, res) => {
    const verify = req.query.id
    const user = await sql(`SELECT * FROM user WHERE verify = "${verify}"`)
    if (user.results.length === 0) {
        return res.render('login.hbs', { error: "Kein Benutzer gefunden" })
    } else {
        await sql(`UPDATE user SET verify = NULL WHERE verify = "${verify}"`)
        return res.render('login.hbs', { error: "Konto erfolgreich verifiziert" })
    }
})

app.get('/logout', async (req, res) => {
    res.clearCookie('auth');
    res.render('login.hbs', { error: "Erfolgreich ausgeloggt" })
})

app.post('/get', (req, res) => {
    const puzzle = generator(3);
    const sudoku = new Sudoku(puzzle, true)
    console.log(sudoku.debug())
    //const offer = JSON.parse(())
    res.send(sudoku)
});


// Get SQL Data
async function sql(query) {
    const startTime = Date.now();
    try {
        const connection = mysql.createConnection(process.env.DATABASE_URL);
        const answer = await new Promise((resolve) => {
            connection.query(query, (err, server) => {
                const elapsedTime = Date.now() - startTime;
                if (err) {
                    log(err)
                    resolve({ success: false, time: elapsedTime })
                } else {
                    resolve({ success: true, time: elapsedTime, results: server })
                }
            })
        });
        return answer
    } catch (error) {
        log(error)
        return { success: false }
    }
}

function formatDateRelativeToNow(date) {
    const jetzt = new Date(date);
    const differenzInSekunden = Math.floor((jetzt - datum) / 1000); // Differenz in Sekunden
  
    if (differenzInSekunden < 5) {
      return "Gerade eben";
    } else if (differenzInSekunden < 60) {
      return "Einige Sekunden her";
    } else if (differenzInSekunden < 120) {
      return "Eine Minute her";
    } else if (differenzInSekunden < 500) {
      return "Einige Minuten her";
    } else if (differenzInSekunden < 900) {
      return "Eine viertel Stunde her";
    } else if (differenzInSekunden < 1800) {
      return "Eine halbe Stunde her";
    } else if (differenzInSekunden < 3600) {
      return "Eine Stunde her";
    } else if (differenzInSekunden < 86400) {
      return "Mehrere Stunden her";
    } else if (differenzInSekunden < 172800) {
      return "Einen Tag her";
    } else if (differenzInSekunden < 604800) {
      return "Mehrere Tage her";
    } else if (differenzInSekunden < 1209600) {
      return "Eine Woche her";
    } else if (differenzInSekunden < 2592000) {
      return "Mehrere Wochen her";
    } else if (differenzInSekunden < 5184000) {
      return "Einen Monat her";
    } else if (differenzInSekunden < 31536000) {
      return "Mehrere Monate her";
    } else {
      return "Vor langer Zeit";
    }
  }


app.listen(5000, () => {
    console.log('Listening...')
})