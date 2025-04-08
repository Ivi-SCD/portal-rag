
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const locationRef = window.location;

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn()
  }))
);

Object.defineProperty(window, "auth", {
  value: {
    BFF_URL: "http://localhost:8080",
    token: "token",
    user: {
      name: "John Doe",
      username: "john_doe",
      email: "john_doe@sicredi.com.br",
      roles: []
    }
  },
  writable: true
});

beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();

  Object.defineProperty(window, "location", {
    value: locationRef
  });
});

afterEach(() => {
  cleanup();
});
