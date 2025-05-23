// import Logo from "@public/logo-lease-tracker.png";

export const getLeaseWelcomeEmailHTML = ({
  recipientName,
  registrationUrl,
}: {
  recipientName: string;
  registrationUrl?: string;
}) => `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f7f7fb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb; min-height:100vh;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); margin:40px 0;">
            <tr>
              <td align="center" style="padding:32px 24px 0 24px;">
                <img src="https://leasetracker.maximilianotec.com/logo-lease-tracker.png" alt="Logo de Lease Tracker" width="280" height="105" style="display:block; margin-bottom:16px;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px;">
                <h2 style="font-family:Arial,Helvetica,sans-serif; color:#1e293b; font-size:24px; margin:24px 0 8px 0; font-weight:700;">
                  Bienvenido a Lease Tracker ${
                    recipientName ? `, ${recipientName}` : ""
                  }!
                </h2>
                <p style="font-family:Arial,Helvetica,sans-serif; color:#334155; font-size:16px; margin:0 0 24px 0;">
                  Tu experiencia de alquiler ahora es más inteligente.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 24px 32px 24px;">
                  <img src="https://leasetracker.maximilianotec.com/mailing/doodle-welcome.png" alt="Ilustración de bienvenida" width="220" style="display:block; margin:0 auto 24px auto; border-radius:8px;" />
                <div style="margin: 24px 0 0 0;">
                  ${
                    registrationUrl
                      ? `<a href="${registrationUrl}" style="display:inline-block; background:#2563eb; color:#fff; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:700; padding:14px 36px; border-radius:6px; text-decoration:none; margin-bottom:12px; box-shadow:0 2px 8px rgba(37,99,235,0.10);">Finalizar Registro</a>`
                      : ""
                  }
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
