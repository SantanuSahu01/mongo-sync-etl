module.exports = {
  logger: {
    transports: ['console','daily', 'error'],
    level: 'info',
    logsDir: [`./logs/${process.env.APP_LABEL}`],
    format: ['string'],
    maxFiles: '7d',
  },
};
