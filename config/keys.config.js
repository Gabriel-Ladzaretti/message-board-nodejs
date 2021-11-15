if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  DATABASE_URI: process.env.MONGO_HOST_URI,
  // Get Your URI from https://cloud.mongodb.com/
};
