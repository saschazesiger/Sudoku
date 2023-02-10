const http = require('http');

const server = http.createServer();

const friends = [
    {
      id: 0,
      name: 'Nikola Tesla',
    },
    {
      id: 1,
      name: 'Sir Isaac Newton',
    },
    {
      id: 2,
      name: 'Albert Einstein',
    }
  ];

server.on('request', (req, res) => {
    const items = req.url.split('/');
    if (items[1] === 'friends') {
        res.statusCode(200)
        res.setHeader('Content-Type', 'application/json')
        if (items.length === 3) {
            const friendIndex = Number(items[2]);
            
        }
        res.end(JSON.stringify({
            id: 0,
            name: 'janis',
        }));
    } else if (req.url === '/messages') {
        res.setHeader('Content-Type', 'text/html')
        res.write('<h1>Hi!</h1>');
        res.end()
    } else {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html')
        res.write('<h1>Not Found!</h1>');
        res.end()
    }
});

server.listen(5000, () => {
    console.log('Listening...')
});