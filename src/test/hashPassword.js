import bcrypt from 'bcrypt';
import {pool} from '../database/connection.js'; // Pastikan jalur impor benar

const hashPasswords = async () => {
    let connection;

    try {
        connection = await pool.getConnection();
        const [users] = await connection.query('SELECT id, username, password FROM user');

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 14);
            await connection.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, user.id]);
            console.log(`Password for user ${user.username} has been hashed.`);
        }

    } catch (err) {
        console.error('Error hashing passwords:', err);
    } finally {
        if (connection) connection.release();
    }
};

hashPasswords();
