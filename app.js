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
var getSalt = function()
{
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
        message: "Here we are handeling the get request for the products"
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
var isAdminLoggedIn = false;
var isServiceLoggedIn = false;

const serviceProvidersSchema = {
  Name: String,
  Email: String,
  Salt: String,
  Password: String,
  isLocked: Boolean
}

// User schema
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
global.currentEmail = "global" ;

var currentServiceProvider = "";

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

const ServiceProvider = mongoose.model("ServiceProvider", serviceProvidersSchema);

const Activity = mongoose.model("Activity", activitiesSchema);

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

//Searching User in AdminView
app.get("/searchUser", function(req, res){
  if(isAdminLoggedIn){
  const{ sUser} = req.query;
  Item.find({EmailID: sUser}, function(err, foundItems){
    res.render("adminview", {newListItems: foundItems});
  });
}
else{
  res.redirect("pleaselogin");
}

});

// Search bar logic for regular users
app.get("/searchActivity", function(req, res){
  const { activityTag } = req.query;
  if (activityTag === "")
  {
    if(!isLoggedIn){
      Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: "guest", newListItems: foundItems});
      });
    }else{
      Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }

  }
  else
  {
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
        res.render("home", {MyName: "guest", newListItems: foundItems});
      });
    }
  }
});

// search bar logic for service providers
app.get("/searchActivityService", function(req, res){
  const { activityTag } = req.query;
  if(activityTag === "")
  {
    Activity.find({ServiceProvider: currentServiceProvider}, function(err, foundItems){
      ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
        res.render("servicehome", {color1: "red", alert: "No activities are found. Try another activity tag.",MyName: docs.Name, newListItems: foundItems});
      });
    });
  }
  else
  {
    var searchAct = activityTag.split(", ");
    for (let i = 0; i < searchAct.length; i++) {
      searchAct[i] = searchAct[i].toLowerCase();
    }
    if(isLoggedIn){
      Activity.find({$and: [{ServiceProvider: currentServiceProvider}, {"Tags": { $in: searchAct }}]}, function(err, foundItems){
        ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
          res.render("servicehome", {color1: "",alert: "",MyName: docs.Name, newListItems: foundItems});
        });
      });
    }
    else{
      Activity.find({$and: [{ServiceProvider: currentServiceProvider}, {"Tags": { $in: searchAct }}]}, function(err, foundItems){
        ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
          res.render("servicehome", {color1: "",alert: "",MyName: docs.Name, newListItems: foundItems});
        });
      });
    }
  }
});


// To Edit Activites by the Service Provider
app.get("/EditActivities/:id", function(req, res){
  var temp = req.params.id.slice(0, req.params.id.length);

  Activity.findOne({Name: temp}, function(err, docs){
    if(docs === null){
      console.log(err);
    }
      else {
    res.render("editActivityTemplate", {item: docs});
  }
  });
});

// To delete Activities from Wallet by the user
app.get("/DeleteActivities/:id", function(req, res)
{
  Item.findOne({EmailID: currentEmail}, function(err, docs)
  {
    if (docs === null)
    {
      Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }

    else {
      Wallet.findOneAndUpdate({emailID: docs.EmailID},{$pull: {currentActivity: req.params.id}}, function(err, document){
      // Activity.find({}, function(err, foundItems){
      //   res.render("home", {MyName: currentUser, newListItems: foundItems});
      // });
      res.redirect("../dashboard")
    });
    }

});
});

app.post("/CheckOut", function(req, res){
  var newPoints = req.body.TotalPoints - req.body.TotalPrice;

  Item.findOneAndUpdate({FirstName: currentUser}, {$set: {Points: newPoints}},function(err, docs){
    if (docs === null) {
        console.log(currentUser);
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }
      else {
        Wallet.findOne({emailID: docs.EmailID}, function(err, document){
          if(docs === null)
            console.log("IN NULL");
          else{
            document.currentActivity.forEach(function(item, index, array){
              Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$push: {completedActivity: item}}, function (error, success) {
                if(error)
                  console.log(error);
                else
                  console.log("Added to DB");
                });
            });
          }
        });
        Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$set: {currentActivity: []}}, function(error, success){
          if(error)
            console.log(error);
          else
            console.log("Added to DB");
        });
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }

  });
});

