import { AnimationSequence } from "framer-motion";

export const churchSequence: AnimationSequence = [
  [".animated-church", { opacity: 1 }, { duration: 0.2 }],
  [".animated-church", { scale: 1.2 }, { duration: 0.2 }],
  [".animated-church", { scale: 1 }, { duration: 0.2 }],
];

export const glassesSequence: AnimationSequence = [
  [".animated-glasses", { opacity: 1 }, { duration: 0.2 }],
  [".animated-glasses", { scale: 1.2 }, { duration: 0.2 }],
  [".animated-glasses", { rotate: "20deg" }, { duration: 0.2 }],
  [".animated-glasses", { rotate: "-20deg" }, { duration: 0.2 }],
  [".animated-glasses", { scale: 1, rotate: "0deg" }, { duration: 0.2 }],
];

export const giftSequence: AnimationSequence = [
  [".animated-gift", { opacity: 1 }, { duration: 0.2 }],
  [".animated-gift", { scale: 1.2 }, { duration: 0.2 }],
  [".animated-gift", { scale: 1 }, { duration: 0.2 }],
];
