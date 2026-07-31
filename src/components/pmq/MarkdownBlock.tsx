import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownBlockProps = {
  content: string;
  className?: string;
};

function WideArtifact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="markdown-wide-artifact" role="region" aria-label={label}>
      {children}
    </div>
  );
}

const wideArtifactComponents: Components = {
  table: ({ children, node: _node, ...props }) => (
    <WideArtifact label="Scrollable table">
      <table {...props}>{children}</table>
    </WideArtifact>
  ),
  pre: ({ children, node: _node, ...props }) => (
    <WideArtifact label="Scrollable code block">
      <pre {...props}>{children}</pre>
    </WideArtifact>
  ),
};

export function MarkdownBlock({
  content,
  className = "",
}: MarkdownBlockProps) {
  return (
    <div className={`pmq-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={wideArtifactComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
