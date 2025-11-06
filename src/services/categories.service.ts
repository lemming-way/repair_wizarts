const CATEGORIES_URL = 'https://profiback.itest24.com/api/full-data';

export type Category = {
  id: number | string;
  name: string;
  subsections: Array<{
    id: number | string;
    name: string;
    services?: Array<Record<string, unknown>>;
  }>;
} & Record<string, unknown>;

export type CategoriesResponse = Category[];

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch(CATEGORIES_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${'123'}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = (await response.json()) as CategoriesResponse;

  return data;
};
