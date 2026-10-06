import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AuthForm } from "@/components/auth-form";

describe("AuthForm", () => {
  it("does not submit an invalid email", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.type(screen.getByLabelText(/^Password/), "long-enough");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("explains that valid details were not transmitted", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email address"), "athlete@example.com");
    await user.type(screen.getByLabelText(/^Password/), "long-enough");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("status")).toHaveTextContent("not sent or stored");
  });
});
