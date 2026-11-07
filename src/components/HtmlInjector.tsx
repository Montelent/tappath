"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  className?: string;
};

/** Inject trusted, administrator-configured HTML and activate its script tags. */
export default function HtmlInjector({ html, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.innerHTML = html;
    for (const original of Array.from(root.querySelectorAll("script"))) {
      const script = document.createElement("script");
      for (const attribute of Array.from(original.attributes)) {
        script.setAttribute(attribute.name, attribute.value);
      }
      script.textContent = original.textContent || "";
      original.replaceWith(script);
    }

    return () => {
      root.replaceChildren();
    };
  }, [html]);

  return <div ref={rootRef} className={className} />;
}
