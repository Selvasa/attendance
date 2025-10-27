const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    month: { type: String, required: true },
    year: { type: String, required: true },
    employeeName: { type: String, required: true },
    workLocation: String,
    employeeId: String,
    lopDays: Number,
    designation: String,
    workedDays: Number,
    department: String,
    bankAccount: String,
    joiningDate: String,
    uan: String,
    esiNumber: String,
    pan: String,
    basicPay: Number,
    hra: Number,
    others: Number,
    incentive: Number,
    pf: Number,
    esi: Number,
    tds: Number,
    staffAdvance: Number,
    totalEarnings: Number,
    totalDeductions: Number,
    netPay: Number,
    amountWords: String,
    paymentMode: String
});

const Payslip = mongoose.model('payslip', payslipSchema);

module.exports = Payslip;


