#!/usr/bin/env python3
"""
Scanned PDF to ePub Converter
Converts scanned (image-based) PDF books into ePub format using OCR.
"""

import argparse
import os
import sys

import fitz  # PyMuPDF
import pytesseract
from ebooklib import epub
from PIL import Image


def check_dependencies():
    """Verify that Tesseract OCR is installed and accessible."""
    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError:
        print("Error: Tesseract OCR is not installed or not found in PATH.\n")
        print("Install it for your operating system:")
        print("  macOS:   brew install tesseract")
        print("  Ubuntu:  sudo apt install tesseract-ocr")
        print("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki\n")
        print("For languages other than English, install language packs:")
        print("  macOS:   brew install tesseract-lang")
        print("  Ubuntu:  sudo apt install tesseract-ocr-<lang>  (e.g. tesseract-ocr-deu)")
        sys.exit(1)


def extract_and_ocr(pdf_path, dpi=300, language="eng"):
    """
    Extract pages from a scanned PDF and run OCR on each page.
    Processes one page at a time to keep memory usage low.

    Returns a list of strings, one per page.
    """
    doc = fitz.open(pdf_path)
    total = len(doc)
    page_texts = []

    print(f"Processing {total} pages at {dpi} DPI (language: {language})...\n")

    for i, page in enumerate(doc):
        print(f"  Page {i + 1}/{total}...", end="", flush=True)
        try:
            pix = page.get_pixmap(dpi=dpi)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text = pytesseract.image_to_string(img, lang=language)
            page_texts.append(text)
            print(" done")
        except Exception as e:
            print(f" OCR failed: {e}")
            page_texts.append(f"[OCR failed for page {i + 1}]")

    doc.close()

    total_chars = sum(len(t) for t in page_texts)
    if total_chars < total * 20:
        print(
            f"\nWarning: Very little text was extracted ({total_chars} characters "
            f"from {total} pages)."
        )
        print("Possible causes:")
        print("  - The scan quality may be too low (try a higher --dpi, e.g. 400)")
        print(f"  - Wrong language (current: {language}). Use --language to change it.")
        print("  - The PDF may not contain scanned images\n")

    return page_texts


def build_epub(texts, output_path, title, author, language, chapter_breaks=None):
    """
    Build an ePub file from a list of page texts.

    If chapter_breaks is provided, it should be a list of page numbers (1-based)
    where new chapters begin. Otherwise, all text goes into a single chapter.
    """
    book = epub.EpubBook()

    # Metadata
    book.set_identifier(f"pdf-to-epub-{title.replace(' ', '-').lower()}")
    book.set_title(title)
    book.set_language(language[:2] if len(language) > 2 else language)
    book.add_author(author)

    # Determine chapter splits
    if chapter_breaks:
        # Convert 1-based page numbers to 0-based indices
        breaks = sorted(set(b - 1 for b in chapter_breaks if 0 < b <= len(texts)))
    else:
        breaks = [0]

    # If 0 isn't in the breaks, add it so we don't lose the first pages
    if 0 not in breaks:
        breaks = [0] + breaks

    # Create chapters
    chapters = []
    spine = ["nav"]
    toc = []

    for idx, start in enumerate(breaks):
        end = breaks[idx + 1] if idx + 1 < len(breaks) else len(texts)
        chapter_num = idx + 1

        # Combine page texts for this chapter
        chapter_text = "\n\n".join(texts[start:end])

        # Convert to HTML paragraphs
        paragraphs = [p.strip() for p in chapter_text.split("\n\n") if p.strip()]
        html_body = "\n".join(f"<p>{p}</p>" for p in paragraphs)

        chapter_title = f"Chapter {chapter_num}"
        c = epub.EpubHtml(
            title=chapter_title,
            file_name=f"chapter_{chapter_num}.xhtml",
            lang=language[:2] if len(language) > 2 else language,
        )
        c.content = (
            f"<html><head><title>{chapter_title}</title></head>"
            f"<body><h1>{chapter_title}</h1>{html_body}</body></html>"
        )

        book.add_item(c)
        chapters.append(c)
        spine.append(c)
        toc.append(c)

    # Table of contents and navigation
    book.toc = toc
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())
    book.spine = spine

    # Write the ePub file
    epub.write_epub(output_path, book)
    print(f"\nePub saved to: {output_path}")


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Convert a scanned (image-based) PDF book into ePub format using OCR.",
        epilog="Example: python pdf_to_epub.py book.pdf --title 'My Book' --author 'Jane Doe'",
    )
    parser.add_argument("input", help="Path to the scanned PDF file")
    parser.add_argument(
        "-o", "--output", help="Output ePub file path (default: same name with .epub extension)"
    )
    parser.add_argument(
        "-t", "--title", help="Book title (default: input filename)"
    )
    parser.add_argument(
        "-a", "--author", default="Unknown", help="Author name (default: Unknown)"
    )
    parser.add_argument(
        "-l",
        "--language",
        default="eng",
        help="Tesseract language code for OCR (default: eng). "
        "Examples: deu (German), fra (French), spa (Spanish), ces (Czech)",
    )
    parser.add_argument(
        "-d",
        "--dpi",
        type=int,
        default=300,
        help="DPI for rendering PDF pages (default: 300). Higher = better OCR but slower",
    )
    parser.add_argument(
        "-c",
        "--chapters",
        help="Comma-separated page numbers where chapters start (e.g. 1,15,42,78)",
    )
    return parser.parse_args()


def main():
    args = parse_arguments()

    # Validate input file
    if not os.path.isfile(args.input):
        print(f"Error: Could not find the file '{args.input}'.")
        print("Please check the file path and try again.")
        sys.exit(1)

    if not args.input.lower().endswith(".pdf"):
        print(f"Error: '{args.input}' does not appear to be a PDF file.")
        sys.exit(1)

    # Check Tesseract is available
    check_dependencies()

    # Set defaults
    base_name = os.path.splitext(os.path.basename(args.input))[0]
    output_path = args.output or os.path.splitext(args.input)[0] + ".epub"
    title = args.title or base_name

    # Parse chapter breaks
    chapter_breaks = None
    if args.chapters:
        try:
            chapter_breaks = [int(x.strip()) for x in args.chapters.split(",")]
        except ValueError:
            print("Error: --chapters must be comma-separated page numbers (e.g. 1,15,42)")
            sys.exit(1)

    print(f"Converting: {args.input}")
    print(f"Title:      {title}")
    print(f"Author:     {args.author}")
    print(f"Language:   {args.language}")
    print(f"DPI:        {args.dpi}")
    print(f"Output:     {output_path}")
    if chapter_breaks:
        print(f"Chapters:   starting at pages {chapter_breaks}")
    print()

    # Run the pipeline
    page_texts = extract_and_ocr(args.input, dpi=args.dpi, language=args.language)
    build_epub(
        page_texts,
        output_path,
        title=title,
        author=args.author,
        language=args.language,
        chapter_breaks=chapter_breaks,
    )

    print("Done!")


if __name__ == "__main__":
    main()
