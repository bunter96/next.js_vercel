import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Configure Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    // 1. Email to admin (you) - Improved formatting + replyTo
    await transporter.sendMail({
      from: `"LowCost TTS" <${process.env.GMAIL_USER}>`, // Professional sender name
      to: process.env.ADMIN_EMAIL,
      replyTo: email, // Replies will go to user's email
      subject: `New contact request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
        </div>
      `,
    });

    // 2. Auto-reply to user (optional)
    await transporter.sendMail({
      from: `"LowCost TTS" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your message!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hi ${name},</p>
          <p>Thank you for contacting us! We've received your message and will respond within 24 hours.</p>
          
          <h4 style="color: #4f46e5; margin-top: 20px;">Your Message:</h4>
          <p>${message.replace(/\n/g, '<br>')}</p>
          
          <p style="margin-top: 30px;">
            <strong>LowCost TTS</strong><br>
            <a href="https://app.lowcosttts.online/">LowCost TTS/</a>
          </p>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}