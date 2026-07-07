const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:8000');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/Users/sohansanil/.gemini/antigravity-ide/brain/17cae8a4-af5c-42ff-9571-c2928dc85b7f/folddeck_preview.png' });
  await browser.close();
})();
