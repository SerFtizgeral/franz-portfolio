export function mediaPath(filename) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/media/${filename}`;
}
