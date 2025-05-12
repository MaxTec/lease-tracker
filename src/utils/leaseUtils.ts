import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sgMail from "@sendgrid/mail";
import { differenceInMonths, addMonths, isEqual, addDays } from "date-fns";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_API_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  file: Buffer,
  fileName: string
): Promise<string> {
  console.log(
    "process.env.CLOUDFLARE_BUCKET_NAME",
    process.env.CLOUDFLARE_BUCKET_NAME
  );
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: `leases/${fileName}`,
    Body: file,
    ContentType: "application/pdf",
  });

  await s3Client.send(command);
  return `${process.env.CLOUDFLARE_BUCKET_PUBLIC_URL}/leases/${fileName}`;
}

export async function sendLeaseEmail(
  tenantEmail: string,
  tenantName: string,
  leaseUrl: string,
  loginUrl: string,
  registrationUrl?: string
) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SendGrid API key is not configured");
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: tenantEmail,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: "Su Nuevo Contrato de Arrendamiento",
    html: `
      <h2>Estimado/a ${tenantName},</h2>
      <p>Su contrato de arrendamiento ha sido creado exitosamente. Puede encontrar los detalles a continuación:</p>
      <ul>
        <li><strong>Contrato de Arrendamiento:</strong> <a href="${leaseUrl}">Ver Contrato de Arrendamiento</a></li>
        <li><strong>Acceso al Portal:</strong> <a href="${loginUrl}">Iniciar Sesión en Su Cuenta</a></li>
      </ul>
      ${registrationUrl ? `<p><strong>Para completar su registro y crear una contraseña, haga clic aquí: <a href="${registrationUrl}">Finalizar Registro</a></strong></p>` : ""}
      <p>Por favor, revise su contrato de arrendamiento y contáctenos si tiene alguna pregunta.</p>
      <p>Saludos cordiales,<br>Equipo de Administración de Propiedades</p>
    `,
  };

  await sgMail.send(msg);
}

export const getAccurateLeaseMonths = (start: Date, end: Date): number => {
  const cleanEnd = addMonths(start, differenceInMonths(end, start));
  const isExactEnd = isEqual(end, cleanEnd);
  if (isExactEnd) return differenceInMonths(end, start);
  return differenceInMonths(addDays(end, 1), start);
};
