import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Terminal } from "./Terminal";

// jsdom has no matchMedia/canvas 2D context; xterm.js needs both to open.
beforeAll(() => {
  window.matchMedia ??= () =>
    ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList;
  HTMLCanvasElement.prototype.getContext = () => null;
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("Terminal", () => {
  it("mounts and unmounts without throwing", () => {
    const { unmount, container } = render(<Terminal />);

    expect(container.querySelector(".xterm")).not.toBeNull();

    expect(() => unmount()).not.toThrow();
  });
});
