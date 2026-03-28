/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const components = {
  h1: ({ node, ...props }: any) => (
    <h1
      className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4"
      {...props}
    />
  ),

  h2: ({ node, ...props }: any) => (
    <h2
      className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3"
      {...props}
    />
  ),

  p: ({ node, ...props }: any) => (
    <p
      className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3"
      {...props}
    />
  ),

  a: ({ node, ...props }: any) => (
    <a
      className="text-cyan-600 dark:text-cyan-400 underline hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  ul: ({ node, ...props }: any) => (
    <ul
      className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4"
      {...props}
    />
  ),

  li: ({ node, ...props }: any) => (
    <li className="mb-1" {...props} />
  ),

  code: ({ inline, ...props }: any) =>
    inline ? (
      <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
        {props.children}
      </code>
    ) : (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
        <code {...props} />
      </pre>
    ),
};

export default function MarkdownDisplay({ value }: { value: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}