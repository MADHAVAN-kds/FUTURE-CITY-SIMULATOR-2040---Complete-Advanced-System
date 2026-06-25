/**
 * Future City Simulator 2040 - AI Advisory System
 * Advanced AI decision-making and recommendations
 */

class AIEngine {
    constructor(city) {
        this.city = city;
        this.lastRecommendationTime = 0;
        this.recommendationInterval = 30000; // 30 seconds
        this.messages = [
            "Analyzing city metrics...",
            "Optimizing resource allocation...",
            "Calculating growth projections...",
            "Monitoring citizen satisfaction...",
            "Processing environmental data...",
            "Evaluating infrastructure needs..."
        ];
        this.currentMessageIndex = 0;
    }
    
    analyze() {
        const state = this.city.getState();
        const recommendations = [];
        const priorities = [];
        
        // Analyze happiness
        if (state.happiness < 50) {
            priorities.push({
                level: 'high',
                metric: 'happiness',
                recommendation: {
                    title: 'Low Citizen Happiness',
                    description: 'Build parks, hospitals, or stadiums to improve happiness.',
                    action: 'build',
                    targets: ['park', 'hospital', 'stadium']
                }
            });
        } else if (state.happiness < 70) {
            priorities.push({
                level: 'medium',
                metric: 'happiness',
                recommendation: {
                    title: 'Moderate Happiness Levels',
                    description: 'Consider adding recreational facilities.',
                    action: 'build',
                    targets: ['park', 'museum']
                }
            });
        }
        
        // Analyze environment
        if (state.environment < 40) {
            priorities.push({
                level: 'critical',
                metric: 'environment',
                recommendation: {
                    title: 'Environmental Crisis',
                    description: 'Urgent: Build solar farms and parks. Reduce industrial buildings.',
                    action: 'build',
                    targets: ['solar', 'park', 'hydro']
                }
            });
        } else if (state.environment < 60) {
            priorities.push({
                level: 'high',
                metric: 'environment',
                recommendation: {
                    title: 'Environmental Concerns',
                    description: 'Focus on green energy and environmental policies.',
                    action: 'policy',
                    targets: ['green_energy']
                }
            });
        }
        
        // Analyze energy
        if (state.energy < 30) {
            priorities.push({
                level: 'critical',
                metric: 'energy',
                recommendation: {
                    title: 'Energy Crisis',
                    description: 'Build solar farms or hydro plants immediately!',
                    action: 'build',
                    targets: ['solar', 'hydro']
                }
            });
        } else if (state.energy < 50) {
            priorities.push({
                level: 'high',
                metric: 'energy',
                recommendation: {
                    title: 'Low Energy Reserves',
                    description: 'Invest in renewable energy sources.',
                    action: 'build',
                    targets: ['solar', 'hydro']
                }
            });
        }
        
        // Analyze technology
        if (state.technology < 40) {
            priorities.push({
                level: 'medium',
                metric: 'technology',
                recommendation: {
                    title: 'Technology Gap',
                    description: 'Build research labs and schools to advance technology.',
                    action: 'build',
                    targets: ['lab', 'school']
                }
            });
        }
        
        // Analyze money
        if (state.money < 50000) {
            priorities.push({
                level: 'high',
                metric: 'money',
                recommendation: {
                    title: 'Low Treasury Funds',
                    description: 'Build commercial or industrial zones to increase revenue.',
                    action: 'build',
                    targets: ['commercial', 'industrial']
                }
            });
        } else if (state.money > 500000) {
            priorities.push({
                level: 'low',
                metric: 'money',
                recommendation: {
                    title: 'Strong Financial Position',
                    description: 'Consider investing in infrastructure or policies.',
                    action: 'expand',
                    targets: ['airport', 'stadium']
                }
            });
        }
        
        // Population analysis
        if (state.population < 20000 && state.happiness > 60) {
            priorities.push({
                level: 'low',
                metric: 'population',
                recommendation: {
                    title: 'Growth Opportunity',
                    description: 'Build residential zones to attract more citizens.',
                    action: 'build',
                    targets: ['residential']
                }
            });
        }
        
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        priorities.sort((a, b) => priorityOrder[a.level] - priorityOrder[b.level]);
        
        return priorities.slice(0, 3); // Return top 3 recommendations
    }
    
