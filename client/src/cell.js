import utils from "./utils";

class Cell {
  static directions = {
    up: [-1, 0],
    upRight: [-1, 1],
    right: [0, 1],
    downRight: [1, 1],
    down: [1, 0],
    downLeft: [1, -1],
    left: [0, -1],
    upLeft: [-1, -1],
  };

  static verArr = ["up", "down"];
  static horArr = ["left", "right"];

  find(row, col) {
    const dirs = utils
      .shuffleArr([...Cell.verArr, ...Cell.horArr])
      .map((str) => ({
        str,
        potential: this.countByDir(row, col, Cell.directions[str]),
        hit: 0,
      }))
      .filter((dir) => dir.potential > 0);

    if (!this.enoughPotential(dirs)) return false;

    this.start = [row, col];
    this.dirs = dirs;
    this.totalHit = 0;

    return true;
  }

  enoughPotential(dirs) {
    const ver = this.sumPotential(dirs, Cell.verArr);
    const hor = this.sumPotential(dirs, Cell.horArr);
    const mx = Math.max(ver, hor);

    return Cell.shipArr.some((s) => s && mx >= s);
  }

  sumPotential(dirs, strs) {
    return dirs
      .filter((d) => strs.includes(d.str))
      .reduce((sum, d) => sum + d.potential, 1);
  }

  countByDir(row, col, dir) {
    let c = -1;

    while (this.isClear(row, col)) {
      ++c;
      [row, col] = Cell.next([row, col], dir);
    }

    return c;
  }

  isClear(row, col) {
    const mat = Cell.matrixTrack;

    return (
      Cell.isInBounds(row, col) &&
      !mat[row][col].hit &&
      Object.values(Cell.directions).every((dir) => {
        const [i, j] = Cell.next([row, col], dir);
        return !Cell.isInBounds(i, j) || !mat[i][j].ship;
      })
    );
  }

  onShip() {
    return this.totalHit > 0 && this.enoughPotential(this.dirs);
  }

  nextCoordinates() {
    return this.nextNoShip();
  }

  nextNoShip() {
    const d = this.dirs[0];
    const mat = Cell.matrixTrack;
    let [i, j] = this.start;

    do {
      [i, j] = Cell.next([i, j], Cell.directions[d.str]);
    } while (mat[i][j].ship);

    return [i, j];
  }

  hit(row, col) {
    Cell.matrixTrack[row][col].hit = true;
    Cell.matrixTrack[row][col].ship = true;
    ++this.totalHit;

    if (!Cell.shipArr.some((s) => s && s > this.totalHit)) return this.reset();
    if (this.totalHit === 2) this.removeIrrelevantDirs();
    if (this.isDirDone()) this.changeToOpposite();
  }

  miss(row, col) {
    Cell.matrixTrack[row][col].hit = true;

    if (this.totalHit === 0) return;
    if (this.totalHit === 1) return this.dirs.shift();
    this.changeToOpposite();
  }

  changeToOpposite() {
    const d = this.dirs[0];
    const opp = this.getOpposite(d);

    if (!opp) return this.reset();

    opp.potential += d.hit;
    opp.hit += d.hit;
    this.dirs = [opp];
  }

  isDirDone() {
    if (this.totalHit === 1) return;

    const d = this.dirs[0];

    return ++d.hit === d.potential;
  }

  removeIrrelevantDirs() {
    const d = this.dirs[0];
    const opp = this.getOpposite(d);

    this.dirs = [d, opp].filter((x) => x);
  }

  getOpposite(dir) {
    const strs = Cell.verArr.includes(dir.str) ? Cell.verArr : Cell.horArr;
    const idx = strs.indexOf(dir.str) ^ 1;

    return this.dirs.find((d) => d.str === strs[idx]);
  }

  reset() {
    const arr = Cell.shipArr;

    delete arr[arr.indexOf(this.totalHit)];
    this.totalHit = 0;
  }

  static isInBounds(r, c) {
    const { nrow, ncol } = utils;

    return r >= 0 && r < nrow && c >= 0 && c < ncol;
  }

  static next(from, dir) {
    return [from[0] + dir[0], from[1] + dir[1]];
  }
}

export default Cell;
