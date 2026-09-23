import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** `<model-viewer>` takes kebab-case attributes; the element types itself once imported. */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        readonly [attribute: string]: unknown;
      };
    }
  }
}
