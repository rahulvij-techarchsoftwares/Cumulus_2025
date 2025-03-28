const mongoose = require("mongoose");
const heritage = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  storage: { 
    type: String, 
    required: true,  
  }, 
  googledrive_dropbox: { 
    type: Boolean, 
    default: false,
    required: true,  
  }, 
  voice_memo: { 
    type: Boolean, 
    efault: false,
    required: true,  
  }, 
  membership_id: { 
    type: String, 
    required: true,  
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
const heritageplan = mongoose.model("heritageplan", heritage);
module.exports = heritageplan;