require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const Listing = require("../models/listing");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
    accessToken: mapToken,
});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateCoordinates() {
    try {
        await mongoose.connect(MONGO_URL);

        console.log("Connected to MongoDB");

        const listings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": { $exists: false } }
            ]
        });

        console.log(`Found ${listings.length} listings without coordinates.`);

        for (let listing of listings) {
            try {
                const query = `${listing.location}, ${listing.country}`;

                console.log(`Geocoding: ${query}`);

                const response = await geocodingClient
                    .forwardGeocode({
                        query: query,
                        limit: 1,
                    })
                    .send();

                if (!response.body.features.length) {
                    console.log(`❌ No coordinates found for: ${query}`);
                    continue;
                }

                listing.geometry = response.body.features[0].geometry;

                await listing.save();

                console.log(
                    `✅ Updated: ${listing.location}`,
                    listing.geometry.coordinates
                );

            } catch (error) {
                console.log(
                    `❌ Error updating ${listing.location}:`,
                    error.message
                );
            }
        }

        console.log("🎉 Coordinate migration completed!");

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error("❌ Migration failed:", error);

        await mongoose.connection.close();

        process.exit(1);
    }
}

updateCoordinates();

