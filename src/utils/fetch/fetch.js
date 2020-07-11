export async function fetchRandomText() {
  number = Math.floor(Math.random() * 5) + 1;
  const res = await fetch(`../../assets/sampleText/sample-${number}.txt`);
  const text = await res.text();
  return text;
}
