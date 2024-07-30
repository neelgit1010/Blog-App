const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { checkAuthCookie } = require("./middlewares/auth");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const Blog = require('./models/blog');

mongoose
  .connect("mongodb://localhost:27017/blazeblog")
  .then(() => console.log("mongodb connected"))
  .catch(() => console.log("error in connecting db"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve('./public')))

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find();
  res.render("home", {
    user: req.user,
    allblogs : allBlogs
  })
});

app.use("/user", userRoute);
app.use('/blog', blogRoute)

app.listen(port, () => console.log("server started"));
