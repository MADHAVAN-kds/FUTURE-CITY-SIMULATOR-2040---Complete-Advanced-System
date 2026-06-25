/**
 * Future City Simulator 2040 - City Management System
 * Core city state and building logic
 */

class City {
    constructor() {
        this.year = 2040;
        this.population = 10000;
        this.money = 1000000;
        this.happiness = 75;
        this.environment = 80;
        this.technology = 50;
        this.energy = 100;
        this.level = 1;
        this.buildings = [];
        this.policies = [];
        this.researchProgress = 0;
        
        // Previous values for trend calculation
        this.prevPopulation = this.population;
        this.prevMoney = this.money;
        this.prevHappiness = this.happiness;
        this.prevEnvironment = this.environment;
        
        // City metrics
        this.trafficFlow = "Normal";
        this.temperature = 22;
        this.airQuality = "Good";
        
        // Building types with costs and effects
        this.buildingTypes = [
            {
                id: 'residential',
                name: 'Residential',
                icon: '🏘️',
                cost: 50000,
                effects: { population: 500, happiness: 5, energy: -5 }
            },
            {
                id: 'commercial',
                name: 'Commercial',
                icon: '🏢',
                cost: 100000,
                effects: { money: 20000, population: 200, energy: -10 }
            },
            {
                id: 'industrial',
                name: 'Industrial',
                icon: '🏭',
                cost: 150000,
                effects: { money: 50000, environment: -10, energy: -20 }
            },
            {
                id: 'park',
                name: 'Park',
                icon: '🌳',
                cost: 30000,
                effects: { happiness: 10, environment: 15, population: 100 }
            },
            {
                id: 'solar',
                name: 'Solar Farm',
                icon: '☀️',
                cost: 200000,
                effects: { energy: 30, environment: 5, technology: 5 }
            },
            {
                id: 'hospital',
                name: 'Hospital',
                icon: '🏥',
                cost: 250000,
                effects: { happiness: 15, population: 300 }
            },
            {
                id: 'school',
                name: 'School',
                icon: '🏫',
                cost: 180000,
                effects: { happiness: 10, technology: 10, population: 200 }
            },
            {
                id: 'lab',
                name: 'Research Lab',
                icon: '🔬',
                cost: 300000,
                effects: { technology: 20, money: -10000 }
            },
            {
                id: 'airport',
                name: 'Airport',
                icon: '✈️',
                cost: 500000,
                effects: { money: 80000, population: 1000, environment: -15 }
            },
            {
                id: 'stadium',
                name: 'Stadium',
                icon: '🏟️',
                cost: 400000,
                effects: { happiness: 20, money: 30000, population: 500 }
            },
            {
                id: 'hydro',
                name: 'Hydro Plant',
                icon: '💧',
                cost: 350000,
                effects: { energy: 40, environment: 10, technology: 5 }
            },
            {
                id: 'museum',
                name: 'Museum',
                icon: '🏛️',
                cost: 220000,
                effects: { happiness: 12, technology: 8, population: 150 }
            }
        ];
        
        // Available policies
        this.policyTypes = [
            {
                id: 'green_energy',
                name: 'Green Energy Initiative',
                icon: '🌿',
                description: 'Invest in renewable energy sources',
                cost: 100000,
                effects: { environment: 20, energy: 10, technology: 5 }
            },
            {
                id: 'tax_cut',
                name: 'Tax Reduction',
                icon: '💰',
                description: 'Lower taxes to attract more citizens',
                cost: 50000,
                effects: { population: 1000, happiness: 10, money: -20000 }
            },
            {
                id: 'tech_hub',
                name: 'Technology Hub',
                icon: '💻',
                description: 'Create a center for innovation',
                cost: 200000,
                effects: { technology: 25, money: 30000, population: 500 }
            },
            {
                id: 'public_transport',
                name: 'Public Transport',
                icon: '🚇',
                description: 'Improve public transportation',
                cost: 150000,
                effects: { happiness: 15, environment: 10, population: 300 }
            },
            {
                id: 'education',
                name: 'Education Reform',
                icon: '📚',
                description: 'Enhance education system',
                cost: 120000,
                effects: { technology: 15, happiness: 10 }
            },
            {
                id: 'healthcare',
                name: 'Universal Healthcare',
                icon: '⚕️',
                description: 'Provide healthcare for all',
                cost: 180000,
                effects: { happiness: 20, population: 800 }
            }
        ];
        
        // Add some starter buildings
        this.addStarterBuildings();
    }
    
    addStarterBuildings() {
        this.buildings.push(
            { type: 'residential', x: 100, y: 300, age: 0 },
            { type: 'residential', x: 250, y: 300, age: 0 },
            { type: 'commercial', x: 400, y: 280, age: 0 },
            { type: 'park', x: 550, y: 320, age: 0 },
            { type: 'school', x: 700, y: 290, age: 0 }
        );
    }
    
    canAfford(cost) {
        return this.money >= cost;
    }
    
    buildBuilding(buildingTypeId, x, y) {
        const buildingType = this.buildingTypes.find(b => b.id === buildingTypeId);
        if (!buildingType) return false;
        
        if (!this.canAfford(buildingType.cost)) {
            return { success: false, message: 'Insufficient funds!' };
        }
        
        this.money -= buildingType.cost;
        this.buildings.push({ type: buildingTypeId, x, y, age: 0 });
        this.applyEffects(buildingType.effects);
        
        return { 
            success: true, 
            message: `${buildingType.name} built successfully!` 
        };
    }
    
