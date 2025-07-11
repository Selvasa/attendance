const express = require('express');
const app = express();
const mongoose = require('mongoose');
const env = require('dotenv').config();
const cors = require('cors');
const register = require("./controller/register")
const login = require("./controller/login")

async function connectDB() {
    await mongoose.connect(process.env.CONNECTION_STRING, { dbName: process.env.DB_NAME }, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
}
connectDB()
    .then(() => { console.log("Database Connected Successfully") })
    .catch((error) => { console.log(error, 'Database error') })
app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('X-Common-Header', 'This is a common header');
    next();
});
app.use(register);
app.use(login);
app.listen(1001, () => {
    console.log("Server connected port 1001")
})

