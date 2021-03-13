const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
  extended:true
}));

app.get("/", function(req, res) {

  res.sendFile(__dirname + "/index.html")

});

app.get("/login.html", function(req, res){
  res.sendFile(__dirname+"/login.html")
});

app.get("/index.html", function(req, res){
  res.sendFile(__dirname + "/index.html")
});

app.get("/home.html", function(req, res){
  res.sendFile(__dirname + "/home.html");
});

app.get("/tryagain.html", function(req, res){
  res.sendFile(__dirname + "/tryagain.html")
});


app.post("/", function(req, res){
  const emailAddress = req.body.emailID;
  const password = req.body.passWORD;
  if(emailAddress === "pruthvi@gmail.com" && password === "pass"){
    console.log("Success!");
    res.redirect('home.html');
  }
  else {
    console.log("Wrong Credentials");
    res.redirect('tryagain.html');
  }

});

app.listen(3000, function(){
  console.log("Server is running at port 3000.");
});
