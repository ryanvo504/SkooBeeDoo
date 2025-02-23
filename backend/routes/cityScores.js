import express from 'express';
import { getCityScores } from '../controllers/cityScoresController.js';

const router = express.Router();

router.get('/city-scores', getCityScores);

export default router;