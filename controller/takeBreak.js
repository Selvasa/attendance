const express = require('express');
const route = express.Router();
const LeaveModel = require('../model/appliedLeavesModel');
const WRHModel = require('../model/wfhModel')

route.post('/applyBreak', async (req, res) => {
    const { status, type, override } = req.query;
    const { employeeName, date, wwtId } = req.body;

    console.log(status, type, employeeName, date, wwtId)
    //empId exists
    if (type == 'leave') {
        try {
            const existingWFHData = await WRHModel.find({ wwtId, date: { $in: date } })
            const existingLeaveData = await LeaveModel.find({ wwtId, date: { $in: date } });

            if (existingWFHData.length > 0) {
                const existingWFHDates = existingWFHData.map((d) => d.date).join(", ");

                if (override) {
                    await WRHModel.deleteMany({ wwtId, date: { $in: date } });
                    await LeaveModel.insertMany(date.map((d) => ({ employeeName, date: d, wwtId, status })));
                    return res.status(201).json({ msg: `Leave approved successfully — removed existing Work From Home entries for the following date(s): ${existingWFHDates}` })
                }

                return res.status(404).json({ msg: `Leave not approved — the employee is already working from home for the following date(s): ${existingWFHDates}` })

            }
            else if (existingLeaveData.length > 0) {
                const existingDates = existingLeaveData.map((d) => d.date).join(", ");
                return res.status(404).json({ error: `Leave not approved — leave already applied for the following date(s): ${existingDates}` });
            }
            else {
                await LeaveModel.insertMany(date.map((d) => ({ employeeName, date: d, wwtId, status })));
                res.status(201).json({ msg: "Leave Approved Successfully" })
            }

        }
        catch (err) {
            res.status(501).json({ msg: err })
        }
    }
    else if (type == 'wfh') {
        try {
            const existingWFHData = await WRHModel.find({ wwtId, date: { $in: date } });
            const existingLeaveData = await LeaveModel.find({ wwtId, date: { $in: date } })

            if (existingLeaveData.length > 0) {
                const existingLeaveDates = existingLeaveData.map((d) => d.date).join(", ");
                if (override) {
                    await LeaveModel.deleteMany({ wwtId, date: { $in: date } });
                    await WRHModel.insertMany(date.map((d) => ({ employeeName, date: d, wwtId, status })));
                    return res.status(201).json({ msg: `WFH Approved Successfully -- removed existing Leave entries for the following date(s): ${existingLeaveDates}` })
                }
                return res.status(404).json({ msg: "WFH not approved — the employee is already on leave for the following date(s):" + existingLeaveDates })
            }
            else if (existingWFHData.length > 0) {
                const existingWFHDates = existingWFHData.map((d) => d.date).join(", ");
                return res.status(404).json({ error: `WFH not approved — WFH already applied for the following date(s): ${existingWFHDates}`, });
            }
            else {
                await WRHModel.insertMany(date.map((d) => ({ employeeName, date: d, wwtId, status })));
                res.status(201).json({ msg: "WFH Approved Successfully" })
            }
        }
        catch (err) {
            res.status(501).json({ msg: err })
        }
    }

});

// route.get("getleaveData", (req, res) => {
//     // from today to future
//     const { userId, from, to } = req.query;
//     // if(userId)
//     // both leave wfh 
// });

module.exports = route;