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
    initializeMap: async (mapName) => {
        await get().setMap(mapName);
    },
    setMap: async (mapName) => {
        try {
            const response = await fetch("/assets/maps.json");
            if (!response.ok) {
                throw new Error("Failed to fetch map");
            }
            const data = await response.json();
            console.log("Fetched map data:", data);
    
            if (!data[mapName]) {
                throw new Error(`Map "${mapName}" not found in the data`);
            }
    
            const newMap = data["map2"];
            const startPosition = newMap.flat().find((cell) => cell.type === "START");
    
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
