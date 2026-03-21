export const categoryKeys = {
  all: ['categories'] as const,
};

export type CategoriesQueryKey = typeof categoryKeys.all;
