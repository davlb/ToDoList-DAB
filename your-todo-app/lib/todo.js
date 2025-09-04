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
// Add this function to your lib/todo.js
export async function updateTodo(id, newTitle) {
  const { data, error } = await supabase
    .from('todos')
    .update({ title: newTitle })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add this function
export async function saveAiOutput(id, enhancedTitle, aiOutput) {
  const { data, error } = await supabase
    .from("todos")
    .update({ enhanced_title: enhancedTitle, ai_output: aiOutput })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
  
}
// Delete task
export async function deleteTodo(id) {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}