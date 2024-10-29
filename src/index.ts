require('dotenv').config();
import express, { Request, Response } from 'express';
import './database/config';
import { fetchHTML } from './plugins/scrap';

const app = express(); 
const PORT = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  // Usage example:
  fetchHTML('https://www.google.com')
    .then(html => {
      res.send(html);
    })
    .catch(error => console.error('Error:', error.message));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
