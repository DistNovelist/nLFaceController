const express = require('express');
const fs = require('fs');
// csv モジュールの内，必要な機能を読み込む
const parse = require('csv-parse/sync');
const stringify = require('csv-stringify/sync');
const bodyParser = require('body-parser');
const {PythonShell} = require('python-shell');


const app = express();
var pyshell = new PythonShell('key.py');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/api/getRules', (req, res) => {
    var csvData = fs.readFileSync('./rules.csv', 'utf8');
    var parsed = parse.parse(csvData, {columns: true});
    res.send(parsed);
});

app.post('/api/saveRules', (req, res) => {
    console.log(req.body);
    csv = stringify.stringify(req.body.rules, {header: true});
    fs.writeFileSync('./rules.csv', csv);
    res.send('ok');
});

app.post('/api/key', (req, res) => {
    console.log(req.body);
    if(req.body.val=='true'){
        pyshell.send(req.body.key);
    }else{
        pyshell.send("!"+req.body.key);
    }
    res.send('ok');
});

pyshell.on('message',  function (data) {
    console.log(data);
})

app.use(express.static('public'));

app.listen(3000);