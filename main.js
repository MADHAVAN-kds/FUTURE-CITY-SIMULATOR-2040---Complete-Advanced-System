/**
 * Future City Simulator 2040 - Main Application Controller
 * Integrates all systems and manages game loop
 */

class GameController {
    constructor() {
        this.city = new City();
        this.aiEngine = new AIEngine(this.city);
        this.eventSystem = new EventSystem(this.city);
        this.visualizer = null;
        
        this.isRunning = true;
        this.gameSpeed = 4;
        this.lastUpdate = Date.now();
        this.lastAIUpdate = Date.now();
        this.aiUpdateInterval = 10000; // AI updates every 10 seconds
        
        this.init();
    }
    
    init() {
        // Initialize visualizer
        const canvas = document.getElementById('cityCanvas');
        this.visualizer = new CityVisualizer(canvas, this.city);
        
        // Setup UI
        this.setupUI();
        this.setupEventListeners();
        this.setupNotifications();
        
        // Start game loop
        this.gameLoop();
        
        // Initial updates
        this.updateUI();
        this.updateAI();
        this.buildBuildingMenu();
        this.buildPolicyMenu();
    }
    
    setupUI() {
        // Initial UI state
        this.updateUI();
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.isRunning = true;
            this.showNotification('success', 'Simulation resumed');
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isRunning = false;
            this.showNotification('info', 'Simulation paused');
        });
        
        // Speed controls
        document.getElementById('speed1x').addEventListener('click', () => this.setSpeed(1));
        document.getElementById('speed2x').addEventListener('click', () => this.setSpeed(2));
        document.getElementById('speed4x').addEventListener('click', () => this.setSpeed(4));
        
        // Save/Load/Reset
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // View controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.visualizer.zoomIn();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.visualizer.zoomOut();
        });
        
        document.getElementById('rotateView').addEventListener('click', () => {
            this.visualizer.rotate();
        });
        
        // Quick actions
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            this.eventSystem.triggerEmergency();
        });
        
        document.getElementById('researchBtn').addEventListener('click', () => {
            this.eventSystem.researchTechnology();
        });
        
        document.getElementById('festivalsBtn').addEventListener('click', () => {
            this.eventSystem.triggerFestival();
        });
        
        document.getElementById('policyBtn').addEventListener('click', () => {
            this.showPolicyModal();
        });
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('policyModal').classList.remove('active');
        });
        
        // Custom events
        window.addEventListener('notification', (e) => {
            this.showNotification(e.detail.type, e.detail.message);
        });
        
        window.addEventListener('cityEvent', (e) => {
            this.addCityEvent(e.detail);
        });
    }
    
    setupNotifications() {
        this.notifications = [];
    }
    
    buildBuildingMenu() {
        const grid = document.getElementById('buildingGrid');
        grid.innerHTML = '';
        
        this.city.buildingTypes.forEach(building => {
            const card = document.createElement('div');
            card.className = 'building-card';
            card.innerHTML = `
                <div class="building-icon">${building.icon}</div>
                <div class="building-name">${building.name}</div>
                <div class="building-cost">$${building.cost.toLocaleString()}</div>
            `;
            
            card.addEventListener('click', () => {
                if (this.city.canAfford(building.cost)) {
                    this.visualizer.setPendingBuilding(building.id);
                    this.showNotification('info', `Click on the canvas to place ${building.name}`);
                } else {
                    this.showNotification('error', 'Insufficient funds!');
                }
            });
            
            grid.appendChild(card);
        });
    }
    
    buildPolicyMenu() {
        const grid = document.getElementById('policyGrid');
        grid.innerHTML = '';
        
        this.city.policyTypes.forEach(policy => {
            const card = document.createElement('div');
            card.className = 'policy-card';
            if (this.city.policies.includes(policy.id)) {
                card.classList.add('active');
            }
            
            card.innerHTML = `
                <div class="policy-icon">${policy.icon}</div>
                <div class="policy-name">${policy.name}</div>
                <div class="policy-desc">${policy.description}</div>
                <div class="policy-cost">Cost: $${policy.cost.toLocaleString()}</div>
            `;
            
            card.addEventListener('click', () => {
                if (!this.city.policies.includes(policy.id)) {
                    const result = this.city.enactPolicy(policy.id);
                    if (result.success) {
                        card.classList.add('active');
                        this.showNotification('success', result.message);
                    } else {
                        this.showNotification('error', result.message);
                    }
                }
            });
            
            grid.appendChild(card);
        });
    }
    
    setSpeed(speed) {
        this.gameSpeed = speed;
        document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`speed${speed}x`).classList.add('active');
        this.showNotification('info', `Speed set to ${speed}x`);
    }
    
    gameLoop() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000 * this.gameSpeed;
        
        if (this.isRunning) {
            // Update city
            const updateResult = this.city.update(deltaTime);
            
            // Check for level up
            if (updateResult.levelUp) {
                this.showNotification('success', `🎊 Level Up! Your city is now level ${updateResult.newLevel}!`);
                this.addCityEvent({
                    name: '⭐ City Level Up!',
                    description: `Your city has reached level ${updateResult.newLevel}!`,
                    type: 'positive'
                });
            }
            
            // Update UI
            this.updateUI();
            
            // Update event system
            this.eventSystem.update(now);
            
            // Update AI periodically
            if (now - this.lastAIUpdate > this.aiUpdateInterval) {
                this.updateAI();
                this.lastAIUpdate = now;
            }
        }
        
        // Render visualization
        this.visualizer.render();
        
        this.lastUpdate = now;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateUI() {
        const state = this.city.getState();
        
        // Header stats
        document.getElementById('currentYear').textContent = state.year;
        document.getElementById('cityLevel').textContent = state.level;
        document.getElementById('aiStatus').textContent = 'ACTIVE';
        
        // Metrics
        document.getElementById('population').textContent = state.population.toLocaleString();
        document.getElementById('money').textContent = '$' + state.money.toLocaleString();
        document.getElementById('happiness').textContent = Math.round(state.happiness) + '%';
        document.getElementById('environment').textContent = Math.round(state.environment) + '%';
        document.getElementById('technology').textContent = Math.round(state.technology) + '%';
        document.getElementById('energy').textContent = Math.round(state.energy) + '%';
        
        // Progress bars
        document.getElementById('populationBar').style.width = Math.min(100, (state.population / 1000)) + '%';
        document.getElementById('moneyBar').style.width = Math.min(100, (state.money / 2000000) * 100) + '%';
        document.getElementById('happinessBar').style.width = state.happiness + '%';
        document.getElementById('environmentBar').style.width = state.environment + '%';
        document.getElementById('technologyBar').style.width = state.technology + '%';
        document.getElementById('energyBar').style.width = state.energy + '%';
        
        // Trends
        const trends = state.trends;
        this.updateTrend('populationTrend', trends.population);
        this.updateTrend('moneyTrend', trends.money);
        this.updateTrend('happinessTrend', trends.happiness);
        this.updateTrend('environmentTrend', trends.environment);
        
        // City info
        document.getElementById('buildingCount').textContent = state.buildingCount;
        document.getElementById('trafficFlow').textContent = state.trafficFlow;
        document.getElementById('temperature').textContent = state.temperature + '°C';
        document.getElementById('airQuality').textContent = state.airQuality;
    }
    
    updateTrend(elementId, value) {
        const element = document.getElementById(elementId);
        if (value > 0) {
            element.textContent = `+${value}%`;
            element.style.color = 'var(--success)';
            element.className = 'metric-trend';
        } else if (value < 0) {
            element.textContent = `${value}%`;
            element.style.color = 'var(--danger)';
            element.className = 'metric-trend negative';
        } else {
            element.textContent = '0%';
            element.style.color = 'var(--text-dim)';
            element.className = 'metric-trend';
        }
    }
    
    updateAI() {
        // Get AI recommendations
        const recommendations = this.aiEngine.analyze();
        const recommendationList = document.getElementById('recommendationList');
        recommendationList.innerHTML = '';
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `
                <div class="recommendation-title">${rec.recommendation.title}</div>
                <div class="recommendation-desc">${rec.recommendation.description}</div>
            `;
            recommendationList.appendChild(item);
        });
        
        // Update AI message
        const insight = this.aiEngine.getInsight();
        const messageBox = document.getElementById('aiMessageBox');
        messageBox.innerHTML = `<p class="ai-message">${insight}</p>`;
    }
    
    addCityEvent(eventData) {
        const eventsList = document.getElementById('eventsList');
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${eventData.type || ''}`;
        
        const time = new Date().toLocaleTimeString();
        eventItem.innerHTML = `
            <div class="event-time">${time}</div>
            <div class="event-text">${eventData.name}<br>${eventData.description}</div>
        `;
        
        eventsList.insertBefore(eventItem, eventsList.firstChild);
        
        // Limit event history
        while (eventsList.children.length > 5) {
            eventsList.removeChild(eventsList.lastChild);
        }
    }
    
    showNotification(type, message) {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const title = {
            success: '✅ Success',
            error: '❌ Error',
            warning: '⚠️ Warning',
            info: 'ℹ️ Info'
        }[type] || 'Notification';
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    showPolicyModal() {
        document.getElementById('policyModal').classList.add('active');
    }
    
    saveGame() {
        if (this.city.save()) {
            this.showNotification('success', 'Game saved successfully!');
        } else {
            this.showNotification('error', 'Failed to save game!');
        }
    }
    
    loadGame() {
        if (this.city.load()) {
            this.updateUI();
            this.showNotification('success', 'Game loaded successfully!');
        } else {
            this.showNotification('error', 'No saved game found!');
        }
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset? All progress will be lost!')) {
            this.city.reset();
            this.updateUI();
            this.showNotification('info', 'Game reset complete!');
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
    console.log('🏙️ Future City Simulator 2040 initialized!');
    console.log('Welcome, Mayor! Build the city of tomorrow.');
});
