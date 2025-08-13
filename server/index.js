require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ufc_live',
  password: 'yourpassword',
  port: 5432,
});

app.get('/', (req, res) => {
  res.send('UFC Live API running');
});

// TODO: Add endpoints for events, fighters, news, live updates

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
