export const onKeyboardValidation =
  (handler?: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    console.log("keyUp", e);
    if (handler && e.code === "Enter") {
      handler();
    }
  };
