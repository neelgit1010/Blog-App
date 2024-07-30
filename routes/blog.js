const fs = require('fs')
const path = require('path')
const { Router } = require("express");
const router = Router();
const multer = require('multer')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const mongoose = require('mongoose');
const blog = require('../models/blog');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the path to the user's directory
        const userDir = path.join('./public/uploads', `user-${req.user.id}`);
        // console.log(req.user.id);
        // console.log(req.user);

        // Create the directory if it doesn't exist
        fs.mkdirSync(userDir, { recursive: true });

        cb(null, userDir)
    },
    filename : function(req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`
        cb(null, fileName)
    }
})

const upload = multer({ storage : storage }) // 'upload' is a middleware here

router.get("/add-blog",(req, res) => {
  res.render("addblog", {
    user: req.user,
  });
});

router.post('/', upload.single('coverimg'), async (req, res) => {
    // console.log(req.body);
    // console.log(req.file);
    const {title, body} = req.body;
    let coverimg = "/images/blog-cover-default.jpg"
    if(req.file) coverimg = `/uploads/user-${req.user.id}/${req.file?.filename}`
    const blog = await Blog.create({
      title,
      body,
      coverimgURL : coverimg,
      createdBy : req.user.id
    })
    res.redirect(`/blog/${blog._id}`);
})

router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy")
  const comments = await Comment.find({blogId : req.params.id}).populate("createdBy")
  console.log('comments : ', comments);
  res.render('showblog', {
    user : req.user,
    blog,
    comments
  })
})

router.post('/comment/:blogid', async (req, res) => {
  await Comment.create({
    content : req.body.comment,
    blogid : req.params.blogid,
    createdBy : req.user._id
  })

  res.redirect(`/blog/${req.params.blogid}`)
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' }); // Sending a JSON response with a success message
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;