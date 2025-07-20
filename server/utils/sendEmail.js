import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:#0F172A;padding:1rem 1.5rem;border-radius:8px;color:#fff;">
          <h1 style="margin-top:0;">🏠 RentRadar</h1>
        </div>
        <div style="padding:1.5rem 1rem;background:#F8FAFC;">
          ${html}
        </div>
        <div style="font-size:0.8rem;color:#6B7280;text-align:center;margin-top:1rem;">
          &copy; ${new Date().getFullYear()} RentRadar | Nairobi, Kenya
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default sendEmail;
