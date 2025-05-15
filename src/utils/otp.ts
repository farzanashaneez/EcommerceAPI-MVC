import nodemailer from 'nodemailer';

// Generate a 6-digit numeric OTP as a string
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send an OTP email to the specified email address
export const sendOTPEmail = async (email: string, otp: string) => {
  // Create a Nodemailer transporter using Gmail service and credentials from env variables
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Gmail address to send from
      pass: process.env.GMAIL_PASS  // Gmail app password or OAuth token
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.GMAIL_USER, // Sender address
    to: email,                    // Recipient address
    subject: 'Your OTP Code',     // Email subject line
    text: `Your OTP is: ${otp}`   // Email body text with the OTP
  };

  // Send the email asynchronously
  await transporter.sendMail(mailOptions);
};
