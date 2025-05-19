module.exports = {
  logger: {
    transports: ['daily', 'error'],
    level: 'info',
    logsDir: [`/mnt/logs/${process.env.NODE_ENV}/${process.env.APP_LABEL}`],
    format: ['string'],
    maxFiles: '45d',
  },
};
