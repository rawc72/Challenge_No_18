require("dotenv").config({ path: "./.env" });
var express = require("express");
var apiRouter = require("./routes/api");
var logger = require("morgan");
var mongoose = require("mongoose");
var moment = require("moment-timezone");

const PORT = process.env.PORT || 3000;

var app = express();

mongoose.connect(
  process.env.mongodb_url,
  {
    minPoolSize: 5,
    family: 4,
  },
  (error) => {
    if (error) {
      console.log("Error when connect to mongodb..", error);
    } else {
      console.log("Connected to mongodb..");
    }
  }
);

logger.token("date", function () {
  return moment().tz("America/Toronto").format();
});

app.use(
  logger(
    ':remote-addr(:req[x-forwarded-for]) - [:date ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'
  )
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiRouter);

app.get("/health", (req, res) => {
  res.send('{"status": "up"}');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
