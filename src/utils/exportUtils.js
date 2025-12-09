import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export to Markdown
export const exportToMarkdown = (chat, title) => {
  let content = `# ${title}\n\n`;
  
  chat.forEach(msg => {
    const role = msg.sender === 'user' ? 'User' : 'AI';
    content += `### ${role}\n\n${msg.message}\n\n---\n\n`;
  });

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${title.replace(/\s+/g, '_')}.md`);
};

// Export to DOCX
export const exportToDocx = async (chat, title) => {
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  chat.forEach(msg => {
    const role = msg.sender === 'user' ? 'User' : 'AI';
    
    // Role Header
    children.push(
      new Paragraph({
        text: role,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    // Message Content (Simple splitting by newlines for now)
    const lines = msg.message.split('\n');
    lines.forEach(line => {
      children.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 100 },
        })
      );
    });

    // Separator
    children.push(
      new Paragraph({
        text: "--------------------------------------------------",
        spacing: { before: 200, after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
};

// Export to PDF
export const exportToPdf = async (elementId, title) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#111827' // Dark background matching theme
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("Export to PDF failed:", error);
  }
};

// Export to JSON
export const exportToJson = (chat, title) => {
  const content = JSON.stringify({ title, messages: chat, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  saveAs(blob, `${title.replace(/\s+/g, '_')}.json`);
};
