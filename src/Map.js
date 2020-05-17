import { loadImage, loadImageByBlob } from "./util";
import "./style/map.css";

class Map {
  constructor(options) {
    this.url = options.url;
    this.container = document.getElementById(options.target);
    this.container || this.createContainer(options.target);
    this.tileWidth = 150;

    this.tiles = {};
    this.level = 1;
    this.offset = [Math.PI, Math.PI];
    this.minimumLevel = 1;
    this.maximumLevel = 14;
    this.radiansPixels = [];
    this.tileRadians = [];

    for (let i = this.minimumLevel; i <= this.maximumLevel; i++) {
      this.tileRadians[i] = (Math.PI * 2) / Math.pow(2, i);
      this.radiansPixels[i] = 150 / this.tileRadians[i];
    }

    this.createCanavs();
    this.registerHandler();
    this.load();
  }

  createContainer(id) {
    this.container = document.createElement("div");
    this.container.id = id;
    this.container.classList.add("map-container");
    document.body.appendChild(this.container);
  }

  createCanavs() {
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("map-canvas");
    this.container.innerHTML = "";
    this.container.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.canvas.width = 300;
    this.canvas.height = 300;
  }

  registerHandler() {
    this.container.addEventListener("mousewheel", (e) => {
      let deltaY = e.deltaY;
      if (deltaY > 0) {
        this.pop();
      } else {
        this.next();
      }
    });
    const rect = this.container.getBoundingClientRect();
    this.container.addEventListener("mousemove", (e) => {
      let left = (e.clientX - rect.left) / rect.width;
      let top = (e.clientY - rect.top) / rect.height;
      if (left < 0.5 && top < 0.5) this.target = 0;
      if (left >= 0.5 && top < 0.5) this.target = 1;
      if (left < 0.5 && top >= 0.5) this.target = 2;
      if (left >= 0.5 && top >= 0.5) this.target = 3;
    });
    this.container.addEventListener("mousedown", (e) => {
      this.moving = true;
      this.dragPos = [e.clientX, e.clientY];
    });
    document.addEventListener("mousemove", (e) => {
      if (this.moving) {
        this.offset[0] +=
          (e.clientX - this.dragPos[0]) / this.radiansPixels[this.level];
        this.offset[1] +=
          (e.clientY - this.dragPos[1]) / this.radiansPixels[this.level];
        this.dragPos = [e.clientX, e.clientY];
        const ranges = this.getTileRange();
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            if (ranges[i][j] !== this.ranges[i][i]) {
              this.load();
              break;
            }
          }
        }
        this.render();
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (this.moving) {
        this.moving = false;
      }
    });
  }

  getTileRange() {
    let xCount = Math.pow(2, this.level);
    let yCount = Math.pow(2, this.level);
    let singleTileSize = (Math.PI * 2) / xCount;
    let width = singleTileSize * 2;
    let left = this.offset[0] - singleTileSize;
    let right = this.offset[0] + singleTileSize;
    let top = this.offset[1] - singleTileSize;
    let bottom = this.offset[1] + singleTileSize;

    let tileLeft = Math.floor(left / singleTileSize);
    let tileRight = Math.floor(right / singleTileSize);
    let tileTop = Math.floor(top / singleTileSize);
    let tileBottom = Math.floor(bottom / singleTileSize);

    tileLeft = Math.max(0, tileLeft);
    tileRight = Math.min(xCount - 1, tileRight);
    tileTop = Math.max(0, tileTop);
    tileBottom = Math.min(yCount - 1, tileBottom);
    return [
      [tileLeft, tileRight],
      [tileTop, tileBottom],
    ];
  }

  async load() {
    this.ranges = this.getTileRange();
    const images = [];
    for (let x = this.ranges[0][0], i = 0; x <= this.ranges[0][1]; x++, i++) {
      for (let y = this.ranges[1][0], j = 0; y <= this.ranges[1][1]; y++, j++) {
        const url = this.url
          .replace(/{\s*z\s*}/, this.level)
          .replace(/{\s*x\s*}/, x)
          .replace(/{\s*y\s*}/, y);
        images.push(await loadImageByBlob(url));
      }
    }
    this.renderWhole(this.ranges, images);
    this.render();
  }

  renderWhole(ranges, images) {
    const xrange = ranges[0];
    const yrange = ranges[1];
    const tileSize = this.canvas.width / 2;

    this.wholeCanvas = document.createElement("canvas");
    const context = this.wholeCanvas.getContext("2d");
    this.wholeCanvas.width = tileSize * xrange.length;
    this.wholeCanvas.height = tileSize * yrange.length;

    for (let x = xrange[0], i = 0, idx = 0; x <= xrange[1]; x++, i++) {
      for (let y = yrange[0], j = 0; y <= yrange[1]; y++, j++, idx++) {
        context.drawImage(
          images[idx],
          i * tileSize,
          j * tileSize,
          tileSize,
          tileSize
        );
      }
    }
    const data = this.wholeCanvas.toDataURL();
    this.dataImage = new Image();
    this.dataImage.src = data;
    this.dataImage.onload = () => {
      this.render();
    };
  }

  pop() {
    if (this.level <= this.minimumLevel) return;
    this.level--;
    this.load();
  }

  next() {
    if (this.level >= this.maximumLevel) return;
    this.level++;
    this.load();
  }

  render() {
    const singleTileRadians = this.tileRadians[this.level];
    const left = this.ranges[0][0] * singleTileRadians;
    const top = this.ranges[1][0] * singleTileRadians;
    const origin = [
      this.offset[0] - singleTileRadians,
      this.offset[1] - singleTileRadians,
    ];
    const radiansOffset = [origin[0] - left, origin[1] - top];
    const radiansPixel = this.radiansPixels[this.level];
    const screenOffset = [
      radiansOffset[0] * radiansPixel,
      radiansOffset[1] * radiansPixel,
    ];

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(
      this.dataImage,
      screenOffset[0],
      screenOffset[1],
      this.wholeCanvas.width,
      this.wholeCanvas.height
    );
  }
}

window.Map = Map;

export default Map;
