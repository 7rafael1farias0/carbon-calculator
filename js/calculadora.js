/**
 * Calculator - Objeto global da calculadora para emissões de CO2
 * Contém métodos de cálculo para emissões, comparações e créditos de carbono
 */

const Calculator = {
    /**
     * Calcula emissão de CO2 para uma dada distância e meio de transporte
     * @param {number} distanceKm - Distância em quilômetros
     * @param {string} transportMode - Chave do meio de transporte (bicycle, car, bus, truck)
     * @returns {number} Emissão de CO2 em quilogramas, arredondada para 2 casas decimais
     */
    calculateEmission: function(distanceKm, transportMode) {
        // Obtém o fator de emissão para o modo de transporte especificado
        const emissionFactor = CONFIG.EMISSION_FACTORS[transportMode];
        
        // Calcula emissão: distância * fator de emissão
        const emission = distanceKm * emissionFactor;
        
        // Retorna resultado arredondado para 2 casas decimais
        return Math.round(emission * 100) / 100;
    },

    /**
     * Calcula emissões para todos os meios de transporte e compara com o carro como baseline
     * @param {number} distanceKm - Distância em quilômetros
     * @returns {Array} Array de objetos com mode, emission e percentageVsCar, ordenado por emissão
     */
    calculateAllModes: function(distanceKm) {
        // Array para armazenar resultados de cálculo
        const results = []; 
        
        // Primeiro, calcula a emissão do carro como baseline para comparação
        const carEmission = this.calculateEmission(distanceKm, 'car');
        
        // Calcula emissão para cada meio de transporte
        for (const mode in CONFIG.EMISSION_FACTORS) {
            // Calcula emissão para este modo
            const emission = this.calculateEmission(distanceKm, mode);
            
            // Calcula porcentagem comparada ao carro (baseline)
            // Trata caso onde a emissão do carro é 0
            const percentageVsCar = carEmission > 0 
                ? Math.round((emission / carEmission) * 100 * 100) / 100
                : 0;
            
            // Adiciona objeto de resultado ao array
            results.push({
                mode: mode,
                emission: emission,
                percentageVsCar: percentageVsCar
            });
        }
        
        // Ordena o array por emissão (do menor para o ranking mais ecológico)
        results.sort((a, b) => a.emission - b.emission);
        
        return results;
    },

    /**
     * Calcula economia de CO2 comparada a uma emissão baseline
     * @param {number} emission - Emissão atual em kg CO2
     * @param {number} baselineEmission - Emissão baseline para comparar em kg CO2
     * @returns {Object} Objeto com propriedades savedKg e percentage
     */
    calculateSavings: function(emission, baselineEmission) {
        // Calcula quantos kg de CO2 foram poupados
        const savedKg = baselineEmission - emission;
        
        // Calcula a porcentagem de economia
        // Trata caso onde a baseline é 0
        const percentage = baselineEmission > 0
            ? (savedKg / baselineEmission) * 100
            : 0;
        
        // Retorna objeto com valores arredondados
        return {
            savedKg: Math.round(savedKg * 100) / 100,
            percentage: Math.round(percentage * 100) / 100
        };
    },

    /**
     * Calcula créditos de carbono necessários para compensar a emissão
     * @param {number} emissionKg - Emissão de CO2 em quilogramas
     * @returns {number} Número de créditos de carbono necessários, arredondado para 4 casas decimais
     */
    calculateCarbonCredits: function(emissionKg) {
        // Cada crédito de carbono compensa uma certa quantidade de CO2 (definida em CONFIG)
        const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
        
        // Retorna arredondado para 4 casas decimais para precisão
        return Math.round(credits * 10000) / 10000;
    },

    /**
     * Estima a faixa de preço para créditos de carbono em Reais
     * @param {number} credits - Número de créditos de carbono
     * @returns {Object} Objeto com preço mínimo, máximo e médio em BRL
     */
    estimateCreditPrice: function(credits) {
        // Calcula o preço mínimo baseado na taxa de mercado baixa
        const min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
        
        // Calcula o preço máximo baseado na taxa de mercado alta
        const max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
        
        // Calcula preço médio (ponto médio da faixa)
        const average = (min + max) / 2;
        
        // Retorna objeto com todos os preços arredondados para 2 casas decimais
        return {
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            average: Math.round(average * 100) / 100
        };
    }
};
