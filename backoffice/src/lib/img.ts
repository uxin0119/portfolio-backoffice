// 상품명 기반 AI 상품 이미지 URL (Pollinations, 키 불필요). 백엔드 imageUrl이 없을 때 폴백.
export function productImageUrl(name: string, seed: number | string = 0): string {
  const prompt = `${name} product photo, white background, studio lighting, ecommerce`;
  const s = typeof seed === "number" ? Math.abs(seed) : Math.abs(hashCode(seed));
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true&seed=${s}`;
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}
