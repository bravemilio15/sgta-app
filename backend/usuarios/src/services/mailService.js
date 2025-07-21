require('dotenv').config();
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pruebascodigo96@gmail.com',
    pass: 'hbab ccws gctu mplk'
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