app.get("/points.html", function(req, res){
  if(!isLoggedIn){
      res.redirect("../pleaselogin");
  }
  else {
    Item.findOne({FirstName: currentUser}, function(err, docs){
      if(docs == null)
        console.log(err);
      else{
        res.render("point", {TotalPoints: docs.Points, FName: docs.FirstName, LName: docs.LastName, Address: docs.Street, City: docs.City, State: docs.State, Zipc: docs.ZipCode, CCNum: docs.CredCardNumb, CCccv: docs.CVC, CCExp:""});
      }


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
  else {
    res.redirect("../pleaselogin");
  }

});

app.post("/afterEditActivity", function(req, res)
{
    if(req.body.vote === "Done")
    {
      console.log(req.body.EditedName);
      Activity.findOneAndUpdate({Name: req.body.EditedName}, {$set:{Description: req.body.EditedDescription, Date: req.body.EditedDate, Time: req.body.EditedTime, Image: req.body.EditedImage, Venue: req.body.EditedVenue, Longitude: req.body.EditedLongitude, Latitude: req.body.EditedLatitude, Price: req.body.EditedPrice}}, function(err, docs){
    if(err)
      console.log(err);
  });
}
else {
  Activity.findOneAndDelete({Name: req.body.EditedName}, function(err, docs1){
    if(err)
      console.log(err);
  });
}
  res.redirect("serviceDashboard2");
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

  Item.findOne({EmailID: currentEmail}, function (err, docs){
    if (docs === null) {
      console.log("in null");
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
    }
    else {
      Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$push: {currentActivity: req.body.ActivityToAdd}}, function (error, success) {
        if(error) {
            console.log(error);
        } else {
          console.log("Added to DB");
          console.log(success);
        }

      });
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
    }

  });
});

app.get("/servicel", function(req, res){
  res.render("servicelogin", {inputcolor: "black", FirstLine: "Service Provider", SecondLine:""});
});

app.get("/servicesp", function(req, res){
  res.render("servicesignup",{inputcolor: "black", FirstLine: "Welcome, Service Provider!", SecondLine:""});
});

// Logic to sign up new service provider account
app.post("/serviceSignUp", function(req, res)
{
  email = req.body.spEmail.trim();  // trim whitespaces
  if (validator.validate(email))  // validate email
  {
    ServiceProvider.findOne({Email: email}, function(err, docs)
    {
      if(docs === null) // if fresh aka valid email to sign up
      {
        salt = getSalt();
        const temp = new ServiceProvider
        ({
          Name: req.body.spName.trim(),
          Email: email,
          Salt: salt,
          Password: hash(req.body.spPassword, salt),
          isLocked: false
        });

        ServiceProvider.insertMany(temp, function(err){
          if(err)
            console.log(err);
        });
        res.redirect("servicel");
      }
      else
      {
        // if this email already exists in the DB
        res.render("servicesignup", {inputcolor: "red", FirstLine: "Email already in use", SecondLine:"Try a Different One!"});
      }
    });
  }
  else res.render("servicesignup", {inputcolor: "red", FirstLine: "Invalid email format", SecondLine:"Try Again!"}); // wrong email format
});

// Push the new normal user account into the DB
app.post("/aftersignup",function(req, res){
  email = req.body.Email.trim();     // trim whitespaces
  if (validator.validate(email))    // validate email
  {
    Item.findOne({EmailID:email}, function (err, docs)
    {
      if(docs === null){  // if fresh aka valid email to sign up
        salt = getSalt();

        const temps = new Item({
          FirstName: req.body.FName.trim(),
          LastName: req.body.LName.trim(),
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
        res.redirect("login.html");
        // res.render("signup", {inputcolor: "black", FirstLine: "", SecondLine:""});
      }
      else
      {
        // if this email already exists in the DB
        res.render("signup", {inputcolor: "red", FirstLine: "Email already in use", SecondLine:"Try a Different One!"});
      }
    });
  }
  else res.render("signup", {inputcolor: "red", FirstLine: "Invalid email format", SecondLine:"Try Again!"}); // wrong email format
});

// Change Password logic
app.post("/changePass", function(req, res){

  Item.findOne({EmailID: currentEmail}, function (err, docs){
    if (docs === null) {
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
    }
    else {
      if((docs.Password === hash(req.body.oldPassword, docs.Salt)) && (req.body.newPassword1 === req.body.newPassword2)){
        console.log("some");
        Item.updateOne({EmailID: currentEmail}, {$set:{Password: hash(req.body.newPassword1, docs.Salt)}}, function(err, result){
          if(result === null)
            console.log("can't change password");
          else{
            console.log("Password changed");
          }
        });
      }
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });

    }

  });
});

app.get("/signup.html", function(req, res){
  res.render("signup", {inputcolor: "black", FirstLine: "", SecondLine:""});
});

app.get("/Wallet.html", function(req, res){
  if (isLoggedIn) // if user is logged in
  {
    Item.findOne({EmailID: currentEmail}, function(err, docs){

      if (docs === null) {
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }
      else {
        Wallet.findOne({emailID: docs.EmailID}, function(err, document){
          if(docs === null)
            console.log("EEEEEEEE");
          else{
            Activity.find({Name: {$in: document.currentActivity}}, function(err, docs1){
              if(err)
                console.log(err);
                else{
                  var total = 0;
                  docs1.forEach(function(item){
                    total += item.Price;
                  })
                  var totalP = total.toFixed(0);
                  var discount = totalP - (docs.Points * 0.2);
                  var totalP1 = parseInt(totalP);
                  var totalP3 = parseInt(docs.Points.toFixed(0));

                  res.render("wallets", {numActivity: document.currentActivity.length, newListItems: docs1, TotalPrice: totalP1, TotalPoints: totalP3})
                }
            });
          }
        });
      }

    });
  }
  else {
    res.redirect("pleaselogin");
  }
});

app.get("/pleaselogin", function(req, res){
  res.render("login", {inputcolor: "black", FirstLine: "You need to log in to proceed", SecondLine:""});
});

app.get("/nextstep.html", function(req, res){
  console.log("In nextstep");
});


app.get("/profile", function(req, res){
  if (isLoggedIn) // if user is logged in
  {
    Item.findOne({EmailID: currentEmail}, function (err, docs)
    {
      if (docs === null) {
        Activity.find({}, function(err, foundItems){
        res.render("home", {MyName: currentUser, newListItems: foundItems});
      });
      }
      else{
        res.render("profile", {FName: docs.FirstName, LName: docs.LastName, EID1: docs.EmailID, FAddress: docs.Street, FCity: docs.City, FState: docs.State, fZIP: docs.ZipCode, CreditNum: docs.CredCardNumb, CVCNum: docs.CVC, Fpoints: docs.Points});
      }
    });
  }
  else res.redirect("pleaselogin");
});

app.post("/afterCheckOut", function(req, res){

  var newPoints = req.body.TotalPoints - req.body.TotalPrice;

  Item.findOne({EmailID: currentEmail}, function(err, docs){
    if (docs === null) {
        Activity.find({}, function(err, foundItems){
          res.render("home", {MyName: currentUser, newListItems: foundItems});
        });
      }
      else {
        Item.findOneAndUpdate({EmailID: currentEmail}, {$set: {Points: newPoints}},function(err, docs2){

        });
        Wallet.findOne({emailID: docs.EmailID}, function(err, document){
          if(docs === null)
            console.log("IN NULL");
          else{
            document.currentActivity.forEach(function(item, index, array){
              Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$push: {completedActivity: item}}, function (error, success) {
                if(error)
                  console.log(error);
                else
                  console.log("Added to DB");
                });
            });
          }
        });
        Wallet.findOneAndUpdate({emailID: docs.EmailID}, {$set: {currentActivity: []}}, function(error, success){
          if(error)
            console.log(error);
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
      Item.findOne({EmailID: currentEmail}, function(err, docs){
        if (docs === null) {
          Activity.find({}, function(err, foundItems){
            res.render("home", {MyName: currentUser, newListItems: foundItems});
          });
        }
        else {
          Wallet.findOne({emailID: docs.EmailID}, function(err, document){
            if(document === null)
              console.log("IN NULL");
            else{
              Activity.find({Name: {$in: document.completedActivity}}, function(err, docs1){
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
    else res.redirect("pleaselogin");
});


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html")
});

app.get("/login.html", function(req, res){
  res.render("login", {inputcolor: "black", FirstLine: "", SecondLine:""});
});

app.get("../MainDashBoard", function(req, res){
  Activity.find({}, function(err, foundItems){
  res.render("home", {MyName: currentUser, newListItems: foundItems});
});
});

app.get("/MainDashBoard", function(req, res){

  Activity.find({}, function(err, foundItems){
  res.render("home", {MyName: currentUser, newListItems: foundItems});
});

});



app.get("/mainpage.html", function(req, res){
  Activity.find({}, function(err, foundItems){
  res.render("home", {MyName: "guest", newListItems: foundItems});
});
});

app.get("/index.html", function(req, res){
  res.sendFile(__dirname + "/index.html");
  currentUser = "";
  currentEmail = "" ;
  isLoggedIn = false;
  activityList = [];
  isAdminLoggedIn = false;
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

app.post("/AddPoints", function(req, res){

  Item.findOne({FirstName: currentUser}, function(err, docs1){
    if(err)
      console.log(err);
    else{
      var tp = docs1.Points + parseInt(req.body.PointsToAdd);
      Item.findOneAndUpdate({FirstName: currentUser}, {$set: {Points: tp}}, function(err, docs1){

      });
    }
  });
  res.redirect("dashboard");
});

app.post("/editUser", function(req, res){
  if(isAdminLoggedIn){
  console.log(req.body.userEditEmail);
  console.log(req.body.vote);

  if(req.body.vote === "Edit"){
    res.redirect("editU/?uEmail=" + req.body.userEditEmail);
    // res.sendFile(__dirname + "/edit.html")
  }
  else if(req.body.vote === "Lock"){
    res.redirect("LockUser/?uEmail=" + req.body.userEditEmail)
  }
}
else{
  res.redirect("../pleaselogin");
}
});

app.get("/LockUser", function(req, res){
  if(isAdminLoggedIn){

  Item.findOne({EmailID: req.query.uEmail}, function(err, docs){
    if(docs.isLocked){
      res.render("userUnlock", {UserName: docs.EmailID, todo: "Locked", todo1: "Unlock" });
    }
    else
      res.render("userUnlock", {UserName: docs.EmailID, todo: "Unlocked", todo1: "Lock" });

  });
}
else{
  res.redirect("../pleaselogin");
}
});

  app.get("/UserLocking", function(req, res){
    const{ userEmail1 } = req.query;
    Item.findOne({EmailID: userEmail1}, function(err, docs){
      if(docs.isLocked){
        Item.findOneAndUpdate({EmailID: userEmail1}, {$set: {isLocked: false}}, function(error, success){});
      }
      else{
        Item.findOneAndUpdate({EmailID: userEmail1}, {$set: {isLocked: true}}, function(error, success){});
      }

    });

  Item.find({}, function(err, foundItems){
    res.render("adminview", {newListItems: foundItems});
  });
    });



app.get("/editU", function(req, res){
  if(isAdminLoggedIn){
  Item.findOne({EmailID: req.query.uEmail}, function (err, docs) {
    if (docs === null) {  // can't find email in the DB
      Item.find({}, function(err, foundItems){
        res.render("adminview", {newListItems: foundItems});
      });
    }
    else {
      res.render("userEditTemplate", {item: docs})

    }
  });
}
else{
  res.redirect("pleaselogin");
}
});

// Login logic for service provider
app.post("/serviceHome", function(req, res)
{
  var emailAddress = req.body.serviceEmail.trim();
  var password = req.body.servicePassword;

  if (validator.validate(emailAddress))
  {
    ServiceProvider.findOne({Email: emailAddress}, function(err, docs)
    {
      if (docs === null)  // no account with this email
        res.render("servicelogin", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
      else
      {
        if (emailAddress === docs.Email && hash(password, docs.Salt) === docs.Password)
        {
          if (docs.isLocked)  // if account is locked
          {
            res.redirect("AccountLocked");
          }
          else  // login successfully
          {
            isLoggedIn = true;
            currentServiceProvider = emailAddress;
            res.redirect("serviceDashboard");
          }
        }
        else  // wrong password
        res.render("servicelogin", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
      }
    });
  }
  else res.render("servicelogin", {inputcolor: "red", FirstLine: "Wrong Credentials", SecondLine:"Try Again!"});
});

app.get("/adminDashboard", function(req, res){
  console.log(isAdminLoggedIn);
  if(isAdminLoggedIn){
  Item.find({}, function(err, foundItems){
    res.render("adminview", {newListItems: foundItems});
  });
}
else{
  res.redirect("pleaselogin");
}
});

// Login logic for normal user
app.post("/home", function(req, res){
  var emailAddress = req.body.emailID.trim();
  var password = req.body.passWORD;

  if (emailAddress === "admin@admin.com" && password === "admin") {
    isAdminLoggedIn = true;
    res.redirect("adminDashboard");
  }
  else if (validator.validate(emailAddress))  {
    Item.findOne({EmailID: emailAddress}, function (err, docs) {
      if (docs === null) {  // can't find email in the DB
        console.log("Email not existed") ;
        res.render("login", {inputcolor: "red", FirstLine: "Wrong Username/Password", SecondLine:"Try Again!"});
      }
      else {
        if(emailAddress === docs.EmailID && hash(password, docs.Salt) === docs.Password) {  // login sucessfully
          if(!docs.isLocked){
            currentUser = docs.FirstName;
            currentEmail = docs.EmailID ;
            res.redirect("dashboard");
            isLoggedIn = true ;
          }
        else{
          res.redirect("AccountLocked");
        }
        }
        else  // user input password doesn't match password in DB
          res.render("login", {inputcolor: "red", FirstLine: "Wrong Username/Password", SecondLine:"Try Again!"});
      }
    });
  }
  else res.render("login", {inputcolor: "red", FirstLine: "Wrong email format", SecondLine:"Try Again!"});
});

app.get("/AccountLocked", function(req, res){
  res.render("login", {inputcolor: "red", FirstLine: "Account Locked", SecondLine:"Contact Admin for Clarification"});
});

app.get("/serviceDashboard", function(req, res){
  Activity.find({ServiceProvider: currentServiceProvider}, function(err, foundItems){
    ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
      res.render("servicehome", {color1: "",alert: "", MyName: docs.Name, newListItems: foundItems});
    });
  });
});

app.get("/serviceDashboard1", function(req, res){
  Activity.find({ServiceProvider: currentServiceProvider}, function(err, foundItems){
    ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
      res.render("servicehome", {color1: "",alert: "Activity Added", MyName: docs.Name, newListItems: foundItems});
    });
  });
});

app.get("/serviceDashboard2", function(req, res){
  console.log(currentServiceProvider);
  Activity.find({ServiceProvider: currentServiceProvider}, function(err, foundItems){
    ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
      res.render("servicehome", {color1: "",alert: "Activity Added", MyName: docs.Name, newListItems: foundItems});
    });
  });
});

app.post("/ActivityAdded", function(req, res){

var searchAct = req.body.ActivityTags.split(", ");
for (let i = 0; i < searchAct.length; i++) {
    searchAct[i] = searchAct[i].toLowerCase();
}

console.log("activiti is " + req.body.ActivityName);
  const temps = new Activity({
    Name: req.body.ActivityName,
    ServiceProvider: currentServiceProvider,
    Description: req.body.ActivityDescription,
    Date: req.body.ActivityDate,
    Time: req.body.ActivityTime,
    Image: req.body.ActivityURL,
    Venue: req.body.ActivityVenue,
    Longitude: req.body.ActivityLongitude,
    Latitude: req.body.ActivityLatitude,
    Price: req.body.ActivityPrice,
    Tags: searchAct,
  });
  Activity.find({Name: req.body.ActivityName}, function(err, docss1){
      // if(docss1 === null){
        Activity.insertMany(temps, function(err){
          if (err)
            console.log(err);
          else
            console.log("Successfully saved default items to DB.");
        });

        res.redirect("serviceDashboard1");

      // }
      // else {
      //   console.log(docss1.Name);
      //   res.redirect("ServiceProviderDash");
      // }
  });
});

app.get("/ServiceProviderDash", function(req, res){
  Activity.find({ServiceProvider: currentServiceProvider}, function(err, foundItems){
    ServiceProvider.findOne({Email: currentServiceProvider}, function(err, docs){
      res.render("servicehome", {color1: "", alert: "",MyName: docs.Name, newListItems: foundItems});
    });
  });
});

app.post("/afterUser", function(req, res){
  Item.findOneAndUpdate({EmailID: req.body.EditedEMD},{$set: {FirstName: req.body.EditedFName, LastName: req.body.EditedLName, Street: req.body.EditedFAdress, City: req.body.EditedCity, State: req.body.EditedFState, ZipCode: req.body.EditedFZIP, CredCardNumb: req.body.EditedCreditNum, CVC: req.body.EditedCVC }}, function(err, docs){
    if(err)
      console.log(err);
  });
  res.redirect("dashboard");
});

// update user info from admin change page
app.post("/afterEditUser", function(req, res){
  salt = "" ; // placeholder for user's salt
  Item.findOne({EmailID: req.body.EditedEmail}, function(err, docs){
    salt = docs.Salt ;  // find user's salt
  });

  // update user info
  Item.findOneAndUpdate({EmailID: req.body.EditedEmail},{$set: {FirstName: req.body.EditedFName, LastName: req.body.EditedLName, Password: hash(req.body.EditedPass, salt)}}, function(err, docs){
    if(err)
      console.log(err);
  });

  // redirect to edit user page
  Item.find({}, function(err, foundItems){
    res.render("adminview", {newListItems: foundItems});
  });
});

app.get("/dashboard", function(req, res){
      Activity.find({}, function(err, foundItems){
      res.render("home", {MyName: currentUser, newListItems: foundItems});
    });
});

app.get("/AllUsers", function(req,res){
  if(isAdminLoggedIn){
  Item.find({}, function(err, foundItems){
    res.render("adminview", {newListItems: foundItems});
  });
}
else{
  res.redirect("pleaselogin");
}
});

app.get("/NewActivity", function(req, res){
  res.sendFile(__dirname + "/ActivityInfo.html")
});

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is running.");
});
