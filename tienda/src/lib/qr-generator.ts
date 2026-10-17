/**
 * Generador de Código QR de Alta Gama con Nivel H (High Error Correction)
 * y soporte para incrustación de Isotipo/Logo central.
 * 
 * Implementación 100% autónoma en TypeScript sin dependencias externas.
 */

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

// Tablas estándar QR Galois Field 256
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
})();

function gfMultiply(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

function gfPolyMultiply(poly1: any, poly2: any): Uint8Array {
  const result = new Uint8Array(poly1.length + poly2.length - 1);
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      result[i + j] ^= gfMultiply(poly1[i], poly2[j]);
    }
  }
  return result;
}

function getGeneratorPolynomial(degree: number): Uint8Array {
  let poly: any = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = gfPolyMultiply(poly, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return poly;
}

function calculateReedSolomon(data: Uint8Array, ecLength: number): Uint8Array {
  const genPoly = getGeneratorPolynomial(ecLength);
  const msgPoly = new Uint8Array(data.length + ecLength);
  msgPoly.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = msgPoly[i];
    if (coef !== 0) {
      for (let j = 0; j < genPoly.length; j++) {
        msgPoly[i + j] ^= gfMultiply(genPoly[j], coef);
      }
    }
  }

  return new Uint8Array(msgPoly.slice(data.length));
}

// Configuración de versiones 1 a 10 para Nivel H
interface VersionConfigH {
  version: number;
  totalCodewords: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  blocks: { count: number; dataCodewords: number }[];
  alignmentPositions: number[];
}

const VERSIONS_H: VersionConfigH[] = [
  {
    version: 1,
    totalCodewords: 26,
    dataCodewords: 9,
    ecCodewordsPerBlock: 17,
    blocks: [{ count: 1, dataCodewords: 9 }],
    alignmentPositions: [],
  },
  {
    version: 2,
    totalCodewords: 44,
    dataCodewords: 16,
    ecCodewordsPerBlock: 28,
    blocks: [{ count: 1, dataCodewords: 16 }],
    alignmentPositions: [6, 18],
  },
  {
    version: 3,
    totalCodewords: 70,
    dataCodewords: 26,
    ecCodewordsPerBlock: 22,
    blocks: [{ count: 2, dataCodewords: 13 }],
    alignmentPositions: [6, 22],
  },
  {
    version: 4,
    totalCodewords: 100,
    dataCodewords: 36,
    ecCodewordsPerBlock: 16,
    blocks: [{ count: 4, dataCodewords: 9 }],
    alignmentPositions: [6, 26],
  },
  {
    version: 5,
    totalCodewords: 134,
    dataCodewords: 46,
    ecCodewordsPerBlock: 22,
    blocks: [
      { count: 2, dataCodewords: 11 },
      { count: 2, dataCodewords: 12 },
    ],
    alignmentPositions: [6, 30],
  },
  {
    version: 6,
    totalCodewords: 172,
    dataCodewords: 60,
    ecCodewordsPerBlock: 28,
    blocks: [{ count: 4, dataCodewords: 15 }],
    alignmentPositions: [6, 34],
  },
  {
    version: 7,
    totalCodewords: 196,
    dataCodewords: 66,
    ecCodewordsPerBlock: 26,
    blocks: [
      { count: 4, dataCodewords: 13 },
      { count: 1, dataCodewords: 14 },
    ],
    alignmentPositions: [6, 22, 38],
  },
  {
    version: 8,
    totalCodewords: 242,
    dataCodewords: 86,
    ecCodewordsPerBlock: 26,
    blocks: [
      { count: 4, dataCodewords: 14 },
      { count: 2, dataCodewords: 15 },
    ],
    alignmentPositions: [6, 24, 42],
  },
  {
    version: 9,
    totalCodewords: 292,
    dataCodewords: 108,
    ecCodewordsPerBlock: 24,
    blocks: [
      { count: 4, dataCodewords: 12 },
      { count: 4, dataCodewords: 13 },
    ],
    alignmentPositions: [6, 26, 46],
  },
  {
    version: 10,
    totalCodewords: 346,
    dataCodewords: 130,
    ecCodewordsPerBlock: 28,
    blocks: [
      { count: 6, dataCodewords: 15 },
      { count: 2, dataCodewords: 16 },
    ],
    alignmentPositions: [6, 28, 50],
  },
];

