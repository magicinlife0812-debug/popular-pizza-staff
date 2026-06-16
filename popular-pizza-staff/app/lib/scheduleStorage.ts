export type ScheduleShift = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "scheduled";
};

export function getScheduleShifts() {
  const stored = localStorage.getItem("scheduleShifts");

  if (!stored) return [];

  return JSON.parse(stored);
}

export function saveScheduleShifts(shifts: ScheduleShift[]) {
  localStorage.setItem("scheduleShifts", JSON.stringify(shifts));
}

export function addScheduleShift(shift: ScheduleShift) {
  const shifts = getScheduleShifts();

  saveScheduleShifts([shift, ...shifts]);
}

export function deleteScheduleShift(shiftId: string) {
  const shifts = getScheduleShifts();

  saveScheduleShifts(shifts.filter((shift: ScheduleShift) => shift.id !== shiftId));
}
export function updateScheduleShift(updatedShift: ScheduleShift) {
  const shifts = getScheduleShifts();

  const updatedShifts = shifts.map((shift: ScheduleShift) =>
    shift.id === updatedShift.id ? updatedShift : shift
  );

  saveScheduleShifts(updatedShifts);
}