const express = require('express');
const router = express.Router();
const Register = require('../model/createEmpModel');


router.post("/register", async (req, res) => {
    const {
        employeeName,
        employeeEmail,
        workLocation,
        department,
        role,
        designation,
        joinDate,
        bankAccount,
        uanNumber,
        esiNumber,
        panNumber,
        resourceType,
        username,
        password,
        address,
        phone, status

    } = req.body;
    console.log(req.body)
    try {
        const createEmp = await new Register({ ...req.body, status: false }).save();
        res.status(201).json({ msg: "Employee Created Successfully" })
    }
    catch (err) {
        console.log("Registration Failed");
        res.status(500).json({ msg: "Registration Failed" })
    }
})
module.exports = router;