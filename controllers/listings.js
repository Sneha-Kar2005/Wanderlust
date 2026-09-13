
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
    accessToken: mapToken,
});


// INDEX - SEARCH AND CATEGORY FILTERING

module.exports.index = async (req, res) => {
    const { search, category } = req.query;

    let filter = {};

    // Search by title, description, location, or country
    if (search && search.trim() !== "") {
        const searchText = search.trim();

        const searchRegex = new RegExp(
            searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
        );

        filter.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
        ];
    }

    // Filter by category
    if (category && category.trim() !== "") {
        filter.category = category.trim();
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        search: search || "",
        category: category || "",
    });
};


// NEW FORM

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// SHOW LISTING

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    console.log(listing);

    res.render("listings/show.ejs", {
        listing,
    });
};


// CREATE LISTING

// CREATE LISTING

module.exports.createListing = async (req, res, next) => {
    try {
        // Check if image was uploaded
        if (!req.file) {
            req.flash("error", "Please upload an image.");
            return res.redirect("/listings/new");
        }

        // Check if location is provided
        if (!req.body.listing || !req.body.listing.location) {
            req.flash("error", "Please enter a valid location.");
            return res.redirect("/listings/new");
        }

        // Geocode the listing location
        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        // Check if Mapbox found the location
        if (
            !response.body.features ||
            response.body.features.length === 0
        ) {
            req.flash(
                "error",
                "Location not found. Please enter a valid location."
            );

            return res.redirect("/listings/new");
        }

        // Get uploaded image details
        let url = req.file.path;
        let filename = req.file.filename;

        // Create new listing
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;

        newListing.image = {
            url,
            filename,
        };

        // Save location geometry
        newListing.geometry =
            response.body.features[0].geometry;

        // Save listing to database
        let savedListing = await newListing.save();

        console.log(savedListing);

        req.flash("success", "New Listing Created!");

        res.redirect("/listings");

    } catch (err) {
        next(err);
    }
};


// EDIT FORM

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace(
        "/upload",
        "/upload/w_150"
    );

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl,
    });
};


// UPDATE LISTING

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true, runValidators: true }
    );

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url,
            filename,
        };

        await listing.save();
    }

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);
};


// DELETE LISTING

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    console.log(deletedListing);

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");
};





