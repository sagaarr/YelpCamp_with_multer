var express = require("express");
var router = express.Router();
var dotenv = require('dotenv').config();
var Campground = require("../models/campground");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dwdneihli', 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});




//INDEX - show all campgrounds
router.get("/campgrounds", function(req, res){
      console.log(req.user);
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser:req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/campgrounds",middleware.isloggedIn,upload.single('image'), function(req, res) {
        cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          // add cloudinary url for the image to the campground object under image property
          req.body.image = result.secure_url;
          // add image's public_id to campground object
          req.body.imageId = result.public_id;
          var name = req.body.name;
          var image = req.body.image;
          var desc = req.body.description;
          var price = req.body.price;
            // add author to campground
          var author = {
              id: req.user._id,
              username:req.user.username
          };
          var newCampground = {name: name, image: image, description: desc, author:author , price:price };
            // Create a new campground and save to DB
            Campground.create(newCampground, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    //redirect back to campgrounds page
                    console.log(newlyCreated);
                    res.redirect("/campgrounds");
                }
            });
    
        });
    });

    
//NEW - show form to create new campground
router.get("/campgrounds/new",middleware.isloggedIn, function(req, res){
    res.render("campgrounds/new"); 
 });


// SHOW - shows more info about one campground
router.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            console.log(foundCampground);
            res.render("campgrounds/show", {foundCampground: foundCampground});
        }
    });
});


// EDIT CAMPGROUND ROUTE 
router.get("/campgrounds/:id/edit" ,middleware.checkCampgroundOwnerShip, function(req, res){
        Campground.findById(req.params.id, function(err , foundCampground){
                res.render("campgrounds/edit", {foundCampground: foundCampground});
    });
    
});
// UPDATE CAMPGROUND ROUTE 
router.put("/campgrounds/:id", upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});


router.delete('/:id', function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
      if(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      try {
          await cloudinary.v2.uploader.destroy(campground.imageId);
          campground.remove();
          req.flash('success', 'Campground deleted successfully!');
          res.redirect('/campgrounds');
      } catch(err) {
          if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
      }
    });
  });



module.exports = router;