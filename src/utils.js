const numeralValues = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
const numerals = ["M", "CM", "D", "CD", "C", "CX", "L", "XL", "X", "IX", "V", "IV", "I"];

function toRomanNumerals(number) {
  let result = '';
  if (number === 0) {
    return 'N';
  } else {
    for (let i = 0; i < numerals.length; i++) {
      while (number >= numeralValues[i]) {
        number -= numeralValues[i];
        result += numerals[i];
      }
    }
    return result;
  }
}

function formatNumber(num) {
    const numStr = num.toString();
    const builder = numStr.split('');

    for (let i = numStr.length - 3; i > (num < 0 ? 1 : 0); i -= 3) {
        builder.splice(i, 0, ",");
    }

    return builder.join('') || numStr;
}

function stringHashcode(str) {
  var hash = 0,
    i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function numberArrayHashcode(array) {
  var hash = 0,
    i, chr;
  if (array.length === 0) return hash;
  for (i = 0; i < array.length; i++) {
    chr = array[i];
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function getTimeUntil(time) {
  return time - Date.now();
}

function formatTimeAmount(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  let timeString = '';

  if (hours > 0) {
      timeString += hours === 1 ? '1 hour' : `${hours} hours`;
  }

  if (minutes > 0) {
      if (timeString !== '') {
          timeString += ', ';
      }
      timeString += minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  if (remainingSeconds > 0) {
      if (timeString !== '') {
          timeString += ', ';
      }
      timeString += remainingSeconds === 1 ? '1 second' : `${remainingSeconds} seconds`;
  }

  return timeString;
}

function formatTimeUntil(seconds) {
  if (seconds === 0) return 'Now';
  const isNegative = seconds < 0;
  if (isNegative) seconds *= -1;
  return (isNegative ? '' : 'in ') + formatTimeAmount(seconds) + (isNegative ? ' ago' : '');
}

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function random(seed) {
  // LCG parameters (these values are commonly used but can be adjusted)
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  // Generate the next pseudo-random number based on the previous seed
  seed = (a * Math.pow(seed + 5, 4) + c) % m;

  // Normalize the pseudo-random number to be between 0 and 1
  return seed / m;
}

export {
    toRomanNumerals,
    formatNumber,
    stringHashcode,
    numberArrayHashcode,
    getTimeUntil,
    formatTimeUntil,
    formatTimeAmount,
    cyrb128,
    random,
}