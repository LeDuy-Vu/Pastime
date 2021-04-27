const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const crypto = require('crypto');
const _ = require("lodash");
const router = express.Router();
var validator = require("email-validator");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/**
 * Generates random hex string of length 16 as salt
 * @function nothing
 */
 var getSalt = function(){
   console.log("Happy");
  return crypto.randomBytes(Math.ceil(8)).toString('hex').slice(0,16);
};

/**
* Hash sensitive information with ripemd160.
* @function
* @param {string} phase - Phase needed to be hashed.
* @param {string} salt - Data to be validated.
*/
var hash = function(phase, salt){
  var hash = crypto.createHmac('ripemd160', salt); // Hashing algorithm ripemd160
  hash.update(phase);
  return hash.digest('hex');
};


router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Here we are handling the get request for the products"
    });
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb+srv://pruthvi:cs160team3@cluster0.h0d8v.mongodb.net/myFirstDatabase?retryWrites=true", {useNewUrlParser: true, useUnifiedTopology: true});
module.exports = router;

const globVars = {
  CurrentUser: String,
  isLoggedIn: Boolean,
}
var isLoggedIn = false;

const itemsSchema = {
  FirstName: String,
    LastName: String,
    EmailID: String,
    Salt: String,
    Password: String,
    Street: String,
    City: String,
    State: String,
    ZipCode: String,
    CredCardName: String,
    CredCardNumb: String,
    Last4Digits: String,
    CVC: String,
    ExpireDate: String,
    Points: Number,
    isLocked: Boolean
};

const userWallet = {
  emailID: String,
  currentActivity:[{
    type: String
  }],
  completedActivity:[{
    type: String
  }],
}

const globalDB = mongoose.model("globalDB", globVars);
const Wallet = mongoose.model("Wallet", userWallet);

const Item = mongoose.model("Item", itemsSchema);

let global = this;
global.currentUser = "global";

const activitiesSchema = {
  Name: String,
  ServiceProvider: String,
  Description: String,
  Rating: String,
  Date: String,
  Time: String,
  Image: String,
  Venue: String,
  Longitude: String,
  Latitude: String,
  Price: Number,
  Tags: Array,
};

const Activity = mongoose.model("Activity", activitiesSchema);

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

// Search bar logic
app.get("/searchActivity", function(req, res){
  const { activityTag } = req.query;
  var searchAct = activityTag.split(", ");
  for (let i = 0; i < searchAct.length; i++) {
      searchAct[i] = searchAct[i].toLowerCase();
  }
  if(isLoggedIn){
    Activity.find({"Tags": { $in: searchAct }}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
  }
  else{
    Activity.find({"Tags": { $in: searchAct }}, function(err, foundItems){
      res.render("home", {MyName: "Anonymous", newListItems: foundItems});
    });
  }
});



// Each clickable activity card
app.get("/activities/:id", function(req, res){
  if (isLoggedIn)
  {
    Activity.findOne({'Name': req.params.id}, 'Name Description ServiceProvider Rating Date Time Image Venue Longitude Latitude Price Tags', function (err, activity) {
      if (err) return handleError(err);
      else {
        res.render("activities", {name: activity.Name, des:activity.Description, provider: activity.ServiceProvider, rating: activity.Rating, date: activity.Date,
          time: activity.Time, image: activity.Image, venue: activity.Venue, longitude: activity.Longitude, latitude: activity.Latitude, price: activity.Price,
        tags: activity.Tags});
      }
    });
  }
  else res.render("login", {inputcolor: "black", FirstLine: "You need to log in to proceed", SecondLine:""}) ;

});

app.post("/result", function(req, res){
  Activity.findOne({'Name': req.body.City}, 'Name Description ServiceProvider Rating Date Time Image Venue Longitude Latitude Price Tags', function (err, activity) {
    if (err) return handleError(err);
    else {
      res.render("activities", {name: activity.Name, des:activity.Description, provider: activity.ServiceProvider, rating: activity.Rating, date: activity.Date,
        time: activity.Time, image: activity.Image, venue: activity.Venue, longitude: activity.Longitude, latitude: activity.Latitude, price: activity.Price,
      tags: activity.Tags});
    }
  });
})

app.post("/addActivity", function(req, res){

  Item.findOne({FirstName: currentUser }, function (err, docs){
    if (docs === null) {
      console.log("in null");
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
    }
    else {
      Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$push: {currentActivity: req.body.ActivityToAdd}}, function (error, success) {
        if(error) {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(error);
        } else {
          console.log("Added to DB");
            console.log(success);
        }

      });
      console.log("Updating " +docs.EmailID + " with " + req.body.ActivityToAdd);
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }

  });
});

