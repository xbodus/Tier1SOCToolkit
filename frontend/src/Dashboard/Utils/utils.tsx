

export function getCookie(name:string) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1]
}



export function formatDuration(duration: string): string {
  const [datePart, timePart] = duration.replace('P', '').split('T');

  let result = [];

  // Days
  const days = parseInt(datePart) || 0;
  if (days > 0) result.push(`${days}d`);

  if (timePart) {
    // Hours
    const hours = parseInt(timePart.split('H')[0]) || 0;
    if (hours > 0) result.push(`${hours}h`);

    // Minutes
    const minMatch = timePart.match(/(\d+)M/);
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    if (minutes > 0) result.push(`${minutes}m`);

    // Seconds
    const secMatch = timePart.match(/([\d.]+)S/);
    const seconds = secMatch ? parseFloat(secMatch[1]) : 0;
    if (seconds > 0) result.push(`${Math.floor(seconds)}s`);
  }

  return result.length > 0 ? result.join(' ') : '0s';
}