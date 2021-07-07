const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema({
    content: {type:String, trim: true},
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true })

var Chat = mongoose.model('Message', messageSchema)
module.exports = Chat