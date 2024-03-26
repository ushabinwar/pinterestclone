const mongoose = require('mongoose');

const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name:String,
  password: {
    type: String,
   
  },
  profileImage: {
    type: String, // Assuming dp is a URL or a file path, adjust the type accordingly
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact:{
    type:Number
  },
  boards:{
    type:Array,
    default:[]
  },
  posts:[ {
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
    
  }],
  
});

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema);
