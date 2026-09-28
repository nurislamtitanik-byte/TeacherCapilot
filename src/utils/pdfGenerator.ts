import { jsPDF } from 'jspdf';
import { LessonPlan, TestQuiz, LearningMaterial } from '../types';

export function downloadLessonPlanPdf(lesson: LessonPlan) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'normal');
    doc.text('TeacherCopilot UZ — Dars Ishlanmasi', margin, y);
    doc.text(`${lesson.subject} | ${lesson.grade}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Header Banner - Professional Deep Indigo
  doc.setFillColor(67, 56, 202); // indigo-700
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TeacherCopilot UZ — DARS REJASI VA ISHLANMASI', margin + 6, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Fan: ${lesson.subject}  |  Sinf: ${lesson.grade}  |  Vaqt: ${lesson.duration}  |  Daraja: ${lesson.level}`, margin + 6, y + 16);

  y += 29;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(lesson.title || `${lesson.topic} mavzusidagi dars ishlanmasi`, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 3;

  const renderSectionHeader = (title: string) => {
    checkPageBreak(13);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y - 4, contentWidth, 7.5, 'F');
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.2);
    doc.line(margin, y - 4, margin, y + 3.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(title, margin + 4, y + 1.2);
    y += 8.5;
  };

  const renderParagraph = (text: string) => {
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text || '-', contentWidth);
    checkPageBreak(lines.length * 4.4 + 3.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.4 + 3.5;
  };

  // 1. Dars maqsadi
  renderSectionHeader('1. Darsning Maqsadi');
  renderParagraph(lesson.objective);

  // 2. Kutilayotgan natijalar
  if (lesson.expectedResults && lesson.expectedResults.length > 0) {
    renderSectionHeader('2. Kutilayotgan Natijalar');
    lesson.expectedResults.forEach((res, i) => {
      renderParagraph(`${i + 1}. ${res}`);
    });
  }

  // 3. Kerakli jihozlar
  if (lesson.materials && lesson.materials.length > 0) {
    renderSectionHeader('3. Kerakli Jihozlar va Vositalar');
    renderParagraph(lesson.materials.join('; '));
  }

  // 4. Dars bosqichlari
  if (lesson.stages && lesson.stages.length > 0) {
    renderSectionHeader('4. Dars Bosqichlari va Vaqt Taqsimoti');
    lesson.stages.forEach((stage, idx) => {
      checkPageBreak(20);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y - 2, contentWidth, 17, 1, 1, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y - 2, contentWidth, 17, 1, 1, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202);
      doc.text(`[${stage.time || `${idx + 1}-bosqich`}] ${stage.title}`, margin + 3, y + 2.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const teacherText = `O'qituvchi: ${stage.teacherActivity || '-'}`;
      const studentText = `O'quvchi: ${stage.studentActivity || '-'}`;
      doc.text(doc.splitTextToSize(teacherText, contentWidth - 6).slice(0, 1), margin + 3, y + 7.5);
      doc.text(doc.splitTextToSize(studentText, contentWidth - 6).slice(0, 1), margin + 3, y + 12.5);

      y += 19.5;
    });
  }

  // 5. Mavzuni tushuntirish
  renderSectionHeader('5. Yangi Mavzuni Tushuntirish Bayoni');
  renderParagraph(lesson.explanation);

  // 6. Amaliy mashqlar
  if (lesson.exercises && lesson.exercises.length > 0) {
    renderSectionHeader('6. Amaliy Mashqlar va Topshiriqlar');
    lesson.exercises.forEach((ex, i) => {
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`${i + 1}. ${ex.title || `Mashq ${i + 1}`}`, margin, y);
      y += 4;

      if (ex.instruction) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const insLines = doc.splitTextToSize(`Ko'rsatma: ${ex.instruction}`, contentWidth);
        doc.text(insLines, margin, y);
        y += insLines.length * 4 + 2;
      }

      renderParagraph(ex.content);
    });
  }

  // 7. Baholash
  renderSectionHeader('7. O‘quvchilarni Baholash');
  renderParagraph(lesson.assessment);

  // 8. Uyga vazifa
  renderSectionHeader('8. Uyga Vazifa');
  renderParagraph(lesson.homework);

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Sahifa ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('TeacherCopilot UZ — O‘qituvchilar uchun AI yordamchi', margin, pageHeight - 10);
  }

  const safeFilename = `Dars_${lesson.subject}_${lesson.grade}_${lesson.topic}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 45);
  doc.save(`${safeFilename || 'Dars_reja'}.pdf`);
}

export function downloadTestPdf(test: TestQuiz, options: { includeAnswers: boolean }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'normal');
    doc.text('TeacherCopilot UZ — Nazorat Testi', margin, y);
    doc.text(`${test.subject} | ${test.grade}`, pageWidth - margin, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Student header block
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`FAN: ${test.subject.toUpperCase()} (${test.grade})`, margin + 5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Mavzu: ${test.topic}`, margin + 5, y + 12);
  doc.text(`Savollar: ${test.questions.length} ta  |  Turi: ${test.testType}  |  Daraja: ${test.level}`, margin + 5, y + 17.5);

  // Student info lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('O‘quvchi F.I.Sh: ___________________________________', pageWidth - margin - 85, y + 8);
  doc.text('Sana: _________  Bahosi: _________', pageWidth - margin - 85, y + 16);

  y += 31;

  if (options.includeAnswers) {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ESLATMA: Ushbu nusxada to‘g‘ri javoblar kaliti va izohlari ko‘rsatilgan (O‘qituvchi nusxasi).', margin + 4, y + 4.8);
    y += 11;
  }

  // Questions loop
  test.questions.forEach((q, idx) => {
    checkPageBreak(36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    const questionTitle = `${idx + 1}. ${q.question}`;
    const qLines = doc.splitTextToSize(questionTitle, contentWidth);
    doc.text(qLines, margin, y);
    y += qLines.length * 4.6 + 2;

    const opts: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
    opts.forEach((optKey) => {
      const optText = q.options[optKey] || '';
      const isCorrect = optKey === q.correctAnswer;

      checkPageBreak(6.5);

      if (options.includeAnswers && isCorrect) {
        doc.setFillColor(238, 242, 255);
        doc.rect(margin + 2, y - 3, contentWidth - 4, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }

      doc.setFontSize(9);
      const optionLine = `${optKey}) ${optText} ${options.includeAnswers && isCorrect ? '  [To‘g‘ri javob]' : ''}`;
      const wrapped = doc.splitTextToSize(optionLine, contentWidth - 8);
      doc.text(wrapped, margin + 4, y);
      y += wrapped.length * 4.2 + 1;
    });

    if (options.includeAnswers && q.explanation) {
      checkPageBreak(9);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const explLines = doc.splitTextToSize(`Izoh: ${q.explanation}`, contentWidth - 6);
      doc.text(explLines, margin + 4, y + 1);
      y += explLines.length * 3.8 + 2.5;
    }

    y += 3.5;
  });

  // If include answers, add a clean answer key grid at the end
  if (options.includeAnswers) {
    checkPageBreak(22);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 13, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('JAVOBLAR KALITI:', margin + 4, y + 4.5);

    const keysString = test.questions.map((q, i) => `${i + 1}-${q.correctAnswer}`).join('  |  ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const keyLines = doc.splitTextToSize(keysString, contentWidth - 8);
    doc.text(keyLines, margin + 4, y + 9.5);
    y += 17;
  }

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Sahifa ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('TeacherCopilot UZ — Nazorat Testi', margin, pageHeight - 10);
  }

  const suffix = options.includeAnswers ? '_Javoblar_Bilan' : '_Savolnoma';
  const safeFilename = `Test_${test.subject}_${test.grade}_${test.topic}${suffix}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 45);
  doc.save(`${safeFilename || 'Test'}.pdf`);
}

export function downloadMaterialPdf(material: LearningMaterial) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'normal');
    doc.text('TeacherCopilot UZ — O‘quv Materiali', margin, y);
    doc.text(`${material.subject} | ${material.grade}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Header Banner - Professional Violet
  doc.setFillColor(109, 40, 217); // violet-700
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TeacherCopilot UZ — O‘QUV VA TARQATMA MATERIALI', margin + 6, y + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Fan: ${material.subject}  |  Sinf: ${material.grade}  |  Turi: ${material.materialType}  |  Daraja: ${material.level}`, margin + 6, y + 16);

  y += 29;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(`${material.topic} bo‘yicha o‘quv materiali`, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 3;

  const renderSectionHeader = (title: string) => {
    checkPageBreak(13);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y - 4, contentWidth, 7.5, 'F');
    doc.setDrawColor(109, 40, 217);
    doc.setLineWidth(1.2);
    doc.line(margin, y - 4, margin, y + 3.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(title, margin + 4, y + 1.2);
    y += 8.5;
  };

  const renderParagraph = (text: string) => {
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(text || '-', contentWidth);
    checkPageBreak(lines.length * 4.4 + 3.5);
    doc.text(lines, margin, y);
    y += lines.length * 4.4 + 3.5;
  };

  // 1. Qisqa tushuntirish
  renderSectionHeader('1. Mavzuning Qisqa Tushuntirishi');
  renderParagraph(material.explanation);

  // 2. Misollar
  if (material.examples && material.examples.length > 0) {
    renderSectionHeader('2. Misollar va Tahlillar');
    material.examples.forEach((ex, i) => {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`${i + 1}. ${ex.title || `Misol ${i + 1}`}`, margin, y);
      y += 4;

      renderParagraph(ex.example);

      if (ex.note) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const noteLines = doc.splitTextToSize(`Eslatma: ${ex.note}`, contentWidth);
        doc.text(noteLines, margin, y);
        y += noteLines.length * 3.8 + 2;
      }
    });
  }

  // 3. Mashqlar
  if (material.exercises && material.exercises.length > 0) {
    renderSectionHeader('3. Mustaqil Mashqlar va Topshiriqlar');
    material.exercises.forEach((ex, i) => {
      checkPageBreak(13);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`Topshiriq ${i + 1}:`, margin, y);
      y += 4;

      renderParagraph(ex.task);

      if (ex.solution) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(67, 56, 202);
        const solLines = doc.splitTextToSize(`Yechim/Kalit: ${ex.solution}`, contentWidth);
        doc.text(solLines, margin, y);
        y += solLines.length * 3.8 + 2;
      }
    });
  }

  // 4. Esda saqlang
  if (material.importantPoints && material.importantPoints.length > 0) {
    renderSectionHeader('4. Esda Saqlang (Muhim Qoidalar)');
    material.importantPoints.forEach((point) => {
      renderParagraph(`- ${point}`);
    });
  }

  // 5. Mustahkamlash
  renderSectionHeader('5. Mustahkamlash Savollari');
  renderParagraph(material.reinforcement);

  // 6. Uyga vazifa
  renderSectionHeader('6. Uyga Vazifa');
  renderParagraph(material.homework);

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Sahifa ${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text('TeacherCopilot UZ — O‘quv Materiali', margin, pageHeight - 10);
  }

  const safeFilename = `Material_${material.subject}_${material.grade}_${material.topic}`
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 45);
  doc.save(`${safeFilename || 'Material'}.pdf`);
}
