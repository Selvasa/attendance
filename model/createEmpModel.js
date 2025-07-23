const mongoose = require('mongoose');

const createEmpSchema = new mongoose.Schema({
    employeeName: String,
    employeeEmail: String,
    workLocation: String,
    department: String,
    role: String,
    designation: String,
    joinDate: String,
    bankAccount: String,
    uanNumber: String,
    esiNumber: String,
    panNumber: String,
    resourceType: String,
    username: String,
    password: String,
    address: String,
    phone: String,
    status: Boolean,
    timelog: [{
        date: String,
        checkin: String,
        checkout: String,
        totalhours: String,
        autocheckout:{type:Boolean,default:false}
    }]
})

const Register = mongoose.model("register", createEmpSchema);
module.exports = Register;