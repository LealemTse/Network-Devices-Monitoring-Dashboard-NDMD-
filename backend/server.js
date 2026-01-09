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

// Serve Static Files (Vanilla Frontend)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/dashboard", dashboardRoutes);

const networkScanner = require('./services/networkScanner');

const testDBConnection = async () => {
    try {
        const connection = await db.getConnection()
        console.log("Successfuly connected to mysql.")
        connection.release()

        // Start network scanner
        console.log("Initializing network scanner...");
        await networkScanner.scan(); // Initial scan

        // Fetch refresh interval from DB
        const [config] = await db.query("SELECT refresh_interval FROM configuration_settings LIMIT 1");
        const interval = config.length && config[0].refresh_interval ? config[0].refresh_interval : 60000;

        console.log(`Starting monitoring with interval: ${interval}ms`);

        // Schedule scan
        setInterval(async () => {
            await networkScanner.scan();
        }, interval);

        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })
    } catch (err) {
        console.log("Error connecting to mysql: ", err.message);
    }
}
testDBConnection();
