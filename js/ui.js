/**
 * UI - Objeto global de UI para renderização e manipulação do DOM
 * Contém métodos utilitários e funções de renderização para a interface da calculadora
 */

const UI = {
    /**
     * MÉTODOS UTILITÁRIOS
     */

    /**
     * Formata um número com casas decimais e separadores de milhar
     * @param {number} number - Número a ser formatado
     * @param {number} decimals - Número de casas decimais
     * @returns {string} String do número formatado (ex.: "1.234,56")
     */
    formatNumber: function(number, decimals = 2) {
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formata um valor como moeda Real brasileiro
     * @param {number} value - Valor a ser formatado
     * @returns {string} String formatada de moeda (ex.: "R$ 1.234,56")
     */
    formatCurrency: function(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    },

    /**
     * Exibe um elemento removendo a classe 'hidden'
     * @param {string} elementId - ID do elemento a ser exibido
     */
    showElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    },

    /**
     * Oculta um elemento adicionando a classe 'hidden'
     * @param {string} elementId - ID do elemento a ser ocultado
     */
    hideElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    },

    /**
     * Rola suavemente até um elemento
     * @param {string} elementId - ID do elemento para rolar até ele
     */
    scrollToElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    /**
     * MÉTODOS DE RENDERIZAÇÃO
     */

    /**
     * Renderiza os resultados principais do cálculo
     * @param {Object} data - Dados do resultado contendo origem, destino, distância, emissão, modo, economia
     * @returns {string} String HTML para a seção de resultados
     */
    renderResults: function(data) {
        // Obtém metadados do meio de transporte
        const modeData = CONFIG.TRANSPORT_MODES[data.mode];
        
        // Monta a estrutura HTML com cartões de resultados
        let html = `
            <h2 class="section-title">Resultados da Emissão</h2>
            
            <div class="results__grid">
                <!-- Cartão de Rota -->
                <div class="results__card">
                    <div class="results__card-icon">🗺️</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Rota</h3>
                        <p class="results__card-value">${data.origin} → ${data.destination}</p>
                    </div>
                </div>
                
                <!-- Cartão de Distância -->
                <div class="results__card">
                    <div class="results__card-icon">📏</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Distância</h3>
                        <p class="results__card-value">${this.formatNumber(data.distance, 0)} km</p>
                    </div>
                </div>
                
                <!-- Cartão de Emissão -->
                <div class="results__card results__card--highlight">
                    <div class="results__card-icon">🌿</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Emissão de CO₂</h3>
                        <p class="results__card-value results__card-value--large">${this.formatNumber(data.emission)} kg</p>
                    </div>
                </div>
                
                <!-- Cartão do Meio de Transporte -->
                <div class="results__card">
                    <div class="results__card-icon">${modeData.icon}</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Meio de Transporte</h3>
                        <p class="results__card-value">${modeData.label}</p>
                    </div>
                </div>
        `;
        
        // Adiciona cartão de economia se aplicável (não é carro e há economia)
        if (data.mode !== 'car' && data.savings && data.savings.savedKg > 0) {
            html += `
                <!-- Cartão de Economia -->
                <div class="results__card results__card--success">
                    <div class="results__card-icon">✅</div>
                    <div class="results__card-content">
                        <h3 class="results__card-title">Economia vs Carro</h3>
                        <p class="results__card-value">${this.formatNumber(data.savings.savedKg)} kg</p>
                        <p class="results__card-subtitle">${this.formatNumber(data.savings.percentage)}% menos emissões</p>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`; // Fecha results__grid
        
        return html;
    },

    /**
     * Renderiza a comparação entre todos os meios de transporte
     * @param {Array} modesArray - Array de objetos de modo vindos de Calculator.calculateAllModes()
     * @param {string} selectedMode - Meio de transporte atualmente selecionado
     * @returns {string} String HTML para a seção de comparação
     */
    renderComparison: function(modesArray, selectedMode) {
        // Inicia a estrutura HTML
        let html = `
            <h2 class="section-title">Comparação entre Meios de Transporte</h2>
            <div class="comparison__grid">
        `;
        
        // Encontra a emissão máxima para dimensionar a barra de progresso
        const maxEmission = Math.max(...modesArray.map(m => m.emission));
        
        // Renderiza cada meio de transporte
        modesArray.forEach(modeObj => {
            const modeData = CONFIG.TRANSPORT_MODES[modeObj.mode];
            const isSelected = modeObj.mode === selectedMode;
            
            // Calcula largura da barra de progresso (percentual da emissão máxima)
            const barWidth = maxEmission > 0 ? (modeObj.emission / maxEmission) * 100 : 0;
            
            // Determina cor baseada no percentual vs carro
            let barColor;
            if (modeObj.percentageVsCar <= 25) {
                barColor = '#10b981'; // Verde - muito ecológico
            } else if (modeObj.percentageVsCar <= 75) {
                barColor = '#f59e0b'; // Amarelo - moderado
            } else if (modeObj.percentageVsCar <= 100) {
                barColor = '#fb923c'; // Laranja - alto
            } else {
                barColor = '#ef4444'; // Vermelho - muito alto
            }
            
            html += `
                <div class="comparison__item${isSelected ? ' comparison__item--selected' : ''}">
                    <div class="comparison__header">
                        <span class="comparison__icon">${modeData.icon}</span>
                        <span class="comparison__label">${modeData.label}</span>
                        ${isSelected ? '<span class="comparison__badge">Selecionado</span>' : ''}
                    </div>
                    
                    <div class="comparison__stats">
                        <div class="comparison__stat">
                            <span class="comparison__stat-label">Emissão</span>
                            <span class="comparison__stat-value">${this.formatNumber(modeObj.emission)} kg CO₂</span>
                        </div>
                        <div class="comparison__stat">
                            <span class="comparison__stat-label">vs Carro</span>
                            <span class="comparison__stat-value">${this.formatNumber(modeObj.percentageVsCar)}%</span>
                        </div>
                    </div>
                    
                    <div class="comparison__bar-container">
                        <div class="comparison__bar" style="width: ${barWidth}%; background-color: ${barColor};"></div>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <!-- Tip Box -->
            <div class="comparison__tip">
                <span class="comparison__tip-icon">💡</span>
                <p class="comparison__tip-text">
                    <strong>Dica:</strong> Escolher meios de transporte mais sustentáveis ajuda a reduzir 
                    significativamente as emissões de CO₂ e contribui para um planeta mais saudável!
                </p>
            </div>
        `;
        
        return html;
    },

    /**
     * Renderiza informações e preços de créditos de carbono
     * @param {Object} creditsData - Objeto contendo créditos e informações de preço
     * @returns {string} String HTML para a seção de créditos de carbono
     */
    renderCarbonCredits: function(creditsData) {
        const html = `
            <h2 class="section-title">Créditos de Carbono</h2>
            
            <div class="carbon-credits__grid">
                <!-- Credits Needed Card -->
                <div class="carbon-credits__card">
                    <div class="carbon-credits__card-header">
                        <span class="carbon-credits__icon">🌳</span>
                        <h3 class="carbon-credits__card-title">Créditos Necessários</h3>
                    </div>
                    <div class="carbon-credits__card-body">
                        <p class="carbon-credits__value">${this.formatNumber(creditsData.credits, 4)}</p>
                        <p class="carbon-credits__helper">1 crédito = 1.000 kg CO₂</p>
                    </div>
                </div>
                
                <!-- Price Estimate Card -->
                <div class="carbon-credits__card">
                    <div class="carbon-credits__card-header">
                        <span class="carbon-credits__icon">💰</span>
                        <h3 class="carbon-credits__card-title">Custo Estimado</h3>
                    </div>
                    <div class="carbon-credits__card-body">
                        <p class="carbon-credits__value">${this.formatCurrency(creditsData.price.average)}</p>
                        <p class="carbon-credits__helper">
                            Variação: ${this.formatCurrency(creditsData.price.min)} - ${this.formatCurrency(creditsData.price.max)}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Information Box -->
            <div class="carbon-credits__info">
                <h4 class="carbon-credits__info-title">O que são Créditos de Carbono?</h4>
                <p class="carbon-credits__info-text">
                    Créditos de carbono são certificados que representam a redução de uma tonelada 
                    de CO₂ da atmosfera. Ao comprar créditos, você compensa suas emissões financiando 
                    projetos de preservação ambiental, reflorestamento e energia renovável.
                </p>
            </div>
            
            <!-- Compensation Button -->
            <div class="carbon-credits__action">
                <button class="carbon-credits__button" type="button">
                    🛒 Compensar Emissões
                </button>
            </div>
        `;
        
        return html;
    },

    /**
     * Mostra estado de carregamento em um botão
     * @param {HTMLElement} buttonElement - Elemento botão para mostrar carregamento
     */
    showLoading: function(buttonElement) {
        // Salva o texto original do botão
        buttonElement.dataset.originalText = buttonElement.innerHTML;
        
        // Desabilita o botão
        buttonElement.disabled = true;
        
        // Altera o conteúdo do botão para mostrar spinner e texto de carregando
        buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
    },

    /**
     * Esconde o estado de carregamento e restaura o botão
     * @param {HTMLElement} buttonElement - Elemento botão para restaurar
     */
    hideLoading: function(buttonElement) {
        // Habilita o botão
        buttonElement.disabled = false;
        
        // Restaura o texto original a partir do atributo de dados
        if (buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        }
    }
};
