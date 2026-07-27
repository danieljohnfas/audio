import * as jsmediatags from 'jsmediatags';

export function extractCoverArt(file) {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: function(tag) {
        const tags = tag.tags;
        let coverUrl = null;
        
        if (tags.picture) {
          const { data, format } = tags.picture;
          let base64String = '';
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          const base64 = btoa(base64String);
          coverUrl = `data:${format};base64,${base64}`;
        }
        
        resolve({
          coverUrl,
          tags: {
            title: tags.title,
            artist: tags.artist,
            album: tags.album,
          }
        });
      },
      onError: function(error) {
        console.error('Error reading tags:', error);
        // Even if reading tags fails, we can resolve with nulls rather than crashing
        resolve({
          coverUrl: null,
          tags: null
        });
      }
    });
  });
}
