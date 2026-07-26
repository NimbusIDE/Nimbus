import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
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

function renderTree(props: Partial<ComponentProps<typeof FileTree>> = {}) {
  return render(
    <FileTree
      nodes={nodes}
      onSelectFile={vi.fn()}
      selectedPaths={new Set()}
      onSelectionChange={vi.fn()}
      {...props}
    />,
  );
}

describe("FileTree", () => {
  it("renders folders and files with nested indentation", () => {
    renderTree();

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

    renderTree();

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

    renderTree({ activePath: "package.json", onSelectFile });

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

  describe("multi-select (NIM-37)", () => {
    // Flat, uniquely-named files so getByRole queries are unambiguous — the
    // outer `nodes` fixture has two rows both named "page.tsx".
    const flatNodes: TreeNode[] = [
      { name: "one.ts", type: "file", content: "" },
      { name: "two.ts", type: "file", content: "" },
      { name: "three.ts", type: "file", content: "" },
    ];

    function renderFlatTree(
      props: Partial<ComponentProps<typeof FileTree>> = {},
    ) {
      return render(
        <FileTree
          nodes={flatNodes}
          onSelectFile={vi.fn()}
          selectedPaths={new Set()}
          onSelectionChange={vi.fn()}
          {...props}
        />,
      );
    }

    it("plain click selects only the clicked file", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      renderFlatTree({
        selectedPaths: new Set(["one.ts"]),
        onSelectionChange,
      });

      await user.click(screen.getByRole("button", { name: /two\.ts/ }));

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(["two.ts"]));
    });

    it("Ctrl/Cmd+click toggles a file in the existing selection", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      renderFlatTree({
        selectedPaths: new Set(["one.ts"]),
        onSelectionChange,
      });

      await user.keyboard("{Control>}");
      await user.click(screen.getByRole("button", { name: /two\.ts/ }));
      await user.keyboard("{/Control}");

      expect(onSelectionChange).toHaveBeenCalledWith(
        new Set(["one.ts", "two.ts"]),
      );
    });

    it("Shift+click selects the contiguous range from the anchor", async () => {
      let selectedPaths = new Set<string>();
      const onSelectionChange = vi.fn((next: Set<string>) => {
        selectedPaths = next;
      });
      const user = userEvent.setup();

      const { rerender } = renderFlatTree({ selectedPaths, onSelectionChange });

      // Plain click on the first file sets the Shift anchor.
      await user.click(screen.getByRole("button", { name: /one\.ts/ }));
      rerender(
        <FileTree
          nodes={flatNodes}
          onSelectFile={vi.fn()}
          selectedPaths={selectedPaths}
          onSelectionChange={onSelectionChange}
        />,
      );

      // Shift+click the last file should select every file in between.
      await user.keyboard("{Shift>}");
      await user.click(screen.getByRole("button", { name: /three\.ts/ }));
      await user.keyboard("{/Shift}");

      expect(onSelectionChange).toHaveBeenLastCalledWith(
        new Set(["one.ts", "two.ts", "three.ts"]),
      );
    });

    it("applies a distinct highlight class to selected files", () => {
      renderFlatTree({ selectedPaths: new Set(["one.ts"]) });

      expect(screen.getByRole("button", { name: /one\.ts/ })).toHaveClass(
        "ring-emerald-500",
      );
      expect(screen.getByRole("button", { name: /two\.ts/ })).not.toHaveClass(
        "ring-emerald-500",
      );
    });

    it("does not select folders on click", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      renderTree({ onSelectionChange });

      await user.click(screen.getByRole("button", { name: /^app$/ }));

      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });
});
