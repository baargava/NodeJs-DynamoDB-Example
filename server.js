const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
var cron = require('node-cron');
const helmet=require('helmet');
const morgan=require('morgan');
const rateLimiter=require('express-rate-limit');
const app = express();
const fs = require("fs");
const path = require("path");
const setupSwagger = require("./swagger");
setupSwagger(app);
// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
const limiter=rateLimiter({
  windowMs:15*60*1000,
  max:100
}); 
app.use(limiter);

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
  flags: "a", // Append mode
});
app.use(morgan("combined", { stream: accessLogStream }));

// let taks=cron.schedule('*/5 * * * * *', async() => {
// try {
//   const response=await axios.get('https://jsonplaceholder.typicode.com/posts');
//   console.log(response.data);
// } catch (error) {
//   console.error(error);
// }
// });
// setTimeout(() => {
//   taks.stop();
// console.log('Task Stopped');
// }, 10000);
// Connect to MongoDB
const dynamodb = require('./config');

// Import Routes
const authRoutes = require('./Routes/auth');  
const protectedRoutes = require("./Routes/ProtetedRoutes/Dashboard");
const productRoutes = require('./Routes/products');  
const CategoryRoutes=require('./Routes/categories');
const { default: axios } = require('axios');
app.use('/', [authRoutes,protectedRoutes,productRoutes,CategoryRoutes]);
// Test Route
app.get("/", (req, res) => {
    res.send("Hello, API is running!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
 { console.log(`🚀 Server running on port ${PORT}`)
console.log("Swagger Docs: http://localhost:5000/api-docs")});