export const AVATAR_IDS = [
  "wolf",
  "rabbit",
  "cat",
  "dog",
  "bear",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const DEFAULT_AVATAR_ID: AvatarId = "wolf";

/** Legacy profile avatar_ids from the first animal set + dropped duplicate wolf ("fox"). */
const LEGACY_AVATAR_MAP: Record<string, AvatarId> = {
  owl: "rabbit",
  badger: "bear",
  otter: "dog",
  hedgehog: "cat",
  fox: "wolf",
};

export type AvatarOption = {
  id: AvatarId;
  label: string;
  src: string;
};

export const AVATARS: AvatarOption[] = [
  { id: "wolf", label: "Wolf", src: "/avatars/wolf.png?v=4" },
  { id: "rabbit", label: "Rabbit", src: "/avatars/rabbit.png?v=4" },
  { id: "cat", label: "Cat", src: "/avatars/cat.png?v=4" },
  { id: "dog", label: "Dog", src: "/avatars/dog.png?v=4" },
  { id: "bear", label: "Bear", src: "/avatars/bear.png?v=11" },
];
export function isAvatarId(value: unknown): value is AvatarId {
  return (
    typeof value === "string" &&
    (AVATAR_IDS as readonly string[]).includes(value)
  );
}

export function resolveAvatarId(value: unknown): AvatarId {
  if (typeof value !== "string") return DEFAULT_AVATAR_ID;
  if (isAvatarId(value)) return value;
  return LEGACY_AVATAR_MAP[value] ?? DEFAULT_AVATAR_ID;
}

export function getAvatarOption(id: AvatarId): AvatarOption {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
