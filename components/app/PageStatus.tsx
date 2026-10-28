import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { uiPreview } from "@/lib/firebase/preview";

type PageStatusProps = {
  /** Shown instead of the spinner when loading failed. */
  error?: Error | null;
  label?: string;
};

/** Centered loading or error line for pages waiting on live data. */
export function PageStatus({ error, label = "Loading…" }: PageStatusProps) {
  const message = uiPreview
    ? "UI preview is on: this page uses real data, so turn preview off and sign in."
    : error
      ? "This page couldn't load. Refresh to try again."
      : label;
  return (
    <div className="flex flex-1 items-center justify-center p-gutter">
      <Text
        role={error ? "alert" : "status"}
        variant="body"
        className={error ? "text-danger-text" : "flex items-center gap-2.5 text-muted"}
      >
        {!error && !uiPreview && <Spinner />}
        {message}
      </Text>
    </div>
  );
}
