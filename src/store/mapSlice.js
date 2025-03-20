export const createMapSlice = (set, get) => ({
    currentPosition: { id: "0-0" },
    setPosition: (id) => set(() => ({ currentPosition: { id } })),
    resetPosition: () => {
        const startPosition = get()
            .map.flat()
            .find((cell) => cell.type === "START");
        if (startPosition) {
            set(() => ({ currentPosition: { id: startPosition.id } }));
        }
    },
    setEncounterType: (encounterType) => set(() => ({ encounterType })),
    setEncounterDifficulty: (encounterDifficulty) =>
        set(() => ({ encounterDifficulty })),
    map: [],
    initializeMap: async () => {
        await get().setMap();
    },
    setMap: async () => {
        try {
            const response = await fetch("/assets/maps.json");
            if (!response.ok) {
                throw new Error("Failed to fetch map");
            }
            const data = await response.json();
            console.log("Fetched map data:", data);
    
            const mapNames = Object.keys(data);
            if (mapNames.length === 0) {
                throw new Error("No maps available in the data");
            }
            const randomMapName = mapNames[Math.floor(Math.random() * mapNames.length)];
            const newMap = data[randomMapName];
            const startPosition = newMap.flat().find(cell => cell.type === "START");
            set(() => ({
                map: newMap,
                currentPosition: startPosition ? { id: startPosition.id } : { id: "0-0" },
            }));
        } catch (error) {
            console.error("Error fetching map:", error);
        }
    },

    clearMap: () => set(() => ({ map: [] })),
});
