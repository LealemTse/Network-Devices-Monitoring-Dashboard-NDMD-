const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dbConnect = require('../config/db.js')
const authRoutes = require('./controllers/authController.js')

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
dbConnect();
const testDBConnection = async () => {
    try {
        const connection = await dbConnect.getConnection();
        console.log("Successfuly connected to mysql.");
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })
        connection.release();
    } catch (err) {
        console.log("Error connecting to mysql: ", err.message);
    }
}
testDBConnection();

