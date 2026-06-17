import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export async function getPayrollShifts() {
  const { data, error } = await supabase
    .from("shift_history")
    .select(`
      id,
      clock_in,
      clock_out,
      hours,
      tips,
      mileage,
      employee:employees (
        id,
        employee_code,
        name,
        hourly_rate
      )
    `)
    .eq("store_id", STORE_ID)
    .order("clock_in", { ascending: false });

  if (error) {
    console.error("Payroll fetch error:", error);
    return [];
  }

  return data.map((shift: any) => ({
    id: shift.id,
    employeeDatabaseId: shift.employee.id,
    employeeId: shift.employee.employee_code,
    employeeName: shift.employee.name,
    hourlyRate: Number(shift.employee.hourly_rate),
    clockIn: shift.clock_in,
    clockOut: shift.clock_out,
    hours: Number(shift.hours),
    tips: Number(shift.tips),
    mileage: Number(shift.mileage),
  }));
}