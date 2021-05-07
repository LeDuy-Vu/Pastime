// CODE TO PUSH AN ACTIVITY DOCUMENT TO MONGODB (MAINTAINING PURPOSE)
// const Activity = mongoose.model("Activity", activitiesSchema);
// const activity1 = new Activity({
//      Name: "Camping",
//      ServiceProvider: "Goldenvoice",
//      Description: "Multi day outdoor experience with a music festival",
//      Rating: "5/5",
//      Date: "04/09/2021",
//      Time: "12:00 pm",
//      Image: "https://s.abcnews.com/images/Entertainment/coachella-2017-02-gty-jc-18...",
//      Venue: "Empire Polo Club",
//      Longitude: "-121.879898",
//      Latitude: "37.346792",
//      Price: 100,
//      Tags: ["camping", "outdoors", "nature", "physical"]
// });
//
// const defaultActivities = [activity1];
//
// Activity.insertMany(defaultItems, function(err){
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Successfully savevd default items to DB.");
//         }
// });




// TEST USER SCHEMA AND HASHING

/**
 * Generates random hex string of length 16 as salt
 * @function
 */
 var getSalt = function(){
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


const crypto = require('crypto');
const { result } = require('lodash');
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://pruthvi:cs160team3@cluster0.h0d8v.mongodb.net/myFirstDatabase?retryWrites=true", {useNewUrlParser: true, useUnifiedTopology: true});

const testusersSchema = {
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
const Test = mongoose.model("Test", testusersSchema);

// test1
salt1 = getSalt()
pass1 = "test2"
number1 = "1234123456785678"
cvc1 = "123"
const testUser1 = new Test({
    FirstName: "Pruthvi",
    LastName: "Punwar",
    EmailID: "punwar@gmail.com",
    Salt: salt1,
    Password: hash(pass1, salt1),
    Street: "2327 Lskm",
    City: "San Jose",
    State: "CA",
    ZipCode: "95138",
    CredCardName: "Pruthvi Punwar",
    CredCardNumb: hash(number1, salt1),
    Last4Digits: "5678",
    CVC: hash(cvc1, salt1),
    Expiry: "01/23",
    Points: 420,
    isLocked: false
});

// test2
salt2 = getSalt()
pass2 = "cuccu123"
number2 = "1111111111111111"
cvc2 = "456"
const testUser2 = new Test({
    FirstName: "Le Duy",
    LastName: "Vu",
    EmailID: "vlduy2112@gmail.com",
    Salt: salt2,
    Password: hash(pass2, salt2),
    Street: "1 Washington Square",
    City: "San Jose",
    State: "CA",
    ZipCode: "95616",
    CredCardName: "Le Duy Vu",
    CredCardNumb: hash(number2, salt2),
    Last4Digits: "1111",
    CVC: hash(cvc2, salt2),
    Expiry: "06/22",
    Points: 69,
    isLocked: false
});

// test3
salt3 = getSalt()
pass3 = "test"
number3 = "1234567887654321"
cvc3 = "999"
const testUser3 = new Test({
    FirstName: "Peter",
    LastName: "Parker",
    EmailID: "parker@gmail.com",
    Salt: salt3,
    Password: hash(pass3, salt3),
    Street: "2328 mIink nm",
    City: "San Jose",
    State: "CA",
    ZipCode: "91107",
    CredCardName: "Peter Parker",
    CredCardNumb: hash(number3, salt3),
    Last4Digits: "4321",
    CVC: hash(cvc3, salt3),
    Expiry: "12/22",
    Points: 0,
    isLocked: false
});

// test4
salt4 = getSalt()
pass4 = "1234"
number4 = "9999999999999999"
cvc4 = "789"
const testUser4 = new Test({
    FirstName: "Rishab",
    LastName: "Pandit",
    EmailID: "rpandit@cpp.edu",
    Salt: salt4,
    Password: hash(pass4, salt4),
    Street: "2870 E Colorado Blvd",
    City: "San Jose",
    State: "CA",
    ZipCode: "91123",
    CredCardName: "Rishab Pandit",
    CredCardNumb: hash(number4, salt4),
    Last4Digits: "9999",
    CVC: hash(cvc4, salt4),
    Expiry: "08/25",
    Points: 100,
    isLocked: false
});

const testCases = [testUser5];

Test.insertMany(testCases, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
});

// Test cases
// var test1 = "123"
// console.log("Original: " + test1)
// var salt = getSalt()
// console.log("Salt used: " + salt)
// var res = hash(test1, salt)
// console.log("Hashed: " + res)
// if (hash(test1, salt) === res)
//     console.log("True")
// console.log("Login:  " + hash(test1, salt))