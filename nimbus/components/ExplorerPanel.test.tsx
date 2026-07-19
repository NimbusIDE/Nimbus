import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExplorerPanel } from "./ExplorerPanel";
import type { TreeNode } from "@/types/workspace";

/**
 * ExplorerPanel owns the right-click context menu for the file explorer.
 * These tests guard the three menu variants from the NIM-31 acceptance
 * criteria: file rows, folder rows, and empty sidebar space each show a
 * different set of actions, and picking an action closes the menu.
 */
const nodes: TreeNode[] = [
  { name: "package.json", type: "file", content: "{}" },
  {
    name: "app",
    type: "folder",
    children: [{ name: "page.tsx", type: "file", content: "" }],
  },
];

function renderPanel() {
  return render(
    <ExplorerPanel
      nodes={nodes}
      isLoading={false}
      error={null}
      onSelectFile={vi.fn()}
      onOpenFile={vi.fn()}
    />,
  );
}

describe("ExplorerPanel context menu", () => {
  it("shows Open, Rename, Duplicate, Delete when right-clicking a file row", () => {
    renderPanel();

    fireEvent.contextMenu(
      screen.getByRole("button", { name: /package\.json/ }),
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Rename" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Duplicate" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete" }),
    ).toBeInTheDocument();
  });

  it("shows New File, New Folder, Rename, Delete when right-clicking a folder row", () => {
    renderPanel();

    fireEvent.contextMenu(screen.getByRole("button", { name: /app/ }));

    expect(
      screen.getByRole("menuitem", { name: "New File" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "New Folder" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Rename" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Delete" }),
    ).toBeInTheDocument();
  });

  it("shows New File, New Folder when right-clicking empty sidebar space", () => {
    renderPanel();

    fireEvent.contextMenu(screen.getByText("Explorer"));

    expect(
      screen.getByRole("menuitem", { name: "New File" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "New Folder" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Open" })).toBeNull();
  });

  it("does not also open the empty-space menu when a row is right-clicked", () => {
    renderPanel();

    fireEvent.contextMenu(
      screen.getByRole("button", { name: /package\.json/ }),
    );

    // Only one menu should be open: the file menu, not the empty-space menu.
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(screen.getByRole("menuitem", { name: "Open" })).toBeInTheDocument();
  });

  it("closes the menu after clicking an item", async () => {
    const user = userEvent.setup();
    renderPanel();

    fireEvent.contextMenu(
      screen.getByRole("button", { name: /package\.json/ }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Open" }));

    expect(screen.queryByRole("menu")).toBeNull();
  });
});
