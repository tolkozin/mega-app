import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

function CustomImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, width, height } = props;
  if (!src || typeof src !== "string") return null;

  return (
    <Image
      src={src}
      alt={alt ?? ""}
      width={Number(width) || 800}
      height={Number(height) || 450}
      className="rounded-lg"
      loading="lazy"
    />
  );
}

function CustomLink(
  props: React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  const { href, children, ...rest } = props;
  if (!href) return <span {...rest}>{children}</span>;

  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
    tip: "border-green-500 bg-green-50 dark:bg-green-950/30",
  };

  const labels = { info: "Info", warning: "Warning", tip: "Tip" };

  return (
    <div className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      <p className="mb-1 font-semibold">{labels[type]}</p>
      <div>{children}</div>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  img: CustomImage as any,
  a: CustomLink as any,
  Callout,
};
