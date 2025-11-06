const mongoose = require('mongoose');

const WFHSchema = new mongoose.Schema({
    employeeName: String,
    date:String,
    wwtId:String,
    status:Boolean,
    

});

const applyWRH = mongoose.model('WFHSchema', WFHSchema);

module.exports = applyWRH;


