"use client";

import { useEffect } from "react";

type Slot = "head" | "body_start" | "footer";

function activateScript(node: Node): Node {
  if (!(node instanceof HTMLScriptElement)) return node;
  const script = document.createElement("script");
  for (const attribute of Array.from(node.attributes)) {
    script.setAttribute(attribute.name, attribute.value);
  }
  script.textContent = node.textContent || "";
  return script;
}

export default function CustomCodeClient({ slot, html }: { slot: Slot; html: string }) {
  useEffect(() => {
    const target = slot === "head" ? document.head : document.body;
    const template = document.createElement("template");
    template.innerHTML = html;
    const sourceNodes = Array.from(template.content.childNodes);
    const mountedNodes: Node[] = [];
    const bodyStartReference = slot === "body_start" ? target.firstChild : null;

    for (const source of sourceNodes) {
      const node = activateScript(source);
      if (slot === "body_start") {
        target.insertBefore(node, bodyStartReference);
      } else {
        target.appendChild(node);
      }
      mountedNodes.push(node);
    }

    return () => {
      for (const node of mountedNodes) node.parentNode?.removeChild(node);
    };
  }, [slot, html]);

  return null;
}
