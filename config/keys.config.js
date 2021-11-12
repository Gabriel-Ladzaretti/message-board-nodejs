if (!process.env.PORT) require("dotenv").config();
module.exports = {
  MongoURI: process.env.MONGO_HOST_URI,
  // Get Your URI from https://cloud.mongodb.com/
};
