const { Router } = require("express");
const User = require("../models/user");
const router = Router();

router.get("/signin", (req, res) => res.render("signin"));
router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  await User.create({
    name,
    email,
    password,
  });
  res.redirect("/");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndCreateToken(email, password);

    // console.log("token : ", token);
    res.cookie("token", token).redirect("/",);
  } catch (error) {
    res.render("signin", {
      err: "User not found! Incorrect email or password",
    });
  }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
})

module.exports = router;
