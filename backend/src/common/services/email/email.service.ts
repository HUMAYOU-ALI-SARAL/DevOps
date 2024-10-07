import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly htmlTemplates: {[key: string]: string}

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'mail.spheraworld.com', 
      port: 465,
      auth: {
        user: 'noreply@spheraworld.com',
        pass: 'l9grjpatvxhu'
      }
    });
    
    // Load all email templates into the RAM. It will reduce time for email sending.
    // Maybe remake this logic later. 
    this.htmlTemplates = {};

    const files = fs.readdirSync(path.resolve(__dirname, './templates/'));

    files.forEach(async file => {
      const [filename, _] = file.split('.');
      const htmlString = fs.readFileSync(path.join(__dirname, 'templates', file), {encoding: 'utf8'})
      
      this.htmlTemplates[filename] = htmlString;
    })
  }

  async sendOTPEmail(email: string, otp: string) {
    if (!this.htmlTemplates['otp']) {
      throw new HttpException('There is no OTP html template!', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const html = this.htmlTemplates['otp'].replace('${{{otp}}}', otp);
    let mailOptions = {
      from: 'noreply@spheraworld.com',
      to: email,
      subject: 'Mail Verification',
      html,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new HttpException('Email send failed!', HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error
      });
    }
  }
}
