const axios = require('axios');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'SONU@2002sonu',
    database: 'satellite_data1'
};

// Fetch satellite data from the Celestrak API
const fetchData = async () => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const response = await axios.get('https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=json');
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('API did not return valid JSON data.');
        }
        const satellites = response.data.slice(0, 600); // Limit to the first 600 entries

        // Preparing country data
        const countries = ['USA', 'Russia', 'China', 'India', 'Japan', 'France', 'UK', 'Germany', 'Canada', 'Brazil'];
        await connection.query('INSERT IGNORE INTO LaunchCountry1 (country_name) VALUES ?', [countries.map(name => [name])]);

        // Retrieve country_ids from LaunchCountry1
        const [countriesData] = await connection.query('SELECT * FROM LaunchCountry1');
        const countryIdMap = new Map(countriesData.map(country => [country.country_name, country.country_id]));

        // Begin transaction to insert satellites data
        await connection.beginTransaction();
        const insertQuery = 'INSERT INTO Satellites1 (norad_id, satellite_name, country_id, launch_date) VALUES (?, ?, ?, NOW())';
        for (const satellite of satellites) {
            const countryName = countries[Math.floor(Math.random() * countries.length)]; // Randomly assign a country for demonstration
            const countryId = countryIdMap.get(countryName);
            await connection.execute(insertQuery, [
                satellite.norad_cat_id || null, 
                satellite.name || null,
                countryId || null
            ]);
        }
        await connection.commit();
        console.log('Data import completed successfully.');
    } catch (error) {
        console.error('Error during data fetching or insertion:', error);
        await connection.rollback();
    } finally {
        connection.end();
    }
};

fetchData();
