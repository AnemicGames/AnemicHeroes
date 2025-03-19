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
    initializeMap: async (mapName = "map1") => {
        await get().setMap(mapName);
    },
    setMap: async (mapName = "map1") => {
        try {
            const response = await fetch("/assets/maps.json");
            if (!response.ok) {
                throw new Error("Failed to fetch map");
            }
            const data = await response.json();
            console.log("Fetched map data:", data); // Log the fetched data

            if (!data[mapName]) {
                throw new Error(`Map "${mapName}" not found in the data`);
            }

            // Log the specific map being set
            console.log("Setting map:", data[mapName]);
            set(() => ({ map: data[mapName] }));
        } catch (error) {
            console.error("Error fetching map:", error);
        }
    },
});
