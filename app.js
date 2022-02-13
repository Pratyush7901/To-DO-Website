const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

var tasks = ["Buy Food", "Cook Food", "Eat Food"];
let worktask = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://Pratyush:Pratyush@7@cluster0.bvy8d.mongodb.net/todolistDB";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const DB="mongodb+srv://Pratyush:Pratyush%407@cluster0.bvy8d.mongodb.net/todolistDB"
mongoose.connect(DB,{
      useNewUrlParser:true,});

const todoSchema = {
      name: String
};

const Todo = mongoose.model("Todo", todoSchema);

const item1 = new Todo({
      name: "Welcome to you todo list!!!"
});

const item2 = new Todo({
      name: "Hit + to add an Item!!!"
});

const item3 = new Todo({
      name: "<-- Hit this to delete an item!!!"
});

const defaultItems = [item1, item2, item3];

const listschema = {
      name: String,
      item: [todoSchema]
};

const List = mongoose.model("List", listschema);


app.get("/", function (req, res) {

      Todo.find({}, function (err, findItems) {

            if (findItems.length === 0) {
                  Todo.insertMany(defaultItems, function (err) {
                        if (err) {
                              console.log(err);
                        }
                        else {
                              console.log("success");
                        }
                        res.redirect("/")
                  })
            }
            res.render("list", { listTitle: "Today", newItem: findItems });
      })



      //res.write("Server is now ready");
})

app.post("/", function (req, res) {

      let task = req.body.newtask;
      const listName=req.body.list;
      
            const newitem = new Todo({
                  name: task
            })

            if(listName=="Today")
            {
                  newitem.save();
                  res.redirect("/");
            } else{
                  List.findOne({name:listName},function(err,foundList){
                        foundList.item.push(newitem);
                        foundList.save();
                        res.redirect("/"+listName);
                  })
            }
            
      
});

app.post("/delete", function (req, res) {
      const checkedId = req.body.checkbox;
      const listName=req.body.listName;
      console.log(listName);
      if(listName==="Today")
      {
            Todo.findByIdAndRemove(checkedId, function (err) {
                  if (!err) {
                        console.log("success");
                  }
            });
      }else{
            List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedId}}}, function(err, foundList){
                  if (!err){
                  //   res.redirect("/" + listName);
                  }
                });

                res.redirect("/"+listName);
      }
      
      res.redirect("/");
})

app.get("/:topic", function (req, res) {
      
      const customName = _.capitalize(req.params.topic);

      List.findOne({ name: customName }, function (err, foundList) {
            if (!err) {
                  if (!foundList) {
                        const list = new List({
                              name: customName,
                              item: defaultItems
                        })
                        list.save();
                        res.redirect("/"+customName);
                  }
                  else{
                        res.render("list", { listTitle: foundList.name, newItem: foundList.item });
                  }
            }
      })


})

app.post("/work", function (req, res) {
      let workTask = req.body.newtask;
      worktask.push(workTask);

      res.redirect("/work");
})

app.get("/about", function (req, res) {
      res.render("about");
})

app.listen(3000, function () {
      console.log("Server is up and running at 3000");
})