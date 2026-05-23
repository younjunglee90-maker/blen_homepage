export type SupportMailtoFields = {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function buildSupportMailto({
  to,
  name,
  email,
  subject,
  message,
}: SupportMailtoFields): string {
  const mailSubject = subject.trim() || `Support request from ${name}`;
  const body = [`Name: ${name}`, `Email: ${email}`, '', message.trim()].join('\n');

  // encodeURIComponent uses %20 for spaces. URLSearchParams uses + which Windows Mail
  // shows literally instead of decoding to spaces.
  const query = [
    `subject=${encodeURIComponent(mailSubject)}`,
    `body=${encodeURIComponent(body)}`,
  ].join('&');

  return `mailto:${to}?${query}`;
}
