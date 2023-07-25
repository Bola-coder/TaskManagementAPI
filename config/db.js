const mongoose = require("mongoose");

const connectToDB = () => {
  const connectionUri = process.env.mongoURI.replace(
    "<password>",
    process.env.mongoPassword
  );
  //   mongoose.set("strictQuery", false);
  mongoose
    .connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log("DB connected successfuly ");
    })
    .catch((err) => {
      console.log("Error occured when conecting to the database.", err);
    });
};

module.exports = connectToDB;
