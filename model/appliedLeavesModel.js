const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
    employeeName: String,
    date:String,
    wwtId:String,
    status:Boolean,
    

});

const applyLeave = mongoose.model('LeaveSchema', LeaveSchema);

module.exports = applyLeave;


