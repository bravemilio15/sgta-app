const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS  
  }
});

async function enviarCorreo(destinatario, asunto, texto) {
  const mailOptions = {
    from: `"SGTA" <${process.env.MAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    text: texto
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };
