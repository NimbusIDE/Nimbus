import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <Modal
        isOpen={false}
        title="File Not Found"
        message="details"
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the title and message when isOpen is true", () => {
    render(
      <Modal
        isOpen
        title="File Not Found"
        message="The file could not be found."
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("File Not Found")).toBeInTheDocument();
    expect(
      screen.getByText("The file could not be found."),
    ).toBeInTheDocument();
  });

  it("calls onClose when the close (X) button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal
        isOpen
        title="File Not Found"
        message="details"
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal
        isOpen
        title="File Not Found"
        message="details"
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal
        isOpen
        title="File Not Found"
        message="details"
        onClose={onClose}
      />,
    );

    // The backdrop is the dialog panel's direct parent element.
    const backdrop = screen.getByRole("dialog").parentElement;
    expect(backdrop).not.toBeNull();

    await user.click(backdrop as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the panel", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal
        isOpen
        title="File Not Found"
        message="The file could not be found."
        onClose={onClose}
      />,
    );

    await user.click(screen.getByText("The file could not be found."));

    expect(onClose).not.toHaveBeenCalled();
  });
});
