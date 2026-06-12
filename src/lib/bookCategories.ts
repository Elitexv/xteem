/** Canonical educational sectors for cataloguing learning resources. */
export const EDUCATIONAL_BOOK_CATEGORIES = [
  "General Studies",
  "Science & Mathematics",
  "Engineering & Technology",
  "Medicine & Health Sciences",
  "Business & Economics",
  "Law & Public Policy",
  "Humanities & Social Sciences",
  "Arts & Design",
  "Agriculture & Environmental Science",
  "Education & Pedagogy",
  "Languages & Literature",
  "Computer Science & Information Systems",
] as const;

export type EducationalBookCategory = (typeof EDUCATIONAL_BOOK_CATEGORIES)[number];

export const DEFAULT_BOOK_CATEGORY: EducationalBookCategory = "General Studies";

/** Maps legacy fiction/general labels to the current educational taxonomy. */
const LEGACY_CATEGORY_MAP: Record<string, EducationalBookCategory | string> = {
  General: "General Studies",
  Fiction: "Languages & Literature",
  "Non-Fiction": "General Studies",
  Science: "Science & Mathematics",
  Technology: "Engineering & Technology",
  Business: "Business & Economics",
  History: "Humanities & Social Sciences",
  Biography: "Humanities & Social Sciences",
  "Self-Help": "Education & Pedagogy",
  Education: "Education & Pedagogy",
};

export function formatBookCategory(category: string | null | undefined): string {
  const trimmed = category?.trim();
  if (!trimmed) return DEFAULT_BOOK_CATEGORY;
  return LEGACY_CATEGORY_MAP[trimmed] ?? trimmed;
}

/** Sorted category chips: canonical order first, then any legacy extras. */
export function listCatalogCategories(bookCategories: Iterable<string | null | undefined>): string[] {
  const fromBooks = new Set<string>();
  for (const raw of bookCategories) {
    fromBooks.add(formatBookCategory(raw));
  }
  const ordered = EDUCATIONAL_BOOK_CATEGORIES.filter((c) => fromBooks.has(c));
  const extras = [...fromBooks]
    .filter((c) => !EDUCATIONAL_BOOK_CATEGORIES.includes(c as EducationalBookCategory))
    .sort((a, b) => a.localeCompare(b));
  return [...ordered, ...extras];
}
