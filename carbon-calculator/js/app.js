/**
 * app.js - Arquivo principal da aplicação
 * Trata inicialização e submissão do formulário da calculadora de CO2
 */

// Aguarda o DOM carregar completamente antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    
    /**
     * INICIALIZAÇÃO
     * Configura a calculadora no carregamento da página
     */
    
    // Preenche o datalist com todas as cidades disponíveis
    CONFIG.populateDatalist();
    
    // Configura preenchimento automático da distância quando cidades são selecionadas
    CONFIG.setupDistanceAutofill();
    
    // Obtém o elemento do formulário da calculadora
    const calculatorForm = document.getElementById('calculator-form');
    
    // Adiciona listener de submit ao formulário
    calculatorForm.addEventListener('submit', handleFormSubmit);
    
    // Log successful initialization
    console.log('✅ Calculadora inicializada!');
    
    /**
     * TRATADOR DE SUBMISSÃO DO FORMULÁRIO
     * Processa dados do formulário e exibe os resultados do cálculo
     * @param {Event} event - Evento de submissão do formulário
     */
    function handleFormSubmit(event) {
        // Previna o comportamento padrão de submissão do formulário
        event.preventDefault();
        
        /**
         * PASSO 1: Obter e validar valores do formulário
         */
        
        // Obtém valor da cidade de origem (trim)
        const origin = document.getElementById('origin').value.trim();
        
        // Obtém valor da cidade de destino (trim)
        const destination = document.getElementById('destination').value.trim();
        
        // Obtém valor da distância e converte para float
        const distanceInput = document.getElementById('distance').value;
        const distance = parseFloat(distanceInput);
        
        // Obtém o meio de transporte selecionado pelos radios
        const transportModeInput = document.querySelector('input[name="transport"]:checked');
        const transportMode = transportModeInput ? transportModeInput.value : null;
        
        /**
         * PASSO 2: Validar entradas
         */
        
        // Verifica se todos os campos obrigatórios estão preenchidos
        if (!origin || !destination) {
            alert('❌ Por favor, preencha a origem e o destino.');
            return;
        }
        
        if (!distance || distance <= 0) {
            alert('❌ Por favor, insira uma distância válida maior que zero.');
            return;
        }
        
        if (!transportMode) {
            alert('❌ Por favor, selecione um meio de transporte.');
            return;
        }
        
        /**
         * PASSO 3: Mostrar estado de carregamento
         */
        
        // Obtém o elemento do botão de envio
        const submitButton = calculatorForm.querySelector('.form-submit');
        
        // Mostra spinner de carregamento no botão
        UI.showLoading(submitButton);
        
        // Esconde quaisquer resultados anteriores
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');
        
        /**
         * PASSO 4: Processar cálculo com atraso simulado
         * Simula chamada de API ou processamento pesado
         */
        
        setTimeout(function() {
            try {
                /**
                 * CÁLCULOS
                 */
                
                // Calcula emissão para o modo de transporte selecionado
                const emission = Calculator.calculateEmission(distance, transportMode);
                
                // Calcula emissão do carro como baseline para comparação
                const carEmission = Calculator.calculateEmission(distance, 'car');
                
                // Calcula economia em relação ao carro (se não for carro)
                const savings = transportMode !== 'car' 
                    ? Calculator.calculateSavings(emission, carEmission)
                    : null;
                
                // Calcula emissões para todos os meios de transporte
                const allModesComparison = Calculator.calculateAllModes(distance);
                
                // Calcula créditos de carbono necessários
                const carbonCredits = Calculator.calculateCarbonCredits(emission);
                
                // Calcula preço estimado para créditos de carbono
                const creditPrice = Calculator.estimateCreditPrice(carbonCredits);
                
                /**
                 * CONSTRUIR OBJETOS DE DADOS PARA RENDERIZAÇÃO
                 */
                
                // Objeto de dados de resultados
                const resultsData = {
                    origin: origin,
                    destination: destination,
                    distance: distance,
                    emission: emission,
                    mode: transportMode,
                    savings: savings
                };
                
                // Objeto de dados de créditos de carbono
                const creditsData = {
                    credits: carbonCredits,
                    price: creditPrice
                };
                
                /**
                 * RENDERIZAR RESULTADOS
                 */
                
                // Renderiza a seção principal de resultados
                const resultsHTML = UI.renderResults(resultsData);
                document.getElementById('results-content').innerHTML = resultsHTML;
                
                // Renderiza a seção de comparação
                const comparisonHTML = UI.renderComparison(allModesComparison, transportMode);
                document.getElementById('comparison-content').innerHTML = comparisonHTML;
                
                // Renderiza a seção de créditos de carbono
                const creditsHTML = UI.renderCarbonCredits(creditsData);
                document.getElementById('carbon-credits-content').innerHTML = creditsHTML;
                
                /**
                 * EXIBIR RESULTADOS
                 */
                
                // Exibe todas as seções de resultados
                UI.showElement('results');
                UI.showElement('comparison');
                UI.showElement('carbon-credits');
                
                // Rola suavemente até a seção de resultados
                UI.scrollToElement('results');
                
                // Esconde estado de carregamento e restaura o botão
                UI.hideLoading(submitButton);
                
                // Registra sucesso no console
                console.log('✅ Cálculo concluído:', {
                    emission: emission,
                    credits: carbonCredits,
                    savings: savings
                });
                
            } catch (error) {
                /**
                 * TRATAMENTO DE ERROS
                 */
                
                // Registra detalhes do erro no console para depuração
                console.error('❌ Erro ao calcular emissões:', error);
                
                // Mostra mensagem de erro amigável ao usuário
                alert('❌ Ocorreu um erro ao calcular as emissões. Por favor, tente novamente.');
                
                // Esconde estado de carregamento
                UI.hideLoading(submitButton);
            }
            
        }, 1500); // 1.5 second delay to simulate processing
    }
    
});
