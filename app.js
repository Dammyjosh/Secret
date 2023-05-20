//jshint esversion:6


require("dotenv").config();


const mongoose = require("mongoose");
 
//connect to MongoDB by specifying port to access MongoDB server
main().catch((err) => console.log(err));
 
async function main() {
  mongoose.set("strictQuery", false);
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
}
 


const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const findOrCreate = require("mongoose-findorcreate")

const app = express()


app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))


app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session())

async function main() {
  mongoose.set("strictQuery", false);
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
}
 


 const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
 });

 userSchema.plugin(passportLocalMongoose)
  userSchema.plugin(findOrCreate)

  const User = new mongoose.model("User", userSchema);   

   passport.use(User.createStrategy());

  

    passport.serializeUser(function(user, done) {
    done(null, user.id);
   });
 
   passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
  });
  
	passport.use(new GoogleStrategy({
    
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secret"
  },
  
  function(request, accessToken, refreshToken, profile, done) {
   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
 ));
    


  app.get("/", function(req, res){
  res.render("home")
  })



   app.get("/auth/google", 
   passport.authenticate("google", { scope: ["profile"] }));
 
   app.get("/auth/google/secret", 
   passport.authenticate("google", { failureRedirect: "/login" }),
   function(req, res) {
    res.redirect("/secrets");
   });

   app.get("/login", function(req, res){
   res.render("login")
   })


  app.get("/register", function(req, res){
	res.render("register")
  })


  app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}) .then (function(foundUsers){
    
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
      else {
          console.log(err)
          }
  });
});
   



   app.get("/submit", function (req, res) {
   if (req.isAuthenticated()) {
    res.render("submit");
   } else {
    res.redirect("/login");
  }
   });

   app.post("/submit", (req, res)=>{  
   
    User.findById(req.user)   
    .then (function(foundUser){
       if (foundUser) {
        foundUser.secret = req.body.secret;
        foundUser.save()
        .then(()=> {
		res.redirect("/secrets");
        });
      } else {
        if (err)
      {console.log(err)}
      }
  });
  });


     
  // app.post("/submit", function (req, res) {
  //   console.log(req.user.id);
  //   User.findById(req.user.id, function (foundUser) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       if (foundUser) {
  //         foundUser.secret = req.body.secret;
  //         foundUser.save(function () {
  //           res.redirect("/secrets");
  //         });
  //       }
  //     }
  //   });
  // });



  
 
app.post("/login",passport.authenticate("local",{
  successRedirect: "/secrets",
  failureRedirect: "/login"
 }), (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});
 
	req.login(user, (err) => {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function() {
				res.redirect("/secrets");
			});
		}
	});
});



   app.get("/logout", (req, res) => {
	req.logout(function(err) {
		if (err) {
			return (err);
		}
		res.redirect('/');
	});
   });

   

  app.listen(3000, function(){
	console.log("Server started on port 3000.")
 })




