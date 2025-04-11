export const onKeyboardValidation =
  (handler?: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (handler && (e.code === "Enter" || e.code === "Space")) {
      handler();
    }
  };
