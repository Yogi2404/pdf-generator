const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        console.error('No URL provided');
        return res.status(400).send('URL is required');
    }

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 }); // No timeout

        const pdfPath = path.join(__dirname, 'page.pdf');
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        res.download(pdfPath, 'page.pdf', (err) => {
            if (err) {
                console.error('Error downloading the file:', err);
            }

            // Delete the file after download
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
