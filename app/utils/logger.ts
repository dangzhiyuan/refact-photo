export const logger = {
  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  }
}; 