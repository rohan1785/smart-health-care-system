import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Enable CORS for frontend
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// API health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running securely!', status: 'ok' });
});

// A placeholder for future API routes
// app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
