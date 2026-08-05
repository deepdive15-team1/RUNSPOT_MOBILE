import fs from "node:fs";
import path from "node:path";

/**
 * ★★ 같은 리소스가 서로 다른 캐시 키로 저장되면 invalidate 가 반쪽만 동작한다.
 * 이 테스트는 런타임이 아니라 소스를 스캔한다 — RN 환경이 필요 없어서 가장 빠르다.
 */

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app", "src"];

function collectFiles(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      out.push(...collectFiles(p));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

interface KeyUse {
  file: string;
  line: number;
  raw: string;
  head: string;
}

function collectQueryKeys(): KeyUse[] {
  const uses: KeyUse[] = [];
  for (const dir of SCAN_DIRS) {
    for (const rel of collectFiles(dir)) {
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      src.split("\n").forEach((line, i) => {
        const m = line.match(/queryKey:\s*\[([^\]]*)\]/);
        if (!m) return;
        const inner = m[1].trim();
        const head = (inner.split(",")[0] ?? "")
          .trim()
          .replace(/^["'`]|["'`]$/g, "");
        uses.push({ file: rel, line: i + 1, raw: inner, head });
      });
    }
  }
  return uses;
}

/** 같은 도메인 리소스를 가리키는 키 그룹. 여기 있는 head 는 하나로 통일되어야 한다. */
const SESSION_DETAIL_HEADS = ["sessionDetail", "session"];

describe("쿼리 키 일관성", () => {
  const uses = collectQueryKeys();

  it("★ 프로젝트 전체에 하드코딩된 리터럴 쿼리 키는 0개여야 한다", () => {
    expect(uses.length).toBe(0);
  });

  it("★★ 세션 상세는 단 하나의 키 형태만 쓴다", () => {
    const offenders = uses.filter((u) => SESSION_DETAIL_HEADS.includes(u.head));
    const shapes = new Set(offenders.map((u) => u.raw.replace(/\s+/g, " ")));

    const report = offenders
      .map((u) => `  ${u.file}:${u.line}  [${u.raw}]`)
      .join("\n");

    // 현재 3종류: ["sessionDetail", id] / ["session","detail",id] / ["session", id]
    expect(`${shapes.size}종류\n${report}`).toBe(`0종류\n${report}`);
  });

  it("★ queryKey 는 리터럴 배열이 아니라 키 팩토리를 통해서만 만든다", () => {
    // 팩토리 호출은 queryKey: xxxKeys.yyy(...) 형태라 위 정규식에 안 잡힌다.
    // 잡힌 것들 = 전부 리터럴 = 전부 위반.
    const literals = uses.map((u) => `${u.file}:${u.line} [${u.raw}]`);
    expect(literals).toEqual([]);
  });

  it("★ 캐시 키에 객체를 직접 넣지 않는다 (무한 증식 방지)", () => {
    // search.tsx: ["mapMarkers", bounds] — bounds 는 지도 팬마다 새 객체다
    const objectish = uses.filter((u) =>
      /\b(bounds|params|filters|options|region|camera)\b/.test(u.raw),
    );
    const report = objectish.map((u) => `${u.file}:${u.line} [${u.raw}]`);
    expect(report).toEqual([]);
  });
});

describe("키 팩토리 규약", () => {
  it("모든 *.keys.ts 는 all() 을 노출하고 status() 는 all() 을 prefix 로 쓴다", () => {
    const keyFiles = collectFiles("src").filter((f) => /\.keys\.ts$/.test(f));
    expect(keyFiles.length).toBeGreaterThan(0);

    for (const rel of keyFiles) {
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      expect(src).toMatch(/all:\s*\(/);
      if (/status:\s*\(/.test(src)) {
        // 부분 무효화가 전체 무효화에 포함되도록 스프레드 필수
        expect(src).toMatch(/\.\.\.\w+Keys\.all\(/);
      }
    }
  });
});
