const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes.js')
const deviceRoutes = require('./routes/deviceRoutes.js')
const monitoringRoutes = require('./routes/monitoringRoutes.js')
const dashboardRoutes = require('./routes/dashboardRoutes.js')

const db = require('./config/db.js');

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get('/test', (req, res) => {
    res.send('server alive');
});

const testDBConnection = async () => {
    try {
        const connection = await db.getConnection()
        console.log("Successfuly connected to mysql.")
        connection.release()
        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })
    } catch (err) {
        console.log("Error connecting to mysql: ", err.message);
    }
}
testDBConnection();
