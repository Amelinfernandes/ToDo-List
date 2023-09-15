//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amelin:Amyadmin@cluster0.jw8zr9w.mongodb.net/todolistDB", {useNewUrlParser: true});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema =  {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
}); 

const item2 = new Item({
  name: "Hit the + button to add a new item."
}); 

const item3 = new Item({
  name: "<-- Hit this to delete an item"
}); 

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
//const day = date.getDate();

  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length===0){ //checks if there any items and if there are none then creates those three items
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Succesfully saved default items to DB.");
          })
          .catch(function (err) {
            console.log(err);
          }); 
          res.redirect("/"); //redorect back into the root route and fall onto else block
      } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    })
    .catch(function (err) {
      console.log(err);
    });

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem; //refers to the text that the user entered into the input when they clicked on the + button
  const listName = req.body.list;

  const item = new Item({ 
    name: itemName
  });

  if(listName === "Today"){ //for default page
    item.save(); //the item will show on mongo terminal
    res.redirect("/"); //in order to show the item on website screen
  } else{ //for custom list
    List.findOne({name:listName })
      .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {}); 
    }  
});

app.post("/delete", function(req,res){
  const checkItemId = req.body.checkbox; //new item will be sent over from the above post route for +
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId)
    .then(function () {
      console.log("Succesfully deleted checked item."); //just executing this will show only after refreshing page
      res.redirect("/"); //this will make sure it reflects on the webpage
    })
    .catch(function (err) {
      console.log(err);
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}) //we pull from our items array and item that has checkItemId
    .then(function (foundList) {
      res.redirect("/" + listName); 
    })
    .catch(function (err) {});
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
    .then(function(foundList){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName); //this redirects to whatever was entered after /
      } else{
        
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items}); //using foundList.nme our title will not be Today like previous but will be whatever page it is opening, eg: /Home title will be Home. foundList.items will show the default items
      }
    })
    .catch(function (err) {}); 

  
  

  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
