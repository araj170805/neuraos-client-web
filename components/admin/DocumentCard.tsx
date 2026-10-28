"use client";

import { useState, type ReactNode } from "react";
import { ZoomControl } from "@/components/admin/ZoomControl";
import { IconButton } from "@/components/ui/IconButton";
import { Panel } from "@/components/ui/Panel";
import { Text } from "@/components/ui/Text";

type DocumentCardProps = {
  title: string;
  meta: string;
  onOpen: () => void;
  children: ReactNode;
};

/** Document thumbnail with zoom and "open full". */
export function DocumentCard({ title, meta, onOpen, children }: DocumentCardProps) {
  const [zoom, setZoom] = useState(1);
  return (
    <Panel className="overflow-hidden">
      <div className="h-72.5 overflow-auto bg-track p-5 inset-shadow-track">
        <div className="mx-auto w-fit" style={{ zoom }}>
          {children}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-ink/7 py-3 pr-3 pl-4">
        <div className="min-w-0 flex-1">
          <Text variant="button-sm">{title}</Text>
          <Text variant="mono-meta" className="mt-0.5 truncate text-muted">
            {meta}
          </Text>
        </div>
        <ZoomControl zoom={zoom} onZoom={setZoom} />
        <IconButton icon="expand" label={`Open ${title} full screen`} size="sm" onClick={onOpen} />
      </div>
    </Panel>
  );
}
