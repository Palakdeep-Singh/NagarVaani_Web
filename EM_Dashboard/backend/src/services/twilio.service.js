import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * sendSMS
 * @param {string} to - Recipient phone number (+91...)
 * @param {string} body - SMS content
 */
export const sendSMS = async (to, body) => {
  if (!client) {
    console.error('[Twilio] Client not initialized. Check .env keys.');
    throw new Error('SMS service unavailable');
  }

  // Ensure 'to' has country code (+91 for India if missing)
  let formattedTo = to.startsWith('+') ? to : `+91${to}`;

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formattedTo
    });
    console.log(`[Twilio] SMS sent to ${formattedTo}: SID ${message.sid}`);
    return message;
  } catch (err) {
    console.error(`[Twilio] Failed to send SMS to ${formattedTo}:`, err.message);
    throw new Error(`SMS delivery failed: ${err.message}`);
  }
};
