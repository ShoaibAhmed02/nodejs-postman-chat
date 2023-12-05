const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, default:null },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
