
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// MongoDB Atlas connection
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 10000,
    });
}

// Database connection
main()
    .then(() => {
        console.log("connected to DB");

        // Start server only after successful DB connection
        app.listen(8080, () => {
            console.log("server is listening to port 8080");
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});


// Session configuration
const sessionOptions = {
  store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



// Session and flash middleware
app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages and current user
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Error handler
app.use((req, res, next) => {
    res.status(404).send("Page Not Found!");
});

// General error handler
// General error handler
// General error handler
app.use((err, req, res, next) => {
    console.error("========== ERROR ==========");
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);
    console.error("Full error:", err);
    console.error("============================");

    const statusCode = err?.statusCode || 500;
    const message = err?.message || "Something went wrong!";

    res.status(statusCode).render("error.ejs", {
        message,
    });
});






