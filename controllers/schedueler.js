const cron = require("node-cron");

const scheduleJob = (time, job) => {
  cron.schedule(time, job);
};

module.exports = { scheduleJob };
