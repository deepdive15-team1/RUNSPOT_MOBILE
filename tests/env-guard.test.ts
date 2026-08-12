import fs from "node:fs";
import path from "node:path";

/**
 * ★★ 릴리스 사고 방지용. API 모듈 9개가 EXPO_PUBLIC_USE_MOCK 으로 목/실서버를 가른다.
 * production 빌드에 true 가 섞이면 가짜 데이터가 그대로 출시되고 런타임에 티도 안 난다.
 */

const ROOT = path.resolve(__dirname, "..");
const eas = JSON.parse(fs.readFileSync(path.join(ROOT, "eas.json"), "utf8"));

describe("EAS production 프로파일", () => {
  const prod = eas.build?.production;

  it("production 프로파일이 존재한다", () => {
    expect(prod).toBeDefined();
  });

  it("★★ EXPO_PUBLIC_USE_MOCK 이 true 가 아니다", () => {
    expect(prod?.env?.EXPO_PUBLIC_USE_MOCK).not.toBe("true");
  });

  it("★ API BASE URL은 eas.json에 하드코딩되지 않아야 한다 (EAS Secrets 사용)", () => {
    const url: string | undefined = prod?.env?.EXPO_PUBLIC_API_BASE_URL;
    expect(url).toBeUndefined();
  });

  it("네이버 지도 클라이언트 ID는 eas.json에 하드코딩되지 않아야 한다 (EAS Secrets 사용)", () => {
    expect(prod?.env?.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID).toBeUndefined();
  });
});

describe("모킹 스위치 규약", () => {
  it("EXPO_PUBLIC_USE_MOCK 은 *.index.ts 에서만 읽는다", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), {
        withFileTypes: true,
      })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === "node_modules" || e.name.startsWith(".")) continue;
          walk(rel);
        } else if (/\.(ts|tsx)$/.test(e.name)) {
          const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
          if (
            src.includes("EXPO_PUBLIC_USE_MOCK") &&
            !/\.index\.ts$/.test(e.name)
          ) {
            offenders.push(rel);
          }
        }
      }
    };
    walk("src");
    walk("app");
    expect(offenders).toEqual([]);
  });

  it("모든 API 도메인이 index 스위처를 갖는다 (실서버 직접 import 금지)", () => {
    const apiDir = path.join(ROOT, "src/api");
    const domains = fs
      .readdirSync(apiDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    for (const d of domains) {
      const files = fs.readdirSync(path.join(apiDir, d));
      const hasIndex = files.some((f) => /\.index\.ts$/.test(f));
      const hasMock = files.some((f) => /\.mock\.ts$/.test(f));
      expect({ domain: d, hasIndex, hasMock }).toEqual({
        domain: d,
        hasIndex: true,
        hasMock: true,
      });
    }
  });

  it("화면 코드는 *.index 를 통해서만 API 를 import 한다", () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), {
        withFileTypes: true,
      })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) {
          walk(rel);
          continue;
        }
        if (!/\.tsx?$/.test(e.name)) continue;
        const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
        const bad = src.match(/from "@\/src\/api\/[\w-]+\/\w+Api"/g);
        if (bad) offenders.push(`${rel}: ${bad.join(", ")}`);
      }
    };
    walk("app");
    expect(offenders).toEqual([]);
  });
});
