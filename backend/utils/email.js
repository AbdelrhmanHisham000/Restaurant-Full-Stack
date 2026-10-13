import nodemailer from "nodemailer";

export default async function sendEmail(options) {
  console.log("1 - Creating transporter");

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  console.log("2 - Transporter created");

  await transport.verify();

  console.log("3 - SMTP server ready");

  const mailOptions = {
    from: "Abdelrhman Hisham <from@example.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log("4 - Sending email");

  const info = await transport.sendMail(mailOptions);

  console.log("5 - Email sent:", info.messageId);

  return info;
}

// export default async function sendEmail(options) {
//   var transport = nodemailer.createTransport({
//     host: "sandbox.smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "8ea791740dc0a1",
//       pass: "53e4d7036326c6",
//     },
//   });

//   await transport.sendMail(
//     {
//       from: "Private Person <from@example.com>",
//       to: "A Test User <to@example.com>",
//       subject: "Hello from Mailtrap",
//       text: "This is a test e-mail message.",
//     },
//     (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log("Message sent: %s", info.messageId);
//     },
//   );
// }
