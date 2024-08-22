import { app as serverFi } from './server/fi/server.mjs';
import { app as serverEn } from './server/en/server.mjs';
import { app as serverSv } from './server/sv/server.mjs';
import { createTransport } from 'nodemailer';

const express = require('express');

function getSubject(emailJson) {
  return 'Palautteen aihe: ' + emailJson.reviewTarget;
}

function getBodyText(emailJson) {
  let bodyText = '';
  bodyText += 'Palaute:\n' + emailJson.reviewContent + '\n\n';
  bodyText += 'Palautetta koskeva sijainti verkkopalvelussa:\n' + emailJson.location + '\n\n';
  if (emailJson.contactChecked && emailJson.emailValue) {
    bodyText += 'Toivon yhteydenottoa palautteestani:\n' + emailJson.emailValue + '\n\n';
  }
  bodyText += 'Olen tarkastanut, että tiedot ovat oikein.';
  return bodyText;
}

function run() {
  const port = process.env.PORT || 8080;
  const server = express();

  server.use(express.json());

  server.post('/feedback', async (req, res) => {
    if (!process.env.SMTP_ENABLED) {
      const errorMsg = 'Email: Error: Sending is disabled';
      console.error(errorMsg);
      res.status(500).send({ error: errorMsg });
      return;
    }

    let transportConfig;

    if (process.env.SMTP_RAHTI_SKIP_AUTHENTICATION === "true") {
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: 25,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      };
    } else {
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };
    }

    const transporter = createTransport(transportConfig);

    const mailOptions = {
      from: 'noreply@research.fi',
      to: 'tiedejatutkimus@csc.fi',
      subject: getSubject(req.body),
      text: getBodyText(req.body),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      res.send(info);
    } catch (error) {
      res.status(500).send({ error: "Email: Error: Could not send email" });
    }
  });

  server.use('/fi', serverFi());
  server.use('/sv', serverSv());
  server.use('/en', serverEn());

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