// Push the new user account into the DB
app.post("/aftersignup",function(req, res){
  email = req.body.Email.trim()     // trim whitespaces
  if (validator.validate(email))    // validate email
  {
    Item.findOne({EmailID:email}, function (err, docs){

      if(docs === null){  // if no such email in the DB yet
        salt = getSalt();

        const temps = new Item({
          FirstName: req.body.FName,
          LastName: req.body.LName,
          EmailID: email,
          Salt: salt,
          Password: hash(req.body.Pass, salt),
          Street: "",
          City: "",
          State: "",
          ZipCode: "",
          CredCardName: "",
          CredCardNumb: "",
          Last4Digits: "",
          CVC: "",
          Expiry: "",
          Points: 0,
          isLocked: false
        });

        Wallet.insertMany({emailID: email}, function(err){
          if (err)
            console.log(err);
          else
            console.log("Successfully saved default items to DB.");
        });

        Item.insertMany(temps, function(err){
          if (err)
            console.log(err);
          else
            console.log("Successfully saved default items to DB.");
        });
        res.render("login", {inputcolor: "black", FirstLine: "", SecondLine:""});
      }

      else  // if this email already exists in the DB
      {
        console.log("Email already existed.")
        res.render("login", {inputcolor: "red", FirstLine: "Email Already exists", SecondLine:"Try Again!"});
      }
    });
  }
  else
  {
    console.log("Wrong email format")
    res.render("login", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
  }
});

// Change Password logic
app.post("/changePass", function(req, res){

  Item.findOne({FirstName: currentUser }, function (err, docs){
    if (docs === null) {
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
    }
    else {
      if((docs.Password === hash(req.body.oldPassword, docs.Salt)) && (req.body.newPassword1 === req.body.newPassword2)){
        console.log("some");
        Item.updateOne({FirstName: currentUser}, {$set:{Password: hash(req.body.newPassword1, docs.Salt)}}, function(err, result){
          if(result === null)
            console.log("can't change password");
          else
            console.log("Password changed");
        });
      }
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });

    }

  });
});

app.get("/signup.html", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.get("/Wallet.html", function(req, res){
  if (isLoggedIn) // if user is logged in
  {
    Item.findOne({FirstName: currentUser}, function(err, docs){

      if (docs === null) {
        console.log(currentUser);
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }
      else {
        Wallet.findOne({emailID: docs.EmailID}, function(err, document){
          if(docs === null)
            console.log("EEEEEEEE");
          else{
            Activity.find({Name: document.currentActivity}, function(err, docs1){
              if(err)
                console.log("llol");
                else{
                  var total = 0;
                  docs1.forEach(function(item){
                    total += item.Price;
                  })
                  res.render("wallets", {numActivity: document.currentActivity.length, newListItems: docs1, TotalPrice: total})
                }
            });
          }
        });
      }

    });
  }
  else res.render("login", {inputcolor: "black", FirstLine: "You need to log in to proceed", SecondLine:""});
});

app.get("/nextstep.html", function(req, res){
  console.log("HHHHHH");
});


app.get("/checkout.html", function(req, res){
  if (isLoggedIn) // if user is logged in
  {
    Item.findOne({FirstName: currentUser }, function (err, docs)
    {
      if (docs === null) {
        console.log(currentUser);
        Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
      }
      else{
        res.render("profile", {FName: docs.FirstName, LName: docs.LastName, EID1: docs.EmailID, FAddress: docs.Street + ", " + docs.City +  ", " + docs.State + " " + docs.ZipCode});
      }
    });
  }
  else res.render("login", {inputcolor: "black", FirstLine: "You need to log in to proceed", SecondLine:""}) ;
});

app.post("/afterCheckOut", function(req, res){
  Item.findOne({FirstName: currentUser}, function(err, docs){
    if (docs === null) {
      console.log(currentUser);
      Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }
    else {
      Wallet.findOne({emailID: docs.EmailID}, function(err, document){
        if(docs === null)
          console.log("EEEEEEEE");
        else{
          document.currentActivity.forEach(function(item, index, array){
            Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$push: {completedActivity: item}}, function (error, success) {
              if(error)
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!");
              else
                console.log("Added to DB");
              });
          });
        }
      });
      Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$set: {currentActivity: []}}, function(error, success){
        if(error)
          console.log("**************");
        else
          console.log("Added to DB");
      });
      Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }
  });
});

