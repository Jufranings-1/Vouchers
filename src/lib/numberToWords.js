const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', ' Thousand', ' Million', ' Billion'];

function threeDigitWords(n) {
  const parts = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest > 0 && rest < 20) {
    parts.push(ONES[rest]);
  } else if (rest >= 20) {
    const ones = rest % 10;
    parts.push(ones ? `${TENS[Math.floor(rest / 10)]} ${ONES[ones]}` : TENS[Math.floor(rest / 10)]);
  }
  return parts.join(' ');
}

export function pesosInWords(amount) {
  const value = Math.abs(Number(amount)) || 0;
  const pesos = Math.floor(value);
  const centavos = Math.round((value - pesos) * 100);

  let words;
  if (pesos === 0) {
    words = 'Zero';
  } else {
    const groups = [];
    let n = pesos;
    let scale = 0;
    while (n > 0 && scale < SCALES.length) {
      const group = n % 1000;
      if (group) groups.unshift(threeDigitWords(group) + SCALES[scale]);
      n = Math.floor(n / 1000);
      scale += 1;
    }
    words = groups.join(' ');
  }

  const cents = centavos ? ` and ${String(centavos).padStart(2, '0')}/100` : '';
  return `*** ${words} Pesos${cents} Only ***`;
}
