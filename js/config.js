/**
 * CONFIG - Objeto global de configuração
 * Contém fatores de emissão, metadados dos meios de transporte e funções utilitárias
 */

const CONFIG = {
    /**
     * Fatores de emissão de CO2 em kg por quilômetro para cada meio de transporte
     */
    EMISSION_FACTORS: {
        bicycle: 0,
        car: 0.12,
        bus: 0.089,
        truck: 0.96
    },

    /**
     * Metadados dos meios de transporte para renderização de UI
     */
    TRANSPORT_MODES: {
        bicycle: {
            label: "Bicicleta",
            icon: "🚲",
            color: "#10b981"
        },
        car: {
            label: "Carro",
            icon: "🚗",
            color: "#3b82f6"
        },
        bus: {
            label: "Ônibus",
            icon: "🚌",
            color: "#f59e0b"
        },
        truck: {
            label: "Caminhão",
            icon: "🚚",
            color: "#ef4444"
        }
    },

    /**
     * Configuração de créditos de carbono
     */
    CARBON_CREDIT: {
        KG_PER_CREDIT: 1000,
        PRICE_MIN_BRL: 50,
        PRICE_MAX_BRL: 150
    },

    /**
     * Preenche o datalist com todas as cidades disponíveis
     * Obtém cidades do RoutesDB e cria elementos option
     */
    populateDatalist: function() {
        // Obtém todas as cidades do banco de rotas
        const cities = RoutesDB.getAllCities();
        
        // Obtém o elemento datalist
        const datalist = document.getElementById('cities-list');
        
        // Limpa opções existentes (se houver)
        datalist.innerHTML = ''; 
        
        // Cria e adiciona elementos option para cada cidade
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            datalist.appendChild(option);
        });
    },

    /**
     * Configura cálculo automático de distância quando origem e destino são selecionados
     * Trata busca de rota e sobrescrita manual de distância
     */
    setupDistanceAutofill: function() {
        // Obtém elementos do formulário
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        const distanceInput = document.getElementById('distance');
        const manualCheckbox = document.getElementById('manual-distance');
        const helperText = document.querySelector('.form-group__helper-text');
        
        /**
         * Tenta encontrar e preencher a distância entre as cidades selecionadas
         */
        const tryFindDistance = () => {
            // Obtém valores dos inputs e remove espaços
            const origin = originInput.value.trim();
            const destination = destinationInput.value.trim();
            
            // Só procura se ambos os campos estiverem preenchidos
            if (origin && destination) {
                // Tenta encontrar a distância da rota
                const distance = RoutesDB.findDistance(origin, destination);
                
                if (distance !== null) {
                    // Rota encontrada — preenche a distância
                    distanceInput.value = distance;
                    distanceInput.readOnly = true;
                    
                    // Exibe mensagem de sucesso
                    if (helperText) {
                        helperText.textContent = `✓ Distância encontrada: ${distance} km`;
                        helperText.style.color = '#10b981';
                    }
                } else {
                    // Rota não encontrada
                    distanceInput.value = ''; 
                    distanceInput.readOnly = false;
                    
                    // Sugere entrada manual
                    if (helperText) {
                        helperText.textContent = 'Rota não encontrada. Por favor, insira a distância manualmente.';
                        helperText.style.color = '#f59e0b';
                    }
                }
            }
        };
        
        // Adiciona listeners de mudança aos inputs de origem e destino
        originInput.addEventListener('change', tryFindDistance);
        destinationInput.addEventListener('change', tryFindDistance);
        
        // Trata o checkbox de distância manual
        manualCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Habilita entrada manual de distância
                distanceInput.readOnly = false;
                distanceInput.focus();
                
                if (helperText) {
                    helperText.textContent = 'Digite a distância manualmente';
                    helperText.style.color = '#6b7280';
                }
            } else {
                // Tenta encontrar a rota novamente ao desmarcar
                tryFindDistance(); 
            }
        });
    }
};
