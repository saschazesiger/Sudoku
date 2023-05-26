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
const {sendMail,sendPass} = require('./modules/email.js')

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
    if (req.cookies.auth) {
        let authHeader = req.cookies.auth;
        try {
            user = await jwt.verify(authHeader, process.env.express_secret)
            log("userid:" + JSON.stringify(user))
            sqluser = await sql(`SELECT * FROM user WHERE email = "${user.id}"`)
            if(!sqluser.results[0].verify){
                verified = true
            }
            if(sqluser.results.length !== 0){
                logged = true
            }
        } catch (e) {
            log("Signing error")
        }
    }
    if (logged !== true) {
        return res.render('login.hbs')
        
    } else if (verified !== true){
        return res.render('verify.hbs')
    }else{
        return res.render('index.hbs',{user:sqluser.results[0].name})
    }
});

app.get('/login', async (req, res) => {
    res.render('login.hbs')
})

app.post('/login', async (req, res) => {
    if (!req.body?.username && !req.body?.password) {
        return res.render('login.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if(!/^[0-9a-zA-Z-.@]+$/.test(req.body?.username)){
        return res.render('login.hbs', { error: "Email beinhaltet ungültige Zeichen" })
    }
    const user = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if(user.results.length === 0){
        return res.render('login.hbs', { error: "Es existiert kein Benutzer mit dieser Email" })
    }
    const match = await bcrypt.compare(req.body?.password, user.results[0].password)

    log(match)
    if(match == true){
        const token = jwt.sign({ id: user.results[0].email }, process.env.express_secret)
        res.cookie('auth', token, { secure: true, overwrite: true });
        res.redirect('/')
    }else{
        res.render('login.hbs',{error:"Passwort falsch"})
    }
})

app.get('/register', async (req, res) => {
    res.render('register.hbs')
})

app.post('/register', async (req, res) => {

    if (!req.body?.username && !req.body?.password && !req.body?.repeatpassword && !req.body?.name) {
        return res.render('register.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if(!/^[0-9a-zA-Z-. @]+$/.test(req.body?.username) && !/^[0-9a-zA-Z-. ]+$/.test(req.body?.name)){
        return res.render('register.hbs', { error: "Name oder Email beinhalten ungültige Zeichen" })
    }
    if(req.body?.password !== req.body?.repeatpassword){
        return res.render('register.hbs', { error: "Passwörter stimmen nicht überein" })
    }

    const result = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if (result.results.length === 0) {
        const hash = await bcrypt.hash(req.body?.password, 10)
            const verify = uuid.v4()
            await sql(`INSERT INTO user (email, password, verify, name) VALUES ("${req.body?.username}","${hash}","${verify}","${req.body?.name}")`)
            await sendMail({email:req.body?.username,verify,name:req.body?.name})


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
    if(!/^[0-9a-zA-Z-.@]+$/.test(req.body?.username)){
        return res.render('reset.hbs', { error: "Email beinhaltet ungültige Zeichen" })
    }
    user = await sql(`SELECT * FROM user WHERE email = "${req.body?.username}"`)
    if(user.results.length === 0){
        return res.render('reset.hbs', { error: "Es existiert kein Benutzer mit dieser Email" })
    }
    await sql(`UPDATE user SET passwordverify = "${verify}" WHERE email = "${req.body?.username}"`)
    await sendPass({email:req.body?.username,verify,name:user.results[0].name})
    return res.render('reset.hbs', { error: "Email erfolgreich versendet" })
})

app.get('/password', async (req, res) => {
    const verify = req.query.id
    log(verify)
    const user = await sql(`SELECT * FROM user WHERE passwordverify = "${verify}"`)
    if(user.results.length === 0){
        return res.render('reset.hbs',{error:"Ungültiger Link"})
    }else{
        log(verify)
        return res.render('reset2.hbs',{id:verify})
    }
})

app.post('/password', async (req, res) => {

    if (!req.body?.token && !req.body?.password && !req.body?.repeatpassword) {
        return res.render('reset.hbs', { error: "Bitte fülle alle Felder aus" })
    }
    if(req.body?.password !== req.body?.repeatpassword){
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
    if(user.results.length === 0){
        return res.render('login.hbs',{error:"Kein Benutzer gefunden"})
    }else{
        await sql(`UPDATE user SET verify = NULL WHERE verify = "${verify}"`)
        return res.render('login.hbs',{error:"Konto erfolgreich verifiziert"})
    }
})

app.get('/logout', async (req, res) => {
    res.clearCookie('auth');
    res.render('login.hbs',{error:"Erfolgreich ausgeloggt"})
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


app.listen(5000, () => {
    console.log('Listening...')
})