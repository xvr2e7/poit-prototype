// Perlin noise implementation for organic motion
export const perlin = (() => {
  const permutation = new Array(256)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256));
  const p = new Array(512);
  for (let x = 0; x < 512; x++) {
    p[x] = permutation[x & 255];
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(t, a, b) {
    return a + t * (b - a);
  }

  function grad(hash, x) {
    const h = hash & 15;
    const grad = 1 + (h & 7);
    return (h & 8 ? -grad : grad) * x;
  }

  return function (x) {
    const X = Math.floor(x) & 255;
    x -= Math.floor(x);
    const u = fade(x);

    const a = p[X];
    const b = p[X + 1];

    return lerp(u, grad(a, x), grad(b, x - 1)) * 0.5 + 0.5;
  };
})();

// Linear interpolation for smooth transitions
export const lerp = (start, end, amt) => {
  return (1 - amt) * start + amt * end;
};

// Easing functions for natural motion
export const easing = {
  // Exponential ease out for smooth deceleration
  easeOut: (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  // Elastic ease out for bouncy effects
  elasticOut: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Custom water-like motion
  fluid: (t) => {
    return Math.sin(t * Math.PI * 2) * Math.exp(-t * 3);
  },
};

// Animation timing helpers
export const timing = {
  // Frame timing for performance monitoring
  now: () =>
    typeof performance !== "undefined" ? performance.now() : Date.now(),

  // Duration calculations
  getDuration: (start) => timing.now() - start,

  // Frame rate monitoring
  getFPS: (duration) => 1000 / duration,
};