app.get("/previousActivities", function(req, res){

  if (isLoggedIn) // if user is logged in
  {
    Item.findOne({FirstName: currentUser}, function(err, docs){
      if (docs === null) {
        console.log(currentUser);
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }
      else {
        Wallet.findOne({emailID: docs.EmailID}, function(err, document){
          if(document === null)
            console.log("EEEEEEEE");
          else{
            Activity.find({Name: document.completedActivity}, function(err, docs1){
              if(err)
                console.log(err);
                else {
                  res.render("pastActivities", {newListItems: docs1})
                }
            });

          }
        });
      }
    });
  }
  else res.render("login", {inputcolor: "black", FirstLine: "You need to log in to proceed", SecondLine:""});
});


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html")
});

app.get("/login.html", function(req, res){
  res.render("login", {inputcolor: "black", FirstLine: "lllll", SecondLine:""});
});

app.get("/mainpage.html", function(req, res){
  Activity.find({}, function(err, foundItems){
  res.render("home", {MyName: "anonymous", newListItems: foundItems});
});
});

app.get("/index.html", function(req, res){
  res.sendFile(__dirname + "/index.html");
  currentUser = "";
  isLoggedIn = false ;
  activityList = [];
});


app.get("/adminview.html", function(req, res){
  res.sendFile(__dirname + "/adminview.html")
});

app.get("/edit.html", function(req, res){
  res.sendFile(__dirname + "/edit.html")
});

app.get("/tryagain.html", function(req, res){
  res.render("login", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
});

// app.get("/*", function(req, res){
//   res.sendFile(__dirname + "/404.html")
// });

app.post("/editUser", function(req, res){
  console.log(req.body.userEditEmail);
  console.log(req.body.vote);

  if(req.body.vote === "Edit"){
    res.sendFile(__dirname + "/edit.html")
  }
  else{
    return null;
  }
});


// Login logic
app.post("/home", function(req, res){
  var emailAddress = req.body.emailID.trim();
  var password = req.body.passWORD;

  if (emailAddress === "admin@admin.com" && password == "admin") {
    console.log("Admin Success");
    isLoggedIn = true ;
    Item.find({}, function(err, foundItems){
      res.render("adminview", {newListItems: foundItems});
    });
  }
  else if (validator.validate(emailAddress))  {
    Item.findOne({EmailID: emailAddress}, function (err, docs) {
      if (docs === null) {  // can't find email in the DB
        console.log("Email not existed")
        res.render("login", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
      }
      else {
        if(emailAddress === docs.EmailID && hash(password, docs.Salt) === docs.Password) {  // login sucessfully
          currentUser = docs.FirstName;
          console.log("Ah shit, here we go again11");
          res.redirect("dashboard");
          isLoggedIn = true ;
          //   Activity.find({}, function(err, foundItems){
          //   res.render("home", {MyName: currentUser, newListItems: foundItems});
          // });
          console.log("ttt");
        }
        else {  // user input password doesn't match password in DB
          console.log("ppp");
          console.log("Wrong password");
          res.render("login", {inputcolor: "red", FirstLine: "Wrong Password", SecondLine:"Try Again!"});
        }
      }
    });
  }
  else  {
    console.log("kkk");
    console.log("Wrong email format");
    res.render("login", {inputcolor: "red", FirstLine: "Wrong email format", SecondLine:"Try Again!"});
  }
});

app.get("/dashboard", function(req, res){

  console.log("whereee");
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
});
// app.get("/dashboard.html", (req, res)=>{
//   console.log("Ah shit, here we go again");
//     Activity.find({}, function(err, foundItems){
//     res.render("home", {MyName: currentUser, newListItems: foundItems});
//   });
// });

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is running.");
});
