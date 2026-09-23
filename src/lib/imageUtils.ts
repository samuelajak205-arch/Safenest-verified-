export const getOptimizedImage = (url: string, width: number = 400): string => {
  if (url.includes('unsplash.com')) {
    // Basic unsplash optimization
    const base = url.split('?')[0];
    return `${base}?auto=format,compress&q=70&w=${width}`;
  }
  return url;
};
