/**
 * Future City Simulator 2040 - Event System
 * Random events, challenges, and opportunities
 */

class EventSystem {
    constructor(city) {
        this.city = city;
        this.eventHistory = [];
        this.activeEvents = [];
        this.lastEventTime = 0;
        this.eventInterval = 45000; // 45 seconds between events
        
        this.eventTypes = [
            // Positive events
            {
                id: 'tech_breakthrough',
                name: '🔬 Technology Breakthrough!',
                description: 'Your research labs have made a major discovery!',
                probability: 0.15,
                effects: { technology: 15, money: 50000 },
                requirements: { buildings: ['lab'] }
            },
            {
                id: 'population_boom',
                name: '👥 Population Boom!',
                description: 'A wave of new citizens has arrived!',
                probability: 0.2,
                effects: { population: 2000, happiness: 5 },
                requirements: { happiness: 70 }
            },
            {
                id: 'investment',
                name: '💰 Major Investment!',
                description: 'International investors are interested in your city!',
                probability: 0.15,
                effects: { money: 200000 },
                requirements: { technology: 60 }
            },
            {
                id: 'festival',
                name: '🎉 Successful Festival!',
                description: 'The city festival was a huge success!',
                probability: 0.2,
                effects: { happiness: 10, money: 30000 },
                requirements: { population: 20000 }
            },
            {
                id: 'green_award',
                name: '🌿 Environmental Award!',
                description: 'Your city wins an environmental excellence award!',
                probability: 0.1,
                effects: { environment: 10, money: 50000, happiness: 5 },
                requirements: { environment: 75 }
            },
            {
                id: 'tourism_boost',
                name: '📸 Tourism Surge!',
                description: 'Your city has become a popular tourist destination!',
                probability: 0.15,
                effects: { money: 100000, happiness: 8 },
                requirements: { buildings: ['museum', 'stadium'] }
            },
            
            // Negative events
            {
                id: 'power_outage',
                name: '⚡ Power Outage!',
                description: 'Energy grid failure causes citywide blackout!',
                probability: 0.15,
                effects: { energy: -20, happiness: -10, money: -50000 },
                requirements: { energy: { max: 40 } }
            },
            {
                id: 'pollution_spike',
                name: '☁️ Pollution Crisis!',
                description: 'Air quality has reached dangerous levels!',
                probability: 0.15,
                effects: { environment: -15, happiness: -10 },
                requirements: { environment: { max: 40 } }
            },
            {
                id: 'economic_downturn',
                name: '📉 Economic Recession!',
                description: 'The economy has entered a downturn!',
                probability: 0.1,
                effects: { money: -150000, happiness: -5 },
                requirements: {}
            },
            {
                id: 'protest',
                name: '📢 Citizen Protests!',
                description: 'Unhappy citizens are protesting in the streets!',
                probability: 0.15,
                effects: { happiness: -8, money: -30000 },
                requirements: { happiness: { max: 50 } }
            },
            {
                id: 'infrastructure_failure',
                name: '🚧 Infrastructure Failure!',
                description: 'Old infrastructure needs expensive repairs!',
                probability: 0.1,
                effects: { money: -100000 },
                requirements: { buildings: { min: 20 } }
            },
            
            // Neutral/Choice events
            {
                id: 'developer_proposal',
                name: '🏗️ Developer Proposal',
                description: 'A developer wants to build in your city. Accept?',
                probability: 0.1,
                type: 'choice',
                choices: [
                    { text: 'Accept', effects: { money: 100000, environment: -10 } },
                    { text: 'Decline', effects: { happiness: 5 } }
                ],
                requirements: {}
            }
        ];
    }
    
    update(currentTime) {
        if (currentTime - this.lastEventTime > this.eventInterval) {
            this.triggerRandomEvent();
            this.lastEventTime = currentTime;
        }
    }
    
    triggerRandomEvent() {
        const eligibleEvents = this.eventTypes.filter(event => {
            return this.checkRequirements(event.requirements) && 
                   Math.random() < event.probability;
        });
        
        if (eligibleEvents.length === 0) return;
        
        const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
        this.executeEvent(event);
    }
    
