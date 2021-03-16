const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const router = express.Router();

app.use(bodyParser.json());

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Here we are handling the get request for the products"
    });
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb+srv://pruthvi:cs160team3@cluster0.h0d8v.mongodb.net/myFirstDatabase?retryWrites=true&w=majoritytodolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
module.exports = router;

const itemsSchema = {
  FirstName: String,
  LastName: String,
  EmailID: String,
  Password: String,
  Street: String,
  City: String,
  State: String,
  ZipCode: String,

};

const Item = mongoose.model("Item", itemsSchema);
//
// const item1 = new Item({
//   FirstName: "Peter",
//   LastName: "Parker",
//   EmailID: "parker@gmail.com",
//   Password: "test",
//   Street: "1234 roger street",
//   City: "San Jose",
//   State: "CA",
//   ZipCode: "95123",
// });
//
// const item2 = new Item({
//   FirstName: "Roger",
//   LastName: "Stones",
//   EmailID: "rstones@gmail.com",
//   Password: "test",
//   Street: "1234 amazing street",
//   City: "San Jose",
//   State: "CA",
//   ZipCode: "95143",
// });
//
// const item3 = new Item({
//   FirstName: "Vilas",
//   LastName: "Punwar",
//   EmailID: "vpuwnar@gmail.com",
//   Password: "test1",
//   Street: "2878 Colorado street",
//   City: "San Jose",
//   State: "CA",
//   ZipCode: "95113",
// });
//
// const defaultItems = [item1, item2, item3];
//
// var currentUser;
//
// Item.insertMany(defaultItems, function(err){
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully savevd default items to DB.");
//         }
// });

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

app.post("/result", function(req, res){

  console.log(req.body.City);
})

app.post("/aftersignup",function(req, res){
  const temps = new Item({
    FirstName: req.body.FName,
    LastName: req.body.LName,
    EmailID: req.body.Email,
    Password: req.body.Pass,
    Street: req.body.Streets,
    City: req.body.City,
    State: req.body.state,
    ZipCode: req.body.zips,
  });

  Item.insertMany(temps, function(err){
    if (err) {
              console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
          }
  });

  res.sendFile(__dirname+"/login.html")
});

app.get("/signup.html", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.get("/nextstep.html", function(req, res){

  res.render("profile", {myName: "Pruthvi"});
});

app.get("/", function(req, res) {

  res.sendFile(__dirname + "/index.html")

});

app.get("/login.html", function(req, res){
  res.sendFile(__dirname+"/login.html")
});

app.get("/index.html", function(req, res){
  res.sendFile(__dirname + "/index.html")
  currentUser = "";
});

app.get("/home.html", function(req, res){
  res.sendFile(__dirname + "/home.html");
  currentUser = ""
});

app.get("/adminview.html", function(req, res){
  res.sendFile(__dirname + "/adminview.html")
});

app.get("/tryagain.html", function(req, res){
  res.sendFile(__dirname + "/tryagain.html")
});


app.post("/", function(req, res){
  var emailAddress = req.body.emailID;
  var password = req.body.passWORD;
  //console.log(emailAddress);


  Item.findOne({EmailID: emailAddress }, function (err, docs) {
      if (err){
          console.log(err)
      }
      else{

        if(emailAddress === docs.EmailID && password === docs.Password){
          console.log("Success!");
          currentUser = emailAddress;
          res.redirect('home.html');
        }
        else if (emailAddress === "admin@admin.com" && password == "admin") {
          console.log("Admin Success");
          res.redirect('adminview.html');

        }

        else {

         res.redirect('tryagain.html');
       }

      }
  });

  //
  //
  //

});

app.listen(3000, function(){
  console.log("Server is running at port 3000.");
});
