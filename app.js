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
//to connect with localhost
//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
//connect with mongoose Atlas
mongoose.connect("mongodb+srv://admin-jose:test123@cluster0.uiisp.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
//create Schema
const itemsSchema = {
  name: String
};
// create Model
const Item = mongoose.model("Item", itemsSchema);
//create Document
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "< -- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];
// cerated schema for custom list 
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//mongoose model for custom list.
const List= mongoose.model("List", listSchema);



// const items = ["Buy Food", "Cook Food", "Eat Food"]; // instead this defaul array,it is created using mongoose
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();

Item.find( {}, function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
          if (err)
          {
            console.log("Error in Insertion");
          }
          else{
            console.log("Successfully inserted in Database");
          }
    });
    res.redirect("/"); // aftet inserting it should redirect to home route else it won't show inserted items
    }  
    else
    {
    //console.log(foundItems);
    res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
}); //Item.find closed
});// app.get getting closed

app.get("/:customListName", function(req,res){
  //console.log(req.params.customListName)
  const customListName = _.capitalize(req.params.customListName);
//List is the model name if its capital give in capital

List.findOne({name: customListName}, function(err, foundList)
{
if(!err)
{
  if(!foundList){
    //create a New List
    console.log("Dosen't exit!");

    //document created for list collections already items collection is created
  const list = new List({
    name: customListName, //home,work whatever user types in addition to localhost:3000
    items: defaultItems
  });

  list.save();
  res.redirect("/" +customListName);

  }else{
    //show an exixting list
    console.log("exist!")
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

  }
}
});


})



app.post("/", function(req, res){

  
  const itemName = req.body.newItem; //newItem from list.ejs
  const listName = req.body.list; // button value created to add items to custom List instead of posting in root route
  //console.log("item I serted is: ", itemName);

  //create document
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){ // add item to home route
    item.save();
    res.redirect("/");
  }
  else{//add item to new cutom list
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" +listName);
    });
  }

});

app.post("/delete", function(req,res){
  console.log("req.body: ", req.body);

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;//lidtName is "hidden= type" input tag in list.ejs" value"

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log("error in Delection")
      }
      else{
      console.log("Item Deleted succesfully is : ",  checkedItemId)
      res.redirect("/");
      }
    });
  }
  else
  { //https://docs.mongodb.com/v5.0/reference/operator/update/pull/   
    //(find an elemnt in array and delete and update)
    //items is an array
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


  
})
  // if (req.body.list === "Work") {
  //   workItems.push(item); items array dosenot exit since we use database
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
