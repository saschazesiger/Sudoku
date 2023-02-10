const express = require('express');
const external = require('./external');
const friendsRouter = require('./friends')

const app = express();



app.use((req, res, next) => {
    const start = Date.now();
    next();
    const delta = Date.now() - start;
    console.log(`${req.method} ${req.url} ${delta}ms`);
})



app.use('/friends', friendsRouter);



app.get('/external', external.runmodule)

app.listen(5000, () => {
    console.log('Listening...')
});