# -*- coding: utf-8 -*-
"""
BSM manuscript DOCX template — Palatino + GOST layout.
GOST-oriented defaults (R 7.0.11 / common thesis/journal practice):
  A4; margins L 30 / R 15 / T 20 / B 20 mm; body 14 pt; line spacing 1.5;
  first-line indent 1.25 cm; font Palatino Linotype.
"""
from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "templates" / "BSM-manuscript-template.docx"
LEGACY_COPIES = [
    ROOT / "templates" / "Mol-Sciera-manuscript-template.docx",
    ROOT / "templates" / "Biological-Sciences-manuscript-template.docx",
]
ASSETS = ROOT / "templates" / "_assets"
# Site accent (headings in body)
TEAL = RGBColor(0x0D, 0x2B, 0x28)
# MDPI-like journal teal for header bar
MDPI_TEAL = "00A496"
MDPI_TEAL_RGB = RGBColor(0x00, 0xA4, 0x96)
BLACK = RGBColor(0x00, 0x00, 0x00)
MUTED = RGBColor(0x5A, 0x68, 0x70)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FONT = "Palatino Linotype"
BODY_SIZE = 14
HINT_SIZE = 12
GOST_LINE = 1.5
GOST_FIRST_INDENT = Cm(1.25)
JOURNAL_EN = "Biological Systems and Methods"
JOURNAL_RU = "Биологические системы и методы"
JOURNAL_SUB = "An International Journal of Biological Research and Methodology"
JOURNAL_SHORT = "BSM"


def set_run(run, *, size=BODY_SIZE, bold=False, italic=False, color=None, font=FONT):
    run.font.name = font
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn("w:ascii"), font)
    rFonts.set(qn("w:hAnsi"), font)
    rFonts.set(qn("w:eastAsia"), font)
    rFonts.set(qn("w:cs"), font)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color is not None:
        run.font.color.rgb = color


def p_style(
    paragraph,
    *,
    space_before=0,
    space_after=0,
    line=GOST_LINE,
    align=WD_ALIGN_PARAGRAPH.JUSTIFY,
    first_indent=False,
):
    paragraph.alignment = align
    pf = paragraph.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line
    pf.left_indent = Cm(0)
    pf.right_indent = Cm(0)
    pf.first_line_indent = GOST_FIRST_INDENT if first_indent else Cm(0)


def add_line(
    doc,
    text,
    *,
    size=BODY_SIZE,
    bold=False,
    italic=False,
    color=None,
    space_before=0,
    space_after=0,
    align=WD_ALIGN_PARAGRAPH.JUSTIFY,
    first_indent=False,
):
    p = doc.add_paragraph()
    p_style(
        p,
        space_before=space_before,
        space_after=space_after,
        align=align,
        first_indent=first_indent,
    )
    run = p.add_run(text)
    set_run(run, size=size, bold=bold, italic=italic, color=color)
    return p


def add_hint(doc, text):
    return add_line(
        doc,
        text,
        size=HINT_SIZE,
        italic=True,
        color=MUTED,
        space_after=6,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        first_indent=False,
    )


def add_heading_block(doc, title: str, hint: str):
    add_line(
        doc,
        title,
        size=14,
        bold=True,
        color=TEAL,
        space_before=12,
        space_after=6,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        first_indent=False,
    )
    add_hint(doc, hint)


def set_cell_text(cell, text, *, bold=False, size=12):
    cell.text = ""
    p = cell.paragraphs[0]
    p_style(p, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False, line=1.15)
    run = p.add_run(text)
    set_run(run, size=size, bold=bold)


def add_sample_table(doc, caption: str, headers: list[str], rows: list[list[str]]):
    add_line(
        doc,
        caption,
        size=12,
        bold=True,
        color=TEAL,
        space_before=8,
        space_after=4,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        first_indent=False,
    )
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        set_cell_text(table.rows[0].cells[i], h, bold=True, size=11)
    for r_i, row in enumerate(rows):
        for c_i, val in enumerate(row):
            set_cell_text(table.rows[r_i + 1].cells[c_i], val, size=11)
    add_hint(doc, "Замените числа и подписи своими данными. Не оставляйте вымышленные значения в финальной подаче.")


