const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();

app.use(bodyParser.json());

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Here we are handling the get request for the products"
    });
});

module.exports = router;


app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

var currentUser;

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/about.html", function(req, res){
  res.sendFile(__dirname + "/about.html");
});

app.post("/result", function(req, res){

  console.log(req.body.City);
  console.log(currentUser);
})

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
});

app.get("/adminview.html", function(req, res){
  res.sendFile(__dirname + "/adminview.html")
});

app.get("/tryagain.html", function(req, res){
  res.sendFile(__dirname + "/tryagain.html")
});


app.post("/", function(req, res){
  const emailAddress = req.body.emailID;
  const password = req.body.passWORD;
  if(emailAddress === "pruthvi@gmail.com" && password === "pass"){
    console.log("Success!");
    currentUser = emailAddress;
    res.redirect('home.html');
  }
  else if (emailAddress === "admin@admin.com" && password == "admin") {
    console.log("Admin Success");
    res.redirect('adminview.html');

  }
  else {
    console.log("Wrong Credentials");
    res.redirect('tryagain.html');
  }

});

app.listen(3000, function(){
  console.log("Server is running at port 3000.");
});
