// Gestor de juegos
class GameManager {
    constructor() {
        this.games = [];
        this.filteredGames = [];
    }

    async loadGames() {
        try {
            console.log('🎮 Cargando juegos...');
            
            // Cargar juegos base
            const baseGames = await this.loadBaseGames();
            
            // Cargar juegos personalizados
            const customGames = this.loadCustomGames();
            
            // Combinar
            this.games = [...baseGames, ...customGames];
            this.filteredGames = [...this.games];
            
            console.log(`✅ ${this.games.length} juegos cargados`);
            return this.games;
            
        } catch (error) {
            console.error('❌ Error cargando juegos:', error);
            this.games = this.loadCustomGames();
            this.filteredGames = [...this.games];
            return this.games;
        }
    }

    async loadBaseGames() {
        try {
            const response = await fetch('./scripts/data/games.json');
            if (!response.ok) throw new Error('Error cargando JSON');
            
            const data = await response.json();
            return data.juegos || [];
        } catch (error) {
            console.error('Error cargando juegos base:', error);
            return [];
        }
    }

    loadCustomGames() {
        return storage.get(storage.keys.CUSTOM_GAMES, []);
    }

    saveCustomGames(games) {
        return storage.set(storage.keys.CUSTOM_GAMES, games);
    }

    addGame(gameData) {
        const customGames = this.loadCustomGames();
        
        const newGame = {
            id: Date.now(), // ID único basado en timestamp
            ...gameData,
            precio: parseFloat(gameData.precio),
            esPersonalizado: true
        };

        const updatedGames = [...customGames, newGame];
        
        if (this.saveCustomGames(updatedGames)) {
            this.games.push(newGame);
            this.filteredGames.push(newGame);
            return newGame;
        }
        
        throw new Error('No se pudo guardar el juego');
    }

    filterGames(searchTerm = '', category = 'all') {
        this.filteredGames = this.games.filter(game => {
            const matchesSearch = game.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                game.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = category === 'all' || game.categoria === category;
            
            return matchesSearch && matchesCategory;
        });
        
        return this.filteredGames;
    }

    getGames() {
        return this.games;
    }

    getFilteredGames() {
        return this.filteredGames;
    }
}

// Instancia global
const gameManager = new GameManager();