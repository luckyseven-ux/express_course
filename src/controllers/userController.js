import { google } from 'googleapis';
import { pool } from '../database/connection.js';
import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt'; 


dotenv.config();

export const getUser = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('SELECT * FROM user');
        connection.release();

        res.status(201).json({ result });
    } catch (error) {
        console.error('Gagal mendapatkan User:', error);
        res.status(500).json({ message: 'Gagal mendapatkan User' });
    }
};

export const addUser = async (req, res) => {
    const { username, email, password, retype_password } = req.body;
    if (password !== retype_password) {
        return res.status(400).json({ message: 'Password tidak cocok' });
    }
    try {
        const connection = await pool.getConnection();
        const [extUser] = await connection.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email]);
        if (extUser.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'username or email already exist !!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        await connection.query('INSERT INTO user (username, email, password) values (?,?,?)', [username, email, hashedPassword]);
        connection.release();
        res.status(201).json({ message: 'User add Successfully !!' });
    } catch (err) {
        res.status(500).json({ message: 'kesalahan input data', error: err.message });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        const [users] = await connection.query('SELECT * FROM user WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(403).json({ message: 'Username salah' });
        }

        const user = users[0]; // Ambil pengguna pertama dari hasil query

        // Periksa apakah password di-hash dengan benar
        if (!user.password.startsWith('$2b$')) {
            return res.status(500).json({ message: 'Password hash tidak valid di database' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const userId = user.id;
        const email = user.email;
        const currentLoginTime = new Date();
        const lastLoginTime = user.last_login;

        // Perbarui waktu login di database
        await connection.query('UPDATE user SET prev_login = ?, last_login = ? WHERE id = ?', [lastLoginTime, currentLoginTime, userId]);

        // Set sesi pengguna
        req.session.user = {
            id: userId,
            email: email
        };

        // Set cookie
        res.cookie('userId', userId, { httpOnly: true });

        res.status(200).json({
            message: 'Login berhasil',
            user: {
                id: userId,
                email,
                lastLogin: lastLoginTime,
                currentLogin: currentLoginTime
            }
        });
    } catch (err) {
        console.error('Kesalahan server:', err);
        res.status(500).json({ message: 'Kesalahan server', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// OAuth callbacks are not changed
export const gauth_callback = async (req, res) => {
    const oauth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/auth/google/callback'
    );

    const { code } = req.query;
    try {
        const { tokens } = await oauth.getToken(code);
        oauth.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth,
            version: 'v2'
        });
        const { data } = await oauth2.userinfo.get();

        if (!data) {
            return res.json({ data: data });
        }

        let user = {
            id: data.id,
            email: data.email,
            name: data.name,
            picture: data.picture
        };

        res.json({ user });
    } catch (error) {
        console.error('Error during Google OAuth callback:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const github_callbackk = async (req, res) => {
    const clientId = process.env.GITHUB_CLIENT;
    const clientSecret = process.env.GITHUB_SECRET;
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code: code
        }, {
            headers: {
                accept: 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            console.error('Access token not found');
            return res.status(400).json({ message: 'Access token not found' });
        }

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const data = userResponse.data;

        if (!data) {
            console.error('User data not found');
            return res.status(404).json({ message: 'User data not found' });
        }

        let user = {
            id: data.id,
            email: data.email,
            name: data.name,
            picture: data.avatar_url
        };
        req.session.user = user;

        res.cookie('user', JSON.stringify(user), { maxAge: 900000, httpOnly: true });

        return res.json({ user });
    } catch (error) {
        console.error('Error during GitHub OAuth callback:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


 