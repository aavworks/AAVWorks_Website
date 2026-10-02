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
  accessKey: '139a1399-6b2d-4a46-95fc-93af360a4741',
  recipientEmail: 'info.aavworks@gmail.com',
  endpoint: 'https://api.web3forms.com/submit',
  timeoutMs: 15000,
};
