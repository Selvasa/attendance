const mongoose = require('mongoose');

const checkinEmpSchema = new mongoose.Schema({
         employeeName:String,
         checkin:String,
         checkout:String,
         totalhours:String,
         status:Boolean,
})

const Checkin = mongoose.model("checkin", checkinEmpSchema);
module.exports = Checkin;