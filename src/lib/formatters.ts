export const extractMeetingLink = (text: string) => {
  if (!text) return "#";

  // 1. Find http/https links (even if the tutor accidentally types 'https:/' with one slash)
  const urlRegex = /(https?:\/+[^\s]+)/;
  const match = text.match(urlRegex);
  if (match) {
    // Force it to have exactly two slashes so the browser doesn't break
    return match[0].replace(/https?:\/+/, 'https://'); 
  }

  // 2. Scan for raw Google Meet links
  const meetRegex = /(meet\.google\.com\/[^\s]+)/;
  const meetMatch = text.match(meetRegex);
  if (meetMatch) return `https://${meetMatch[0]}`;

  // 3. Scan for raw Zoom links
  const zoomRegex = /([a-zA-Z0-9-]+\.zoom\.us\/[^\s]+)/;
  const zoomMatch = text.match(zoomRegex);
  if (zoomMatch) return `https://${zoomMatch[0]}`;

  // 4. If it's a single word, assume it's a link
  if (!text.trim().includes(" ")) {
    return `https://${text.trim()}`;
  }

  return "#"; 
};