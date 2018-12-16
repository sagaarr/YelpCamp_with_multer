var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
// ==========================================================
// COMMENT ROUTES 
// ==========================================================
router.get("/campgrounds/:id/comments/new",middleware.isloggedIn, function(req, res){
    //find a campground by Id 
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground:campground});
        }
    });
    
});

router.post("/campgrounds/:id/comments",middleware.isloggedIn, function(req, res){
    // look up campground using id
    Campground.findById(req.params.id , function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment , function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    // ADD A USER NAME ANE ID TO THE COMMENT
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // SAVE COMMENT
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    console.log(comment);
                    res.redirect("/campgrounds/" + campground._id );
                }
            });
        }
    });
    // create a new comment
    // connect new comment to campground
    // redirect campground to show page
    
});


// EDIT ROUTE FOR COMMENTS 
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkAuthorityOfUser, function(req, res){
    Comment.findById(req.params.comment_id, function(err , foundComment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit", {campground_id: req.params.id, foundComment:foundComment});
        }
    });
    
});

router.put("/campgrounds/:id/comments/:comment_id",middleware.checkAuthorityOfUser, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id , req.body.comment , function(err , updatedComment){
        if(err){
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkAuthorityOfUser, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id , function(err){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});




module.exports = router;
