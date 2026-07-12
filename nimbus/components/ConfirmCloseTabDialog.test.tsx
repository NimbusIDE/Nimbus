import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmCloseTabDialog } from "./ConfirmCloseTabDialog";

/**
 * ConfirmCloseTabDialog is callback-driven, so these tests focus on its public
 * contract: it must show the dirty-file warning and dispatch the selected action.
 */
describe("ConfirmCloseTabDialog", () => {
  it("renders the save confirmation dialog for the given file", () => {
    // Render the dialog with a sample file name so the test can verify the
    // exact user-facing message and all available actions.
    render(
      <ConfirmCloseTabDialog
        fileName="page.tsx"
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // The dialog should expose accessible roles/text so users and tests can
    // identify the warning without relying on CSS classes.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Save changes to page.tsx?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your changes will be lost if you do not save them."),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Don't Save" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onSave when Save is clicked", async () => {
    // userEvent simulates a real user click, while vi.fn() lets us assert which
    // callback the component dispatches.
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmCloseTabDialog
        fileName="page.tsx"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    // Only the Save action should fire; the dialog should not accidentally
    // discard changes or cancel the close.
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onDiscard when Don't Save is clicked", async () => {
    // This covers the destructive path where the parent should discard unsaved
    // changes before closing the tab.
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmCloseTabDialog
        fileName="page.tsx"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Don't Save" }));

    // Don't Save must call only the discard handler; saving or canceling here
    // would change the meaning of the user's choice.
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    // Cancel is the safe exit: the parent should close the dialog but leave the
    // tab and unsaved edits alone.
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmCloseTabDialog
        fileName="page.tsx"
        onSave={onSave}
        onDiscard={onDiscard}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    // Only the Cancel callback should run; this protects against accidentally
    // closing or saving the dirty file when the user backs out.
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
  });
});
