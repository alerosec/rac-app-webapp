import supabase from './supabase-client.js';

export async function getCurrentUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user ?? null;
}

export async function createAssessment(assessment) {
  const { error } = await supabase.from('assessments').insert(assessment);
  if (error) throw error;
  return assessment;
}

export async function getRisks() {
  const { data, error } = await supabase.from('risks').select('*');
  if (error) throw error;
  return data;
}

export async function getComplianceItems() {
  const { data, error } = await supabase.from('compliance').select('*');
  if (error) throw error;
  return data;
}

export async function createCompliance(item) {
  const { error } = await supabase.from('compliance').insert(item);
  if (error) throw error;
  return item;
}

export async function createEvidence(item) {
  const { error } = await supabase.from('evidence').insert(item);
  if (error) throw error;
  return item;
}
