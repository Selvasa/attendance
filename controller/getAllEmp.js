const express = require('express');
const verifyToken = require('../middleware/verify');
const Loging = require("../model/createEmpModel");
const route = express.Router();

route.get("/all", verifyToken, (req, res) => {

   return res.json({ message: req.user })
})

route.get("/allemp", async (req, res) => {
   const login = await Loging.find();
   if (login) {
      return res.status(200).json({ data: login })
   }
   else {
      return res.status(401).json({ message: 'User not fount' });
   }
})

module.exports = route;