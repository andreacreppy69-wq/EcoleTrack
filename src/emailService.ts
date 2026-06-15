import axios from 'axios';

// Load Brevo API key from environment
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

if (!BREVO_API_KEY) {
  console.warn('[BREVO] ⚠ BREVO_API_KEY environment variable is not configured');
} else {
  console.log('[BREVO] ✓ BREVO_API_KEY configured');
}

interface EmailData {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    if (!BREVO_API_KEY) {
      console.error('[BREVO] Email API key not configured - cannot send email');
      return false;
    }

    const payload = {
      sender: {
        name: 'EcolesTrack',
        email: 'noreply@ecolestrack.com',
      },
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent || emailData.htmlContent,
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    console.log('[BREVO] Email sent successfully to', emailData.to.map(t => t.email).join(', '));
    return true;
  } catch (error: any) {
    console.error('[BREVO] Error sending email:', error?.response?.data || error?.message || error);
    return false;
  }
};

// Email verification template
export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string): Promise<boolean> => {
  const baseUrl = String(process.env.BACKEND_URL || process.env.FRONTEND_URL || 'https://ecolestrack-5481.onrender.com').replace(/\/$/, '');
  const verificationUrl = `${baseUrl}/api/users/verify?token=${verificationToken}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EcolesTrack</h1>
      </div>
      <div style="background-color: #f1f5f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e293b; margin-top: 0;">Bienvenue sur EcolesTrack!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Bonjour <strong>${firstName}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Merci de vous être inscrit sur EcolesTrack. Pour activer votre compte et accéder à la plateforme, 
          veuillez cliquer sur le lien ci-dessous:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Vérifier mon adresse email
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          Si vous ne pouvez pas cliquer sur le lien, copiez et collez cette URL dans votre navigateur:<br>
          <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${verificationUrl}</code>
        </p>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Ce lien expirera dans 24 heures.
        </p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          © 2026 EcolesTrack. Tous droits réservés.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: [{ email, name: firstName }],
    subject: 'Vérifiez votre adresse email - EcolesTrack',
    htmlContent,
  });
};

// Admin notification for new user
export const sendAdminNotificationNewUser = async (adminEmail: string, firstName: string, userEmail: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EcolesTrack - Notification Admin</h1>
      </div>
      <div style="background-color: #f1f5f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e293b; margin-top: 0;">Nouvel utilisateur inscrit</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Un nouvel utilisateur s'est inscrit sur la plateforme.
        </p>
        <div style="background-color: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #475569;"><strong>Nom:</strong> ${firstName}</p>
          <p style="margin: 10px 0 0 0; color: #475569;"><strong>Email:</strong> ${userEmail}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Connectez-vous au dashboard pour voir plus de détails.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: [{ email: adminEmail, name: 'Admin' }],
    subject: `Nouvel utilisateur: ${firstName}`,
    htmlContent,
  });
};

// Admin notification for new message
export const sendAdminNotificationNewMessage = async (adminEmail: string, senderName: string, senderEmail: string, message: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EcolesTrack - Nouveau message</h1>
      </div>
      <div style="background-color: #f1f5f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e293b; margin-top: 0;">Vous avez reçu un nouveau message</h2>
        <div style="background-color: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; color: #475569;"><strong>De:</strong> ${senderName} (${senderEmail})</p>
          <p style="margin: 0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Consultez le dashboard pour répondre à ce message.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: [{ email: adminEmail, name: 'Admin' }],
    subject: `Nouveau message de ${senderName}`,
    htmlContent,
  });
};

// Payment confirmation email
export const sendPaymentConfirmationEmail = async (email: string, firstName: string, amount: number, reference: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EcolesTrack - Paiement confirmé</h1>
      </div>
      <div style="background-color: #f1f5f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #10b981; margin-top: 0;">✓ Paiement reçu</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Bonjour <strong>${firstName}</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Nous avons bien reçu votre paiement. Merci pour votre contribution!
        </p>
        <div style="background-color: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; color: #475569;"><strong>Montant:</strong> ${amount} FCFA</p>
          <p style="margin: 0; color: #475569;"><strong>Référence:</strong> ${reference}</p>
        </div>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Consultez votre dashboard pour plus de détails sur vos investissements.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: [{ email, name: firstName }],
    subject: 'Votre paiement a été confirmé',
    htmlContent,
  });
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendAdminNotificationNewUser,
  sendAdminNotificationNewMessage,
  sendPaymentConfirmationEmail,
};
