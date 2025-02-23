// controllers/cityScoresController.js
import { connectDB } from '../config/database.js';

// Weights from your Python script
const weights = {
    'Housing': 0.2,
    'Transportation': 0.15,
    'Environment': 0.15,
    'Health': 0.2,
    'Neighborhood': 0.1,
    'Engagement': 0.1,
    'Opportunity': 0.1
};

export const getCityScores = async (req, res) => {
    try {
        const db = await connectDB();
        const citiesRef = db.collection('cities');
        const snapshot = await citiesRef.get();

        const cityScores = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const key = `${data.geo_label_citystate}_${data.date_label}`;

            // Calculate weighted general score
            const generalScore = 
                (data.Housing * weights.Housing) +
                (data.Transportation * weights.Transportation) +
                (data.Environment * weights.Environment) +
                (data.Health * weights.Health) +
                (data.Neighborhood * weights.Neighborhood) +
                (data.Engagement * weights.Engagement) +
                (data.Opportunity * weights.Opportunity);

            if (!cityScores[key]) {
                cityScores[key] = {
                    geo_label_citystate: data.geo_label_citystate,
                    date_label: data.date_label,
                    Average_General_Score: generalScore
                };
            }
        });

        const results = Object.values(cityScores);
        res.json(results);

    } catch (error) {
        console.error('Error fetching city scores:', error);
        res.status(500).json({ error: 'Failed to fetch city scores' });
    }
};