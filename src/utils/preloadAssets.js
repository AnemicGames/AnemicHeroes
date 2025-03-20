export async function preloadAssets(assets, onProgress) {
  const totalImages = assets.images.length;
  let loadedImages = 0;

  // 1) Load all images
  const imagePromises = assets.images.map((path) =>
    loadImage(path).then(() => {
      loadedImages++;
      onProgress?.(loadedImages, totalImages);
    })
  );

  // 2) Load JSON data (optional, if you want to “preload” it)
  const dataPromises = assets.data.map((path) => loadJson(path));

  // 3) Load audio files
  const audioPromises = assets.audio.map((path) => loadAudio(path));

  // Wait for all to complete
  await Promise.all([...imagePromises, ...dataPromises, ...audioPromises]);
}

// Helpers:

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = (err) => {
      console.error('Failed to load image:', src, err);
      reject(err);
    };
    img.src = src;
  });
}

async function loadJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`JSON fetch failed: ${url}, status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load JSON:', url, error);
  }
}

function loadAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';

    audio.oncanplaythrough = () => resolve(src);

    audio.onerror = (err) => {
      console.error('Failed to load audio:', src, err);
      reject(err);
    };

    audio.src = src;
    audio.load();
  });
}
