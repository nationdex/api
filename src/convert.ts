const DEC: string[] = new Array(256);
const HEX16: string[] = new Array(65536);
let cache: Map<string, string | null> | null = null;
let max = 0;

for (let i = 0; i < 256; i++) DEC[i] = "" + i;
for (let i = 0; i < 65536; i++) HEX16[i] = i.toString(16);

export function cacheIP(count?: number | string): void {
  cache = new Map();
  max = +(count ?? 10000);
}

export function convertIP(
  buffer: ArrayBuffer | Uint8Array | string,
): string | null {
  if (typeof buffer === "string") return buffer || null;
  const from = Buffer.from(buffer as ArrayBuffer);
  if (!cache) return parseIP(from);
  const key = from.toString("hex");
  let result = cache.get(key);
  if (result !== undefined) return result;
  result = parseIP(from);
  if (cache.size >= max) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(key, result);
  return result;
}

function parseIP(fm: Buffer): string | null {
  const lh = fm.length;
  if (lh === 4)
    return DEC[fm[0]] + "." + DEC[fm[1]] + "." + DEC[fm[2]] + "." + DEC[fm[3]];
  if (lh !== 16) return null;
  if (
    fm[0] === 0 &&
    fm[1] === 0 &&
    fm[2] === 0 &&
    fm[3] === 0 &&
    fm[4] === 0 &&
    fm[5] === 0 &&
    fm[6] === 0 &&
    fm[7] === 0 &&
    fm[8] === 0 &&
    fm[9] === 0 &&
    fm[10] === 0xff &&
    fm[11] === 0xff
  )
    return (
      DEC[fm[12]] + "." + DEC[fm[13]] + "." + DEC[fm[14]] + "." + DEC[fm[15]]
    );
  const p0 = (fm[0] << 8) | fm[1];
  const p1 = (fm[2] << 8) | fm[3];
  const p2 = (fm[4] << 8) | fm[5];
  const p3 = (fm[6] << 8) | fm[7];
  const p4 = (fm[8] << 8) | fm[9];
  const p5 = (fm[10] << 8) | fm[11];
  const p6 = (fm[12] << 8) | fm[13];
  const p7 = (fm[14] << 8) | fm[15];
  let bs = -1,
    bl = 0;
  let cs = -1,
    cl = 0;
  if (p0 === 0) {
    if (cs === -1) cs = 0;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p1 === 0) {
    if (cs === -1) cs = 1;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p2 === 0) {
    if (cs === -1) cs = 2;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p3 === 0) {
    if (cs === -1) cs = 3;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p4 === 0) {
    if (cs === -1) cs = 4;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p5 === 0) {
    if (cs === -1) cs = 5;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p6 === 0) {
    if (cs === -1) cs = 6;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (p7 === 0) {
    if (cs === -1) cs = 7;
    cl++;
  } else {
    if (cl > bl) {
      bs = cs;
      bl = cl;
    }
    cs = -1;
    cl = 0;
  }
  if (cl > bl) {
    bs = cs;
    bl = cl;
  }
  if (bl === 8) return "::";
  if (bl < 2) bs = -1;
  let re = "";
  let ac = false;
  let cd = false;
  const ce = bs + bl;
  if (bs === 0) {
    re = "::";
    cd = true;
    ac = true;
  }
  if (bs === -1 || 0 < bs || 0 >= ce) {
    re += HEX16[p0];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 1 < bs || 1 >= ce) {
    if (ac) re += ":";
    re += HEX16[p1];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 2 < bs || 2 >= ce) {
    if (ac) re += ":";
    re += HEX16[p2];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 3 < bs || 3 >= ce) {
    if (ac) re += ":";
    re += HEX16[p3];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 4 < bs || 4 >= ce) {
    if (ac) re += ":";
    re += HEX16[p4];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 5 < bs || 5 >= ce) {
    if (ac) re += ":";
    re += HEX16[p5];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 6 < bs || 6 >= ce) {
    if (ac) re += ":";
    re += HEX16[p6];
    ac = true;
  } else if (bs !== -1 && !cd) {
    re += ":";
    cd = true;
  }
  if (bs === -1 || 7 < bs || 7 >= ce) {
    if (ac) re += ":";
    re += HEX16[p7];
  } else if (bs !== -1 && !cd) {
    re += ":";
  }
  if (bs !== -1 && ce === 8) re += ":";
  return re;
}
