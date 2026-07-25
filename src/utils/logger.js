/**
 * Custom Logger untuk Ambacong.
 * Matikan IS_DEBUG untuk production agar performa tidak terganggu.
 */
const IS_DEBUG = true;

class Logger {
  static info(context, message, ...args) {
    if (!IS_DEBUG) return;
    console.log(`%c[${context}]`, 'color: #3b82f6; font-weight: bold;', message, ...args);
  }

  static warn(context, message, ...args) {
    if (!IS_DEBUG) return;
    console.warn(`%c[${context}]`, 'color: #eab308; font-weight: bold;', message, ...args);
  }

  static error(context, message, ...args) {
    if (!IS_DEBUG) return;
    console.error(`%c[${context}]`, 'color: #ef4444; font-weight: bold;', message, ...args);
  }

  static debug(context, message, ...args) {
    if (!IS_DEBUG) return;
    console.debug(`%c[${context}]`, 'color: #a855f7; font-weight: bold;', message, ...args);
  }
}

export default Logger;
