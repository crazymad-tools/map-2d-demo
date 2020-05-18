class Tile {
  constructor(image) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 256;
    this.canvas.height = 256;
    this.context = this.canvas.getContext("2d");
    this.image = image;
    this.render();
  }
  
  render() {
    this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
  }
}

export default Tile;
