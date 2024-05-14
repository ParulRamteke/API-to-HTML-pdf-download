const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const AgroRouter = require("./router/app");

// Middleware
app.use(express.json());
app.use("/", AgroRouter);

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
