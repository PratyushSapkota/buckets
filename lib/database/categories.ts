import type {
  Category,
  UserId,
} from "./types";

const notImplemented = (): never => {
  throw new Error("Not implemented");
};

export const createCategory: (
  userId: UserId,
  input: {
    name: string;
    color?: string;
  },
) => Promise<Category> = notImplemented;

export const getCategory: (
  userId: UserId,
  categoryId: string,
) => Promise<Category | undefined> = notImplemented;

export const listCategories: (userId: UserId) => Promise<Category[]> = notImplemented;

export const updateCategory: (
  userId: UserId,
  categoryId: string,
  input: {
    name?: string;
    color?: string;
  },
) => Promise<Category | undefined> = notImplemented;

export const deleteCategory: (
  userId: UserId,
  categoryId: string,
) => Promise<boolean> = notImplemented;
