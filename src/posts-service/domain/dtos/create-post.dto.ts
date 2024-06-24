export type CreatePostDto = {
  title: string;
  content: string;
  authorId: string;
  previewImage: string;
  categoryCodes: string[];
  summary: string;
};
