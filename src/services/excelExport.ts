import ExcelJS from 'exceljs';
import { ClassItem, RosterEntry, AttendanceSession, AttendanceRecord, GradeActivity, GradeScore } from '../types';

export async function exportClassRecordToExcel(
  classItem: ClassItem,
  roster: RosterEntry[],
  sessions: AttendanceSession[],
  attendance: AttendanceRecord[],
  activities: GradeActivity[],
  scores: GradeScore[]
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AcademiaTrack Digital Class Record';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // SHEET 1: CLASS ROSTER
  // -------------------------------------------------------------
  const rosterSheet = workbook.addWorksheet('Class Roster');
  
  // Title Header
  rosterSheet.addRow([`${classItem.courseCode} - ${classItem.courseTitle}`]);
  rosterSheet.addRow([`Section: ${classItem.section} | Type: ${classItem.classType} | Instructor: ${classItem.instructorName}`]);
  rosterSheet.addRow([`Term: ${classItem.academicTerm} (${classItem.miniTerm}) | Join Code: ${classItem.joinCode}`]);
  rosterSheet.addRow([]); // Blank spacer

  // Table Headers
  const rosterHeaderRow = rosterSheet.addRow(['#', 'Student Number', 'Student Name', 'Program', 'Year Level', 'Status']);
  rosterHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  rosterHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF312E81' } // Indigo dark
  };

  roster.forEach((student, index) => {
    rosterSheet.addRow([
      index + 1,
      student.studentNumber,
      student.studentName,
      student.program,
      student.yearLevel,
      student.enrollmentStatus.toUpperCase()
    ]);
  });

  rosterSheet.columns = [
    { width: 6 },
    { width: 18 },
    { width: 32 },
    { width: 14 },
    { width: 12 },
    { width: 14 }
  ];

  // -------------------------------------------------------------
  // SHEET 2: ATTENDANCE MATRIX
  // -------------------------------------------------------------
  const attSheet = workbook.addWorksheet('Attendance Record');
  attSheet.addRow([`${classItem.courseCode} Attendance Matrix (Tardy Ratio: ${classItem.lateConversionThreshold} L = 1 A)`]);
  attSheet.addRow([]);

  // Header Row: Student info + each session date + summary stats
  const dateHeaders = sessions.map(s => s.sessionDate);
  const attHeaderRow = attSheet.addRow([
    '#',
    'Student Number',
    'Student Name',
    ...dateHeaders,
    'Present (P)',
    'Late (L)',
    'Excused (E)',
    'Absent (A)',
    'Effective Absences',
    'Cut Status'
  ]);
  attHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  attHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF065F46' } // Emerald dark
  };

  roster.forEach((student, idx) => {
    let pCount = 0;
    let lCount = 0;
    let eCount = 0;
    let aCount = 0;

    const rowStatusCells = sessions.map(session => {
      const rec = attendance.find(a => a.sessionId === session.id && a.rosterEntryId === student.id);
      const st = rec ? rec.status : '-';
      if (st === 'P') pCount++;
      if (st === 'L') lCount++;
      if (st === 'E') eCount++;
      if (st === 'A') aCount++;
      return st;
    });

    const effectiveAbsences = aCount + Math.floor(lCount / classItem.lateConversionThreshold);
    let cutStatus = 'SAFE';
    if (effectiveAbsences >= classItem.fdaAbsenceThresholdHours) {
      cutStatus = 'FDA EXCEEDED (RED)';
    } else if (effectiveAbsences >= classItem.fdaAbsenceThresholdHours * 0.6) {
      cutStatus = 'WARNING (YELLOW)';
    }

    attSheet.addRow([
      idx + 1,
      student.studentNumber,
      student.studentName,
      ...rowStatusCells,
      pCount,
      lCount,
      eCount,
      aCount,
      effectiveAbsences,
      cutStatus
    ]);
  });

  attSheet.columns = [
    { width: 6 },
    { width: 18 },
    { width: 28 },
    ...sessions.map(() => ({ width: 12 })),
    { width: 12 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 18 },
    { width: 20 }
  ];

  // -------------------------------------------------------------
  // SHEET 3: CATEGORIZED GRADE SHEET
  // -------------------------------------------------------------
  const gradeSheet = workbook.addWorksheet('Categorized Grades');
  gradeSheet.addRow([`${classItem.courseCode} - Academic Grade Record`]);
  gradeSheet.addRow([]);

  const activityHeaders = activities.map(a => `${a.category}: ${a.name} (Max ${a.maxScore})`);
  const gradeHeaderRow = gradeSheet.addRow([
    '#',
    'Student Number',
    'Student Name',
    ...activityHeaders,
    'Total Earned',
    'Total Possible',
    'Percentage (%)'
  ]);
  gradeHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  gradeHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF831843' } // Rose dark
  };

  const totalPossible = activities.reduce((sum, a) => sum + a.maxScore, 0);

  roster.forEach((student, idx) => {
    let studentTotal = 0;
    const scoreCells = activities.map(act => {
      const sc = scores.find(s => s.activityId === act.id && s.rosterEntryId === student.id);
      if (!sc || sc.isMissing || sc.score === null) {
        return '--'; // Strict NULL / Missing indicator
      }
      studentTotal += sc.score;
      return sc.score;
    });

    const percent = totalPossible > 0 ? ((studentTotal / totalPossible) * 100).toFixed(1) : '0.0';

    gradeSheet.addRow([
      idx + 1,
      student.studentNumber,
      student.studentName,
      ...scoreCells,
      studentTotal,
      totalPossible,
      `${percent}%`
    ]);
  });

  gradeSheet.columns = [
    { width: 6 },
    { width: 18 },
    { width: 28 },
    ...activities.map(() => ({ width: 22 })),
    { width: 14 },
    { width: 14 },
    { width: 16 }
  ];

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${classItem.courseCode}_${classItem.section}_Class_Record_${new Date().toISOString().split('T')[0]}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
