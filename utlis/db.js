const mongoose = require('mongoose');
require('dotenv').config(); 

const DB = process.env.MONGO_URL;  
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.error("DB CONNECTION FAILED\nERR:", err));
  