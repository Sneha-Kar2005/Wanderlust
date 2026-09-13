require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const geocodeListing = async (obj) => {
  const response = await geocodingClient
    .forwardGeocode({ query: `${obj.location}, ${obj.country}`, limit: 1 })
    .send();

  const geometry = response.body.features[0]
    ? response.body.features[0].geometry
    : { type: "Point", coordinates: [0, 0] };

  return { ...obj, geometry };
};

const initDB = async () => {
  await Listing.deleteMany({});

  const listingsWithGeometry = [];

  for (const obj of initData.data) {
    const withGeometry = await geocodeListing(obj);

    listingsWithGeometry.push({
      ...withGeometry,
      owner: "6a9a45004b62198cd995643a",
    });
  }

  await Listing.insertMany(listingsWithGeometry);
  console.log("data was initialized");
  process.exit(0);
};

initDB();
