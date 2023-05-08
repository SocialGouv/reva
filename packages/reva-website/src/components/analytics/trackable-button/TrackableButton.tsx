import { ComponentPropsWithRef, MouseEvent, useCallback } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { push } from "@/components/analytics/matomo-tracker/matomoTracker";

type TrackableButtonProps = ComponentPropsWithRef<typeof Button> & {
  eventTracked: { location: string; event: string };
};

export const TrackableButton = ({
  eventTracked,
  nativeButtonProps,
  linkProps,
  ...buttonProps
}: TrackableButtonProps) => {
  const handleButtonClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      push([
        "trackEvent",
        eventTracked.location,
        eventTracked.event,
        eventTracked.event,
      ]);
      nativeButtonProps?.onClick?.(e);
    },
    [nativeButtonProps, eventTracked]
  );

  const handleLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      push([
        "trackEvent",
        eventTracked.location,
        eventTracked.event,
        eventTracked.event,
      ]);
      linkProps?.onClick?.(e);
    },
    [linkProps, eventTracked]
  );

  return (
    <Button
      {...buttonProps}
      nativeButtonProps={
        nativeButtonProps
          ? ({ ...nativeButtonProps, onClick: handleButtonClick } as any)
          : undefined
      }
      linkProps={
        linkProps
          ? ({ ...linkProps, onClick: handleLinkClick } as any)
          : undefined
      }
    />
  );
};
