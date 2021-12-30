const express = require("express");
const http = require("http");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const passport = require("passport");
const app = express();

// CONSTANTS
const MIN = 1000 * 60;

// Passport config
require("./config/passport.config")(passport);

// DB config
const db = require("./config/keys.config").DATABASE_URI;

// Connect
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

// Init Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.set("view engine", "handlebars");

// methodOverride
app.use(methodOverride("_method"));

// Parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
// In a Connect or Express-based application, passport.initialize() middleware
// is required to initialize Passport.
// If your application uses persistent login sessions,
// passport.session() middleware must also be used.
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Redirect http to https requests
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

// Ping self
// const pingSelf = () => {
//   const options = {
//     host: process.env.HOST,
//     port: 80,
//     path: "/",
//   };
//   http.get(options, (res) => {
//     res
//       .on("data", (chunk) => {
//         try {
//           console.log("HEROKU RESPONSE: " + chunk);
//         } catch (err) {
//           console.log(err.message);
//         }
//       })
//       .on("error", function (err) {
//         console.log("Error: " + err.message);
//       });
//   });
// };

// if (process.env.NODE_ENV === "production") {
//   setInterval(pingSelf, MIN * 20);
// }

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users.routes"));
app.use("/api/messages", require("./routes/messages.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`));
