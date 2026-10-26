import { axiosInstance } from "@/src/api/axiosInstance";
import { getViewUrls } from "@/src/api/community/communityApi";
import {
  mapCommunityImageFallbackUrls,
  resolveCommunityImageUri,
} from "@/src/hooks/community/useCommunityImageUrls";
import {
  COMMUNITY_FEED_ASPECT_RATIO,
  getCommunityDetailImageHeight,
} from "@/src/utils/communityImageLayout";

jest.mock("@/src/api/axiosInstance", () => ({
  axiosInstance: { get: jest.fn() },
}));

describe("커뮤니티 이미지 조회", () => {
  beforeEach(() => jest.clearAllMocks());

  it("복수 이미지 키를 반복된 keys 쿼리로 전송한다", async () => {
    const keys = ["posts/2026/a b.jpg", "posts/2026/b.jpg"];
    const response = { items: [] };
    const get = axiosInstance.get as jest.Mock;
    get.mockResolvedValueOnce({ data: response });

    await expect(getViewUrls(keys)).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/api/v1/files/view-urls", {
      params: { keys },
      paramsSerializer: expect.any(Function),
    });
    const options = get.mock.calls[0][1];
    expect(options.paramsSerializer()).toBe(
      "keys=posts%2F2026%2Fa%20b.jpg&keys=posts%2F2026%2Fb.jpg",
    );
  });

  it("API의 1~50개 제한을 지킨다", async () => {
    await expect(getViewUrls([])).rejects.toThrow();
    await expect(getViewUrls(Array(51).fill("key"))).rejects.toThrow();
    expect(axiosInstance.get).toHaveBeenCalledTimes(0);
  });

  it("이미지 키 대신 발급된 URL을 사용하고 기존 URL을 대체 경로로 쓴다", () => {
    expect(
      resolveCommunityImageUri("posts/a.jpg", {
        "posts/a.jpg": "https://signed.example/a.jpg",
      }),
    ).toBe("https://signed.example/a.jpg");
    expect(
      resolveCommunityImageUri("posts/a.jpg", {}, "https://api.example/a.jpg"),
    ).toBe("https://api.example/a.jpg");
    expect(resolveCommunityImageUri("posts/a.jpg", {})).toBeUndefined();
    expect(
      resolveCommunityImageUri(
        "posts/a.jpg",
        { "posts/a.jpg": "https://signed.example/a.jpg" },
        "https://api.example/a.jpg",
        { "https://signed.example/a.jpg": true },
      ),
    ).toBe("https://api.example/a.jpg");
  });

  it("상세 GET의 이미지 URL을 원래 키에 연결해 수정 화면에서 사용한다", () => {
    expect(
      mapCommunityImageFallbackUrls(
        ["posts/a.jpg", "posts/b.jpg"],
        ["https://api.example/a.jpg", "https://api.example/b.jpg"],
      ),
    ).toEqual({
      "posts/a.jpg": "https://api.example/a.jpg",
      "posts/b.jpg": "https://api.example/b.jpg",
    });
  });
});

describe("community image layout", () => {
  it("uses a responsive 4:3 frame in the feed", () => {
    expect(COMMUNITY_FEED_ASPECT_RATIO).toBe(4 / 3);
  });

  it("keeps the original ratio for a detail image", () => {
    expect(
      getCommunityDetailImageHeight({
        containerWidth: 360,
        viewportHeight: 800,
        imageWidth: 1080,
        imageHeight: 1440,
      }),
    ).toBe(480);
  });

  it("limits an excessively tall detail image to 75% of the viewport", () => {
    expect(
      getCommunityDetailImageHeight({
        containerWidth: 360,
        viewportHeight: 800,
        imageWidth: 900,
        imageHeight: 2400,
      }),
    ).toBe(600);
  });
});
