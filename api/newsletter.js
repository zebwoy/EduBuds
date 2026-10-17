import subscribeHandler from './subscribe.js';

/**
 * Backward compatibility route for POST /api/newsletter
 * Delegates directly to the Vercel serverless subscribe handler.
 */
export default async function handler(req, res) {
  return subscribeHandler(req, res);
}