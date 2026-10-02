/**
 * Contact form delivery settings.
 *
 * The form posts to Web3Forms (https://web3forms.com), which emails each enquiry to the address the
 * access key was created for. The key is meant to be public (it only allows sending to that address).
 *
 * To switch the receiving mailbox later (e.g. to a domain email), create a new key for that address at
 * web3forms.com and paste it here, then rebuild. No other code changes are needed.
 *
 * While accessKey is empty the form falls back to opening the visitor's email app (mailto:) so an
 * enquiry is never silently lost.
 */
export const CONTACT_CONFIG = {
  accessKey: '96521786-497d-422c-ba4e-47748c232420',
  recipientEmail: 'admin@aavworks.com',
  endpoint: 'https://api.web3forms.com/submit',
  timeoutMs: 15000,
};
