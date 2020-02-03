const express = require('express');

let port = Number(process.env.HTTP_PORT);
if (isNaN(port)) port = 8080;

const app = express();
app.use(express.json());

app.get('*', (req, res) => {
    res.send('Hello World!\n');
});

app.listen(port, () => console.log("Backend started on port", port));
