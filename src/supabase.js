// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vexvaobfmblrjxqccuxx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHZhb2JmbWJscmp4cWNjdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzQzMTIsImV4cCI6MjA3NzM1MDMxMn0.asfY8dueynh-tbqmi1x9AUPGAU3yOCsKZqHJFe3dI9Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
