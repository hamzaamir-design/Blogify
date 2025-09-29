// require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');
const userRoute = require('./Routes/user');
const blogRoute = require('./Routes/blog');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./MiddleWares/authentication");
const Blog = require('./models/blog');
const { connected } = require("process");

const PORT = process.env.PORT || 8000;

// mongoose
//     // .connect(process.env.Mongo_URL)
//     .connect('mongodb://localhost:27017/Blogify')
//     .then((e) => console.log("MongoDB Connected"));

let isConnected = false;
async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.Mongo_URL);
        isConnected = true;
        console.log("Connected to mongodb")
    } catch (error) {
        console.error('Error connecting to MongoDb: ', error);
    }
}

app.use((req, res, next) => {
    if (!isConnected) {
        connectToMongoDb();
    }
    next();
})

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve("./public")));


app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));

app.use('/user', userRoute);
app.use("/blog", blogRoute);

app.get('/', async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs: allBlogs,
    });

});

// app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));

module.exports = app;