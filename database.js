const mongoose = require('mongoose')
const dburl = "mongodb+srv://admin:admin@vccluster.vlrnw.mongodb.net/VoiceCometDB?retryWrites=true&w=majority"
class Database{
    constructor(){
        this.connect()
    }
    connect() {
        mongoose.connect(dburl, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useFindAndModify: false
        }).then(()=>{
            console.log('Connection to database successful')
        })
        .catch((e)=>{
            console.log(e)
        })
    }
}

module.exports = new Database()