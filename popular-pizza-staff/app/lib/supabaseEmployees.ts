import { supabase } from "@/app/lib/supabase";
import { STORE_ID } from "@/app/lib/storeConfig";

export type Employee = {
  databaseId: string;
  id: string;
  pin: string;
  name: string;
  roles: string[];
  hourlyRate: number;
  canAccessManager: boolean;
  isActive: boolean;
};

export async function getSupabaseEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      employee_code,
      pin,
      name,
      hourly_rate,
      can_access_manager,
      is_active,
      employee_roles (
        role
      )
    `)
    .eq("store_id", STORE_ID)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((employee: any) => ({
    databaseId: employee.id,
    id: employee.employee_code,
    pin: employee.pin,
    name: employee.name,
    hourlyRate: Number(employee.hourly_rate),
    canAccessManager: employee.can_access_manager,
    isActive: employee.is_active,
    roles: employee.employee_roles.map((item: any) => item.role),
  }));
}

export async function addSupabaseEmployee(employee: Employee) {
  const { data, error } = await supabase
    .from("employees")
    .insert({
      store_id: STORE_ID,
      employee_code: employee.id,
      pin: employee.pin,
      name: employee.name,
      hourly_rate: employee.hourlyRate,
      can_access_manager: employee.canAccessManager,
      is_active: employee.isActive,
    })
    .select("id")
    .single();

  if (error) {
    console.error(error);
    return;
  }

  await supabase.from("employee_roles").insert(
    employee.roles.map((role) => ({
      employee_id: data.id,
      role,
    }))
  );
}

export async function updateSupabaseEmployee(employee: Employee) {
  await supabase
    .from("employees")
    .update({
      pin: employee.pin,
      name: employee.name,
      hourly_rate: employee.hourlyRate,
      can_access_manager: employee.canAccessManager,
      is_active: employee.isActive,
    })
    .eq("id", employee.databaseId);

  await supabase
    .from("employee_roles")
    .delete()
    .eq("employee_id", employee.databaseId);

  await supabase.from("employee_roles").insert(
    employee.roles.map((role) => ({
      employee_id: employee.databaseId,
      role,
    }))
  );
}

export async function toggleSupabaseEmployeeActive(employee: Employee) {
  await supabase
    .from("employees")
    .update({
      is_active: employee.isActive === false,
    })
    .eq("id", employee.databaseId);
}