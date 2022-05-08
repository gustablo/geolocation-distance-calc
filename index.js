const axios = require('axios').default;

class FindMininumDistanceByZipcode {
    constructor() {
        this.API_KEY = 'AIzaSyD7Lzl6EMUHg52x3veWyv6hNWEmUOJppbU';
        this.API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
    }

    async handle(cep, shops) {
        const customerGeo = await this.getGeoByCep(cep);
    
        const distances = this.getDistances(customerGeo, shops);
    
        const minDistance = this.getMinDistance(distances);
    
        return minDistance;
    }
    

    getDistanceFromLatLonInKm(firstPosition, secondPosition) {
        const deg2rad = (deg) => deg * (Math.PI / 180);

        const R = 6371;

        const dLatitude = deg2rad(secondPosition.lat - firstPosition.lat);
        const dLongitude = deg2rad(secondPosition.lng - firstPosition.lng);

        const a = Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) + Math.cos(deg2rad(firstPosition.lat)) * Math.cos(deg2rad(firstPosition.lat)) * Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return ((R * c * 1000).toFixed());
    }

    async getGeoByCep(address) {
        const response = await axios.get(`${this.API_URL}?address=${address}&key=${this.API_KEY}`);

        return response.data.results[0].geometry.location;
    }

    getDistances(customerGeolocation, shops = []) {
        const distances = shops.map(shop => {
            const distance = this.getDistanceFromLatLonInKm(customerGeolocation, shop.geo);
            return { ...shop, distance };
        });

        return distances;
    }

    getMinDistance(distances = []) {
        const [orderedDistances] = distances.sort((a, b) => a.distance - b.distance);
        return orderedDistances;
    }
}



/**
 * O CÓDIGO CONVERTE UM CEP EM UMA COORDANADA GEOGRÁFICA (LAT, LONG) USANDO A API DO GOOGLE MAPS
 * E VERIFICA A PROXIMIDADE EM KM DE ACORDO COM AS COORDANADAS DAS LOJAS COM JS PURO
 * 
 * O SERVIÇO CUSTA U$17 A CADA 1.000 REQUISIÇÕES, A GOOGLE CLOUD DÁ U$300 NOS PRIMEIRO
 * 90 DIAS PARA NOVAS CONTAS, LOGO É POSSIVEL FAZER ~= 17.000 REQUESTS FREE NOS PRIMEIROS 
 * 90 DIAS. PODEMOS MANTER OS JÁ PESQUISADOS E SÓ CHAMAR A API PARA CEPS NÃO PESQUISADOS AINDA
 * REF 
 * https://cloud.google.com/maps-platform/pricing?hl=pt_BR&_ga=2.112852039.-2131941386.1625523983
 */

const findMininumDistance = new FindMininumDistanceByZipcode();

const cep = '01001-000';
const shops = [
    { id: 1, geo: { lat: -23.593364, lng: -46.658579 } },
    { id: 2, geo: { lat: -23.559721, lng: -46.658144 } },
    { id: 3, geo: { lat: -23.549929, lng: -46.616874 } },
    { id: 4, geo: { lat: -23.660711, lng: -46.702570 } },
    { id: 5, geo: { lat: -23.5502909, lng: -46.6341887 } },
    { id: 6, geo: { lat: -23.956559, lng: -46.370425 } },
];

const result = findMininumDistance.handle(cep, shops);

result.then(console.log);
