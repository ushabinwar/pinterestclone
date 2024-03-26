var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require('passport');
const upload = require("./multer")
const postModel =  require('./post')

var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav:false});
});
router.get('/login', function(req, res, next) {
  res.render('login', {nav:false});
});
router.get('/edit', async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  res.render('edit', {nav:true, user});
});
router.get('/profile',isloggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
  console.log(user)
  res.render('profile', {user ,nav:true});
});
router.get('/show/posts',isloggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
  console.log(user)
  res.render('show', {user ,nav:true});
});

router.post('/fileupload',isloggedIn, upload.single('image'), async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("/profile")
});
router.get('/add',isloggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  res.render('add', {nav:true})
});
router.post('/createpost',isloggedIn, upload.single('postimage') , async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user: user._id,
    image:req.file.filename,
    title:req.body.title,
    description: req.body.description
  });
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
 
});
router.get('/feed',isloggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  const posts = await postModel.find().populate("user")
  res.render('feed', {user, posts ,nav:true});
});


router.post('/update',isloggedIn,async function(req, res, next) {
  const user = await userModel.findOneAndUpdate(
    {username:req.session.passport.user},
    {username:req.body.username,name:req.body.name,},
    {new:true},
    )
    req.login(user, function(err) {
      if (err) {
        // Handle error
      }
      // User is now logged in with the updated information
      res.redirect('/profile');
    });
   
 
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username:req.body.username,
    email:req.body.email,
    contact:req.body.contact,
    name:req.body.name,
  })
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile")
    })
  })
});
router.post('/login', passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/"
}), function(req, res, next) {
});
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
function isloggedIn(req, res, next) {
if (req.isAuthenticated()) return next();
else res.redirect('/');
}

module.exports = router;
