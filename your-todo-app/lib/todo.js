import { supabase } from "./supabaseClient";

// Get all tasks
export async function getTodos() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Add a new task
export async function addTodo(title, description = "", username = "Guest") {
  const { data, error } = await supabase
    .from("todos")
    .insert([{ title, description, username }])
    .select();
  if (error) throw error;
  return data[0];
}

// Toggle complete
export async function toggleTodo(id, completed) {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}

// Edit task
export async function updateTodo(id, fields) {
  const { data, error } = await supabase
    .from("todos")
    .update(fields)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
}
