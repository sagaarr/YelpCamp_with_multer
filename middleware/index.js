// All the middleware Goes Here !!!!
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");


var middlewareObj = {};

middlewareObj.checkCampgroundOwnerShip = function(req, res, next){
     if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err , foundCampground){
                // does user own the campground ? otherwise , redirect
                if(err){
                    console.log(err);
                } else{
                    if(foundCampground.author.id.equals(req.user._id)) {
                         next();
                    } else{
                        res.redirect("back");
                    }
                   
                }
            });
    }else{
        res.redirect("back");
    }
};

    

middlewareObj.checkAuthorityOfUser = function(req, res, next){
     if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err , foundComment){
                console.log("FOUND ID IS HERE >>>>>>>" + foundComment.author.id);
                console.log(req.user._id);
                // does user own the comment? 
                if(err){
                    console.log(err);
                } else{
                    if(foundComment.author.id.equals(req.user._id)) {
                         next();
                    } else{
                        res.redirect("back");
                    }
                   
                }
            });
    }else{
        res.redirect("back");
    }
};


middlewareObj.isloggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error" , "Please Login First!!");
    res.redirect("/login");
};



module.exports = middlewareObj;