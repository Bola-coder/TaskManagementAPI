const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const connectToDB = require("./config/db");

const port = process.env.PORT || 5001;

connectToDB();

app.listen(port, () => {
  console.log("App listening on port ", port);
});
