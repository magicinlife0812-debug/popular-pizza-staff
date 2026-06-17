import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export async function getPayrollPayments() {
  const { data, error } = await supabase
    .from("payroll_payments")
    .select(`
      *,
      employee:employees (
        id,
        employee_code,
        name
      )
    `)
    .eq("store_id", STORE_ID);

  if (error) {
    console.error("Payroll payments fetch error:", error);
    return [];
  }

  return data.map((payment: any) => ({
    id: payment.id,
    employeeDatabaseId: payment.employee.id,
    employeeId: payment.employee.employee_code,
    employeeName: payment.employee.name,
    periodStart: payment.period_start,
    periodEnd: payment.period_end,
    amount: Number(payment.amount),
    status: payment.status,
    paidAt: payment.paid_at,
    notes: payment.notes,
  }));
}

export async function markPayrollPaid({
  employeeDatabaseId,
  periodStart,
  periodEnd,
  amount,
}: {
  employeeDatabaseId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
}) {
  const { error } = await supabase.from("payroll_payments").upsert(
    {
      store_id: STORE_ID,
      employee_id: employeeDatabaseId,
      period_start: periodStart,
      period_end: periodEnd,
      amount,
      status: "paid",
      paid_at: new Date().toISOString(),
    },
    {
      onConflict: "employee_id,period_start,period_end",
    }
  );

  if (error) {
    console.error("Mark payroll paid error:", error);
  }
}

export async function markPayrollUnpaid({
  employeeDatabaseId,
  periodStart,
  periodEnd,
  amount,
}: {
  employeeDatabaseId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
}) {
  const { error } = await supabase.from("payroll_payments").upsert(
    {
      store_id: STORE_ID,
      employee_id: employeeDatabaseId,
      period_start: periodStart,
      period_end: periodEnd,
      amount,
      status: "unpaid",
      paid_at: null,
    },
    {
      onConflict: "employee_id,period_start,period_end",
    }
  );

  if (error) {
    console.error("Mark payroll unpaid error:", error);
  }
}