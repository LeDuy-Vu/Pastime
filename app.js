const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

var global = this;
var currentUser = "global"
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
//
// Item.insertMany(defaultItems, function(err){
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully savevd default items to DB.");
//         }
// });

const activitiesSchema = {
  Name: String,
  ServiceProvider: String,
  Description: String,
  Rating: String,
  StartDate: String,
  EndDate: String,
  Image: String,
  Venue: String,
  Longitude: String,
  Latitude: String,
};

const Activity = mongoose.model("Activity", activitiesSchema);


app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

app.post("/result", function(req, res){
  console.log(req.body.City);
  Activity.findOne({'Name': req.body.City}, 'Name Description ServiceProvider Rating StartDate EndDate Image Venue Longitude Latitude', function (err, activity) {
    if (err) return handleError(err);
    else console.log('Name: %s\n Description: %s\n ServiceProvider: %s\n Rating: %s\n StartDate: %s\n EndDate: %s\n Image: %s\n Venue: %s\n Longitude: %s\n Latitude: %s\n', activity.Name,
    activity.Description, activity.ServiceProvider, activity.Rating, activity.StartDate, activity.EndDate, activity.Image, activity.Venue, activity.Longitude, activity.Latitude);
  });
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
    }
    else {
      console.log("Successfully savevd default items to DB.");
    }
  });
  res.sendFile(__dirname+ "/login.html")
});

app.post("/changePass", function(req, res){

  Item.findOne({FirstName: currentUser }, function (err, docs){
    if (docs === null) {
      res.redirect('home.html');
    }
    else {
      console.log(docs.Password + req.body.oldPassword + req.body.newPassword1 + req.body.newPassword2);
      if((docs.Password === req.body.oldPassword) && (req.body.newPassword1 === req.body.newPassword2)){
        console.log("some");
        Item.updateOne({FirstName: currentUser}, {$set:{Password:req.body.newPassword1}}, function(err, result){
          if(result === null)
            console.log("can't change password");
          else
            console.log("Password changed");
        });
      }
      res.redirect("home.html");

    }

  });
});

app.get("/signup.html", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.get("/nextstep.html", function(req, res){
  Item.findOne({FirstName: currentUser }, function (err, docs){

    if (docs === null) {
      console.log(currentUser);
      res.redirect('home.html');
    }
    else{
      res.render("profile", {FName: docs.FirstName, LName: docs.LastName, EID1:docs.EmailID, FAddress: docs.Street});

    }

  });
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

  if (emailAddress === "admin@admin.com" && password == "admin") {
    console.log("Admin Success");
    res.redirect('adminview.html');
  }

  Item.findOne({EmailID: emailAddress }, function (err, docs) {
      if (docs === null) {
          res.redirect('tryagain.html');
      }
      else {
        if(emailAddress === docs.EmailID && password === docs.Password) {
          currentUser = docs.FirstName;
          res.render("home", {MyName: currentUser});
        }
        else {
          res.redirect('tryagain.html');
        }
      }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is running.");
});
