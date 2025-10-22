// Test file to verify React.forwardRef is available
import { forwardRef } from "./react-utils";

// Test component to verify forwardRef works
export const TestComponent = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>(({ children }, ref) => {
  return <div ref={ref}>{children}</div>;
});

TestComponent.displayName = "TestComponent";

// Export test function
export const testForwardRef = () => {
  try {
    // This should not throw an error
    const Test = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
      ({ children }, ref) => {
        return <div ref={ref}>{children}</div>;
      }
    );
    console.log("✅ forwardRef test passed");
    return true;
  } catch (error) {
    console.error("❌ forwardRef test failed:", error);
    return false;
  }
};
