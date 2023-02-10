const express = require('express');

const friendsRouter = express.Router();

const friends = [
    {
        id:0,
        name:'Albert Einstein'
    },
    {
        id: 1,
        name: 'Elon Musk'
    }
];

friendsRouter.get('/', (req, res) => {
    res.json(friends)
})

friendsRouter.get('/:friendId', (req, res) => {
    const friendId = Number(req.params.friendId);
    const friend = friends[friendId];
    if (friend){
        res.json(friend);
    } else {
        res.status(404).json({'error':'Not Found'});
    }
})

module.exports = friendsRouter;