def make_figure_png(path: Path, label: str, subtitle: str):
    w, h = 1200, 720
    img = Image.new("RGB", (w, h), (250, 251, 249))
    draw = ImageDraw.Draw(img)
    draw.rectangle([8, 8, w - 9, h - 9], outline=(13, 43, 40), width=3)
    draw.rectangle([40, 40, 140, 140], fill=(13, 43, 40))
    draw.text((58, 78), "BSM", fill=(232, 245, 242))
    draw.line([220, 200, w - 80, h - 120], fill=(216, 221, 216), width=2)
    draw.line([w - 80, 200, 220, h - 120], fill=(216, 221, 216), width=2)
    draw.rectangle([220, 180, w - 80, h - 100], outline=(184, 192, 186), width=2)
    try:
        font_lg = ImageFont.truetype("pala.ttf", 36)
        font_sm = ImageFont.truetype("pala.ttf", 22)
    except OSError:
        try:
            font_lg = ImageFont.truetype("palab.ttf", 36)
            font_sm = ImageFont.truetype("palab.ttf", 22)
        except OSError:
            font_lg = ImageFont.load_default()
            font_sm = font_lg
    draw.text((160, 55), "Biological Systems and Methods", fill=(13, 43, 40), font=font_lg)
    draw.text((160, 105), "Manuscript figure placeholder · GOST template", fill=(90, 104, 112), font=font_sm)
    draw.text((240, 340), label, fill=(13, 43, 40), font=font_lg)
    draw.text((240, 400), subtitle, fill=(90, 104, 112), font=font_sm)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG")


def add_figure(doc, png: Path, caption: str, hint: str):
    p = doc.add_paragraph()
    p_style(p, space_before=8, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False)
    run = p.add_run()
    run.add_picture(str(png), width=Cm(14.5))
    add_line(
        doc,
        caption,
        size=12,
        bold=True,
        color=TEAL,
        space_after=2,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        first_indent=False,
    )
    add_hint(doc, hint)


