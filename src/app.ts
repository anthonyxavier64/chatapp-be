import express from "express";
import { initDB } from "./config";
import dotenv from "dotenv";
import schema from "./schema";
import jwt from "./middleware/jwt";

dotenv.config();

const app = express();
const port = 3000;

export const pool = initDB();

pool
  .query(schema)
  .then((res) => {
    if (res) {
      console.log('database tables created...');
    }
  })
  .catch((err) => {
      console.log(err)
  });

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./routes/api/auth"));
app.use("/users", jwt.authenticateJWT, require("./routes/api/users"))

//app.use("/api/", authenticateJWT)

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});
