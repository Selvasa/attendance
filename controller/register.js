const express = require('express');
const router = express.Router();
const Register = require('../model/createEmpModel');


router.post("/register", async (req, res) => {
    const { employeeName,
        employeeEmail,
        joiningDate,
        role,
        username,
        password } = req.body;
    console.log(employeeName,
        employeeEmail,
        joiningDate,
        role,
        username,
        password)
    try {
        const createEmp = await new Register({
            employeeName,
            employeeEmail,
            joiningDate,
            role,
            username,
            password
        }).save();
        res.status(201).json({ msg: "Employee Created Successfully" })
    }
    catch (err) {
        console.log("Registration Failed");
        res.status(500).json({ msg: "Registration Failed" })
    }
})
module.exports = router;