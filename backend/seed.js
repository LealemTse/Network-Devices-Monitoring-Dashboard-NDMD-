const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        //seeding the database
        const username = process.env.ADMIN_USER || "admin";
        const password = process.env.ADMIN_PASSWORD || "password@123#";
        const securityQuestion1 = process.env.SEC_Q1 || "What is your favorite color?";
        const securityAnswer1 = process.env.SEC_A1 || "blue";
        const securityQuestion2 = process.env.SEC_Q2 || "What is your favorite food?";
        const securityAnswer2 = process.env.SEC_A2 || "pizza";

        //hashing the data (salt round of 10)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedAnswer1 = await bcrypt.hash(securityAnswer1, saltRounds);
        const hashedAnswer2 = await bcrypt.hash(securityAnswer2, saltRounds);

        //inserting to the database

        const query =
            `INSERT INTO users (username, password, security_question_1, security_answer_1_hash, security_question_2, security_answer_2_hash) VALUES (?, ?, ?, ?, ?, ?)`;
        await db.query(query, [
            username,
            hashedPassword,
            securityQuestion1,
            hashedAnswer1,
            securityQuestion2,
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