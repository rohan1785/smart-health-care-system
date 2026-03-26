import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors()); // Frontend la allow kar
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Backend chalto ahe!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} var ahe`));
