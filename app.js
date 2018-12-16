var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground = require("./models/campground"),
    flash       = require("connect-flash"),  
    Comment    = require("./models/comment"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User         = require("./models/user");
    
  
    
    
    
// importing modules from route folder
var indexRoutes = require("./routes/index"),
    campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comment");
     
 

// ===============================================
// PASSPORT CONFIGURATION
// ----------------------------------------------

app.use(require("express-session")({
    secret:"Sagar Chinchorkar",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ===============================================

mongoose.connect('mongodb://localhost:27017/final_version',{useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

// ++++++++++++++++++++++++++++++++++
// costum function for each route it will be called before each route ie; login logout new edit etc 
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");

    next();
});
// ++++++++++++++++++++++++++++++++++


app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);


app.listen(3000 , function(){
   console.log("The YelpCamp Server Has Started!");
});