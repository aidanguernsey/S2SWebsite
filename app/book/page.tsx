import type { Metadata } from "next";
import { BookSection } from "@/components/BookSection";

export const metadata: Metadata = { title: "Book Us" };

export default function BookPage() {
  return <BookSection headingLevel="h1" />;
}