    getInsight() {
        const state = this.city.getState();
        const insights = [];
        
        // Performance insights
        if (state.trends.population > 5) {
            insights.push("📈 Excellent! Your city is experiencing rapid population growth.");
        } else if (state.trends.population < -5) {
            insights.push("📉 Warning: Population is declining. Focus on happiness and services.");
        }
        
        if (state.trends.money > 10) {
            insights.push("💰 Outstanding! Your economic policies are highly effective.");
        } else if (state.trends.money < -10) {
            insights.push("💸 Alert: Treasury is depleting. Increase revenue sources.");
        }
        
        // Balance insights
        if (state.happiness > 80 && state.environment > 70) {
            insights.push("🌟 Perfect balance! Citizens are happy and environment is healthy.");
        }
        
        if (state.technology > 80) {
            insights.push("🚀 Your city is a technological marvel!");
        }
        
        if (state.energy < 30) {
            insights.push("⚠️ Energy crisis imminent! Build power infrastructure now!");
        }
        
        // Strategic insights
        const ratio = state.money / state.population;
        if (ratio > 100) {
            insights.push("💎 High per-capita wealth. Great economic management!");
        } else if (ratio < 10) {
            insights.push("🔧 Low per-capita wealth. Boost economic development.");
        }
        
        return insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : 
               "Your city is developing steadily. Keep up the good work!";
    }
    
    predictNextChallenge() {
        const state = this.city.getState();
        const challenges = [];
        
        if (state.population > 50000 && state.buildingCount < 30) {
            challenges.push({
                type: 'infrastructure',
                message: 'Your growing population will soon strain current infrastructure.',
                severity: 'medium'
            });
        }
        
        if (state.environment < 50 && this.city.buildings.filter(b => b.type === 'industrial').length > 3) {
            challenges.push({
                type: 'environmental',
                message: 'Environmental degradation may cause a crisis within 5 years.',
                severity: 'high'
            });
        }
        
        if (state.happiness < 60 && state.population > 30000) {
            challenges.push({
                type: 'social',
                message: 'Social unrest possible if happiness continues to decline.',
                severity: 'high'
            });
        }
        
        if (state.energy < 40) {
            challenges.push({
                type: 'energy',
                message: 'Energy shortage will impact all city operations.',
                severity: 'critical'
            });
        }
        
        return challenges.length > 0 ? challenges[0] : null;
    }
    
    suggestOptimalBuilding() {
        const state = this.city.getState();
        
        // Priority-based suggestion
        if (state.energy < 40) {
            return { id: 'solar', reason: 'Critical energy shortage' };
        }
        if (state.environment < 40) {
            return { id: 'park', reason: 'Environmental emergency' };
        }
        if (state.happiness < 50) {
            return { id: 'hospital', reason: 'Low citizen satisfaction' };
        }
        if (state.money < 100000 && state.money > 50000) {
            return { id: 'commercial', reason: 'Need revenue boost' };
        }
        if (state.technology < 50) {
            return { id: 'lab', reason: 'Technology advancement needed' };
        }
        if (state.population < 30000 && state.happiness > 60) {
            return { id: 'residential', reason: 'Growth opportunity' };
        }
        
        return { id: 'commercial', reason: 'Balanced development' };
    }
    
    cycleMessage() {
        this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
        return this.messages[this.currentMessageIndex];
    }
    
    getRandomAdvice() {
        const adviceList = [
            "Balance is key - don't neglect any metric for too long.",
            "Invest in technology early for long-term benefits.",
            "Parks are cheap and boost both happiness and environment.",
            "Monitor your energy levels - blackouts are costly.",
            "A happy population grows faster and generates more revenue.",
            "Industrial zones bring money but harm the environment.",
            "Diversify your buildings for a resilient city.",
            "Policies can provide powerful long-term benefits.",
            "Plan ahead - some buildings have negative effects.",
            "Your decisions shape the future of millions."
        ];
        return adviceList[Math.floor(Math.random() * adviceList.length)];
    }
}
