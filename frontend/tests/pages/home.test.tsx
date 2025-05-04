import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./../../src/pages/Home.tsx";
import Wrapper from "./../utils/WrrapperApp.tsx";


describe("Home", () => {
  it("renders the main heading", () => {
    // ARRANGE + ACT
    render(<Wrapper component={<Home />} />);
    screen.debug();

    // ASSERT
    const img = screen.getByRole("img");
    expect(img).toHaveAccessibleName("No notes");

    expect(img).toHaveAttribute("src", "/assets/No_Note.png");

    expect(img).toHaveAccessibleName("No notes");
  });
});


