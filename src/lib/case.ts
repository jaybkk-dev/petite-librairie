const SMALL_WORDS = new Set([
  'a', 'à', 'au', 'aux',
  'de', 'du', 'des',
  'le', 'la', 'les', "l'", "d'", "qu'",
  'et', 'ou', 'mais', 'ni', 'or', 'car', 'donc',
  'en', 'avec', 'sans', 'pour', 'par', 'sur', 'sous', 'dans', 'chez', 'vers',
  'of', 'the', 'and', 'in', 'on', 'at', 'to', 'for', 'with',
  'von', 'van', 'der', 'die', 'das',
]);

export function smartCase(input: string): string {
  const tokens = input.toLowerCase().split(/(\s+|-|'|—|–)/);
  let firstWordIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] && !/^[\s\-'—–]+$/.test(tokens[i])) {
      firstWordIndex = i;
      break;
    }
  }
  return tokens
    .map((token, i) => {
      if (!token) return token;
      if (/^[\s\-'—–]+$/.test(token)) return token;
      if (i === firstWordIndex) return capitalize(token);
      if (SMALL_WORDS.has(token)) return token;
      return capitalize(token);
    })
    .join('');
}

export function maybeNormalizeCase(input: string): string {
  if (!input) return input;
  if (/[a-zà-ÿ]/.test(input)) return input;
  return smartCase(input);
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1);
}
