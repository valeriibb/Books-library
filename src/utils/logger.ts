type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const format = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const base = { level, message, timestamp: new Date().toISOString() } as any;
  if (meta) Object.assign(base, { meta });
  return JSON.stringify(base);
};

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => console.debug(format('debug', msg, meta)),
  info: (msg: string, meta?: Record<string, unknown>) => console.info(format('info', msg, meta)),
  warn: (msg: string, meta?: Record<string, unknown>) => console.warn(format('warn', msg, meta)),
  error: (msg: string, meta?: Record<string, unknown>) => console.error(format('error', msg, meta)),
};

export default logger;

