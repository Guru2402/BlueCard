var express = require("express"),
	bodyParser = require("body-parser"),
	mongoose	= require("mongoose"),
	ejs          = require("ejs"),
    passport    = require("passport"),
    passportLocal = require("passport-local"),
    user           = require("./models/user"),
    expressSession = require("express-session"),
    passportLocalMongoose = require("passport-local-mongoose"),
    x=0;

const fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var app = express();
mongoose.connect('mongodb://localhost/bluecard')

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(require("express-session")({
    secret: "Guru did the app!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next)=>{
   res.locals.currentUser = req.user;
   next();
});


app.get('/bluecard',isLoggedIn,(req,res)=>{
    res.render('bluecard');
})

var markSchema = new mongoose.Schema({
    name:String,
    regNo:Number,
    semester:Number,
    dept:String,
    sub1:Number,
    sub2:Number,
    sub3:Number,
    sub4:Number,
    sub5:Number,
    sub6:Number
});

var marks = mongoose.model('marks',markSchema);

app.post("/mark",(req,res)=>{
    
    var name=req.body.name,
        regNo=req.body.regNo,
        semester=req.body.sem,
        dept=req.body.dept,
        sub1=req.body.eceEnglish2 || req.body.eeeEnglish2 || req.body.cseEnglish2 || req.body.aeroEnglish2 || req.body.mechEnglish2,
        sub2=req.body.eceMaths2 || req.body.eeeMaths2 || req.body.cseMaths2 || req.body.aeroMaths2 || req.body.mechMaths2,
        sub3=req.body.ecePhysics2 || req.body.eeePhysics2 || req.body.csePhysics2 || req.body.aeroPhysics2 || req.body.mechPhysics2,
        sub4=req.body.eceChemistry2 || req.body.eeeChemistry2 || req.body.cseDpsd || req.body.aeroChemistry2 || req.body.mechChemistry2,
        sub5=req.body.eceCt || req.body.eeeCt || req.body.csePce || req.body.aeroEm || req.body.mechEm,
        sub6=req.body.eceEd || req.body.eeeBcme || req.body.csePuc || req.body.aeroBeee || req.body.mechBeee;
    
    var mark = {
        name:name,
        regNo:regNo, 
        semester:semester,
        dept:dept,
        sub1:sub1,
        sub2:sub2,
        sub3:sub3,
        sub4:sub4,
        sub5:sub5,
        sub6:sub6
    }
    
    console.log(mark);
    marks.create(mark,(err,done)=>{
        if(err){
            console.log(err);
        }else{
            res.send(`<script>alert("Saved")</script>`);
        }
    });
})

app.post('/search',(req,res)=>{
    
    var person = req.body.search;
    
    MongoClient.connect("mongodb://localhost/bluecard", function (err, db) {
    
    db.collection('marks', function (err, collection) {
        
         collection.find().toArray(function(err, items) {
            if(err) throw err;    
             var j =items.length;
             for(var i=0;i<j;i++){
                    if(items[i].regNo == person){
                     var item = items[i];
                     res.render('student',{item:item})
                 }
                 else{  
                     x++;
                     if(x==j){
                     res.send(`<script>alert("Please enter a valid Register number")</script>`);
                    }}
             }
         
         });
        
    });
                
});   
})

app.get("/register",(req, res)=>{
   res.render("register"); 
});

app.post('/register',(req,res)=>{
    var newUser = new user({username: req.body.username});
    user.register(newUser, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res,()=>{
           res.redirect("/bluecard"); 
        });
    });
});
    
app.get('/',(req,res)=>{
  res.render('login')  
})

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/bluecard",
        failureRedirect: "/"
    }),(req, res)=>{
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/')
    }
}
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
})

app.listen(8085,()=>{
    console.log("started");
})