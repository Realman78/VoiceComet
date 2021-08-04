const mongoose = require('mongoose')

const Schema = mongoose.Schema

const notificationSchema = new Schema({
    userTo: { type: Schema.Types.ObjectId, ref: 'User' },
    userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
    notificationType: String,
    opened: { type: Boolean, default: false},
    entityId: Schema.Types.ObjectId
}, { timestamps: true })

notificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId)=>{
    var data = {
        userTo,
        userFrom, 
        notificationType,
        entityId
    }
    await Notification.deleteOne(data).catch(err =>console.log(err))
    return Notification.create(data)
}

var Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification