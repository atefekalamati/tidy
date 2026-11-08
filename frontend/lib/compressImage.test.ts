import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage, dataUrlBytes } from "./compressImage";

let size = { width: 0, height: 0 };
let decodes = true;
let alphaValues: number[] = [255];

const drawImage = vi.fn();
const toDataURL = vi.fn((type: string) => `data:${type};base64,AAAA`);
const context = {
  drawImage,
  fillRect: vi.fn(),
  globalCompositeOperation: "source-over",
  fillStyle: "",
  getImageData: () => ({ data: alphaValues.flatMap((a) => [0, 0, 0, a]) }),
};

class FakeImage {
  naturalWidth = size.width;
  naturalHeight = size.height;
  onload?: () => void;
  onerror?: () => void;
  set src(_url: string) {
    queueMicrotask(() => (decodes ? this.onload?.() : this.onerror?.()));
  }
}

const file = (type = "image/jpeg") => new File([new Uint8Array(4)], "a", { type });
const canvasSize = () => {
  const [, , , width, height] = drawImage.mock.calls[0];
  return { width, height };
};

beforeEach(() => {
  decodes = true;
  alphaValues = [255];
  drawImage.mockClear();
  toDataURL.mockClear();
  context.fillRect.mockClear();
  context.globalCompositeOperation = "source-over";
  vi.stubGlobal("Image", FakeImage);
  URL.createObjectURL = vi.fn(() => "blob:x");
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as never);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(toDataURL as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("compressImage", () => {
  it("limits the longest side of a landscape image to 1280px", async () => {
    size = { width: 3000, height: 1500 };
    await compressImage(file());
    expect(canvasSize()).toEqual({ width: 1280, height: 640 });
  });

  it("limits the longest side of a portrait image to 1280px", async () => {
    size = { width: 1000, height: 2000 };
    await compressImage(file());
    expect(canvasSize()).toEqual({ width: 640, height: 1280 });
  });

  it("does not enlarge small images", async () => {
    size = { width: 400, height: 300 };
    await compressImage(file());
    expect(canvasSize()).toEqual({ width: 400, height: 300 });
  });

  it("encodes as JPEG at quality 0.8", async () => {
    size = { width: 100, height: 100 };
    expect(await compressImage(file())).toBe("data:image/jpeg;base64,AAAA");
    expect(toDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
  });

  it("converts a fully opaque PNG to JPEG", async () => {
    size = { width: 100, height: 100 };
    expect(await compressImage(file("image/png"))).toBe("data:image/jpeg;base64,AAAA");
  });

  it("keeps a PNG with transparency as PNG", async () => {
    size = { width: 100, height: 100 };
    alphaValues = [255, 120, 255];
    expect(await compressImage(file("image/png"))).toBe("data:image/png;base64,AAAA");
    expect(context.fillRect).not.toHaveBeenCalled();
  });

  it("puts other transparent formats on white instead of black", async () => {
    size = { width: 100, height: 100 };
    alphaValues = [0];
    expect(await compressImage(file("image/webp"))).toBe("data:image/jpeg;base64,AAAA");
    expect(context.globalCompositeOperation).toBe("destination-over");
    expect(context.fillStyle).toBe("#ffffff");
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 100, 100);
  });

  it("rejects a file that cannot be decoded and releases its URL", async () => {
    size = { width: 100, height: 100 };
    decodes = false;
    await expect(compressImage(file())).rejects.toThrow();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:x");
  });
});

describe("dataUrlBytes", () => {
  it("measures the decoded size", () => {
    expect(dataUrlBytes(`data:image/jpeg;base64,${"A".repeat(4)}`)).toBe(3);
    expect(dataUrlBytes(`data:image/png;base64,${"A".repeat(4000)}`)).toBe(3000);
  });
});
