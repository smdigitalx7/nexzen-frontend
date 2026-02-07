"use client";

import * as React from "react";

/**
 * Context for the current modal/dialog content element.
 * When a Popover (e.g. ServerCombobox dropdown) is rendered inside a Dialog,
 * its portal content is normally rendered to document.body. The modal Dialog
 * then treats clicks on that content as "outside" and focus trap can prevent
 * selection. Providing the dialog content element as the portal container
 * fixes this so the dropdown content is inside the dialog DOM and clicks work.
 */
const ModalContainerContext = React.createContext<
  React.RefObject<HTMLDivElement | null> | null
>(null);

type ModalContainerProviderProps = Readonly<{
  value: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}>;

export const ModalContainerProvider = React.forwardRef<
  HTMLDivElement,
  ModalContainerProviderProps
>(function ModalContainerProvider({ value, children }, ref) {
  return (
    <ModalContainerContext.Provider value={value}>
      <div ref={ref} style={{ display: "contents" }}>
        {children}
      </div>
    </ModalContainerContext.Provider>
  );
});

export function useModalContainer(): HTMLElement | null {
  const ref = React.useContext(ModalContainerContext);
  return ref?.current ?? null;
}

export { ModalContainerContext };
