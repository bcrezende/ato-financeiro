const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export const emailService = {
  async sendPasswordReset(to: { email: string; name: string }, resetUrl: string) {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:32px 40px;text-align:center">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px">Ato Financeiro</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe">Controle total das suas finanças</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827">Redefinir sua senha</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
              Olá, <strong>${to.name}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta.
              Clique no botão abaixo para criar uma nova senha.
            </p>

            <div style="text-align:center;margin:32px 0">
              <a href="${resetUrl}"
                style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px">
                Redefinir senha
              </a>
            </div>

            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
              Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, ignore este e-mail — sua senha permanece a mesma.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;font-size:11px;color:#d1d5db">
              © ${new Date().getFullYear()} Ato Financeiro · Se o botão não funcionar, copie e cole este link:<br>
              <span style="color:#6366f1;word-break:break-all">${resetUrl}</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          name: 'Ato Financeiro',
          email: process.env.BREVO_SENDER_EMAIL!,
        },
        to: [to],
        subject: 'Redefinição de senha — Ato Financeiro',
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo error ${res.status}: ${body}`);
    }
  },
};
