const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs  = require("fs");
const ejs = require("ejs");
var _ = require('lodash');
const crypto = require('crypto');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//variables start

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
let composeposts = [];
let temperature;
let weatherDescription;

//variable ending

function generateUserID(name, password, email) {
  const data = name + password + email;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const userID = hash.substring(0, 10); // Extract a substring of the hash as the user ID
  return userID;
}

app.get("/", (req, res) => {
  res.redirect("/signin");
});

//sign in  a user
app.get("/signin", (req, res) => {
  res.render("signin", {message : " "});
});

app.post("/signin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userdata_  = fs.readFileSync('users.json', 'utf8');
  const userdata = JSON.parse(userdata_);
  if (userdata.hasOwnProperty(email)) {
    if(userdata[email].password===password){
      res.redirect("/user");
    }else{
      res.render("signin",{message: "Password is incorrect"});
    }
  }else{
      res.render("signin",{message: "No account available for this email"});
  }
  const statusCode = res.statusCode;
  if(statusCode===200){
    res.render("failure",{message: "Failed To SIGN IN",log:"signin"});
  }
});

// sign up user
app.get("/signup",(req,res)=>{
  res.render("signup", {text : " "});
});

app.post("/signup",(req,res)=>{
  const userdata_  = fs.readFileSync('users.json', 'utf8');
  const userdata = JSON.parse(userdata_);
  const fullName = req.body.fname;
  const password = req.body.password;
  const email = req.body.email;

  if (userdata.hasOwnProperty(email)) {
    res.render("signup", {text : "The account with this email alredy exists. please sign in."});
  }else{
    userid  = generateUserID(fullName, password, email);
    console.log(userid);
    const data = {
      userid: userid,
      Fullname: fullName,
      password: password,
    };
    userdata[email] = data;
    const updatedData = JSON.stringify(userdata);
    fs.writeFileSync('users.json', updatedData, 'utf8');
    res.render("signup", {text : "Account Created sucessfully. please go to sign page"});
  }
  if(res.statusCode === 200){
    res.render("failure",{message: "Failed To SIGN UP",log:"signup"});
  }
});

app.get("/user",(req, res)=>{
  // featch details of user by id
  // in composeposts data is store from document
  res.render("home", { StartingContent: homeStartingContent, posts: composeposts,temperature,weatherDescription,});
});

app.get("/user/about",(req, res) => {
  res.render("about",{aboutContent:aboutContent,temperature,weatherDescription,});
});

app.get("/user/contact",(req, res) => {
  res.render("contact",{contactContent:contactContent,temperature,weatherDescription,});
});

app.get("/user/compose",(req, res) => {
    res.render("compose",{temperature,weatherDescription,});
});

app.get("/post/:id",(req, res) => {
    const reqid =_.lowerCase(req.params.id);
    composeposts.forEach((item) => {
      const store = _.lowerCase(item.title);
      if(store === reqid){
        res.render("post",{Post_item: item,temperature,weatherDescription,});
      }
    });
});

app.post("/user/compose",(req, res) => {
  const post = {title:req.body.title,
    content:req.body.postbody};
  composeposts.push(post);
  res.redirect("/user");
});

app.get("/location", (req, res) => {
  const latitude = req.query.lat;
  const longitude = req.query.lon;
  const apiKey = "6cd17e2dcb8565a06387550d0f7884ae";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      temperature = data.main.temp;
      weatherDescription = data.weather[0].description;
      res.redirect("/");
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to fetch weather data" });
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
