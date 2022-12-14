const Post = require("../models/post");
const User = require("../models/user");
const multer = require("multer");

// get all posts.
exports.posts_list = async (req, res) => {
  console.log("auth?", req.isAuthenticated);
  const posts = await Post.find()
    .sort({ createdAt: "desc" })
    .populate("author");

  return res.send(posts);
};

//located directly in the router
// exports.post_create = (req, res) => {
// };

// get a specific post.
exports.post_detail = async (req, res) => {
  const post = await Post.findById(req.params.id);

  return res.send(post);
};

exports.post_update = async (req, res) => {
  const post = await Post.findById(req.params.id);

  //check if the person owns the post before delete
  if (
    post &&
    req.isAuthenticated &&
    res.locals.currentUser._id.equals(post.author)
  ) {
    const updatedPost = await new Post({
      text: req.body.text,
      author: res.locals.currentUser._id,
      _id: req.params.id,
    });

    Post.findByIdAndUpdate(req.params.id, updatedPost, function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated User : ", docs);
      }
    });
  }
  return res.send(post);
};

exports.post_delete = async (req, res) => {
  const post = await Post.findById(req.params.id);

  //check if the person owns the post before delete
  if (
    post &&
    req.context.me._id.equals(post.author)
    // req.isAuthenticated &&
    // res.locals.currentUser._id.equals(post.author)
  ) {
    await post.remove();

    await User.findOneAndUpdate(
      { _id: req.context.me._id },
      {
        $pull: {
          posts: post._id,
        },
      }
    ).catch(function (error) {
      console.log(error);
    });

    return res.send(post);
  } else {
    return res.send("no such post or not the author");
  }
};

//get user posts sorted by most recent
exports.user_posts = async (req, res) => {
  const posts = await User.findById(req.params.id)
    .populate({
      path: "posts",
      options: { sort: [{ createdAt: "desc" }] },
      populate: { path: "author" },
    })
    .sort({ createdAt: "desc" });
  return res.send(posts);
};
