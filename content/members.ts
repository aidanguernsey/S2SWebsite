import type { Member } from "@/lib/types";

// Starter data. The live site reads from Sanity (edit at /studio); this file is
// only copied in by `npm run seed` and shown when Sanity isn't configured.
// Photos are paths under /public; `npm run seed` uploads them to Sanity.
export const members: Member[] = [
  {
    slug: "sean-spezzano",
    name: "Sean Spezzano",
    voicePart: "Tenor I",
    status: "current",
    classYear: 2028,
    major: "Biochemistry",
    hometown: "Livonia, NY",
    execRole: "President",
    photo: "/members/sean-spezzano.jpg",
    bio: "[A few sentences in Sean's own words: how he found the group, favorite arrangement, what he does outside of singing.]",
    solos: ["Good Old-Fashioned Lover Boy", "Movin' Out", "Virtual Insanity"],
    funFact: "Sean is studying abroad in London next Fall!",
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
