// Vercel serverless entry point. The API folder is loaded as CommonJS by
// Vercel, while the Express server uses native ESM.
let appPromise;

module.exports = async (req, res) => {
  appPromise ||= import('../server/server.js').then(module => module.default);
  const app = await appPromise;
  return app(req, res);
};
