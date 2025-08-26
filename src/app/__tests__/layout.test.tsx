/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { metadata } from "@/app/layout";

// Simple test for metadata without rendering complex components
describe("RootLayout", () => {
  it("should export correct metadata", () => {
    expect(metadata.title).toBe("Bndy Portal");
    expect(metadata.description).toBe("Bndy Platform Portal Application");
  });
});