require('dotenv').config();
import express, { Request, Response } from 'express';
let bodyParser = require('body-parser')
import './database/config';
import { Website } from './database/models/website';
import { fetchHTML, parseHTMLContent, getHostname } from './plugins/scrap';

const app = express();
const PORT = process.env.PORT || 3001;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())

app.get('/api/web/scrap', (req: Request, res: Response) => {
  const { url } = req.body;

  fetchHTML(url)
    .then(async html => {
      const { title, description, keywords } = parseHTMLContent(html);
      const hostname = getHostname(url);

      const normalizedHostname = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
      const existingWebsite = await Website.findOne({
        hostname: { $regex: new RegExp(`^${normalizedHostname}$`, 'i') } // Case insensitive match
      });

      if (existingWebsite) {
        console.log('Website already exists in the database:', existingWebsite);
        return res.status(400).send('Website data already exists.');
      }

      let web = new Website({
        title,
        description,
        hostname: normalizedHostname,
        keywords,
        url
      });
      await web.save();
      res.send(html);
    })
    .catch(error => console.error('Error:', error.message));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
