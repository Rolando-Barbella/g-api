import supabase from './supabaseClient.js';

export async function saveTrendDataToDB(trendData) {
    const { data, error } = await supabase
        .from('Trends') //esta categoria puede variar
        .insert([trendData]);

    if (error) {
        console.error('Error al guardar los datos en Supabase:', error);
        throw error;
    }

    console.log('Datos guardados en la base de datos:', data);
}
