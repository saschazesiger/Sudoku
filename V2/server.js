const {generator, Sudoku} = require('@forfuns/sudoku');
const hbs = require('hbs')
const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'static')))

app.get('/', (req, res) => {
    res.render('index.hbs')
});


app.post('/get', (req, res) => {
    console.log(req, res)
    const puzzle = generator(3);
    const sudoku = new Sudoku(puzzle,true)
    console.log(sudoku)
    //const offer = JSON.parse(())
    res.send(sudoku)
});


app.listen(5000, () => {
    console.log('Listening...')
})