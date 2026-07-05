import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileTree, type TreeNode } from "./FileTree";

/**
 * FileTree renders the project explorer sidebar.
 *
 * These tests guard the behaviors users rely on every day: items render with
 * the correct indentation, folders expand and collapse, the active file is
 * highlighted, and clicking a file notifies the parent component.
 */
const nodes: TreeNode[] = [
  {
    name: "app",
    type: "folder",
    children: [
      {
        name: "page.tsx",
        type: "file",
        content: "export default function Page() {}",
      },
      {
        name: "login",
        type: "folder",
        children: [{ name: "page.tsx", type: "file", content: "login page" }],
      },
    ],
  },
  { name: "package.json", type: "file", content: "{}" },
];

describe("FileTree", () => {
  it("renders folders and files with nested indentation", () => {
    render(<FileTree nodes={nodes} onSelectFile={vi.fn()} />);

    // The tree itself and its items are visible.
    expect(
      screen.getByRole("navigation", { name: "Project files" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /app/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /page\.tsx/ })).toHaveLength(
      2,
    );

    // Deeper nesting adds more left padding so the hierarchy is visually clear.
    expect(screen.getByRole("button", { name: /app/ })).toHaveStyle({
      paddingLeft: "8px",
    });
    expect(screen.getByRole("button", { name: /login/ })).toHaveStyle({
      paddingLeft: "24px",
    });
  });

  it("collapses and expands folder contents when a folder is clicked", async () => {
    const user = userEvent.setup();

    render(<FileTree nodes={nodes} onSelectFile={vi.fn()} />);

    const appFolder = screen.getByRole("button", { name: /app/ });
    expect(appFolder).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /login/ })).toBeInTheDocument();

    // Clicking a folder should hide its children and mark it as collapsed.
    await user.click(appFolder);

    expect(appFolder).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: /login/ }),
    ).not.toBeInTheDocument();

    // Clicking it again should restore the children and mark it as expanded.
    await user.click(appFolder);

    expect(appFolder).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /login/ })).toBeInTheDocument();
  });

  it("calls onSelectFile with the selected file node and path", async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn();

    render(
      <FileTree
        nodes={nodes}
        activePath="package.json"
        onSelectFile={onSelectFile}
      />,
    );

    await user.click(screen.getByRole("button", { name: /package\.json/ }));

    // File selection is delayed so single clicks can be distinguished from
    // double clicks. Wait for that delay before asserting the callback.
    await waitFor(() => {
      expect(onSelectFile).toHaveBeenCalledWith(nodes[1], "package.json");
    });

    // The active file should be highlighted immediately.
    expect(screen.getByRole("button", { name: /package\.json/ })).toHaveClass(
      "bg-sky-900/50",
    );
  });
});
