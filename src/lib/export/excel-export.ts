import type {
  AttendanceRecord,
  ClassSession,
  GradeItem,
  RosterStudent,
  StudentGrade,
} from "../../types/index.ts";
import {
  calculateCategoryScore,
  calculateStudentStanding,
} from "../grades/gradebook-engine.ts";
import { calculateAttendanceMetrics } from "../attendance/attendance-engine.ts";

export interface ExcelWorkbookData {
  courseTitle: string;
  courseCode: string;
  section: string;
  term: string;
  instructorName?: string;
  students: RosterStudent[];
  sessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  gradeItems: GradeItem[];
  studentGrades: StudentGrade[];
}

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderCell(value: string | number | null | undefined, styleId?: string): string {
  const safeVal = escapeXml(value);
  const isNumber = typeof value === "number" && !isNaN(value);
  const type = isNumber ? "Number" : "String";
  const styleAttr = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${styleAttr}><Data ss:Type="${type}">${safeVal}</Data></Cell>`;
}

/**
 * Generates an institutional multi-sheet SpreadsheetML XML workbook.
 * Natively opens in Microsoft Excel, Apple Numbers, and LibreOffice with 3 formatted worksheets:
 * 1. Master Roster
 * 2. Attendance Matrix (with session dates, attendance rates, and FDA warning indicator)
 * 3. Categorized Grades (Quizzes, Performance Tasks, Exams, Subtotals, and Philippine 1.00-5.00 mark)
 */
export function generateMultiSheetExcelXml(data: ExcelWorkbookData): string {
  const {
    courseTitle,
    courseCode,
    section,
    term,
    instructorName = "Faculty Instructor",
    students,
    sessions,
    attendanceRecords,
    gradeItems,
    studentGrades,
  } = data;

  const sortedStudents = [...students].sort((a, b) => {
    const lastDiff = a.lastName.localeCompare(b.lastName);
    return lastDiff !== 0 ? lastDiff : a.firstName.localeCompare(b.firstName);
  });

  const validSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

  const quizzes = gradeItems.filter((i) => i.category === "quiz");
  const pts = gradeItems.filter((i) => i.category === "performance_task");
  const exams = gradeItems.filter((i) => i.category === "exam");

  // ==========================================
  // SHEET 1: MASTER ROSTER
  // ==========================================
  const rosterRows: string[] = [
    `<Row ss:StyleID="Title"><Cell><Data ss:Type="String">${escapeXml(courseCode)} ${escapeXml(section)} - Official Master Roster</Data></Cell></Row>`,
    `<Row ss:StyleID="SubTitle"><Cell><Data ss:Type="String">Course: ${escapeXml(courseTitle)} | Term: ${escapeXml(term)} | Instructor: ${escapeXml(instructorName)}</Data></Cell></Row>`,
    `<Row/>`,
    `<Row ss:StyleID="Header">
      ${renderCell("#")}
      ${renderCell("Student Number")}
      ${renderCell("Last Name")}
      ${renderCell("First Name")}
      ${renderCell("Program / Strand")}
      ${renderCell("Year Level")}
    </Row>`,
  ];

  sortedStudents.forEach((student, index) => {
    rosterRows.push(
      `<Row>
        ${renderCell(index + 1)}
        ${renderCell(student.studentNumber)}
        ${renderCell(student.lastName)}
        ${renderCell(student.firstName)}
        ${renderCell(student.program)}
        ${renderCell(student.academicLevel)}
      </Row>`
    );
  });

  // ==========================================
  // SHEET 2: ATTENDANCE MATRIX
  // ==========================================
  const attendanceHeaderCells = [
    renderCell("#"),
    renderCell("Student Number"),
    renderCell("Student Name"),
    ...validSessions.map((s) => renderCell(s.date)),
    renderCell("Total Present"),
    renderCell("Total Late"),
    renderCell("Total Excused"),
    renderCell("Total Absent"),
    renderCell("Effective Absences"),
    renderCell("FDA Standing"),
  ];

  const attendanceRows: string[] = [
    `<Row ss:StyleID="Title"><Cell><Data ss:Type="String">${escapeXml(courseCode)} ${escapeXml(section)} - Institutional Attendance Record</Data></Cell></Row>`,
    `<Row ss:StyleID="SubTitle"><Cell><Data ss:Type="String">Total Sessions: ${validSessions.length} | Rule: 3 Lates = 1 Absent | FDA Threshold: 4 Absences</Data></Cell></Row>`,
    `<Row/>`,
    `<Row ss:StyleID="Header">${attendanceHeaderCells.join("")}</Row>`,
  ];

  sortedStudents.forEach((student, index) => {
    const studentRecords = attendanceRecords.filter((a) => a.studentId === student.id);

    const sessionCells = validSessions.map((session) => {
      const record = studentRecords.find((r) => r.date === session.date);
      return renderCell(record?.status || "--");
    });

    const metrics = calculateAttendanceMetrics(
      studentRecords.map((r) => r.status),
      4
    );
    const fdaLevel = metrics.isFDA
      ? "FDA RISK / EXCEEDED"
      : metrics.isWarning
      ? "WARNING (NEAR LIMIT)"
      : "SAFE";

    attendanceRows.push(
      `<Row>
        ${renderCell(index + 1)}
        ${renderCell(student.studentNumber)}
        ${renderCell(`${student.lastName}, ${student.firstName}`)}
        ${sessionCells.join("")}
        ${renderCell(metrics.present)}
        ${renderCell(metrics.late)}
        ${renderCell(metrics.excused)}
        ${renderCell(metrics.absent)}
        ${renderCell(metrics.effectiveAbsences)}
        ${renderCell(fdaLevel)}
      </Row>`
    );
  });

  // ==========================================
  // SHEET 3: CATEGORIZED GRADES
  // ==========================================
  const gradeHeaderCells = [
    renderCell("#"),
    renderCell("Student Number"),
    renderCell("Student Name"),
    ...quizzes.map((q) => renderCell(`Quiz: ${q.title} (${q.maxScore}pts)`)),
    renderCell("Quiz Total (25%)"),
    ...pts.map((pt) => renderCell(`PT: ${pt.title} (${pt.maxScore}pts)`)),
    renderCell("PT Total (45%)"),
    ...exams.map((e) => renderCell(`Exam: ${e.title} (${e.maxScore}pts)`)),
    renderCell("Exam Total (30%)"),
    renderCell("Weighted Final %"),
    renderCell("Philippine Mark (1.00 - 5.00)"),
    renderCell("Grade Remarks"),
  ];

  const gradeRows: string[] = [
    `<Row ss:StyleID="Title"><Cell><Data ss:Type="String">${escapeXml(courseCode)} ${escapeXml(section)} - Official Categorized Gradebook</Data></Cell></Row>`,
    `<Row ss:StyleID="SubTitle"><Cell><Data ss:Type="String">Weighting: Quizzes 25%, Performance Tasks 45%, Exams 30% | Blank = Missing (Uncomputed)</Data></Cell></Row>`,
    `<Row/>`,
    `<Row ss:StyleID="Header">${gradeHeaderCells.join("")}</Row>`,
  ];

  sortedStudents.forEach((student, index) => {
    const studentGradesList = studentGrades.filter((g) => g.studentId === student.id);

    const quizCells = quizzes.map((q) => {
      const g = studentGradesList.find((grade) => grade.gradeItemId === q.id);
      return renderCell(g && g.score !== null && g.score !== undefined ? g.score : "--");
    });
    const quizScore = calculateCategoryScore(gradeItems, studentGrades, student.id, "quiz");

    const ptCells = pts.map((p) => {
      const g = studentGradesList.find((grade) => grade.gradeItemId === p.id);
      return renderCell(g && g.score !== null && g.score !== undefined ? g.score : "--");
    });
    const ptScore = calculateCategoryScore(gradeItems, studentGrades, student.id, "performance_task");

    const examCells = exams.map((e) => {
      const g = studentGradesList.find((grade) => grade.gradeItemId === e.id);
      return renderCell(g && g.score !== null && g.score !== undefined ? g.score : "--");
    });
    const examScore = calculateCategoryScore(gradeItems, studentGrades, student.id, "exam");

    const standing = calculateStudentStanding(gradeItems, studentGrades, student.id);

    gradeRows.push(
      `<Row>
        ${renderCell(index + 1)}
        ${renderCell(student.studentNumber)}
        ${renderCell(`${student.lastName}, ${student.firstName}`)}
        ${quizCells.join("")}
        ${renderCell(quizScore.percentage !== null ? `${quizScore.percentage}%` : "--")}
        ${ptCells.join("")}
        ${renderCell(ptScore.percentage !== null ? `${ptScore.percentage}%` : "--")}
        ${examCells.join("")}
        ${renderCell(examScore.percentage !== null ? `${examScore.percentage}%` : "--")}
        ${renderCell(standing.finalGrade !== null ? `${standing.finalGrade}%` : "--")}
        ${renderCell(standing.letterGrade)}
        ${renderCell(standing.isPassing ? "PASSED" : "FAILED")}
      </Row>`
    );
  });

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#09090B"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#7C1D26"/>
  </Style>
  <Style ss:ID="SubTitle">
   <Font ss:FontName="Segoe UI" ss:Size="9" ss:Italic="1" ss:Color="#71717A"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#5E141B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#7C1D26" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Master Roster">
  <Table>
   ${rosterRows.join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Attendance Matrix">
  <Table>
   ${attendanceRows.join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Categorized Grades">
  <Table>
   ${gradeRows.join("\n   ")}
  </Table>
 </Worksheet>
</Workbook>`;
}

/**
 * Triggers a browser download of the generated multi-sheet workbook.
 */
export function downloadExcelWorkbook(data: ExcelWorkbookData, filename?: string): void {
  const xml = generateMultiSheetExcelXml(data);
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `${data.courseCode}_${data.section}_Official_Class_Record.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
