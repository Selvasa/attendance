const express = require('express');
const verifyToken = require('../middleware/verify');
const Payslip = require('../model/paySlip.model');
const Register = require('../model/createEmpModel'); 
const route = express.Router();


route.get('/getPaySlip/:id', async (req, res) => {
    try {
        const { id } = req.params; // employeeId (not payslip id)
        const { month, year } = req.query; 

        if (!id || !month || !year) {
            return res.status(400).json({ message: 'Employee ID, month, and year are required.' });
        }

        // Find payslip by employee ID, month, and year
        const payslip = await Payslip.findOne({
            employeeId: id,
            month: month,
            year: year
        });

        if (!payslip) {
            return res.status(404).json({ message: 'Payslip not found for given details.' });
        }

        return res.status(200).json({ success: true, data: payslip });
    } catch (err) {
        console.error('Error fetching payslip:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});


route.post('/createPaySlip/:id', async (req, res) => {
    try {
        const { id } = req.params; // employeeId
        const payslipData = req.body;

        // Validate employee exists
        const employee = await Register.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found!' });
        }

        // Check if payslip for that month/year already exists
        const existing = await Payslip.findOne({
            employeeId: id,
            month: payslipData.month,
            year: payslipData.year
        });

        if (existing) {
            return res.status(400).json({ message: 'Payslip already exists for this employee and month/year.' });
        }

        // Create new payslip
        const newPayslip = new Payslip({
            employeeId: id,
            employeeName: employee.employeeName,
            workLocation: employee.workLocation,
            department: employee.department,
            designation: employee.designation,
            bankAccount: employee.bankAccount,
            joiningDate: employee.joinDate,
            uan: employee.uanNumber,
            esiNumber: employee.esiNumber,
            pan: employee.panNumber,
            ...payslipData 
        });

        await newPayslip.save();
        res.status(201).json({ success: true, message: 'Payslip created successfully.', data: newPayslip });

    } catch (err) {
        console.error('Error creating payslip:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
});



module.exports = route;
