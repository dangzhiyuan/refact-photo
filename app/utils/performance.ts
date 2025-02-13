export const measurePerformance = (name: string, callback: () => void) => {
  if (__DEV__) {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`Performance [${name}]: ${end - start}ms`);
  } else {
    callback();
  }
}; 