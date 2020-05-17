class Map {
  container;

  canvas;

  currentTile = 0;

  current = [0, 0, 0];

  level = 0;

  history = [];

  url = '';

  offset = [0, 0];

  wholeImage;

  dragPos = [0, 0];

  moving = false;

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
    this.container.addEventListener('mousewheel', (e) => {
      let deltaY = e.deltaY;
      if (deltaY > 0) {
        this.pop();
      } else {
        this.next(this.target);
      }
    })
    const rect = this.container.getBoundingClientRect();
    this.container.addEventListener("mousemove", (e) => {
      let left = (e.clientX - rect.left) / rect.width;
      let top = (e.clientY - rect.top) / rect.height;
      if (left < 0.5 && top < 0.5) this.target = 0;
      if (left >= 0.5 && top < 0.5) this.target = 1;
      if (left < 0.5 && top >= 0.5) this.target = 2;
      if (left >= 0.5 && top >= 0.5) this.target = 3;
    })
    this.container.addEventListener('mousedown', (e) => {
      this.moving = true;
      this.dragPos = [e.clientX, e.clientY];
    })
    document.addEventListener('mousemove', (e) => {
      if (this.moving) {
        this.offset[0] += e.clientX - this.dragPos[0];
        this.offset[1] += e.clientY - this.dragPos[1];
        this.dragPos = [e.clientX, e.clientY]
        this.move();
      }
    })
    document.addEventListener('mouseup', (e) => {
      if (this.moving) {
        this.moving = false;
      }
    })

  }

  getTileRange () {
    let xCount = Math.pow(2, this.level);
    let yCount = Math.pow(2, this.level);
    let singleTileSize = Math.PI * 2 / xCount;
    let width = singleTileSize * 2;

  }

  pop() {
    if (this.history.length > 0) {
      let last = this.history.pop();
      this.current.forEach((i, idx) => {
        this.current[idx] = last[idx];
      })
      this.level = this.current[0] + 1;
      this.load()
    }
  }

  next(i) {
    const current = this.current;
    if (current[0] >= 17) return;

    this.history.push(current.map((item) => item))
    current[0]++;
    this.level = current[0];
    if (i === 0) {
      current[1] = current[1] << 1;
      current[2] = current[2] << 1;
    }
    if (i === 1) {
      current[1] = (current[1] << 1) + 1;
      current[2] = current[2] << 1;
    }
    if (i === 2) {
      current[1] = current[1] << 1;
      current[2] = (current[2] << 1) + 1;
    }
    if (i === 3) {
      current[1] = (current[1] << 1) + 1;
      current[2] = (current[2] << 1) + 1;
    }
    this.load()
  }

  load() {
    let current = this.current;
    let z = current[0] + 1;
    let x = current[1] << 1;
    let y = current[2] << 1;
    for (let i = y, idx = 0; i <= y + 1; i++) {
      for (let j = x; j <= x + 1; j++, idx++) {
        let tile = this.url.replace('{z}', z).replace('{x}', j).replace('{y}', i);
        let _idx = idx;
        loadImageByBlob(tile).then(image => this.render(_idx, image))
      }
    }
    this.move();
  }

  render(idx, image) {
    let x = [0, 1, 0, 1][idx];
    let y = [0, 0, 1, 1][idx];
    let context = this.canvas.getContext('2d');
    let width = context.canvas.width;
    let height = context.canvas.height;
    context.drawImage(image, x * width / 2, y * height / 2, width / 2, height / 2);
    this.wholeImage = context.canvas.toDataURL();
  }

  move() {
    let offset = this.offset;
    let context = this.canvas.getContext('2d');
    let width = context.canvas.width;
    let height = context.canvas.height;
    let image = new Image();
    image.src = this.wholeImage;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, offset[0], offset[1], width, height)
  }

}