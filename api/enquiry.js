const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const SCORE_THRESHOLD = 0.5;
const EXPECTED_ACTION = 'contact_enquiry';
const ALLOWED_HOSTNAMES = new Set(['moonstoneadvocates.com', 'www.moonstoneadvocates.com']);

const text = (value, maxLength = 2000) => String(value ?? '').trim().slice(0, maxLength);

const respond = (response, status, body) => {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  return response.end(JSON.stringify(body));
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return respond(response, 405, { ok: false, message: 'Method not allowed.' });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY is not configured.');
    return respond(response, 503, { ok: false, message: 'Enquiry verification is temporarily unavailable. Please contact the firm by telephone or email.' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return respond(response, 400, { ok: false, message: 'The enquiry could not be read. Please review the form and try again.' });
    }
  }

  const token = text(body?.recaptchaToken, 4096);
  if (!token) {
    return respond(response, 400, { ok: false, message: 'Security verification was not completed. Please try again.' });
  }

  try {
    const verificationResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token })
    });
    const verification = await verificationResponse.json();
    const score = Number(verification.score ?? 0);
    const validHostname = ALLOWED_HOSTNAMES.has(verification.hostname);
    const verified = verification.success === true
      && verification.action === EXPECTED_ACTION
      && validHostname
      && score >= SCORE_THRESHOLD;

    if (!verified) {
      console.warn('reCAPTCHA verification rejected an enquiry.', {
        success: verification.success,
        action: verification.action,
        hostname: verification.hostname,
        score,
        errors: verification['error-codes']
      });
      return respond(response, 403, { ok: false, message: 'We could not verify this enquiry. Please wait a moment and try again.' });
    }

    const enquiry = {
      matter: text(body.matter, 160),
      subservice: text(body.subservice, 200),
      matterStage: text(body.matter_stage, 160),
      matterReference: text(body.matter_reference, 500),
      deadline: text(body.deadline, 40),
      documents: text(body.documents, 40),
      name: text(body.name, 160),
      email: text(body.email, 254),
      phone: text(body.phone, 80),
      organisation: text(body.organisation, 200),
      contactMethod: text(body.contact_method, 40),
      message: text(body.message, 5000)
    };
    if (!enquiry.matter || !enquiry.name || !enquiry.email || !enquiry.message || body.consent !== 'on') {
      return respond(response, 400, { ok: false, message: 'Please complete all required fields before submitting your enquiry.' });
    }

    const subject = `Website enquiry: ${enquiry.matter}${enquiry.subservice ? ` - ${enquiry.subservice}` : ''}`;
    const emailBody = [
      `Legal service: ${enquiry.matter}`,
      `Specific assistance: ${enquiry.subservice || 'Not selected'}`,
      `Current stage: ${enquiry.matterStage || 'Not provided'}`,
      `Relevant details: ${enquiry.matterReference || 'Not provided'}`,
      `Important deadline: ${enquiry.deadline || 'Not provided'}`,
      `Formal documents received: ${enquiry.documents || 'Not provided'}`,
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      `Telephone: ${enquiry.phone || 'Not provided'}`,
      `Organisation: ${enquiry.organisation || 'Not provided'}`,
      `Preferred response: ${enquiry.contactMethod || 'Email'}`,
      '',
      'Enquiry:',
      enquiry.message
    ].join('\n');
    const mailtoUrl = `mailto:info@moonstoneadvocates.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    return respond(response, 200, { ok: true, mailtoUrl });
  } catch (error) {
    console.error('reCAPTCHA verification request failed.', error);
    return respond(response, 502, { ok: false, message: 'Security verification is temporarily unavailable. Please try again shortly.' });
  }
}
