require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 9001;
const db = require('./connections/mongoose');
const session = require("express-session");
const path = require('path');
// const passport = require('passport');
// require('./middleware/passportConflig');
//app json for json structure
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//session
// app.use(
//     session({
//       secret: process.env.SESSION_SECRET,
//       resave: false,
//       saveUninitialized: true,
//       cookie: { secure: false },
//     })
//   );
//   app.use(passport.initialize()); 
//   app.use(passport.session()); 

//connect all routes


app.get("/wellcome", async (req, res) => {
  res.send("wellcome to shivbam stope");
})

const user = require('./Router/userRoutes');
const category = require('./Router/categoryRoutes');
const subCategory = require('./Router/subCategoryRoutes');
const product = require('./Router/productRoutes');

app.use('/api/v1', user);
app.use('/api/v1', category);
app.use('/api/v1', subCategory);
app.use('/api/v1', product);



// server connections
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server connceted successfully :- " + port);
})