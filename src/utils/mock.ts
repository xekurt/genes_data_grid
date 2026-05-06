function generateMockSamples(median: number, count: number = 50): number[] {
  if (median <= 0) return Array(count).fill(0).map(() => Math.random() * 0.1);
  
  const mu = Math.log(median);
  const sigma = 0.4; // Fixed standard deviation for simulation
  const samples: number[] = [];

  for (let i = 0; i < count; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
    // Transform to log-normal
    const val = Math.exp(mu + sigma * z);
    samples.push(val);
  }
  return samples;
}

export { generateMockSamples };