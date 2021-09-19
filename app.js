//jshint esversion:6
require('dotenv').config();
const express =require("express");
const ejs=require("ejs");
const mongoose=require("mongoose");
const multer=require("multer");//read after line 32
// const htmlPdf=require("html-pdf");
const bodyParser=require("body-parser");
//using passport for creating session and cookies
const passport=require("passport");
const session=require("express-session"); //refer line 32
const passportLocalMongoose=require("passport-local-mongoose");//refer line 65
//for authentiatio using google
const GoogleStrategy = require('passport-google-oauth2').Strategy;//requiring postman Oauth
const findOrCreate=require('mongoose-findorcreate');
//for pdf making
const fs=require("fs");
const path=require("path");
//for api calls
const https=require("https");
const flash= require("connect-flash");
// 
const app=express();
app.set('view engine','ejs'); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
                  // ****************************creating session***********************************
app.use(session({
    secret:"anyString",
    cookie:{maxAge:60000},//max age is the time for which cookie will be active on browser
    resave:false,//session will be light 
    saveUninitialized:false//wont save unmodified data
})); 
app.use(flash());
app.use(passport.initialize());
mongoose.connect("mongodb+srv://admin-sas:K4VGL2A_r6zt2bE@homepagecluster0.76qlc.mongodb.net/formDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
// ...............schema..........
const dataSchema= new mongoose.Schema({
    username:String,
    completeName:String,
    adharNumber:Number,
    email:String,
    adress:String,
    contact:Number,
    password:String,
    img:String,
    googleId:String
});
dataSchema.plugin(passportLocalMongoose);
dataSchema.plugin(findOrCreate);
const form= mongoose.model("Form",dataSchema);
passport.use(form.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    form.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new GoogleStrategy({
    // clientID:    config.CLIENT_ID,
    clientID:    process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/oauth/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    form.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
var storageInServer=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/foldername/")//imp
    },
    filename :(req,file,cb)=>{
        cb(null,file.fieldname+"---"+Date.now()+path.extname(file.originalname));
    }
});
                    //   middleware start
var upload=multer({storage:storageInServer,
   //to vallidate which type of files can be uploaded
    fileFilter:(req,file,cb)=>{
        if(file.mimetype=="image/png"||file.mimetype=="image/jpeg"|| file.mimetype=="image/jpg"){
cb(null,true);
        }else{
cb(null,false);
return cb( new Error("only png,jpeg,jpg files expected"));//inbuilt functionalites to return an message
        }
    },
    limits:{
        files:2,//allows 2 files to upload per client request
    fieldSize:2*1024*1024//this is 2 MB
    }
}).single("userimage");  
//middle ware ends
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile","email"] })
);
app.get("/google/oauth/callback",
  passport.authenticate('google', { failureRedirect: "/loginpage" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    const gid=req.user.googleId;
    console.log(gid);
  
    res.render("createaccountpage",{dn:gid});
    // res.redirect("/");
    
    });
  
app.get("/",(req,res)=>{
    res.render("loginpage",{message:req.flash('anyNameAsKey')});
});
app.post("/",upload,(req,res)=>{
 const name= req.body.name;
 const userImage= req.file.filename;//.file because its  ot a text feild also userimage is the name we gave to the file but the miidleware stoes it as filenameto have betterhold on filname ingredients
 const username= req.body.username;
 const adhar= req.body.adhar;
 const contact= req.body.contact;
 const password= req.body.password;
 const email= req.body.email;
 const address= req.body.address;
 const googleid=req.body.googleidd;
 console.log(googleid);
 form.updateMany({googleId:googleid},{img:userImage,username:username,completeName:name,adharNumber:adhar,email:email,adress:address,contact:contact,password:password},(err,result)=>{
  if(err)
  {console.log(err);}
  else{
console.log("sucessfully added to existing db");
  }
  form.findOne({googleId:googleid},(err,result)=>{
      if(err)
      {console.log(err);}
      else{
      res.render("profile",{address:result.adress,id:result._id,adhar:result.adharNumber,image:result.img,username:result.username,name:result.completeName,email:result.email,contact:result.contact,password:result.password});
      }
  });
});
});
app.post("/logindata",(req,res)=>{
   var username=req.body.usernames;
var password=req.body.passwords;
form.findOne({username:username},(err,result)=>{
    if(err)
    {console.log(err);}
    else{
        if(!result){
          req.flash('anyNameAsKey','no such user found')
          res.redirect("/");
        }else
        if(result.password.localeCompare(password)==0){
            res.render("profile",{address:result.adress,id:result._id,adhar:result.adharNumber,image:result.img,username:result.username,name:result.completeName,email:result.email,contact:result.contact,password:result.password});
        }
            else{
                res.status(409).send("Incoorect username or password");
            }
    }
});
    });
// app.post("/logout",(req,res)=>{
//     req.logout();
//     res.redirect("/loginpage");
// });
app.post("/formchanges",(req,res)=>{
 const  newname= req.body.username;
 const  newusername= req.body.userusername;
 const  newadhar= req.body.useradhar;
 const  newcontact= req.body.usercontact;
 const  newpassword= req.body.userpassword;
 const  newemail= req.body.useremail;
//  const newimg=req.body.userimg;
 const  newid=req.body.userid;
 const newaddress=req.body.useraddress;
 const googleid=req.body.googleidd;
form.updateMany({_id:newid},{username:newusername,completeName:newname,adharNumber:newadhar,email:newemail,adress:newaddress,contact:newcontact,password:newpassword},(err,result)=>{
    if(err)
    {console.log(err);}
    else{
console.log("sucessfully updated");
    }
    form.findOne({_id:newid},(err,result)=>{
        if(err)
        {console.log(err);}
        else{
        res.render("profile",{address:result.adress,id:result._id,adhar:result.adharNumber,image:result.img,username:result.username,name:result.completeName,email:result.email,contact:result.contact,password:result.password});
        }
    });
});
});
// API related code
// let port = process.env.Port;
// if(port==null || port=="")
// {
//   port=3000;
// }
app.listen(process.env.PORT||"3000",()=>{
    console.log("running  ");
}); 