const { runComplianceMonitoring } = require('./complianceMonitoringService');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function millisecondsUntilNextDailyRun(now = new Date(), hour = 0, minute = 5) {
  const nextRun = new Date(now);
  nextRun.setHours(hour, minute, 0, 0);
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  return nextRun.getTime() - now.getTime();
}

/** Starts an immediate check and then schedules a check daily at 00:05 local time. */
function startComplianceMonitoring({
  runMonitoring = runComplianceMonitoring,
  logger = console,
  now = () => new Date(),
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  let timer;
  let stopped = false;

  const execute = async () => {
    try {
      await runMonitoring();
    } catch (error) {
      logger.error?.('Compliance monitoring failed.', error);
    }
  };

  const scheduleNextRun = () => {
    const delay = millisecondsUntilNextDailyRun(now());
    timer = setTimer(async () => {
      await execute();
      if (!stopped) scheduleNextRun();
    }, delay);
  };

  void execute();
  scheduleNextRun();

  return () => {
    stopped = true;
    if (timer) clearTimer(timer);
  };
}

module.exports = {
  DAY_IN_MS,
  millisecondsUntilNextDailyRun,
  startComplianceMonitoring,
};
