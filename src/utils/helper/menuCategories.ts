type TMenuCategorySource = { category?: string };

export function getMenuCategoryKey(category: string): string {
	return category.trim().toLowerCase();
}

/** Unique menu category display names; case-insensitive match counts as one. */
export function getUniqueMenuCategories(menus: TMenuCategorySource[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const menu of menus) {
		const cat = menu.category?.trim();
		if (!cat) continue;

		const key = getMenuCategoryKey(cat);
		if (seen.has(key)) continue;

		seen.add(key);
		result.push(cat);
	}

	return result;
}
