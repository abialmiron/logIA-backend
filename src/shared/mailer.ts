import nodemailer, { type Transporter } from "nodemailer";

let transporterPromise: Promise<Transporter> | null = null;

async function crearTransporter(): Promise<Transporter> {
  const account = await nodemailer.createTestAccount();

  console.log("");
  console.log("=== Ethereal (mail de prueba — NO llega a Gmail/Outlook) ===");
  console.log(`Usuario: ${account.user}`);
  console.log(`Clave:   ${account.pass}`);
  console.log("Inbox:   https://ethereal.email/login");
  console.log("===========================================================");
  console.log("");

  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
}

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = crearTransporter();
  }
  return transporterPromise;
}

export async function enviarMail(opciones: {
  para: string;
  asunto: string;
  texto: string;
  html: string;
}): Promise<{ previewUrl: string | null }> {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"LogIA" <noreply@logia.local>',
    to: opciones.para,
    subject: opciones.asunto,
    text: opciones.texto,
    html: opciones.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  if (previewUrl) {
    console.log("");
    console.log("=== Abrí ESTE link para ver el mail (Ethereal) ===");
    console.log(previewUrl);
    console.log("=================================================");
    console.log("");
  }

  return { previewUrl };
}
