import test from "node:test";
import assert from "node:assert/strict";
import {
  filterClassesForDay,
  parseTimeToMinutes,
  detectScheduleConflict,
  computeClassDurationMinutes,
} from "../src/lib/schedule/timetable-engine.ts";
import type { AcademicClass, ScheduleBlock } from "../src/types/index.ts";

const mockClasses: AcademicClass[] = [
  {
    id: "cls_01",
    courseCode: "STAS",
    courseTitle: "Science, Technology and Society",
    section: "E106-R",
    classType: "Lecture",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_inst_01",
    joinCode: "ABC234",
    schedule: [
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
      { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cls_02",
    courseCode: "CS 312",
    courseTitle: "Algorithms",
    section: "CS3A",
    classType: "Laboratory",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_inst_01",
    joinCode: "XYZ789",
    schedule: [
      { dayOfWeek: "Monday", startTime: "13:00", endTime: "16:00", room: "Lab 3" },
      { dayOfWeek: "Thursday", startTime: "13:00", endTime: "16:00", room: "Lab 3" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cls_03",
    courseCode: "IT 221",
    courseTitle: "DBMS",
    section: "IT2B",
    classType: "Lecture",
    units: 3,
    term: "1st Semester 2026-2027",
    instructorId: "usr_inst_01",
    joinCode: "DBM456",
    schedule: [
      { dayOfWeek: "Monday", startTime: "07:30", endTime: "09:00", room: "Room 201" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

test("Timetable Engine: parseTimeToMinutes correctly converts time strings", () => {
  assert.equal(parseTimeToMinutes("00:00"), 0);
  assert.equal(parseTimeToMinutes("07:30"), 450);
  assert.equal(parseTimeToMinutes("09:00"), 540);
  assert.equal(parseTimeToMinutes("13:30"), 810);
  assert.equal(parseTimeToMinutes("23:59"), 1439);
});

test("Timetable Engine: computeClassDurationMinutes computes exact duration", () => {
  assert.equal(computeClassDurationMinutes("09:00", "10:30"), 90);
  assert.equal(computeClassDurationMinutes("13:00", "16:00"), 180);
});

test("Timetable Engine: filterClassesForDay returns classes sorted chronologically", () => {
  const mondayClasses = filterClassesForDay(mockClasses, "Monday");
  assert.equal(mondayClasses.length, 3);
  // IT 221 at 07:30 should be first, STAS at 09:00 second, CS 312 at 13:00 third
  assert.equal(mondayClasses[0].class.courseCode, "IT 221");
  assert.equal(mondayClasses[1].class.courseCode, "STAS");
  assert.equal(mondayClasses[2].class.courseCode, "CS 312");

  const wednesdayClasses = filterClassesForDay(mockClasses, "Wednesday");
  assert.equal(wednesdayClasses.length, 1);
  assert.equal(wednesdayClasses[0].class.courseCode, "STAS");

  const fridayClasses = filterClassesForDay(mockClasses, "Friday");
  assert.equal(fridayClasses.length, 0);
});

test("Timetable Engine: detectScheduleConflict accurately identifies room and time collisions", () => {
  const existingBlocks: ScheduleBlock[] = [
    { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 402" },
  ];

  // 1. Overlapping block on same day (09:30 - 11:00) -> CONFLICT
  const conflict1: ScheduleBlock = {
    dayOfWeek: "Monday",
    startTime: "09:30",
    endTime: "11:00",
    room: "Room 402",
  };
  assert.ok(detectScheduleConflict(existingBlocks, conflict1));

  // 2. Adjacent block on same day (10:30 - 12:00) -> NO CONFLICT
  const noConflictAdjacent: ScheduleBlock = {
    dayOfWeek: "Monday",
    startTime: "10:30",
    endTime: "12:00",
    room: "Room 402",
  };
  assert.equal(detectScheduleConflict(existingBlocks, noConflictAdjacent), null);

  // 3. Same time but different day -> NO CONFLICT
  const noConflictDifferentDay: ScheduleBlock = {
    dayOfWeek: "Tuesday",
    startTime: "09:00",
    endTime: "10:30",
    room: "Room 402",
  };
  assert.equal(detectScheduleConflict(existingBlocks, noConflictDifferentDay), null);
});
