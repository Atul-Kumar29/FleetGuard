import { runComplianceMonitoring } from './complianceMonitoringService.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SchedulerLogger = {
  error?: (message: string, error: unknown) => void;
};

type SchedulerOptions = {
  runMonitoring?: () => Promise<unknown>;
  logger?: SchedulerLogger;
  now?: () => Date;
  setTimer?: typeof setTimeout;
  clearTimer?: typeof clearTimeout;
};

function millisecondsUntilNextDailyRun(
  now: Date = new Date(),
  hour = 0,
  minute = 5
): number {
  const nextRun = new Date(now);
  nextRun.setHours(hour, minute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
}

function startComplianceMonitoring({
  runMonitoring = runComplianceMonitoring,
  logger = console,
  now = () => new Date(),
  setTimer = setTimeout,
  clearTimer = clearTimeout
}: SchedulerOptions = {}): () => void {
  let timer: NodeJS.Timeout | undefined;
  let stopped = false;

  const execute = async (): Promise<void> => {
    try {
      await runMonitoring();
    } catch (error) {
      logger.error?.('Compliance monitoring failed.', error);
    }
  };

  const scheduleNextRun = (): void => {
    const delay = millisecondsUntilNextDailyRun(now());
    timer = setTimer(async () => {
      await execute();

      if (!stopped) {
        scheduleNextRun();
      }
    }, delay);
  };

  void execute();
  scheduleNextRun();

  return (): void => {
    stopped = true;

    if (timer) {
      clearTimer(timer);
    }
  };
}

export {
  DAY_IN_MS,
  millisecondsUntilNextDailyRun,
  startComplianceMonitoring
};
