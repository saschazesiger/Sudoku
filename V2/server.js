const {generator, Sudoku} = require('@forfuns/sudoku');
const express = require('express');

const app = express();
app.set('view engine', 'hbs')
app.set('views','./templates')

app.use('/static',   express.static('static'))


app.get('/get', (req, res) => {
    const puzzle = generator(3);
    const sudoku = JSON.parse(new Sudoku(puzzle,true))
    
    //const offer = JSON.parse(())
    res.send(sudoku)
})


app.listen(5000, () => {
    console.log('Listening...')
})