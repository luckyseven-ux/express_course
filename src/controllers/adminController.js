import {pool} from'../database/connection.js'

export const isAdmin = async (req, res, next) => {
    const user = req.session.user;

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const dbUser = rows[0];

        if (dbUser.id !== 2) {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }

        next();
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

