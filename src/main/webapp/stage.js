// stage.js


class Stage {
    static initialize() {
        this.board = Array.from({ length: Config.rows }, () => Array(Config.cols).fill(null));
        this.stageElement = document.getElementById("game-stage");
        this.stageElement.innerHTML = ""; // ゲーム画面をクリア
        console.log("Stage initialized:", this.board);
    }








	static addPuyo(puyo, x, y) {
	    if (y < 0 || x < 0 || y >= Config.rows || x >= Config.cols) {
	        console.error(`Invalid position: (${x}, ${y})`);
	        return false;
	    }

	    if (this.board[y][x]) {
	        console.warn(`Position already occupied: (${x}, ${y})`);
	        return false;
	    }

	    this.board[y][x] = puyo;
	    this.stageElement.appendChild(puyo);
	    puyo.style.left = `${x * Config.cellSize}px`;
	    puyo.style.top = `${y * Config.cellSize}px`;

	    return true;
	}




	static removePuyo(x, y) {
	    const puyo = this.board[y][x];
	    if (puyo) {
	        console.log(`Removing Puyo at (${x}, ${y})`);
	        this.stageElement.removeChild(puyo);
	        this.board[y][x] = null; // ボードから Puyo を削除
	    }
	}


    static findMatches() {
        const matches = [];
        const visited = Array.from({ length: Config.rows }, () => Array(Config.cols).fill(false));

        const directions = [
            [0, 1], // 下
            [1, 0], // 右
            [0, -1], // 上
            [-1, 0], // 左
        ];

        function dfs(x, y, color, cluster) {
            if (x < 0 || y < 0 || x >= Config.cols || y >= Config.rows) return;
            if (visited[y][x] || !Stage.board[y][x]) return;
            if (!Stage.board[y][x].classList.contains(color)) return;

            visited[y][x] = true;
            cluster.push([x, y]);

            for (const [dx, dy] of directions) {
                dfs(x + dx, y + dy, color, cluster);
            }
        }

        for (let y = 0; y < Config.rows; y++) {
            for (let x = 0; x < Config.cols; x++) {
                if (!visited[y][x] && Stage.board[y][x]) {
                    const color = Stage.board[y][x].classList[1];
                    const cluster = [];
                    dfs(x, y, color, cluster);
                    if (cluster.length >= Config.eraseCount) {
                        matches.push(...cluster);
                    }
                }
            }
        }

        return matches;
    }

	static applyGravity() {
	    for (let x = 0; x < Config.cols; x++) {
	        let emptyRow = Config.rows - 1; // 最下段から上にチェック
	        for (let y = Config.rows - 1; y >= 0; y--) {
	            if (this.board[y][x]) {
	                if (y !== emptyRow) {
	                    const puyo = this.board[y][x];
	                    this.board[emptyRow][x] = puyo;
	                    this.board[y][x] = null;
	                    puyo.style.top = `${emptyRow * Config.cellSize}px`;
	                }
	                emptyRow--; // 空の行を1つ上に移動
	            }
	        }
	    }
	}

}
