/**import { fetchData, fetchCache } from  '../controllers/categoryController.js'
import express from 'express';

const router = express.Router();

router.get('/pokemon', async (req, res) => {
    try {
        const data = await fetchCache(fetchData, 'pokemon_data');
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

export default router;**/
