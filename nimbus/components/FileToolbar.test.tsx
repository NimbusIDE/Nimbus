import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileToolbar } from "./FileToolbar";

/**
 * FileToolbar is callback-driven, so the tests focus on its public contract:
 * every visible action must render and dispatch only its matching handler.
 */
describe("FileToolbar", () => {
  it("renders all file action buttons", () => {
    render(
      <FileToolbar
        onNew={vi.fn()}
        onOpen={vi.fn()}
        onSave={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "New File" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open File" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove File" }),
    ).toBeInTheDocument();
  });

  it("calls the matching handler when each action is clicked", async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    const onOpen = vi.fn();
    const onSave = vi.fn();
    const onRemove = vi.fn();

    render(
      <FileToolbar
        onNew={onNew}
        onOpen={onOpen}
        onSave={onSave}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole("button", { name: "New File" }));
    await user.click(screen.getByRole("button", { name: "Open File" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Remove File" }));

    expect(onNew).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
