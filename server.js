const puppeteer = require('puppeteer');

app.post('/generate-pdf', async (req, res) => {
    const { url, fileName } = req.body;

    if (!url || !fileName) {
        return res.status(400).json({ error: 'URL and fileName are required' });
    }

    try {
        // Launch Puppeteer with default Chromium
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        res.json({ pdfBase64: pdfBuffer.toString('base64'), fileName: `${fileName}.pdf` });
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Error generating PDF', details: error.message });
    }
});
