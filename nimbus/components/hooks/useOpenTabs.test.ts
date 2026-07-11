import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useOpenTabs } from "./useOpenTabs";
import type { TreeNode } from "@/types/workspace";

const fileNode: TreeNode = { name: "foo.ts", type: "file" };

describe("useOpenTabs", () => {
  it("should open a file in preview mode", async () => {
    const loadFileMock = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useOpenTabs({ loadFile: loadFileMock, clearFile: vi.fn() }),
    );

    await act(async () => {
      await result.current.selectFile(fileNode, "/foo.ts");
    });

    expect(result.current.openFiles).toEqual([
      { id: "/foo.ts", name: "foo.ts", isPreview: true },
    ]);
    expect(result.current.activeFileId).toBe("/foo.ts");
  });

  it("should open a file in non-preview mode", async () => {
    const loadFileMock = vi.fn().mockResolvedValue(true);
    const { result } = renderHook(() =>
      useOpenTabs({ loadFile: loadFileMock, clearFile: vi.fn() }),
    );

    await act(async () => {
      await result.current.openFile(fileNode, "/foo.ts");
    });

    expect(result.current.openFiles).toEqual([
      { id: "/foo.ts", name: "foo.ts", isPreview: false },
    ]);
    expect(result.current.activeFileId).toBe("/foo.ts");
  });

  it("rolls back to empty state when selectFile fails and nothing was open before", async () => {
    const loadFileMock = vi.fn().mockResolvedValue(false);
    const { result } = renderHook(() =>
      useOpenTabs({ loadFile: loadFileMock, clearFile: vi.fn() }),
    );

    await act(async () => {
      await result.current.selectFile(fileNode, "/foo.ts");
    });

    expect(result.current.openFiles).toEqual([]);
    expect(result.current.activeFileId).toBe("");
  });

  const otherNode: TreeNode = { name: "bar.ts", type: "file" };

  it("rolls back to the previously active file when selectFile fails", async () => {
    const loadFileMock = vi
      .fn()
      .mockResolvedValueOnce(true) // opening foo.ts succeeds
      .mockResolvedValueOnce(false); // opening bar.ts fails

    const { result } = renderHook(() =>
      useOpenTabs({ loadFile: loadFileMock, clearFile: vi.fn() }),
    );

    await act(async () => {
      await result.current.openFile(fileNode, "/foo.ts");
    });

    await act(async () => {
      await result.current.selectFile(otherNode, "/bar.ts");
    });

    expect(result.current.activeFileId).toBe("/foo.ts");
    expect(result.current.openFiles).toEqual([
      { id: "/foo.ts", name: "foo.ts", isPreview: false },
    ]);
  });

  it("rolls back the active tab when selectTab fails", async () => {
    const loadFileMock = vi
      .fn()
      .mockResolvedValueOnce(true) // initial open succeeds
      .mockResolvedValueOnce(false); // switching tabs fails

    const { result } = renderHook(() =>
      useOpenTabs({ loadFile: loadFileMock, clearFile: vi.fn() }),
    );

    await act(async () => {
      await result.current.openFile(fileNode, "/foo.ts");
    });

    await act(async () => {
      await result.current.selectTab("/bar.ts");
    });

    expect(result.current.activeFileId).toBe("/foo.ts");
  });
});
