/* ORPHEUS ENGINE — WORLD GENERATION SYSTEM (worldgen.js)
   Liminal Procedural Horror Architecture Generator
*/

const WorldGen = {
  grid: [],
  size: 40,

  init(size = 40) {
    this.size = size;
    this.grid = [];
    this.generateBaseGrid();
    this.addLiminalRepetition();
    this.addLandmarks();
    this.addImpossibleGeometry();
    this.addEnvironmentalDecals();
  },

  generateBaseGrid() {
    for (let z = 0; z < this.size; z++) {
      this.grid[z] = [];
      for (let x = 0; x < this.size; x++) {
        // base corridors
        const isWall = Math.random() < 0.28;
        this.grid[z][x] = isWall ? 1 : 0;
      }
    }
  },

  addLiminalRepetition() {
    // repeating corridor pattern ("I've been here before" effect)
    for (let i = 2; i < this.size - 2; i += 6) {
      for (let j = 2; j < this.size - 2; j += 6) {
        const pattern = Math.random() < 0.7 ? 1 : 0;
        this.grid[i][j] = pattern;
        this.grid[i][j + 1] = pattern;
        this.grid[i + 1][j] = pattern;
      }
    }
  },

  addLandmarks() {
    // recognizable anchor points
    this.grid[5][5] = 4; // safe room
    this.grid[this.size - 6][this.size - 6] = 3; // exit gate
    this.grid[Math.floor(this.size / 2)][Math.floor(this.size / 2)] = 5; // anomaly hub
  },

  addImpossibleGeometry() {
    // broken spatial logic zones
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(Math.random() * this.size);
      const z = Math.floor(Math.random() * this.size);
      this.grid[z][x] = 6; // distortion node

      // ripple effect
      if (this.grid[z + 1]) this.grid[z + 1][x] = 1;
      if (this.grid[z][x + 1]) this.grid[z][x + 1] = 1;
    }
  },

  addEnvironmentalDecals() {
    // metadata markers (pipes, stains, wet floors)
    for (let z = 0; z < this.size; z++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[z][x] === 0) {

          const r = Math.random();

          if (r < 0.03) this.grid[z][x] = 10; // leaking pipe
          else if (r < 0.06) this.grid[z][x] = 11; // wet floor
          else if (r < 0.08) this.grid[z][x] = 12; // ceiling stain
          else if (r < 0.09) this.grid[z][x] = 13; // flickering light zone
        }
      }
    }
  },

  getTile(x, z) {
    if (x < 0 || z < 0 || x >= this.size || z >= this.size) return 1;
    return this.grid[z][x];
  },

  isWall(x, z) {
    return this.getTile(x, z) === 1;
  },

  isHazard(x, z) {
    const t = this.getTile(x, z);
    return t === 10 || t === 13;
  }
};

window.WorldGen = WorldGen;

window.addEventListener("load", () => {
  WorldGen.init(40);
});
