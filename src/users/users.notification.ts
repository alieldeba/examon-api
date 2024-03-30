import sendEmail from '../bootstrap/mailer';

export default class UsersNotification {
  async notify(email: string, message: string) {
    await sendEmail({
      email: email,
      subject: 'Password Reset Verification (available for 10 min)',
      message,
    });
  }
}
