//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const date = require(__dirname + '/day.js');
const _ = require('lodash');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('view engine', 'ejs');

// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://" + process.env.MONGOCLUSTER + "todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', (req, res) => {
    // let day=date();
    let day = date.getDate();
    Item.find({}, function (err, results) {
        if (results.length === 0) {
            Item.insertMany(defaultItem, function (err) {
                if (err) { console.log(err); } else { console.log("Default items saved successfully!!!"); }
            });
        }
        res.render('list', { listTitle: day, newListItem: results });
    });
});


app.get('/:paramName', (req, res) => {
    const paramName = _.capitalize(req.params.paramName);
    List.findOne({ name: paramName }, function (err, results) {
        if (!err) {
            if (!results) {
                const list = new List({
                    name: paramName,
                    items: defaultItem
                });
                list.save();
                res.redirect('/' + paramName);
            } else {
                res.render('list', { listTitle: results.name, newListItem: results.items });
            }
        } else { console.log("case mchn"); }
    });

});
app.get('/about', (req, res) => {
    res.render('about');
});

app.post('/', (req, res) => {
    let item = req.body.newItem;
    let list = req.body.list;
    const itemreq = new Item({
        name: item
    });
    if (req.body.list === date.getDate()) {
        itemreq.save(function (err) {
            if (err) { console.log(err); } else { console.log("Item saved successfully!!!"); }
        });
        res.redirect('/');
    } else {
        List.findOne({ name: list }, function (err, results) {
            console.log(results);
            results.items.push(itemreq);
            results.save();
            res.redirect('/' + list);
        });
    }
});

app.post("/delete", (req, res) => {
    console.log(req.body.checkedItem);
    const checkedItemId = req.body.checkedItem;
    let list = req.body.list;
    if (req.body.list === date.getDate()) {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (err) { console.log(err); } else { console.log("Successfully deleted item!"); res.redirect('/'); }
        });
    } else {
        List.findOneAndUpdate({ name: list }, { $pull: { items: { _id: checkedItemId } } }, function (err, results) {
            res.redirect('/' + list);
        });
    }
});
app.listen(process.env.PORT || 3000, function () {
    console.log('Server running at port 3000');
});