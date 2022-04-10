//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-reeturaj:admin123@cluster0.o8deh.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};


const Item = mongoose.model("Item", itemSchema);


//create items to be inserted in the database,remember only the items which are of the same model can be inserted into the
//schema
const Item1 = new Item({
    name: "Welcome to your to-do list"
});
const Item2 = new Item({
    name: "Hit the + button to add an item"
});
const Item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Default items entered to the list.")
                }
            });
            res.redirect("/");
        } else {
            console.log(foundItems);
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });

});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function(err, foundList) {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    // Item.insert(newItem, function(err) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    // or we can do
    // newItem.save();
    // res.redirect("/");
});


app.post("/delete", function(req, res) {
    const removedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(removedItemId, function(err) {
            if (err)
                console.log(err);
            else
                console.log('Succesfully deleted the checked item!');
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:removedItemId}}},function(err,foundList){
            if(!err)
                res.redirect("/" + listName);
        });
    }

});


// app.get("/work", function(req, res) {
//     res.render("list", {
//         listTitle: "Work List",
//         newListItems: workItems
//     });
// });


app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
        name: customListName
    }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName)
            } else {
                //show an existing list
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });

});



app.get("/about", function(req, res) {
    res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
    console.log("Server started successfully");
});
