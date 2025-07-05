import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// dotenv.config({
//   path: "./.env",
// });
dotenv.config();

const PORT = process.env.PORT || 3001;

connectDB()
  .then(
    app.listen(PORT, () => {
      console.log(`Server is running on Port:${PORT}`);
    }),
  )
  .catch((err) => {
    console.log(`MongodDB Connection Error`, err);
  });
