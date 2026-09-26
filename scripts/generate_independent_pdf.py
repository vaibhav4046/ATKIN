from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os

pdf_path = os.path.abspath(r"fixtures/AlderPeak-Independent-Contract.pdf")
os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

doc = SimpleDocTemplate(pdf_path, pagesize=letter)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, leading=20)
heading_style = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], fontSize=12, leading=16)
body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=14)

story = [
    Paragraph("MASTER CLOUD SERVICES AND LICENSING AGREEMENT", title_style),
    Spacer(1, 12),
    Paragraph("DATE: 12 March 2026", body_style),
    Spacer(1, 10),
    Paragraph("PARTIES:", heading_style),
    Paragraph("(1) HIGHFIELD LOGISTICS GROUP LTD, a private limited company incorporated in England and Wales under company number 08912345, whose registered office is at Highfield House, 14 St James Court, Manchester, M2 4NH ('Customer'); and", body_style),
    Spacer(1, 6),
    Paragraph("(2) ALDER PEAK SYSTEMS LTD, a company incorporated in England and Wales, having its principal place of business at Unit 4B, St Ann's Enterprise Park, Newcastle upon Tyne, NE1 2PZ ('Supplier').", body_style),
    Spacer(1, 10),
    Paragraph("OPERATIVE CLAUSES:", heading_style),
    Spacer(1, 6),
    Paragraph("Clause 2.1 (Contract Price & Fees): In consideration of the provision of the Services, the Customer shall pay to the Supplier an agreed total fixed implementation price of £18,420 (excluding Value Added Tax).", body_style),
    Spacer(1, 6),
    Paragraph("Clause 2.4 (Payment Terms): The Supplier shall submit monthly invoices for agreed milestones. The Customer shall settle all undisputed invoices within a Payment Period of 45 calendar days from the date of receipt.", body_style),
    Spacer(1, 6),
    Paragraph("Clause 3.2 (Termination for Convenience): Either party may terminate this Agreement without liability by providing to the other party not less than thirty-seven (37) calendar days prior written notice.", body_style),
    Spacer(1, 6),
    Paragraph("Clause 8.1 (Governing Law & Jurisdiction): This Agreement and any dispute or claim arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the law of England and Wales.", body_style),
    Spacer(1, 14),
    Paragraph("IN WITNESS WHEREOF the parties have executed this Agreement on the date first written above.", body_style),
    Spacer(1, 8),
    Paragraph("Signed for and on behalf of Highfield Logistics Group Ltd: [Signature]", body_style),
    Paragraph("Signed for and on behalf of Alder Peak Systems Ltd: [Signature]", body_style),
]

doc.build(story)
print(f"Generated {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
