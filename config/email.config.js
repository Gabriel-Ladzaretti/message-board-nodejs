if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  // Get Your URI from https://cloud.mongodb.com/
};
