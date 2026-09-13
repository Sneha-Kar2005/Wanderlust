
require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

if (!MONGO_URL) {
    throw new Error("ATLASDB_URL is missing in your .env file.");
}

if (!process.env.MAP_TOKEN) {
    throw new Error("MAP_TOKEN is missing in your .env file.");
}

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN,
});

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB Atlas");
}

const geocodeListing = async (obj) => {
    const response = await geocodingClient
        .forwardGeocode({
            query: `${obj.location}, ${obj.country}`,
            limit: 1,
        })
        .send();

    const geometry =
        response.body.features.length > 0
            ? response.body.features[0].geometry
            : {
                  type: "Point",
                  coordinates: [0, 0],
              };

    return {
        ...obj,
        geometry,
    };
};

const initDB = async () => {
    try {
        await main();

        const listings = [];

        for (const obj of initData.data) {
            console.log(`Processing: ${obj.title}`);

            const listing = await geocodeListing(obj);

            listings.push(listing);
        }

        // Restore original listings without deleting existing data.
        // If a listing with the same title and location exists,
        // update it instead of creating a duplicate.

        for (const listing of listings) {
            const filter = {
                title: listing.title,
                location: listing.location,
            };

            await Listing.findOneAndUpdate(
                filter,
                {
                    $set: listing,
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

            console.log(`Restored: ${listing.title}`);
        }

        console.log("====================================");
        console.log("All listings restored successfully!");
        console.log("====================================");
    } catch (err) {
        console.error("Database initialization failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
};

initDB();


