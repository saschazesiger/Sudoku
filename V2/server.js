const {generator, Sudoku} = require('@forfuns/sudoku');
const hbs = require('hbs')
const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index.hbs')
});

app.get('/get', (req, res) => {
    const puzzle = generator(3);
    const sudoku = JSON.parse(new Sudoku(puzzle,true))
    
    //const offer = JSON.parse(())
    res.send(sudoku)
});


app.listen(5000, () => {
    console.log('Listening...')
})