export class BitBuffer {
  private buffer: number[] = [];
  public length: number = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export function encodeDataH(text: string): { versionConfig: VersionConfigH; data: Uint8Array } {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  const textLength = textBytes.length;

  let versionConfig: VersionConfigH | null = null;
  for (const vc of VERSIONS_H) {
    const countBits = vc.version < 10 ? 8 : 16;
    const requiredBits = 4 + countBits + textLength * 8 + 4;
    const requiredCodewords = Math.ceil(requiredBits / 8);
    if (requiredCodewords <= vc.dataCodewords) {
      versionConfig = vc;
      break;
    }
  }

  if (!versionConfig) {
    versionConfig = VERSIONS_H[VERSIONS_H.length - 1];
  }

  const bb = new BitBuffer();
  bb.put(0x4, 4);

  const countBits = versionConfig.version < 10 ? 8 : 16;
  bb.put(textLength, countBits);

  for (let i = 0; i < textLength; i++) {
    bb.put(textBytes[i], 8);
  }

  const remainingBits = versionConfig.dataCodewords * 8 - bb.length;
  const termLength = Math.min(4, Math.max(0, remainingBits));
  bb.put(0, termLength);

  while (bb.length % 8 !== 0) {
    bb.putBit(false);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (bb.length < versionConfig.dataCodewords * 8) {
    bb.put(padBytes[padIndex % 2], 8);
    padIndex++;
  }

  const dataCodewords = bb.getBytes();

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;

  for (const blockInfo of versionConfig.blocks) {
    for (let i = 0; i < blockInfo.count; i++) {
      const blockData = new Uint8Array(dataCodewords.slice(offset, offset + blockInfo.dataCodewords));
      offset += blockInfo.dataCodewords;
      dataBlocks.push(blockData);
      ecBlocks.push(calculateReedSolomon(blockData, versionConfig.ecCodewordsPerBlock));
    }
  }

  const finalCodewords = new Uint8Array(versionConfig.totalCodewords);
  let finalIndex = 0;
  const maxDataBlockLen = Math.max(...dataBlocks.map((b) => b.length));

  for (let i = 0; i < maxDataBlockLen; i++) {
    for (let b = 0; b < dataBlocks.length; b++) {
      if (i < dataBlocks[b].length) {
        finalCodewords[finalIndex++] = dataBlocks[b][i];
      }
    }
  }

  for (let i = 0; i < versionConfig.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      finalCodewords[finalIndex++] = ecBlocks[b][i];
    }
  }

  return { versionConfig, data: finalCodewords };
}

export function createQRMatrix(text: string): { matrix: boolean[][]; size: number } {
  const { versionConfig, data } = encodeDataH(text);
  const size = versionConfig.version * 4 + 17;

  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const isReserved = (r: number, c: number): boolean => matrix[r][c] !== null;

  const addFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[nr][nc] = isBorder || isCenter;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  const positions = versionConfig.alignmentPositions;
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      const r = positions[i];
      const c = positions[j];
      if (
        (r === 6 && c === 6) ||
        (r === 6 && c === size - 7) ||
        (r === size - 7 && c === 6)
      ) {
        continue;
      }
      if (matrix[r][c] !== null) continue;

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isEdge = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          matrix[r + dr][c + dc] = isEdge || isCenter;
        }
      }
    }
  }

  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  matrix[4 * versionConfig.version + 9][8] = true;

  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][size - i - 1] === null) matrix[8][size - i - 1] = false;
    if (matrix[size - i - 1][8] === null) matrix[size - i - 1][8] = false;
  }

  const formatInfoH0 = 0x3a01;

  let bitIndex = 0;
  const totalBits = data.length * 8;

  let right = size - 1;
  while (right > 0) {
    if (right === 6) right--;

    const upwards = ((right + 1) / 2) % 2 === 1;

    for (let step = 0; step < size; step++) {
      const row = upwards ? size - 1 - step : step;

      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const col = right - colOffset;
        if (!isReserved(row, col)) {
          let bit = false;
          if (bitIndex < totalBits) {
            const bytePos = Math.floor(bitIndex / 8);
            const bitPos = 7 - (bitIndex % 8);
            bit = ((data[bytePos] >>> bitPos) & 1) === 1;
            bitIndex++;
          }
          if ((row + col) % 2 === 0) {
            bit = !bit;
          }
          matrix[row][col] = bit;
        }
      }
    }
    right -= 2;
  }

  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfoH0 >>> (14 - i)) & 1) === 1;
    if (i < 6) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - (15 - i)] = bit;
  }

  return {
    matrix: matrix.map((row) => row.map((cell) => cell === true)),
    size,
  };
}

export interface RenderQROptions {
  canvas: HTMLCanvasElement;
  url: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  includeLogo?: boolean;
  logoSrc?: string;
  logoSizePercent?: number;
}

export async function renderQRWithLogo({
  canvas,
  url,
  size = 1024,
  darkColor = "#2C1810",
  lightColor = "#FFFFFF",
  includeLogo = true,
  logoSrc = "/images/logo.jpg",
  logoSizePercent = 24,
}: RenderQROptions): Promise<void> {
  const { matrix, size: matrixSize } = createQRMatrix(url);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  const quietZone = 4;
  const totalModules = matrixSize + quietZone * 2;
  const moduleSize = size / totalModules;

  ctx.fillStyle = darkColor;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = (c + quietZone) * moduleSize;
        const y = (r + quietZone) * moduleSize;
        ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(moduleSize), Math.ceil(moduleSize));
      }
    }
  }

  if (includeLogo) {
    const centerSize = (size * logoSizePercent) / 100;
    const cx = size / 2;
    const cy = size / 2;
    const radius = centerSize / 2;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = Math.round(size * 0.02);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(size * 0.008);

    ctx.beginPath();
    ctx.arc(cx, cy, radius + moduleSize * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = logoSrc;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, cx - radius, cy - radius, centerSize, centerSize);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = Math.max(3, Math.round(size * 0.007));
      ctx.stroke();
      ctx.restore();
    } catch {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#8C4F37";
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${Math.round(centerSize * 0.2)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Mia Pasta", cx, cy - 6);
      ctx.fillText("Bella", cx, cy + 14);
      ctx.restore();
    }
  }
}

export function downloadQRCanvas(
  canvas: HTMLCanvasElement,
  filename: string = "Mia_Pasta_Bella_QR_Alta_Definicion.png"
) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
}
