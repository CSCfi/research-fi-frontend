const puppeteer = require('puppeteer');

module.exports = async function Login() {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://localhost:5003/mydata');

  // Wait for main page to load
  await page.waitForNavigation();

  // Click login from main navigation
  const [loginLink] = await page.$x("//a/span[contains(., 'Kirjaudu sisään')]");
  if (loginLink) {
    await loginLink.click();
  }

  // Wait for identity server
  await page.waitForNavigation();

  // Wait for ORCID login page
  await page.waitForNavigation();

  // Get credentials fields and sign in button
  const [userNameField] = await page.$x("//*[@id='username']");
  const [passwordField] = await page.$x("//*[@id='password']");
  const [orcidSignInButton] = await page.$x("//*[@id='signin-button']");

  // Enter credentials and click sign in button
  if (userNameField && passwordField) {
    await userNameField.type('mydata.e2e.user@mailinator.com');
    await passwordField.type('mydatae2e');
    await orcidSignInButton.click();
  }

  await page.waitForNavigation();
  await page.waitForNavigation();

  // Fetch cookies for use of Cypress
  const { cookies } = await page._client.send('Network.getAllCookies', {});

  await page.close();
  await browser.close();

  return {
    cookies,
  };
};
