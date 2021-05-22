const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shareUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shareData: { type: Schema.Types.ObjectId, ref: 'Post' },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Post' },
    audioFile: { type: String },
    audioID: { type: String }
}, { timestamps: true })

var Post = mongoose.model('Post', PostSchema)
module.exports = Post