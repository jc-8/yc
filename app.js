var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    dotenv          = require("dotenv"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverrride = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds")

//require routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")



//add environment variables, so the app connects to our local db
//or to atlas mongodb (cloud) accordingly to where it is run
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true});

//local mongodb
// mongoose.connect("mongodb://localhost/yelp_camp_v11", {useNewUrlParser: true, useUnifiedTopology: true});

//hide mongodb link with user and pass in a .env file and refer to it
// dotenv.config();
// var mongodburl = process.env.MONGODBLINK;

//cloud mongodb atlas
// mongoose.connect(mongodburl, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// }).then (() => {
//     console.log("Connected to DB");
// }).catch(err => {
//     console.log("Error", err.message);
// });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverrride("_method"));
app.use(flash());

//seed DB data (for test purposes):
// seedDB();

//Passport configuration
app.use(require("express-session")({
    secret: "Luigi the dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//instead of overfilling this app.js, we transfer the different groups of routes
//to separate files. We can also shorten the route paths within each file,
//by indicating the common path bellow: eg. intead of "/campgrounds/new" we
//just write "/new" because "/campgrounds" is already written bellow in the
//campgroundRoutes (the file routes/campground.js)
//check also the top of the comments.js (there is an object we pass at the top)
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("The YelpCamp server has started"); 
});