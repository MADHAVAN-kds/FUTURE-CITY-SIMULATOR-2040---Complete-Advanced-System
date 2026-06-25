/**
 * Future City Simulator 2040 - Visualization Engine
 * Advanced canvas rendering and animations
 */

class CityVisualizer {
    constructor(canvas, city) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.city = city;
        this.zoom = 1;
        this.rotation = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.animationFrame = 0;
        this.selectedBuilding = null;
        this.hoveredBuilding = null;
        
        // Building visual data
        this.buildingVisuals = {
            residential: { color: '#4facfe', height: 60, width: 50 },
            commercial: { color: '#f093fb', height: 80, width: 60 },
            industrial: { color: '#fa709a', height: 70, width: 70 },
            park: { color: '#43e97b', height: 20, width: 60 },
            solar: { color: '#feca57', height: 40, width: 80 },
            hospital: { color: '#ee5a6f', height: 75, width: 65 },
            school: { color: '#c44569', height: 65, width: 70 },
            lab: { color: '#6c5ce7', height: 85, width: 55 },
            airport: { color: '#fd79a8', height: 50, width: 100 },
            stadium: { color: '#fdcb6e', height: 70, width: 90 },
            hydro: { color: '#00b894', height: 60, width: 75 },
            museum: { color: '#a29bfe', height: 70, width: 60 }
        };
        
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupEventListeners() {
        // Mouse events for building placement
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on existing building
        const clickedBuilding = this.findBuildingAt(x, y);
        if (clickedBuilding) {
            this.selectedBuilding = clickedBuilding;
            return;
        }
        
        // If no building selected for placement, return
        if (!this.pendingBuilding) return;
        
        // Try to place building
        const result = this.city.buildBuilding(this.pendingBuilding, x, y);
        if (result.success) {
            window.dispatchEvent(new CustomEvent('notification', {
                detail: { type: 'success', message: result.message }
            }));
            this.pendingBuilding = null;
        } else {
            window.dispatchEvent(new CustomEvent('notification', {
                detail: { type: 'error', message: result.message }
            }));
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.hoveredBuilding = this.findBuildingAt(x, y);
        this.canvas.style.cursor = this.hoveredBuilding ? 'pointer' : 'default';
    }
    
    findBuildingAt(x, y) {
        for (let building of this.city.buildings) {
            const visual = this.buildingVisuals[building.type];
            if (!visual) continue;
            
            const bx = building.x - visual.width / 2;
            const by = building.y - visual.height;
            
            if (x >= bx && x <= bx + visual.width &&
                y >= by && y <= by + visual.height) {
                return building;
            }
        }
        return null;
    }
    
    render() {
        this.animationFrame++;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        this.drawSky();
        
        // Draw ground
        this.drawGround();
        
        // Draw grid
        this.drawGrid();
        
        // Draw buildings
        this.drawBuildings();
        
        // Draw pending building
        if (this.pendingBuilding) {
            this.drawPendingBuilding();
        }
        
        // Draw effects
        this.drawEffects();
    }
    
    drawSky() {
        const time = this.animationFrame * 0.01;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
        
        // Dynamic sky based on environment
        const envFactor = this.city.environment / 100;
        const r1 = Math.floor(26 + (100 - this.city.environment) * 0.5);
        const g1 = Math.floor(26 + (100 - this.city.environment) * 0.3);
        const b1 = Math.floor(62);
        
        gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
        gradient.addColorStop(1, '#0f0f1e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        // Draw stars
        this.drawStars();
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const starCount = 50;
        for (let i = 0; i < starCount; i++) {
            const x = (i * 137.5) % this.canvas.width;
            const y = (i * 73.3) % (this.canvas.height * 0.5);
            const size = (i % 3) + 1;
            const twinkle = Math.sin(this.animationFrame * 0.05 + i) * 0.5 + 0.5;
            
            this.ctx.globalAlpha = twinkle * 0.7;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    drawGround() {
        const groundY = this.canvas.height * 0.75;
        const gradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a4d2e');
        gradient.addColorStop(1, '#0f1e12');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);
    }
    
    drawGrid() {
        const groundY = this.canvas.height * 0.75;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, groundY);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = groundY; y < this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawBuildings() {
        const sortedBuildings = [...this.city.buildings].sort((a, b) => a.y - b.y);
        
        sortedBuildings.forEach(building => {
            this.drawBuilding(building);
        });
    }
    
    drawBuilding(building) {
        const visual = this.buildingVisuals[building.type];
        if (!visual) return;
        
        const x = building.x;
        const y = building.y;
        const isHovered = this.hoveredBuilding === building;
        const isSelected = this.selectedBuilding === building;
        
        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 5, visual.width * 0.4, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw building
        const bobOffset = Math.sin(this.animationFrame * 0.05 + building.x) * 2;
        const buildingX = x - visual.width / 2;
        const buildingY = y - visual.height + bobOffset;
        
        // Building body
        const gradient = this.ctx.createLinearGradient(buildingX, buildingY, buildingX + visual.width, buildingY + visual.height);
        gradient.addColorStop(0, visual.color);
        gradient.addColorStop(1, this.darkenColor(visual.color, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(buildingX, buildingY, visual.width, visual.height);
        
        // Building details
        this.drawBuildingDetails(buildingX, buildingY, visual);
        
        // Highlight if hovered or selected
        if (isHovered || isSelected) {
            this.ctx.strokeStyle = isSelected ? '#ffff00' : '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(buildingX - 2, buildingY - 2, visual.width + 4, visual.height + 4);
        }
        
        // Draw building icon
        const buildingType = this.city.buildingTypes.find(b => b.id === building.type);
        if (buildingType) {
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(buildingType.icon, x, buildingY - 10);
        }
        
        // Draw glow effect
        if (building.type === 'solar' || building.type === 'lab') {
            const pulse = Math.sin(this.animationFrame * 0.1) * 0.5 + 0.5;
            this.ctx.shadowColor = visual.color;
            this.ctx.shadowBlur = 20 * pulse;
            this.ctx.fillRect(buildingX, buildingY, visual.width, visual.height);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawBuildingDetails(x, y, visual) {
        // Windows
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        const windowSize = 4;
        const windowSpacing = 8;
        
        for (let wy = y + 10; wy < y + visual.height - 10; wy += windowSpacing) {
            for (let wx = x + 10; wx < x + visual.width - 10; wx += windowSpacing) {
                const flicker = Math.random() > 0.1 ? 1 : 0;
                if (flicker) {
                    this.ctx.fillRect(wx, wy, windowSize, windowSize);
                }
            }
        }
    }
    
    drawPendingBuilding() {
        // This would draw a ghost building at mouse position
        // Implementation left for mouse tracking
    }
    
    drawEffects() {
        // Draw particles, clouds, etc.
        this.drawClouds();
        this.drawFlyingVehicles();
    }
    
    drawClouds() {
        const cloudCount = 3;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        
        for (let i = 0; i < cloudCount; i++) {
            const x = ((this.animationFrame * (i + 1) * 0.5) % (this.canvas.width + 200)) - 100;
            const y = 50 + i * 40;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawFlyingVehicles() {
        if (this.city.buildings.some(b => b.type === 'airport')) {
            const x = ((this.animationFrame * 2) % (this.canvas.width + 100)) - 50;
            const y = 100;
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText('✈️', x, y);
        }
    }
    
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    setPendingBuilding(buildingType) {
        this.pendingBuilding = buildingType;
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.1, 2);
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.1, 0.5);
    }
    
    rotate() {
        this.rotation += 45;
        if (this.rotation >= 360) this.rotation = 0;
    }
}
