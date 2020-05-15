function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute('crossorigin', 'anonymous');
    image.src = url;
    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      reject(new Error('瓦片加载失败'))
    }
  });
}

function loadImageByBlob(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      return res.blob();
    }).then((blob) => {
      const imageUrl = URL.createObjectURL(blob);
      let image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(image);
      }
    })
  })
}