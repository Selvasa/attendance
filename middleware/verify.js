const jwt = require("jsonwebtoken");
const Register = require("../model/createEmpModel");

const verifyToken = async (req, res, next) => {
    const authToken = req.headers.authorization;
    if (!authToken) {
        return res.status(401).json({ message: "Token are missing" });
    }
    const token = authToken.split(" ")[1];

    jwt.verify(token, process.env.KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" })
        }
        else {
            let users = await Register.find({ _id: decoded.id });

            if (users.length == 0) {
                return res.status(404).json({ message: "User not found" })
            }
            req.user = users
        }

        next();
    })

}

module.exports = verifyToken;