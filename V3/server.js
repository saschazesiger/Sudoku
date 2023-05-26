const {generator, Sudoku} = require('@forfuns/sudoku');
const hbs = require('hbs')
const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const log = msg => console.log(new Date(), msg);

const app = express();
app.use(cookieParser());
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'static')))

app.get('/index', async (req, res) => {
    return res.render('index.hbs')
})

app.get('/', async (req, res) => {
    let logged = false
    if (req.cookies.auth) {
        let authHeader = req.cookies.auth;
        try {
            user = await jwt.verify(authHeader, process.env.express_secret)       
            log("userid:"+JSON.stringify(user))
           logged = true
        } catch (e) {
            log("Signing error")
            //const token = jwt.sign({ id: "test" }, process.env.express_secret)
            //res.cookie('auth', token, { secure: true, overwrite: true });
            logged = false
        }
    }
    if (logged == true){
        return res.render('index.hbs')
    } else{
        return res.render('login.hbs')
    }
});

app.get('/login', async (req, res) => {
    res.render('login.hbs')
})

app.post('/login', async (req, res) => {
    log(req.body?.username)
    res.render('verify.hbs')
})

app.get('/register', async (req, res) => {
    res.render('register.hbs')
})

app.post('/get', (req, res) => {
    const puzzle = generator(3);
    const sudoku = new Sudoku(puzzle,true)
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