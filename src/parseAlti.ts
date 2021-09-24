import fs from "fs";
import path from "path";

const filePath = path.resolve(
  "./raw-data",
  // "BDALTIV2_25M_FXX_0650_6250_MNT_LAMB93_IGN69.asc",
  // "BDALTIV2_25M_FXX_0650_6275_MNT_LAMB93_IGN69.asc",
  "BDALTIV2_25M_FXX_0700_6250_MNT_LAMB93_IGN69.asc",
);

const fileString = fs.readFileSync(filePath).toString();

// https://desktop.arcgis.com/fr/arcmap/latest/tools/conversion-toolbox/ascii-to-raster.htm

interface ArcRasterFile {
  lines: number[][];
  // private ncols: number;
  // private nrows: number;
  // private xllcorner: number;
  // private yllcorner: number;
  // private cellsize: number;
}

const fileLines = fileString.split("\n");
console.log(fileLines.length);

const arcRasterFile: ArcRasterFile = {
  lines: fileLines
    .slice(6)
    .map((line) => line.split(" ").map((s) => Number(s))),
};

const r = 10;

const maxLines: number[][] = [];

const lines = arcRasterFile.lines;

for (let y = r; y < lines.length - r; y = y + 2 * r) {
  const line = lines[y];
  // console.log(line);
  const lineMax = [];
  for (let x = r; x < line.length - r; x = x + 2 * r) {
    let localMax = 0;
    for (let yy = y - r; yy < y + r - r; yy++) {
      const ll = lines[yy].slice(x - r, x + r);
      localMax = Math.max(localMax, Math.max(...ll));
    }
    // console.log(localMax);
    lineMax.push(localMax);
  }
  maxLines.push(lineMax);
}

// console.log(maxLines);

const maxima = [];
for (let i = 1; i < maxLines.length - 1; i++) {
  const line = maxLines[i];
  const lineAbove = maxLines[i - 1];
  const lineBelow = maxLines[i + 1];
  for (let j = 1; j < line.length - 1; j++) {
    const altAboveLeft = lineAbove[j - 1];
    const altAbove = lineAbove[j];
    const altAboveRight = lineAbove[j + 1];
    const altLeft = line[j - 1];
    const alt = line[j];
    const altRight = line[j + 1];
    const altBelowLeft = lineBelow[j - 1];
    const altBelow = lineBelow[j];
    const altBelowRight = lineBelow[j + 1];

    if (
      alt > altLeft &&
      alt > altRight &&
      alt > altBelow &&
      alt > altAbove &&
      alt > altBelowLeft &&
      alt > altBelowRight &&
      alt > altAboveLeft &&
      alt > altAboveRight
    ) {
      maxima.push(alt);
      console.log(`Local summit found @ ${alt*3.28084}ft`);
    }
  }
}

console.log(maxima.length);

// 0650 + 1000 * 25 * x = 0675

// 650000m