def shade_cell(cell, hex_color: str):
    """Set cell background fill (e.g. MDPI teal bar)."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def set_cell_margins(cell, *, top=40, bottom=40, left=80, right=80):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for edge, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def add_header_footer(section):
    """MDPI-style teal header bar with journal name; simple page footer."""
    header = section.header
    header.is_linked_to_previous = False
    # Clear default empty paragraph content carefully
    hp0 = header.paragraphs[0]
    hp0.text = ""

    table = header.add_table(rows=1, cols=1, width=Cm(16.5))
    table.autofit = True
    cell = table.cell(0, 0)
    shade_cell(cell, MDPI_TEAL)
    set_cell_margins(cell, top=60, bottom=60, left=100, right=100)

    cell.text = ""
    p = cell.paragraphs[0]
    p_style(p, space_before=0, space_after=0, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False, line=1.0)
    r1 = p.add_run(f"{JOURNAL_EN}  ·  {JOURNAL_SHORT}")
    set_run(r1, size=10, bold=True, color=WHITE)
    r2 = p.add_run(f"\n{JOURNAL_SUB}")
    set_run(r2, size=8, italic=True, color=WHITE)

    # Spacer under bar
    spacer = header.add_paragraph()
    p_style(spacer, space_before=2, space_after=0, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False, line=1.0)

    footer = section.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.text = ""
    p_style(fp, space_before=2, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False, line=1.0)
    run1 = fp.add_run(f"{JOURNAL_SHORT}  ·  стр. ")
    set_run(run1, size=9, color=MDPI_TEAL_RGB)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run2 = fp.add_run()
    run2._r.append(fld_begin)
    run2._r.append(instr)
    run2._r.append(fld_sep)
    run2._r.append(fld_end)
    set_run(run2, size=9, color=MDPI_TEAL_RGB)


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    fig1 = ASSETS / "figure-1-placeholder.png"
    fig2 = ASSETS / "figure-2-placeholder.png"
    make_figure_png(fig1, "Figure 1", "Replace with your plot / micrograph / scheme")
    make_figure_png(fig2, "Figure 2", "Replace with your second figure")

    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    # GOST-style margins
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(3.0)
    section.right_margin = Cm(1.5)
    add_header_footer(section)

    style = doc.styles["Normal"]
    style.font.name = FONT
    style.font.size = Pt(BODY_SIZE)
    style.font.color.rgb = BLACK
    rPr = style._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn("w:ascii"), FONT)
    rFonts.set(qn("w:hAnsi"), FONT)
    rFonts.set(qn("w:eastAsia"), FONT)
    rFonts.set(qn("w:cs"), FONT)
    style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    style.paragraph_format.line_spacing = GOST_LINE
    style.paragraph_format.first_line_indent = GOST_FIRST_INDENT

    add_line(
        doc,
        JOURNAL_EN,
        size=18,
        bold=True,
        color=BLACK,
        space_after=2,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        first_indent=False,
    )
    add_line(
        doc,
        f"{JOURNAL_RU} ({JOURNAL_SHORT})",
        size=14,
        bold=True,
        color=BLACK,
        space_after=4,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        first_indent=False,
    )
    add_line(
        doc,
        JOURNAL_SUB,
        size=11,
        italic=True,
        color=BLACK,
        space_after=2,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        first_indent=False,
    )
    add_line(
        doc,
        "Шаблон рукописи  ·  Palatino Linotype  ·  ГОСТ (А4, поля 30/15/20/20 мм, 14 пт, интервал 1,5)  ·  CC BY 4.0 (planned)",
        size=10,
        color=BLACK,
        space_after=10,
        align=WD_ALIGN_PARAGRAPH.CENTER,
        first_indent=False,
    )
    add_hint(
        doc,
        "Как пользоваться: замените всё в квадратных скобках […]. Подсказки курсивом удалите перед подачей. "
        "Не придумывайте DOI, ISSN, результаты и статистику. Основной текст — абзацный отступ 1,25 см, выравнивание по ширине.",
    )

    add_line(doc, "Тип статьи / Article type", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False)
    add_hint(doc, "Original Research / Methods / Review / Negative Results / Null Findings / …")
    add_line(doc, "[Article type]", size=BODY_SIZE, space_after=8, first_indent=False)

    add_line(doc, "Раздел / Section", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False)
    add_hint(doc, "Biology / Bioinformatics / Biochemistry / Biophysics / Omics / Methods & Reproducibility")
    add_line(doc, "[Section]", size=BODY_SIZE, space_after=10, first_indent=False)

    add_line(doc, "Title / Название", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False)
    add_hint(doc, "Краткое научное название. Предпочтительно на английском (version of record).")
    add_line(doc, "[Manuscript title]", size=14, italic=True, color=MUTED, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False)

    add_line(doc, "Authors / Авторы", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False)
    add_hint(doc, "Формат: Имя Фамилия¹,*, Имя Фамилия². Звёздочка * — автор для корреспонденции.")
    add_line(doc, "First A. Author 1,*, Second B. Author 2", size=BODY_SIZE, space_after=6, align=WD_ALIGN_PARAGRAPH.CENTER, first_indent=False)

    add_line(doc, "Affiliations / Аффилиации", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False)
    add_line(doc, "1 Department / Institute, City, Country", size=12, italic=True, color=MUTED, space_after=2, first_indent=False)
    add_line(doc, "2 Department / Institute, City, Country", size=12, italic=True, color=MUTED, space_after=6, first_indent=False)

    add_line(doc, "Correspondence", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False)
    add_line(
        doc,
        "* Corresponding author: name@institution.edu; ORCID: 0000-0000-0000-0000",
        size=12,
        space_after=12,
        first_indent=False,
    )

    add_heading_block(
        doc,
        "Abstract",
        "150–300 слов. Фон → вопрос → методы → результаты → вывод. Без ссылок и без выдуманных чисел.",
    )
    add_line(doc, "[Write the abstract here.]", size=BODY_SIZE, italic=True, color=MUTED, space_after=10, first_indent=True)

    add_line(doc, "Keywords", size=14, bold=True, color=TEAL, space_after=2, align=WD_ALIGN_PARAGRAPH.LEFT, first_indent=False)
    add_hint(doc, "3–8 ключевых слов через точку с запятой.")
    add_line(doc, "keyword1; keyword2; keyword3; keyword4", size=BODY_SIZE, space_after=12, first_indent=False)

    add_heading_block(
        doc,
        "1. Introduction",
        "Контекст, пробел в знаниях, цель/гипотеза. В конце — чёткая цель исследования.",
    )
    add_line(doc, "[Introduction text.]", size=BODY_SIZE, italic=True, color=MUTED, space_after=8, first_indent=True)

    add_heading_block(
        doc,
        "2. Materials and Methods",
        "Дизайн, материалы, протоколы, статистика (тесты, ПО и версии), репликаты, критерии исключения.",
    )
    add_line(doc, "[Methods text.]", size=BODY_SIZE, italic=True, color=MUTED, space_after=6, first_indent=True)

    add_sample_table(
        doc,
        "Table 1. Example — sample sizes and groups (replace with your data)",
        ["Group", "n (biological)", "Treatment", "Endpoint"],
        [
            ["Control", "[n]", "[none / vehicle]", "[primary endpoint]"],
            ["Treatment A", "[n]", "[dose / condition]", "[primary endpoint]"],
            ["Treatment B", "[n]", "[dose / condition]", "[primary endpoint]"],
        ],
    )

    add_heading_block(
        doc,
        "3. Results",
        "Факты и измерения. Для Negative/Null Results — оценки эффектов, CI и мощность, если применимо.",
    )
    add_line(
        doc,
        "[Results text. Refer to Figure 1 and Table 1.]",
        size=BODY_SIZE,
        italic=True,
        color=MUTED,
        space_after=6,
        first_indent=True,
    )

    add_figure(
        doc,
        fig1,
        "Figure 1. [Short title of the figure]",
        "Замените картинку своим файлом (TIFF/PNG ≥ 300 dpi). Не публикуйте шаблонную заглушку как данные.",
    )

    add_sample_table(
        doc,
        "Table 2. Example — summary statistics (replace)",
        ["Variable", "Mean ± SD", "95% CI", "p-value"],
        [
            ["[Outcome 1]", "[x ± s]", "[low–high]", "[p]"],
            ["[Outcome 2]", "[x ± s]", "[low–high]", "[p]"],
        ],
    )

    add_figure(
        doc,
        fig2,
        "Figure 2. [Short title of the second figure]",
        "Второй пример рисунка. Удалите, если не нужен.",
    )

    add_heading_block(
        doc,
        "4. Discussion",
        "Интерпретация, сравнение с литературой, ограничения. Не усиливайте выводы сверх данных.",
    )
    add_line(doc, "[Discussion text.]", size=BODY_SIZE, italic=True, color=MUTED, space_after=8, first_indent=True)

    add_heading_block(doc, "5. Conclusions", "2–5 предложений строго по результатам. Без новых данных.")
    add_line(doc, "[Conclusions text.]", size=BODY_SIZE, italic=True, color=MUTED, space_after=10, first_indent=True)

    end_matter = [
        ("Author Contributions (CRediT)", "Вклад по CRediT."),
        ("Funding", "Гранты с номерами — или отсутствие внешнего финансирования."),
        ("Institutional Review Board Statement", "Этическое одобрение или Not applicable."),
        ("Informed Consent Statement", "Согласие или Not applicable."),
        ("Data Availability Statement", "Репозиторий / по запросу / в статье."),
        ("Code Availability Statement", "Ссылка, версия, лицензия — или Not applicable."),
        ("Conflicts of Interest", "Раскрытие или отсутствие конфликтов."),
        ("Acknowledgments", "По желанию."),
        ("Use of Generative AI", "Раскрытие ИИ или None."),
    ]
    for title, hint in end_matter:
        add_heading_block(doc, title, hint)
        add_line(
            doc,
            f"[{title} — replace this placeholder.]",
            size=12,
            italic=True,
            color=MUTED,
            space_after=6,
            first_indent=True,
        )

    add_heading_block(
        doc,
        "References",
        "Нумерованный список. DOI только реальные. Оформление — единый стиль журнала (Vancouver / ГОСТ Р 7.0.5 — по указанию редакции).",
    )
    add_line(
        doc,
        "1. Author, A.B.; Author, C.D. Title of the article. Journal Name Year, Volume, Article number. https://doi.org/xx.xxxx/xxxxx\n"
        "2. Author, E.F. Book Title; Publisher: City, Country, Year; pp. 1–10.",
        size=12,
        space_after=12,
        first_indent=False,
    )

    add_line(
        doc,
        "BSM editorial note: submission and peer review are free; APC is charged only after acceptance. "
        "This file is a structural GOST-oriented template (Palatino Linotype), not a published article.",
        size=10,
        italic=True,
        color=MUTED,
        space_before=8,
        first_indent=False,
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print("wrote", OUT)
    for legacy in LEGACY_COPIES:
        doc.save(legacy)
        print("wrote", legacy)


if __name__ == "__main__":
    main()
