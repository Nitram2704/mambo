import { FoodItem } from '@/data/foodDatabase';

const OFF_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
    try {
        const url = `${OFF_API_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.products) return [];

        return data.products.map((product: any) => {
            // Map OFF data to our FoodItem interface
            // OFF values are usually per 100g
            const servingSize = product.serving_size || '100g';

            // Nutriments are often per 100g
            const calories = product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0;
            const protein = product.nutriments?.protein_100g || product.nutriments?.protein || 0;
            const carbs = product.nutriments?.carbohydrates_100g || product.nutriments?.carbohydrates || 0;
            const fats = product.nutriments?.fat_100g || product.nutriments?.fat || 0;

            return {
                id: `off_${product.code}`,
                name: product.product_name || 'Producto desconocido',
                category: 'snacks', // Default category, hard to map perfectly without complex logic
                servingSize: servingSize,
                calories: Math.round(calories),
                protein: Math.round(protein * 10) / 10,
                carbs: Math.round(carbs * 10) / 10,
                fats: Math.round(fats * 10) / 10,
                brand: product.brands || undefined,
                image: product.image_front_small_url, // Optional: we might want to add image support later
                isGeneric: false,
                source: 'openfoodfacts'
            };
        }).filter((item: FoodItem) => item.name && item.calories > 0); // Filter out bad data

    } catch (error) {
        console.error('Error searching OpenFoodFacts:', error);
        return [];
    }
}

export async function getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 1 || !data.product) return null;

        const product = data.product;
        const servingSize = product.serving_size || '100g';

        const calories = product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0;
        const protein = product.nutriments?.protein_100g || product.nutriments?.protein || 0;
        const carbs = product.nutriments?.carbohydrates_100g || product.nutriments?.carbohydrates || 0;
        const fats = product.nutriments?.fat_100g || product.nutriments?.fat || 0;

        return {
            id: `off_${product.code}`,
            name: product.product_name || 'Producto desconocido',
            category: 'snacks', // Default
            servingSize: servingSize,
            calories: Math.round(calories),
            protein: Math.round(protein * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            fats: Math.round(fats * 10) / 10,
            brand: product.brands || undefined,
            image: product.image_front_small_url,
            isGeneric: false,
            source: 'openfoodfacts'
        };
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
}
