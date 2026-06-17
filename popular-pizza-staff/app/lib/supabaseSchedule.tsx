import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export type SupabaseScheduleShift = {
  id: string;
  employeeDatabaseId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: "scheduled";
};

export async function getSupabaseScheduleShifts(): Promise<SupabaseScheduleShift[]> {
  const { data, error } = await supabase
    .from("schedule_shifts")
    .select(`
      id,
      date,
      start_time,
      end_time,
      notes,
      status,
      employee:employees (
        id,
        employee_code,
        name
      )
    `)
    .eq("store_id", STORE_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Schedule fetch error:", JSON.stringify(error, null, 2));
    return [];
  }

  return data.map((shift: any) => ({
    id: shift.id,
    employeeDatabaseId: shift.employee.id,
    employeeId: shift.employee.employee_code,
    employeeName: shift.employee.name,
    date: shift.date,
    startTime: shift.start_time,
    endTime: shift.end_time,
    notes: shift.notes ?? "",
    status: shift.status,
  }));
}

export async function addSupabaseScheduleShift(shift: {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const { error } = await supabase.from("schedule_shifts").insert({
    store_id: STORE_ID,
    employee_id: shift.employeeId,
    date: shift.date,
    start_time: shift.startTime,
    end_time: shift.endTime,
    status: "scheduled",
  });

  if (error) {
    console.error("Schedule insert error:", JSON.stringify(error, null, 2));
  }
}

export async function updateSupabaseScheduleShift(shift: {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const { error } = await supabase
    .from("schedule_shifts")
    .update({
      employee_id: shift.employeeId,
      date: shift.date,
      start_time: shift.startTime,
      end_time: shift.endTime,
    })
    .eq("id", shift.id);

  if (error) {
    console.error("Schedule update error:", JSON.stringify(error, null, 2));
  }
}

export async function deleteSupabaseScheduleShift(shiftId: string) {
  const { error } = await supabase
    .from("schedule_shifts")
    .delete()
    .eq("id", shiftId);

  if (error) {
    console.error("Schedule delete error:", JSON.stringify(error, null, 2));
  }
}