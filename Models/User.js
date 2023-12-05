const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String,default:null },
    email: { type: String, default:null },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
