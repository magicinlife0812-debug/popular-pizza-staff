import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export async function getActiveShift(employeeDatabaseId: string) {
  const { data, error } = await supabase
    .from("active_shifts")
    .select("*")
    .eq("employee_id", employeeDatabaseId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function clockInShift({
  employeeDatabaseId,
}: {
  employeeDatabaseId: string;
}) {
  const { error } = await supabase.from("active_shifts").insert({
    store_id: STORE_ID,
    employee_id: employeeDatabaseId,
    clock_in: new Date().toISOString(),
    tip_entries: [],
    mileage_counts: {
      under5: 0,
      over5: 0,
      aerosports: 0,
      funzone: 0,
    },
  });

  if (error) {
    console.error(error);
  }
}

export async function updateActiveShift({
  employeeDatabaseId,
  tipEntries,
  mileageCounts,
}: {
  employeeDatabaseId: string;
  tipEntries: number[];
  mileageCounts: any;
}) {
  const { error } = await supabase
    .from("active_shifts")
    .update({
      tip_entries: tipEntries,
      mileage_counts: mileageCounts,
    })
    .eq("employee_id", employeeDatabaseId);

  if (error) {
    console.error(error);
  }
}

export async function clockOutShift({
  activeShift,
  employeeDatabaseId,
  totalTips,
  totalMileage,
  mileageCounts,
}: {
  activeShift: any;
  employeeDatabaseId: string;
  totalTips: number;
  totalMileage: number;
  mileageCounts: any;
}) {
  const clockOutTime = new Date();

  const hoursWorked =
    (clockOutTime.getTime() -
      new Date(activeShift.clock_in).getTime()) /
    (1000 * 60 * 60);

  const { error: historyError } = await supabase
    .from("shift_history")
    .insert({
      store_id: STORE_ID,
      employee_id: employeeDatabaseId,
      clock_in: activeShift.clock_in,
      clock_out: clockOutTime.toISOString(),
      hours: hoursWorked,
      tips: totalTips,
      mileage: totalMileage,
      mileage_counts: mileageCounts,
    });

  if (historyError) {
    console.error(historyError);
    return;
  }

  const { error: deleteError } = await supabase
    .from("active_shifts")
    .delete()
    .eq("employee_id", employeeDatabaseId);

  if (deleteError) {
    console.error(deleteError);
  }

  return hoursWorked;
}