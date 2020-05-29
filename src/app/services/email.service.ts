//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

// This service sends email using nodemailer.

import { Injectable } from '@angular/core';
import nodemailer from 'nodemailer';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class EmailService {
  constructor() {}

  private getSubject(emailJson) {
    return 'Palautteen aihe: ' + emailJson.reviewTarget;
  }

  private getBodyText(emailJson) {
    let bodyText = '';
    bodyText += 'Palaute:\n' + emailJson.reviewContent + '\n\n';
    bodyText += 'Palautetta koskeva sijainti verkkopalvelussa:\n' + emailJson.location + '\n\n';
    if (emailJson.contactChecked && emailJson.emailValue) {
      bodyText += 'Toivon yhteydenottoa palautteestani:\n' + emailJson.emailValue + '\n\n';
    }
    bodyText += 'Olen tarkastanut, että tiedot ovat oikein.'
    return bodyText;
  }

  public async sendMail(host, port, authUser, authPassword, receiver, emailJson, callback) {
    // Email transport options
    let transportOptions = {
      host: host,
      port: port,
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    }
    // Add 'auth' block if username and password are available
    if (authUser && authPassword) {
      transportOptions['auth'] = {
        user: authUser,
        pass: authPassword
      }
    }

    let transporter = nodemailer.createTransport(transportOptions);

    // For configuration options, see https://nodemailer.com/message/
    let mailOptions = {
      from: "noreply@research.fi",
      to: receiver,
      subject: this.getSubject(emailJson),
      text: this.getBodyText(emailJson)
    };
    let info = await transporter.sendMail(mailOptions);
  
    callback(info);
  };
}

