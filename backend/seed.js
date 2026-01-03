const db = require('config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        //seeding the database
        const username = "admin";
        const password = "password@123#";
        const securityAnswer1 = "blue";
        const securityAnswer2 = "pizza";

        //hashing the data (salt round of 10)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedAnswer1 = await bcrypt.hash(securityAnswer1, saltRounds);
        const hashedAnswer2 = await bcrypt.hash(securityAnswer2, saltRounds);

        //inserting to the database

        const query =
            `INSERT INTO users (username, password, securityAnswer1, securityAnswer2) VALUES (?, ?, ?, ?)`;
        await db.query(query, [
            username,
            hashedPassword,
            hashedAnswer1,
            hashedAnswer2,
        ]);

        console.log("Seeding Successfully");
        console.log(`username: ${username}`);
        console.log(`password: ${password}`);

        process.exit(0);

        ``
    } catch (error) {
        console.error("SEEDING ERROR: ", error);
        process.exit(1);
    }
}
seedDatabase();


/*this is used of making the token keys run it two times
node -e "console.log('TOKEN_KEY=' + require('crypto').randomBytes(64).toString('hex'))"
*/