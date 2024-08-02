const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
    const { url, fileName } = req.body;

    if (!url || !fileName) {
        return res.status(400).send('URL and fileName are required');
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pdfPath = path.join(__dirname, `${fileName}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        res.download(pdfPath, `${fileName}.pdf`, (err) => {
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
