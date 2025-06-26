const mongoose = require('mongoose');

const createEmpSchema = new mongoose.Schema({
    employeeName: String,
    employeeEmail: String,
    joiningDate: String,
    role: String,
    username: String,
    password: String
})

const Register = mongoose.model("register", createEmpSchema);
module.exports = Register;