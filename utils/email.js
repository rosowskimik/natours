const path = require('path');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    console.log('Constructor called');
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    console.log('Send called');
    const html = pug.renderFile(
      path.resolve(__dirname, '../views/email', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );
    console.log(html);
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    return this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      `Welcome ${this.firstName} to the Natours family`
    );
  }

  async sendActivate() {
    console.log('SendActivate called');
    await this.send('accountActivation', '<Natours> Account activation');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', '<Natours> Password reset');
  }
}

module.exports = Email;
