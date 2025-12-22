const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const dbConnect = require('../config/db.js')

app.use(express.json());
app.use(cors());

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

