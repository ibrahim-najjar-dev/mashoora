import Markdown from "react-native-markdown-display";
import {
  H1 as ExpoH1,
  H2 as ExpoH2,
  H3 as ExpoH3,
  H4 as ExpoH4,
  H5 as ExpoH5,
  H6 as ExpoH6,
  Code as ExpoCode,
  Pre as ExpoPre,
  UL as ExpoUl,
  LI as ExpoLI,
  Strong as ExpoStrong,
  A as ExpoA,
  P as ExpoP,
  Div as ExpoDiv,
} from "@expo/html-elements";
import { cssInterop } from "nativewind";
import React from "react";

// Types for markdown rule parameters
type MarkdownNode = {
  content?: string;
  attributes?: {
    href?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type MarkdownChildren = React.ReactNode;
type MarkdownParent = any[];

const H1 = cssInterop(ExpoH1, { className: "style" });
const H2 = cssInterop(ExpoH2, { className: "style" });
const H3 = cssInterop(ExpoH3, { className: "style" });
const H4 = cssInterop(ExpoH4, { className: "style" });
const H5 = cssInterop(ExpoH5, { className: "style" });
const H6 = cssInterop(ExpoH6, { className: "style" });
const Code = cssInterop(ExpoCode, { className: "style" });
const Pre = cssInterop(ExpoPre, { className: "style" });
const Ol = cssInterop(ExpoUl, { className: "style" });
const Ul = cssInterop(ExpoUl, { className: "style" });
const Li = cssInterop(ExpoLI, { className: "style" });
const Strong = cssInterop(ExpoStrong, { className: "style" });
const A = cssInterop(ExpoA, { className: "style" });
const P = cssInterop(ExpoP, { className: "style" });
const Div = cssInterop(ExpoDiv, { className: "style" });

const rules = {
  heading1: (node: MarkdownNode, children: MarkdownChildren) => (
    <H4 className="mb-4 mt-4 font-Geist_Bold text-foreground">{children}</H4>
  ),
  heading2: (node: MarkdownNode, children: MarkdownChildren) => (
    <H4 className="mb-4 mt-4 font-Geist_Bold text-foreground">{children}</H4>
  ),
  heading3: (node: MarkdownNode, children: MarkdownChildren) => (
    <P className="mb-2 mt-2 font-Geist_Bold text-foreground">{children}</P>
  ),
  heading4: (node: MarkdownNode, children: MarkdownChildren) => (
    <P className="mb-2 mt-2 font-Geist_Bold text-foreground">{children}</P>
  ),
  heading5: (node: MarkdownNode, children: MarkdownChildren) => (
    <P className="mb-2 mt-2 font-Geist_Bold text-foreground">{children}</P>
  ),
  heading6: (node: MarkdownNode, children: MarkdownChildren) => (
    <P className="mb-2 mt-2 font-Geist_Bold text-foreground">{children}</P>
  ),
  code: (
    node: MarkdownNode,
    children: MarkdownChildren,
    parent: MarkdownParent
  ) => {
    return parent.length > 1 ? (
      <Pre className="mt-2 w-[80dvw] overflow-x-scroll rounded-lg bg-secondary p-3 text-sm md:max-w-[500px]">
        <Code>{children}</Code>
      </Pre>
    ) : (
      <Code className="rounded-md bg-secondary px-1 py-0.5 text-sm">
        {children}
      </Code>
    );
  },
  list_item: (node: MarkdownNode, children: MarkdownChildren) => (
    <Li className="py-1">{children}</Li>
  ),
  ordered_list: (node: MarkdownNode, children: MarkdownChildren) => (
    <Ol className="ml-4 list-outside list-decimal">{children}</Ol>
  ),
  unordered_list: (node: MarkdownNode, children: MarkdownChildren) => (
    <Ul className="ml-4 list-outside list-decimal">{children}</Ul>
  ),
  strong: (node: MarkdownNode, children: MarkdownChildren) => (
    <Strong className="font-semibold">{children}</Strong>
  ),
  link: (node: MarkdownNode, children: MarkdownChildren) => (
    <A
      className="text-blue-500 hover:underline"
      target="_blank"
      rel="noreferrer"
      href={node.attributes?.href}
    >
      {children}
    </A>
  ),
  text: (node: MarkdownNode) => {
    return <P className="text-foreground">{node.content}</P>;
  },
  body: (node: MarkdownNode, children: MarkdownChildren) => {
    return <Div className="">{children}</Div>;
  },
};

export function CustomMarkdown({ content }: { content: string }) {
  return <Markdown rules={rules}>{content}</Markdown>;
}
