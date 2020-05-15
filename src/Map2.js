class Map {
  tiles = {};

  container;

  canvas;

  level = 1;

  offset = [Math.PI, Math.PI];

  minimumLevel = 1;
  
  maximumLevel = 14;

  constructor(options) {
    this.url = options.url;
    this.container = document.getElementById(options.target);
    this.container || this.createContainer(options.target)
    this.createCanavs();
    this.registerHandler();
    this.load();
  }

  createContainer(id) {
    this.container = document.createElement('div')
    this.container.id = id;
    this.container.classList.add('map-container');
    document.body.appendChild(this.container);
  }

  createCanavs() {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('map-canvas');
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  }

  registerHandler() {
  }

  getTileRange() {
    let xCount = Math.pow(2, this.level);
    let yCount = Math.pow(2, this.level);
    let singleTileSize = Math.PI * 2 / xCount;
    let width = singleTileSize * 2;
    let left = this.offset[0] - singleTileSize;
    let right = this.offset[0] + singleTileSize;
    let top = this.offset[1] - singleTileSize;
    let bottom = this.offset[1] + singleTileSize;
  }

  load () {
    this.getTileRange();
  }

  loadTile() { }

}