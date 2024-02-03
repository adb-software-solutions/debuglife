export default function generateInitialsSVG(
    name: string,
    color: string,
    textColor: string,
) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return `
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="${color}" />
        <text x="50%" y="50%" font-family="Arial" font-size="12px" fill="${textColor}" dy=".3em" text-anchor="middle">${initials}</text>
      </svg>
    `;
}
