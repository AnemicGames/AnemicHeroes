// src/utils/getRandomItemIds.js

/**
 * Fetches items from items.json and returns an array of item details
 * based on weighted dropChance.
 * @param {number} count - The number of items to drop.
 * @returns {Promise<object[]>} An array of item objects containing id, name, sprite, and other item properties.
 */
export async function getRandomItems(count = 1) {
  try {
    const response = await fetch('/assets/items.json');
    if (!response.ok) throw new Error('Failed to fetch items.json');
    const data = await response.json();
    const itemTable = data.itemTable;
    if (!Array.isArray(itemTable) || itemTable.length === 0) return [];

    const totalWeight = itemTable.reduce((sum, item) => sum + item.dropChance, 0);

    const selectedItems = [];

    for (let i = 0; i < count; i++) {
      let randomValue = Math.random() * totalWeight;

      for (const item of itemTable) {
        if (randomValue < item.dropChance) {
          selectedItems.push({
            id: item.id,
            name: item.name,
            sprite: item.sprite,
          });
          break;
        }
        randomValue -= item.dropChance;
      }
    }

    return selectedItems;

  } catch (error) {
    console.error('Error getting random items:', error);
    return [];
  }
}
