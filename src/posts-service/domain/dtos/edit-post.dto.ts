export type EditPostDto = {
  title: string;
  content: string;
  authorId: string;
  previewImage: string;
  summary: string;
  id: number;
  categoryCodes: string[];
};
