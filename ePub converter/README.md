A Python script that converts scanned (image-based) PDF books into ePub format using OCR. Instead of downloading paid or bloated converter apps, just run this script on any scanned book PDF and get a clean ePub you can read on any e-reader!

# Quick Setup Steps

## 1. Install Tesseract OCR

Tesseract is the OCR engine that reads text from scanned pages. You need to install it for your operating system:

### macOS:
```bash
brew install tesseract
```

For additional languages (German, French, Spanish, etc.):
```bash
brew install tesseract-lang
```

### Ubuntu / Debian:
```bash
sudo apt install tesseract-ocr
```

For additional languages:
```bash
sudo apt install tesseract-ocr-deu   # German
sudo apt install tesseract-ocr-fra   # French
sudo apt install tesseract-ocr-spa   # Spanish
sudo apt install tesseract-ocr-slv   # Slovenian
```

### Windows:
Download the installer from [UB Mannheim's Tesseract page](https://github.com/UB-Mannheim/tesseract/wiki) and follow the installation instructions. Make sure to add Tesseract to your system PATH.

## 2. Install Python Dependencies

Navigate to the `ePub converter` folder and run:

```bash
pip install -r requirements.txt
```

This installs:
- **PyMuPDF** - reads PDF pages as images
- **pytesseract** - connects to Tesseract OCR
- **Pillow** - image processing
- **ebooklib** - creates ePub files

# Features

- Converts scanned (image-based) PDFs to ePub format
- OCR text extraction powered by Tesseract
- Set book metadata: title, author, language
- Optional chapter splitting at specific pages
- Multi-language OCR support (English, German, French, Spanish, Slovenian, and many more)
- Memory-efficient: processes one page at a time, handles large books
- Progress feedback during conversion
- Warnings for low-quality scans or wrong language settings

# Usage

## Basic Conversion

The simplest usage - just provide the PDF file:

```bash
python pdf_to_epub.py "My Scanned Book.pdf"
```

This creates `My Scanned Book.epub` in the same folder, using the filename as the title.

## Adding Book Details

Set the title and author for the ePub metadata:

```bash
python pdf_to_epub.py book.pdf --title "Great Expectations" --author "Charles Dickens"
```

## Splitting Into Chapters

If you know which pages your chapters start on, use `--chapters` with a comma-separated list of page numbers:

```bash
python pdf_to_epub.py book.pdf --title "Great Expectations" --author "Charles Dickens" --chapters 1,15,42,78,110
```

This creates 5 chapters: pages 1-14, 15-41, 42-77, 78-109, and 110 to the end.

## Converting Books in Other Languages

Use `--language` with a Tesseract language code:

```bash
python pdf_to_epub.py german_book.pdf --language deu --title "Ein deutsches Buch"
python pdf_to_epub.py french_book.pdf --language fra --title "Un livre français"
python pdf_to_epub.py czech_book.pdf --language ces --title "Česká kniha"
```

Common language codes: `eng` (English), `deu` (German), `fra` (French), `spa` (Spanish), `ita` (Italian), `por` (Portuguese), `ces` (Czech), `rus` (Russian), `pol` (Polish), `nld` (Dutch).

Full list: [Tesseract language codes](https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html)

## Adjusting Scan Quality

If OCR results are poor, try increasing the DPI (default is 300):

```bash
python pdf_to_epub.py book.pdf --dpi 400
```

- **200 DPI** - faster, works for clean/high-quality scans
- **300 DPI** - good default for most scanned books
- **400 DPI** - slower, may help with poor quality or small text

## Custom Output Path

By default, the ePub is saved next to the PDF. To save it somewhere else:

```bash
python pdf_to_epub.py book.pdf --output ~/Books/my_book.epub
```

## All Options at a Glance

```
python pdf_to_epub.py --help
```

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `input` | | (required) | Path to the scanned PDF |
| `--output` | `-o` | same as input with .epub | Output ePub file path |
| `--title` | `-t` | input filename | Book title |
| `--author` | `-a` | "Unknown" | Author name |
| `--language` | `-l` | eng | Tesseract language code |
| `--dpi` | `-d` | 300 | DPI for page rendering |
| `--chapters` | `-c` | (none) | Page numbers where chapters start |

# How It Works

The script runs a 3-step pipeline:

1. **PDF to Images** - Opens the PDF with PyMuPDF and renders each page as an image at the specified DPI
2. **Images to Text (OCR)** - Sends each page image to Tesseract OCR, which reads the text from the scanned image
3. **Text to ePub** - Takes all the extracted text, splits it into chapters (if specified), and packages it as an ePub file with proper metadata and navigation

Each page is processed one at a time - the image is extracted, OCR'd, and then discarded before moving to the next page. This keeps memory usage low even for books with hundreds of pages.

# Troubleshooting

## "Tesseract not found" error
Tesseract isn't installed or isn't in your PATH. Follow the installation steps above for your OS.

## Poor OCR quality / garbled text
- Try a higher DPI: `--dpi 400`
- Make sure you're using the right language: `--language deu` for German, etc.
- Check that the scan quality of the original PDF is decent - very blurry or skewed scans will give poor results regardless of settings

## Missing language pack
If you get an error about a missing language, install the language pack:
- macOS: `brew install tesseract-lang` (installs all languages)
- Ubuntu: `sudo apt install tesseract-ocr-<code>` (e.g. `tesseract-ocr-deu`)

## Very slow conversion
- Lower the DPI: `--dpi 200` (faster but lower quality)
- Large books (500+ pages) will naturally take a while - the script shows progress so you can track it

## "Very little text was extracted" warning
This means the OCR found almost no text. Likely causes:
- The PDF contains digital text, not scanned images (use a different converter)
- Wrong language setting
- Very poor scan quality
