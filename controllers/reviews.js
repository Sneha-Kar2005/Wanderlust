const Listing = require("../models/listing");
const Review = require("../models/review");


// Function to automatically detect rating from review comment
function getRatingFromComment(comment) {

    const text = comment.toLowerCase().trim();

    // 5 Stars
    const fiveStarWords = [
        "amazing",
        "excellent",
        "awesome",
        "fantastic",
        "wonderful",
        "perfect",
        "best",
        "outstanding",
        "loved",
        "love",
        "superb",
        "great place",
        "highly recommend"
    ];

    // 4 Stars
    const fourStarWords = [
        "good",
        "nice",
        "enjoyed",
        "pleasant",
        "pretty good",
        "really good",
        "very good"
    ];

    // 2 Stars
    const twoStarWords = [
        "not good",
        "not so good",
        "poor",
        "disappointing",
        "disappointed",
        "bad",
        "could be better",
        "not great"
    ];

    // 1 Star
    const oneStarWords = [
        "terrible",
        "horrible",
        "worst",
        "awful",
        "hate",
        "hated",
        "very bad",
        "extremely bad"
    ];


    // Check 1-star words first
    for (let word of oneStarWords) {
        if (text.includes(word)) {
            return 1;
        }
    }


    // Check 2-star words
    for (let word of twoStarWords) {
        if (text.includes(word)) {
            return 2;
        }
    }


    // Check 5-star words
    for (let word of fiveStarWords) {
        if (text.includes(word)) {
            return 5;
        }
    }


    // Check 4-star words
    for (let word of fourStarWords) {
        if (text.includes(word)) {
            return 4;
        }
    }


    // If no keyword is detected, give 3 stars
    return 3;
};


module.exports.createReview = async (req, res) => {

    // Find the listing
    let listing = await Listing.findById(req.params.id);

    // Get review data
    let comment = req.body.review.comment;

    // Get the rating selected from Starability
    let selectedRating = Number(req.body.review.rating);

    // Check whether the user manually selected a star
    let manualRating = req.body.review.manualRating === "true";

    let finalRating;

    if (manualRating) {
        // User manually selected a rating
        finalRating = selectedRating;
    } else {
        // User did not touch the stars
        // Automatically detect rating from comment
        finalRating = getRatingFromComment(comment);
    }


    // Create review
    let newReview = new Review({
        comment: comment,
        rating: finalRating,
        author: req.user._id
    });


    // Add review to listing
    listing.reviews.push(newReview);


    // Save review
    await newReview.save();


    // Save listing
    await listing.save();


    req.flash("success", "New Review Created!");

    res.redirect(`/listings/${listing._id}`);
};



module.exports.destroyReview = async (req, res) => {

    let { id, reviewId } = req.params;


    await Listing.findByIdAndUpdate(
        id,
        {
            $pull: {
                reviews: reviewId
            }
        }
    );


    await Review.findByIdAndDelete(reviewId);


    req.flash("success", "Review Deleted!");


    res.redirect(`/listings/${id}`);
};