    checkRequirements(requirements) {
        if (!requirements) return true;
        
        const state = this.city.getState();
        
        // Check building requirements
        if (requirements.buildings) {
            const hasBuildings = requirements.buildings.every(buildingType => 
                this.city.buildings.some(b => b.type === buildingType)
            );
            if (!hasBuildings) return false;
        }
        
        // Check metric requirements
        if (requirements.happiness) {
            if (typeof requirements.happiness === 'number') {
                if (state.happiness < requirements.happiness) return false;
            } else if (requirements.happiness.max && state.happiness > requirements.happiness.max) {
                return false;
            }
        }
        
        if (requirements.environment) {
            if (typeof requirements.environment === 'number') {
                if (state.environment < requirements.environment) return false;
            } else if (requirements.environment.max && state.environment > requirements.environment.max) {
                return false;
            }
        }
        
        if (requirements.technology) {
            if (state.technology < requirements.technology) return false;
        }
        
        if (requirements.population) {
            if (state.population < requirements.population) return false;
        }
        
        if (requirements.energy) {
            if (typeof requirements.energy === 'number') {
                if (state.energy < requirements.energy) return false;
            } else if (requirements.energy.max && state.energy > requirements.energy.max) {
                return false;
            }
        }
        
        return true;
    }
    
    executeEvent(event) {
        // Add to history
        this.eventHistory.push({
            event: event,
            timestamp: Date.now()
        });
        
        // Apply effects
        if (event.effects) {
            this.city.applyEffects(event.effects);
        }
        
        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('cityEvent', {
            detail: {
                name: event.name,
                description: event.description,
                type: event.effects ? (event.effects.money && event.effects.money > 0 ? 'positive' : 'negative') : 'neutral'
            }
        }));
        
        // Show notification
        const notifType = event.effects && event.effects.money && event.effects.money < 0 ? 'warning' : 'success';
        window.dispatchEvent(new CustomEvent('notification', {
            detail: {
                type: notifType,
                message: `${event.name}\n${event.description}`
            }
        }));
    }
    
    triggerEmergency() {
        const emergencies = [
            {
                name: '🚨 Natural Disaster!',
                description: 'A natural disaster has struck the city!',
                effects: { money: -200000, happiness: -15, environment: -10, population: -1000 }
            },
            {
                name: '🚨 Cyber Attack!',
                description: 'City systems under cyber attack!',
                effects: { money: -100000, technology: -15, happiness: -10 }
            },
            {
                name: '🚨 Health Crisis!',
                description: 'A health emergency has been declared!',
                effects: { happiness: -20, money: -150000, population: -500 }
            }
        ];
        
        const emergency = emergencies[Math.floor(Math.random() * emergencies.length)];
        this.city.applyEffects(emergency.effects);
        
        window.dispatchEvent(new CustomEvent('cityEvent', {
            detail: {
                name: emergency.name,
                description: emergency.description,
                type: 'danger'
            }
        }));
        
        window.dispatchEvent(new CustomEvent('notification', {
            detail: {
                type: 'danger',
                message: `${emergency.name}\n${emergency.description}`
            }
        }));
    }
    
    triggerFestival() {
        const cost = 50000;
        if (this.city.money < cost) {
            window.dispatchEvent(new CustomEvent('notification', {
                detail: { type: 'error', message: 'Insufficient funds for festival!' }
            }));
            return;
        }
        
        this.city.money -= cost;
        this.city.applyEffects({ happiness: 15, money: 30000 });
        
        window.dispatchEvent(new CustomEvent('cityEvent', {
            detail: {
                name: '🎉 City Festival!',
                description: 'The festival is a huge success! Citizens are celebrating!',
                type: 'positive'
            }
        }));
        
        window.dispatchEvent(new CustomEvent('notification', {
            detail: { type: 'success', message: 'Festival hosted successfully!' }
        }));
    }
    
    researchTechnology() {
        const cost = 100000;
        if (this.city.money < cost) {
            window.dispatchEvent(new CustomEvent('notification', {
                detail: { type: 'error', message: 'Insufficient funds for research!' }
            }));
            return;
        }
        
        this.city.money -= cost;
        this.city.applyEffects({ technology: 10 });
        
        window.dispatchEvent(new CustomEvent('notification', {
            detail: { type: 'success', message: 'Research initiated! Technology advancing.' }
        }));
    }
}
