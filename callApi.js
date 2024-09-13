import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { saveTrendDataToDB } from './insertData.js';  
dotenv.config();

const API_KEY = process.env.API_KEY;

async function getTrendData(paises, categoria, fecha) {
    const query = paises.join(','); 
    const params = new URLSearchParams({
        engine: 'google_trends',
        q: query,
        hl: 'en',
        cat: categoria, // ID de la categoría
        date: fecha,
        tz: 420, // Zona horaria
        api_key: API_KEY,
    });

    const url = `https://serpapi.com/search?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); 
        console.log('Response data:', JSON.stringify(data, null, 2));
        return data; 
    } catch (error) {
        console.error('Error al obtener los datos de Google Trends:', error);
        return null;
    }
}

//Función para procesar y guardar los datos en la base de datos
async function processAndSaveTrends(region, paises, categoria, fecha) {
    // obtener los datos desde Google Trends
    const trendData = await getTrendData(paises, categoria, fecha);
    if (!trendData) {
        console.error('No se recibieron datos de Google Trends');
        return;
    }

    //interest_over_time obtiene datos sobre el interes a traves del tiempo
    const interestData = trendData.interest_over_time.timeline_data.map(item => ({
        date: item.date,
        countries: item.values.map(v => ({ country: v.query, interest: v.value })) 
    }));

    const dbEntry = {
        region: region,
        category: categoria,
        interest: interestData, 
        countries: paises 
    };

    await saveTrendDataToDB(dbEntry);
}

const region = 'Southeast Asia';
const paises = ['thailand', 'bali', 'vietnam', 'philippines', 'taiwan'];
const categoria = '67'; // ID de la categoría "Travel"
const fecha = 'today 1-m'; // Últimos 30 días

processAndSaveTrends(region, paises, categoria, fecha);
