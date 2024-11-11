import nodemailer from "nodemailer";

const emailHelper = async (to, subject, html) => {
  // Crear un transportador
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "misionesinfantilesweb@gmail.com",
      pass: "hsix faty rdcm pacz",
    },
  });

  // Configurar las opciones del correo electrónico
  let mailOptions = {
    from: "misionesinfantilesweb@gmail.com",
    to: to,
    subject: subject,
    html: html, // Aquí es donde configuras el contenido HTML del correo
  };

  // Enviar el correo electrónico
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default emailHelper;
