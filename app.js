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

//schema of users
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

//schema of activities
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

// populate activity database
// const act1 = new Activity({
//   Name: "Coachella Valley Music and Arts Festival",
//   ServiceProvider: "Goldenvoice",
//   Description: "Music festival for EDM fans",
//   Rating: "5/5",
//   StartDate: "April 9, 2021",
//   EndDate: "April 11, 2021",
//   Image: "https://s.abcnews.com/images/Entertainment/coachella-2017-02-gty-jc-180411_hpMain_16x9_992.jpg",
//   Venue: "Empire Polo Club",
//   Longitude: "-121.879898",
//   Latitude: "37.346792",
// });

// const act2 = new Activity({
//   Name: "San Jose Sharks Hockey Game",
//   ServiceProvider: "San Jose Sharks",
//   Description: "Sharks vs. Goldfishes",
//   Rating: "N/A",
//   StartDate: "6:00pm April 9, 2021",
//   EndDate: "10:00pm April 9, 2021",
//   Image: "https://cms.nhl.bamgrid.com/images/photos/295351474/1024x576/cut.jpg",
//   Venue: "SAP Center",
//   Longitude: "-121.901560",
//   Latitude: "37.332542",
// });

// const act3 = new Activity({
//   Name: "Marathon for Cancer Awareness",
//   ServiceProvider: "City of San Jose",
//   Description: "Raising awareness and charity for cancer research organizations",
//   Rating: "5/5",
//   StartDate: "10am February 15, 2021",
//   EndDate: "5pm February 20, 2021",
//   Image: "https://rnr.wtc-cms.com/-/media/RnR/Images/Events/San-Jose/rnr-san-jose-event-list.jpg",
//   Venue: "San Jose Downtown",
//   Longitude: "-121.892083",
//   Latitude: "37.327716",
// });

// const act4 = new Activity({
//   Name: "The Tech Interactive Tour for Kids",
//   ServiceProvider: "City of San Jose",
//   Description: "Shark vs. Tuna",
//   Rating: "4/5",
//   StartDate: "9am June 27, 2021",
//   EndDate: "5pm June 27, 2021",
//   Image: "https://www.thetech.org/sites/default/files/plan_vist_part_1/2.2%20Exhibits/2.2.5%20Exploration%20Gallery/DM_111130-169.jpg",
//   Venue: "The Tech Interactive",
//   Longitude: "-121.890565",
//   Latitude: "37.331840",
// });

// const act5 = new Activity({
//   Name: "San Jose Garlic Fair",
//   ServiceProvider: "San Jose Vegetable Association",
//   Description: "This 3-day event will introduce you with all kinds of garlic our wonderful country can offer",
//   Rating: "3/5",
//   StartDate: "May 29, 2021",
//   EndDate: "May 31, 2021",
//   Image: "https://i.pinimg.com/originals/32/71/f6/3271f617fdd61811630d42523c28378e.png",
//   Venue: "Heritage Rose Garden",
//   Longitude: "-121.907294",
//   Latitude: "37.343745",
// });

// const act6 = new Activity({
//   Name: "Public Movie Night",
//   ServiceProvider: "Tinder",
//   Description: "Great place for couples to hang out and meet alikes",
//   Rating: "4/5",
//   StartDate: "8:00pm August 2, 2021",
//   EndDate: "12:00am August 3, 2021",
//   Image: "https://www.budgetdateideas.com/wp-content/uploads/2019/05/raleigh-outdoor-movie-theater-1024x768.jpg",
//   Venue: "Sunken Garden Golf Course",
//   Longitude: "-122.010908",
//   Latitude: "37.355101",
// });

// const act7 = new Activity({
//   Name: "Date Cookout",
//   ServiceProvider: "Gordon Ramsey",
//   Description: "Learn how to cook delicious meals with your date and other couples",
//   Rating: "5/5",
//   StartDate: "July 18 6:00pm",
//   EndDate: "July 18 9:00pm",
//   Image: "https://www.reviewjournal.com/wp-content/uploads/2018/08/10916530_web1_HELLSKITCHEN_071718ev_009.jpg",
//   Venue: "Hell's Kitchen",
//   Longitude: "-122.008808",
//   Latitude: "37.334957",
// });

// const act8 = new Activity({
//   Name: "Corgi Meetup",
//   ServiceProvider: "Humane Society Silicon Valley",
//   Description: "Bringing corgi fans together",
//   Rating: "5/5",
//   StartDate: "May 4 1:00pm",
//   EndDate: "May 4 3:00pm",
//   Image: "https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2017/11/14112506/Pembroke-Welsh-Corgi-standing-outdoors-in-the-fall.jpg",
//   Venue: "Penintencia Creek Park",
//   Longitude: "-121.848801",
//   Latitude: "37.390271",
// });

// const act9 = new Activity({
//   Name: "Beach Cleanup",
//   ServiceProvider: "Oceana",
//   Description: "Cleaning trash and waste off our beaches",
//   Rating: "N/A",
//   StartDate: "July 25 7:00am",
//   EndDate: "July 25 6:00pm",
//   Image: "https://ih1.redbubble.net/image.1465805474.6430/poster,504x498,f8f8f8-pad,600x600,f8f8f8.jpg",
//   Venue: "Long Beach",
//   Longitude: "-121.952509",
//   Latitude: "37.442339",
// });

// const act10 = new Activity({
//   Name: "Company Hike",
//   ServiceProvider: "PhysX",
//   Description: "Day time walk at a hiking trail",
//   Rating: "5/5",
//   StartDate: "Nov 2 7:00am",
//   EndDate: "Nov 2 5:00pm",
//   Image: "https://i.ytimg.com/vi/QGqJQCvJQ0Q/maxresdefault.jpg",
//   Venue: "Alum Rock Park",
//   Longitude: "-121.825339",
//   Latitude: "37.395391",
// });


// const defaultActivities = [act1, act2, act3, act4, act5, act6, act7, act8, act9, act10];

// Activity.insertMany(defaultActivities, function(err){
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully saved default activities to DB.");
//         }
// });

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

app.post("/result", function(req, res){

  //console.log(req.body.City);
  
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
