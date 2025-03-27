import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PDFDocument, StandardFonts, PageSizes, PDFPage, PDFFont } from 'pdf-lib';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import sgMail from '@sendgrid/mail';
import { numberToWords } from './numberUtils'; // Import the function

interface LeaseData {
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  depositAmount: number;
  paymentDay: number;
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_BUCKET_PUBLIC_URL,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function generateLeasePDF(leaseData: LeaseData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Set vertical margin (1 inch = 72 points)
  const verticalMargin = 28.35; // 1 cm margin (1 cm = 28.35 points), (0.5 cm = 14.175 points)
  const horizontalMargin = 28.35; // 1 cm margin (1 cm = 28.35 points), (0.5 cm = 14.175 points)
  const titleFontSize = 12;
  const bodyFontSize = 10;
  const lineHeight = 12; // 20 points that is 1 cm
  
  // Function to create a new page
  const createNewPage = () => {
    const page = pdfDoc.addPage(PageSizes.Letter);
    return {
      page,
      y: page.getHeight() - verticalMargin - 20
    };
  };

  // Function to draw text with page breaks
  const drawTextWithPageBreak = (text: string, x: number, currentPage: PDFPage, currentY: number, font: PDFFont, size: number) => {
    let y = currentY;
    const pageWidth = currentPage.getWidth();
    const availableWidth = pageWidth - (2 * horizontalMargin);
    const words = text.split(' ');
    let currentLine = '';
    const lines: string[] = [];

    // Calculate how many characters can fit in one line
    const charsPerLine = Math.floor(availableWidth / (size * 0.6)); // Approximate character width

    for (const word of words) {
      if ((currentLine + ' ' + word).length > charsPerLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    }
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    
    for (const line of lines) {
      if (y < verticalMargin + 20) { // If we're too close to the bottom margin
        const { page, y: newY } = createNewPage();
        currentPage = page;
        y = newY;
      }
      
      currentPage.drawText(line, {
        x,
        y,
        size,
        font,
      });
      y -= lineHeight;
    }
    
    return { currentPage, y };
  };

  // Create first page
  let { page, y } = createNewPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Calculate lease duration in years
  const duration = Math.ceil((leaseData.endDate.getTime() - leaseData.startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  
  // Format dates
  const startDate = format(leaseData.startDate, "d 'DE' MMMM 'DE' yyyy", { locale: es });
  const endDate = format(leaseData.endDate, "d 'DE' MMMM 'DE' yyyy", { locale: es });
  const currentDate = format(new Date(), "d 'DEL' MMMM 'DEL' yyyy", { locale: es });

  // Convert amounts to words
  const rentAmountInWords = numberToWords(Math.floor(leaseData.rentAmount));

  // Title
  page.drawText('CONVENIO TRANSACCIONAL', {
    x: horizontalMargin,
    y,
    size: titleFontSize,
    font: boldFont,
  });
  y -= lineHeight * 2;

  // Header
  const headerText = `QUE CELEBRAN POR UNA PARTE COMO ARRENDADOR O PROPIETARIO EL C. JOSÉ JAVIER DOLORES TEC Y CHULIM Y POR LA OTRA PARTE COMO ARRENDATARIO EL C. ${leaseData.tenantName.toUpperCase()} RESPECTO AL LOCAL UBICADO EN ${leaseData.propertyName.toUpperCase()}, UNIDAD ${leaseData.unitNumber.toUpperCase()}, SE SUJETAN A LAS SIGUIENTES:`;
  
  ({ currentPage: page, y } = drawTextWithPageBreak(headerText, horizontalMargin, page, y, font, bodyFontSize));
  y -= lineHeight;

  // Clauses
  const clauses = [
    {
      title: 'PRIMERA.',
      content: 'Ambas partes sujetan este convenio a lo dispuesto por los artículos 3134, 3140, 3141, 3149, 3150, 3151, del Código Civil vigente en el estado.'
    },
    {
      title: 'SEGUNDA.',
      content: `Este convenio es por el término definitivo e improrrogable de ${duration} AÑO(S), que corresponde del ${startDate} AL ${endDate}.`
    },
    {
      title: 'TERCERA.',
      content: `La cuota mensual por concepto de arrendamiento se detalla a continuación: La cuota mensual por concepto de arrendamiento se establecerá de la siguiente manera: A partir del ${startDate}, el arrendatario deberá pagar $${leaseData.rentAmount.toFixed(2)} (${rentAmountInWords} PESOS 00/100 M.N.) correspondientes al mes de ${format(leaseData.startDate, 'MMMM', { locale: es })}. Este monto se aplicará hasta el pago realizado el ${format(leaseData.endDate, "d 'DE' MMMM 'DE' yyyy", { locale: es })}. Cada pago realizado el día ${leaseData.paymentDay} será para cubrir el costo del arrendamiento del mes que finaliza ese día, entregándose en el domicilio ya mencionado o a través de un depósito bancario.`
    },
    {
      title: 'CUARTA.',
      content: 'EL LOCAL será destinado para uso de OFICINA ADMINISTRATIVA Y DE DISEÑO, que el arrendatario acepta que están en buenas condiciones dicho LOCAL para su uso y funcionamiento.'
    },
    {
      title: 'QUINTA.',
      content: 'Al término de este convenio, el arrendatario se compromete y obliga a entregar este local a sus propietarios, respondiendo por los daños que causen al inmueble por el retiro de muebles u otros accesorios que se encuentran introducidos en dicho local y que sirven para el funcionamiento del giro al que está destinado, renunciando desde ahora a toda prórroga y beneficio de acuerdo con los artículos 2738 y 2739 del Código Civil en vigor, y por tanto autoriza expresamente a los propietarios para que tomen posesión de este local al día siguiente de la terminación de este convenio sin necesidad de invocar acción alguna ante los tribunales de esta ciudad o los jueces del pueblo donde corresponda.'
    },
    {
      title: 'SEXTA.',
      content: 'Será por cuenta del arrendatario los gastos que se refieran por consumo de agua potable, energía eléctrica, vigilancia, limpieza y todos los demás que se refieren a la operación y funcionamiento del local arrendado.'
    },
    {
      title: 'SÉPTIMA.',
      content: 'Para el caso de incumplimiento en la entrega de este local arrendado a la fecha de vencimiento de este convenio, se establece la pena convencional el pago de la cantidad de $200 PESOS (SON: DOSCIENTOS PESOS 00/100 M.N.) por cada día que exceda al CONTRATO, sin que por ello se entienda relevado de cubrir daños y perjuicios, gastos y costos de los juicios que se iniciarán ante los tribunales judiciales de esta ciudad, los jueces del pueblo o cualquier autoridad donde corresponda, por causas de incumplimiento.'
    },
    {
      title: 'OCTAVA.',
      content: 'Para el caso de interpretación y cumplimiento de este convenio, las partes expresamente manifiestan someterse a la jurisdicción y competencia de los tribunales judiciales o las autoridades correspondientes de la ciudad o del pueblo donde corresponda.'
    },
    {
      title: 'NOVENA.',
      content: 'Las partes manifiestan que, de su voluntad libre y espontánea, al suscribir este convenio, por lo que no existe error, dolo, violencia o mala fe, desde ahora renuncian a invocar estas como causales de rescisión del mismo.'
    },
    {
      title: 'DÉCIMA.',
      content: 'TODA REMODELACIÓN QUE SE HAGA O CAMBIO A SU ESTRUCTURA DEL BIEN INMUEBLE QUEDARÁ A BENEFICIO DEL ARRENDADOR.'
    }
  ];

  // Draw each clause
  for (const clause of clauses) {
    // Draw clause title
    if (y < verticalMargin + 50) {
      ({ page, y } = createNewPage());
    }
    
    page.drawText(clause.title, {
      x: horizontalMargin,
      y,
      size: bodyFontSize,
      font: boldFont,
    });
    y -= lineHeight;

    // Draw clause content
    ({ currentPage: page, y } = drawTextWithPageBreak(clause.content, horizontalMargin, page, y, font, bodyFontSize));
    y -= lineHeight;
  }

  // Signature section
  if (y < verticalMargin + 50) {
    ({ page, y } = createNewPage());
  }
  
  y -= lineHeight * 2;
  const signatureText = `Las partes contratantes declaran y manifiestan estar debidamente enteradas de todas y cada una de las cláusulas de este convenio, como su contenido, y ratificando en la ciudad de Cancún, del Municipio de Benito Juárez, Q. Roo, a los ${currentDate}.`;
  
  drawTextWithPageBreak(signatureText, horizontalMargin, page, y, font, bodyFontSize);

  return Buffer.from(await pdfDoc.save());
}

export async function uploadToR2(file: Buffer, fileName: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: `leases/${fileName}`,
    Body: file,
    ContentType: 'application/pdf',
  });

  await s3Client.send(command);
  return `${process.env.CLOUDFLARE_BUCKET_PUBLIC_URL}/leases/${fileName}`;
}

export async function sendLeaseEmail(
  tenantEmail: string,
  tenantName: string,
  leaseUrl: string,
  loginUrl: string
) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SendGrid API key is not configured');
  }
  
  sgMail.setApiKey(apiKey);

  const msg = {
    to: tenantEmail,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Your New Lease Agreement',
    html: `
      <h2>Dear ${tenantName},</h2>
      <p>Your lease agreement has been created successfully. You can find the details below:</p>
      <ul>
        <li><strong>Lease Agreement:</strong> <a href="${leaseUrl}">View Lease Agreement</a></li>
        <li><strong>Login to Portal:</strong> <a href="${loginUrl}">Login to Your Account</a></li>
      </ul>
      <p>Please review your lease agreement and contact us if you have any questions.</p>
      <p>Best regards,<br>Property Management Team</p>
    `,
  };

  await sgMail.send(msg);
} 