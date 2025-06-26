const mongoose = require('mongoose');

const loginEmpSchema = new mongoose.Schema({
    empEmail: String,
    empPassword: String
})

const Login = mongoose.model("login", loginEmpSchema);
module.exports = Login;
// module.exports = Login;