import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWorkspaceFiles } from "./useWorkspaceFiles";
import { fetchWorkspaceFile, FileNotFoundError } from "@/lib/workspaceApi";

// fetchWorkspaceFile is the only thing that actually hits the network, so it's
// the one piece we mock. FileNotFoundError stays the real class (via
// importOriginal) since useWorkspaceFiles' catch block does an `instanceof`
// check against it - a fake class wouldn't match.
vi.mock("@/lib/workspaceApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/workspaceApi")>();
  return {
    ...actual,
    fetchWorkspaceFile: vi.fn(),
  };
});

const mockedFetchWorkspaceFile = vi.mocked(fetchWorkspaceFile);

describe("useWorkspaceFiles", () => {
  beforeEach(() => {
    mockedFetchWorkspaceFile.mockReset();
  });

  it("loads a file successfully", async () => {
    mockedFetchWorkspaceFile.mockResolvedValue({
      path: "/foo.ts",
      name: "foo.ts",
      content: "hello",
    });

    const openVirtualFile = vi.fn();
    const { result } = renderHook(() =>
      useWorkspaceFiles({ openVirtualFile, setIsDirty: vi.fn() }),
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.loadWorkspaceFile("/foo.ts");
    });

    expect(success).toBe(true);
    expect(openVirtualFile).toHaveBeenCalledWith(
      { name: "foo.ts", contents: "hello" },
      false,
    );
    expect(result.current.activeFilePath).toBe("/foo.ts");
    expect(result.current.fileError).toBeNull();
  });

  it("shows a File Not Found error and does not touch the editor content", async () => {
    mockedFetchWorkspaceFile.mockRejectedValue(
      new FileNotFoundError("/missing.ts"),
    );

    const openVirtualFile = vi.fn();
    const { result } = renderHook(() =>
      useWorkspaceFiles({ openVirtualFile, setIsDirty: vi.fn() }),
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.loadWorkspaceFile("/missing.ts");
    });

    expect(success).toBe(false);
    expect(openVirtualFile).not.toHaveBeenCalled();
    expect(result.current.activeFilePath).toBeUndefined();
    expect(result.current.fileError).toEqual({
      title: "File Not Found",
      message: expect.stringContaining("/missing.ts"),
    });
  });

  it("shows a generic error for non-404 failures", async () => {
    mockedFetchWorkspaceFile.mockRejectedValue(new Error("network down"));

    const openVirtualFile = vi.fn();
    const { result } = renderHook(() =>
      useWorkspaceFiles({ openVirtualFile, setIsDirty: vi.fn() }),
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.loadWorkspaceFile("/foo.ts");
    });

    expect(success).toBe(false);
    expect(openVirtualFile).not.toHaveBeenCalled();
    expect(result.current.fileError).toEqual({
      title: "Error Loading File",
      message: "network down",
    });
  });

  it("clearFileError resets fileError to null", async () => {
    mockedFetchWorkspaceFile.mockRejectedValue(
      new FileNotFoundError("/missing.ts"),
    );

    const { result } = renderHook(() =>
      useWorkspaceFiles({ openVirtualFile: vi.fn(), setIsDirty: vi.fn() }),
    );

    await act(async () => {
      await result.current.loadWorkspaceFile("/missing.ts");
    });

    expect(result.current.fileError).not.toBeNull();

    act(() => {
      result.current.clearFileError();
    });

    expect(result.current.fileError).toBeNull();
  });
});
