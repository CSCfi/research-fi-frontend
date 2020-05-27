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

  public async sendMail(host, port, authUser, authPassword, receiver, user, callback) {
    // Email transport options
    let transportOptions = {
      host: host,
      port: port,
      secure: false,
    }

    // Add 'auth' block if username and password are available
    if (authUser && authPassword) {
      transportOptions['auth'] = {
        user: authUser,
        pass: authPassword
      }
    }

    let transporter = nodemailer.createTransport(transportOptions);
  
    let mailOptions = {
      from: "Web portal",
      to: receiver,
      html: "<span>Hello</span>"
    };
  
    let info = await transporter.sendMail(mailOptions);
  
    callback(info);
  };
}

