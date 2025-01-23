import { Design } from "@/data/designs";

const shareMessage = (design: Design) => {
  return `Hey! Check out this ${design.name} bandana by Bandit Brothers\n${window.location.origin}/designs/${design.id}`;
};

export const shareDesign = async (design: Design) => {
  try {
    await navigator.share({
      title: `Share ${design.name}`,
      text: shareMessage(design),
    });
  } catch (e) {
    console.error(e);
  }
};
