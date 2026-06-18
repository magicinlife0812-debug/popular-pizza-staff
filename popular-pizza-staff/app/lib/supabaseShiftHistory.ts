import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export async function getShiftHistory() {
  const { data, error } = await supabase
    .from("shift_history")
    .select(`
      *,
      employee:employees (
        employee_code,
        name
      )
    `)
    .eq("store_id", STORE_ID)
    .order("clock_in", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

   return (data ?? []).map((shift: any) => ({
    id: shift.id,
    employeeId: shift.employee.employee_code,
    employeeName: shift.employee.name,
    clockIn: shift.clock_in,
    clockOut: shift.clock_out,
    hours: Number(shift.hours),
    tips: Number(shift.tips),
    mileage: Number(shift.mileage),
    mileageCounts: shift.mileage_counts,
  }));
}