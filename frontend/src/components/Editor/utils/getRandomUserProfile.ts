const entries = [
  "#7d0000",
  "#640000",
  "#990000",
  "#bf0000",
  "#bf4000",
  "#004000",
  "#007f00",
  "#407f00",
  "#7f7f00",
  "#000099",
  "#0000bf",
  "#0000ff",
  "#004040",
  "#404040",
  "#7f0040",
  "#bf0040",
];

export interface UserProfile {
  name: string;
  color: string;
}

export function getRandomUserProfile(name: string): UserProfile {
  const entry = entries[Math.floor(Math.random() * entries.length)];
  return {
    color: entry,
    name: name,
  };
}
