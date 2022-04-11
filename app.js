//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const date= require(__dirname+'/day.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine', 'ejs');

let items = [];
let workItems = [];

app.get('/', (req, res) => {
    // let day=date();
    let day=date.getDate();
    res.render('list', { listTitle: day, newListItem: items });
});
app.get('/work', (req, res) => {
    res.render('list', { listTitle: "Work", newListItem: workItems });
});
app.get('/about', (req, res) => {
    res.render('about');
});

app.post('/', (req, res) => {
    let item = req.body.newItem;
    if (req.body.button === "Work") {
        workItems.push(item);
        res.redirect('/work');
    } else {
        items.push(item);
        res.redirect('/');
    }
});


app.listen(3000, function () {
    console.log('Server running at port 3000');
});