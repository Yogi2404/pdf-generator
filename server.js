const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 3000;
const readFile = promisify(fs.readFile);

app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
    const { url, fileName } = req.body;

    if (!url || !fileName) {
        return res.status(400).json({ error: 'URL and fileName are required' });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pdfPath = path.join(__dirname, `${fileName}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        const pdfBuffer = await readFile(pdfPath);
        const base64 = pdfBuffer.toString('base64');

        // Delete the file after converting
        fs.unlinkSync(pdfPath);

        res.json({ pdfBase64: base64, fileName: `${fileName}.pdf` });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
