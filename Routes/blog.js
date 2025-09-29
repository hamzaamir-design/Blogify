const { Router } = require("express");
const router = Router();
const path = require('path');
const multer = require('multer');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const fs = require('fs');

// ---- Multer setup ----
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve("./public/uploads"));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage });

// ---- Add new blog ----
router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    })
})

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    console.log('comments', comments);
    return res.render('blog', {
        user: req.user,
        blog,
        comments,
    });
})

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    })
    return res.redirect(`/blog/${req.params.blogId}`);
})

router.post('/', upload.single('coverImage'), async (req, res) => {

    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    const { title, body } = req.body;

    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });

    res.redirect(`/blog/${blog._id}`);
});

// ---- Delete blog ----
router.post('/:id/delete', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        if (blog.coverImageURL) {
            const filePath = path.resolve(`./public${blog.coverImageURL}`);
            fs.unlink(filePath, (err) => {
                if (err) console.warn("⚠️ Could not delete file:", err.message);
                else console.log("🗑️ Deleted file:", filePath);
            });
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.error("❌ Error deleting blog:", err);
        res.status(500).send("Error deleting blog");
    }
});

module.exports = router;