    applyEffects(effects) {
        if (effects.population) this.population += effects.population;
        if (effects.money) this.money += effects.money;
        if (effects.happiness) this.happiness = Math.max(0, Math.min(100, this.happiness + effects.happiness));
        if (effects.environment) this.environment = Math.max(0, Math.min(100, this.environment + effects.environment));
        if (effects.technology) this.technology = Math.max(0, Math.min(100, this.technology + effects.technology));
        if (effects.energy) this.energy = Math.max(0, Math.min(100, this.energy + effects.energy));
    }
    
    enactPolicy(policyId) {
        const policy = this.policyTypes.find(p => p.id === policyId);
        if (!policy) return false;
        
        if (this.policies.includes(policyId)) {
            return { success: false, message: 'Policy already active!' };
        }
        
        if (!this.canAfford(policy.cost)) {
            return { success: false, message: 'Insufficient funds!' };
        }
        
        this.money -= policy.cost;
        this.policies.push(policyId);
        this.applyEffects(policy.effects);
        
        return { 
            success: true, 
            message: `${policy.name} enacted successfully!` 
        };
    }
    
    update(deltaTime) {
        // Store previous values for trend calculation
        this.prevPopulation = this.population;
        this.prevMoney = this.money;
        this.prevHappiness = this.happiness;
        this.prevEnvironment = this.environment;
        
        // Population growth based on happiness
        if (this.happiness > 60) {
            const growthRate = (this.happiness - 60) / 100;
            this.population += Math.floor(this.population * growthRate * 0.01);
        } else if (this.happiness < 40) {
            const shrinkRate = (40 - this.happiness) / 100;
            this.population -= Math.floor(this.population * shrinkRate * 0.01);
        }
        
        // Money from population (taxes)
        const taxRevenue = Math.floor(this.population * 0.5);
        this.money += taxRevenue;
        
        // Money from commercial buildings
        const commercialBuildings = this.buildings.filter(b => b.type === 'commercial').length;
        this.money += commercialBuildings * 1000;
        
        // Money from industrial buildings
        const industrialBuildings = this.buildings.filter(b => b.type === 'industrial').length;
        this.money += industrialBuildings * 2500;
        
        // Maintenance costs
        const maintenanceCost = this.buildings.length * 500;
        this.money -= maintenanceCost;
        
        // Environment degradation from buildings
        const industrialCount = this.buildings.filter(b => b.type === 'industrial').length;
        this.environment -= industrialCount * 0.1;
        
        // Environment improvement from parks
        const parkCount = this.buildings.filter(b => b.type === 'park').length;
        this.environment += parkCount * 0.2;
        
        // Ensure metrics stay within bounds
        this.population = Math.max(0, this.population);
        this.money = Math.max(0, this.money);
        this.happiness = Math.max(0, Math.min(100, this.happiness));
        this.environment = Math.max(0, Math.min(100, this.environment));
        this.technology = Math.max(0, Math.min(100, this.technology));
        this.energy = Math.max(0, Math.min(100, this.energy));
        
        // Update traffic flow based on population
        if (this.population < 50000) this.trafficFlow = "Light";
        else if (this.population < 100000) this.trafficFlow = "Normal";
        else if (this.population < 200000) this.trafficFlow = "Heavy";
        else this.trafficFlow = "Congested";
        
        // Update air quality based on environment
        if (this.environment > 70) this.airQuality = "Excellent";
        else if (this.environment > 50) this.airQuality = "Good";
        else if (this.environment > 30) this.airQuality = "Moderate";
        else this.airQuality = "Poor";
        
        // Update temperature based on environment
        this.temperature = 22 + (80 - this.environment) / 10;
        
        // Level up system
        const newLevel = Math.floor(this.population / 10000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            return { levelUp: true, newLevel: this.level };
        }
        
        // Age buildings
        this.buildings.forEach(building => building.age += deltaTime);
        
        return { levelUp: false };
    }
    
    getTrend(current, previous) {
        if (previous === 0) return 0;
        const change = ((current - previous) / previous) * 100;
        return Math.round(change * 10) / 10;
    }
    
    getState() {
        return {
            year: this.year,
            population: this.population,
            money: this.money,
            happiness: this.happiness,
            environment: this.environment,
            technology: this.technology,
            energy: this.energy,
            level: this.level,
            buildingCount: this.buildings.length,
            trafficFlow: this.trafficFlow,
            temperature: Math.round(this.temperature * 10) / 10,
            airQuality: this.airQuality,
            trends: {
                population: this.getTrend(this.population, this.prevPopulation),
                money: this.getTrend(this.money, this.prevMoney),
                happiness: this.getTrend(this.happiness, this.prevHappiness),
                environment: this.getTrend(this.environment, this.prevEnvironment)
            }
        };
    }
    
    save() {
        const saveData = {
            year: this.year,
            population: this.population,
            money: this.money,
            happiness: this.happiness,
            environment: this.environment,
            technology: this.technology,
            energy: this.energy,
            level: this.level,
            buildings: this.buildings,
            policies: this.policies,
            researchProgress: this.researchProgress
        };
        localStorage.setItem('futureCitySave', JSON.stringify(saveData));
        return true;
    }
    
    load() {
        const saveData = localStorage.getItem('futureCitySave');
        if (saveData) {
            const data = JSON.parse(saveData);
            Object.assign(this, data);
            return true;
        }
        return false;
    }
    
    reset() {
        this.year = 2040;
        this.population = 10000;
        this.money = 1000000;
        this.happiness = 75;
        this.environment = 80;
        this.technology = 50;
        this.energy = 100;
        this.level = 1;
        this.buildings = [];
        this.policies = [];
        this.researchProgress = 0;
        this.addStarterBuildings();
    }
}
