import type { Member } from "@/lib/types";

// One entry per person, current or alumni.
// When someone graduates, change `status` to "alumni" and remove `execRole`.
// Get each person's OK on their bio and photo before publishing.
export const members: Member[] = [
  {
    slug: "jane-doe",
    name: "Jane Doe",
    voicePart: "Tenor I",
    status: "current",
    classYear: 2027,
    major: "[Major]",
    hometown: "[Hometown]",
    execRole: "President",
    bio: "[A few sentences in Jane's own words: how she found the group, favorite arrangement, what she does outside of singing.]",
    solos: ["[Song Title]"],
    funFact: "[Fun fact]",
  },
  {
    slug: "alex-rivera",
    name: "Alex Rivera",
    voicePart: "Tenor II",
    status: "current",
    classYear: 2027,
    major: "[Major]",
    execRole: "Music Director",
    bio: "[Bio placeholder.]",
  },
  {
    slug: "sam-chen",
    name: "Sam Chen",
    voicePart: "Baritone",
    status: "current",
    classYear: 2028,
    major: "[Major]",
    execRole: "Business Manager",
    bio: "[Bio placeholder.]",
  },
  {
    slug: "jordan-lee",
    name: "Jordan Lee",
    voicePart: "Bass",
    status: "current",
    classYear: 2029,
    major: "[Major]",
    bio: "[Bio placeholder.]",
  },
  {
    slug: "taylor-brooks",
    name: "Taylor Brooks",
    voicePart: "Vocal Percussion",
    status: "current",
    classYear: 2028,
    major: "[Major]",
    bio: "[Bio placeholder.]",
  },
  {
    slug: "morgan-ellis",
    name: "Morgan Ellis",
    voicePart: "Baritone",
    status: "alumni",
    classYear: 2024,
    major: "[Major]",
    bio: "[Alumni bio placeholder: what they're up to now, if they'd like to share.]",
  },
];

export const voicePartOrder = [
  "Tenor I",
  "Tenor II",
  "Baritone",
  "Bass",
  "Vocal Percussion",
] as const;

export const currentMembers = () =>
  members.filter((m) => m.status === "current");

export const execBoard = () =>
  members.filter((m) => m.status === "current" && m.execRole);

export const alumni = () =>
  members
    .filter((m) => m.status === "alumni")
    .sort((a, b) => b.classYear - a.classYear);

export const getMember = (slug: string) => members.find((m) => m.slug === slug);
