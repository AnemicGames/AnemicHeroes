// src/utils/getRandomItemIds.js

/**
 * Fetches items from items.json and returns an array of item IDs
 * based on weighted dropChance.
 * @param {number} count - The number of items to drop.
 * @returns {Promise<string[]>} An array of dropped item IDs.
 */
export async function getRandomItemIds(count = 1) {
    try {
      const response = await fetch('/assets/items.json');
      if (!response.ok) throw new Error('Failed to fetch items.json');
      const data = await response.json();
      const itemTable = data.itemTable;
      if (!Array.isArray(itemTable) || itemTable.length === 0) return [];
  
      const totalWeight = itemTable.reduce((sum, item) => sum + item.dropChance, 0);
  
      const selectedIds = [];
  
      for (let i = 0; i < count; i++) {
        let randomValue = Math.random() * totalWeight;
  
        for (const item of itemTable) {
          if (randomValue < item.dropChance) {
            selectedIds.push(item.id);
            break;
          }
          randomValue -= item.dropChance;
        }
      }
  
      return selectedIds;
  
    } catch (error) {
      console.error('Error getting random item IDs:', error);
      return [];
    }
  }
  