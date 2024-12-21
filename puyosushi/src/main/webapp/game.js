window.addEventListener("DOMContentLoaded", () => {
    Stage.initialize();
    let score = 0;
    let currentPuyo = null;
    let currentX = 0;
    let currentY = 0;
    let isDropping = false;
    let chainCount = 0;
    let isChainActive = false;
    let lastUpdatedScore = 0;

    // スコアに基づいてぷよの種類を更新
    function updatePuyoTypes() {
        if (score >= 30000) Config.colors = ["puyo1", "puyo2", "puyo3", "puyo4", "puyo5", "puyo6", "puyo7", "puyo8", "puyo9", "puyo10", "puyo11", "puyo12"];
        else if (score >= 10000) Config.colors = ["puyo1", "puyo2", "puyo3", "puyo4", "puyo5", "puyo6", "puyo7", "puyo8", "puyo9"];
        else if (score >= 5000) Config.colors = ["puyo1", "puyo2", "puyo3", "puyo4", "puyo5", "puyo6"];
        else Config.colors = ["puyo1", "puyo2", "puyo3"];
    }

    // 落下速度の更新
    function updateFallSpeed() {
        const threshold = Math.floor(score / 10000) * 10000;
        if (threshold > lastUpdatedScore) {
            Config.fallSpeed = Math.max(Config.fallSpeed * 0.9, 0.1); // 最小速度を0.1秒に設定
            lastUpdatedScore = threshold;
        }
    }

    // 新しいぷよ生成
    function spawnPuyo() {
        updatePuyoTypes();
        currentX = Math.floor(Config.cols / 2);
        currentY = 0;

        if (Stage.board[currentY][currentX]) {
			console.warn("初期位置が埋まっています。ゲームオーバー!");
			gameOver(score); // スコアをサーバーに送信
            alert(`ゲームオーバー! あなたのスコア: ${score}`);
            return false;
        }

        const type = Config.colors[Math.floor(Math.random() * Config.colors.length)];
        currentPuyo = Puyo.create(type, currentX, currentY);
        Stage.addPuyo(currentPuyo, currentX, currentY);
        isDropping = true;
        return true;
    }

    // ぷよ移動
    function movePuyo(dx, dy) {
        const newX = currentX + dx;
        const newY = currentY + dy;

        if (newX >= 0 && newX < Config.cols && newY >= 0 && newY < Config.rows && !Stage.board[newY][newX]) {
            Stage.board[currentY][currentX] = null;
            Stage.board[newY][newX] = currentPuyo;
            currentX = newX;
            currentY = newY;
            currentPuyo.style.left = `${currentX * Config.cellSize}px`;
            currentPuyo.style.top = `${currentY * Config.cellSize}px`;
            return true;
        }
        return false;
    }

    // ぷよ固定
    function fixPuyo() {
        Stage.board[currentY][currentX] = currentPuyo;
        currentPuyo = null;
        isDropping = false;

        setTimeout(() => {
            handleMatches();
        }, Config.lockDelay);
    }

    // マッチ処理
	function handleMatches() {
	    const matches = Stage.findMatches();
	    console.log("Found Matches:", matches); // マッチした座標のリストを表示

	    if (matches.length > 0) {
	        // 連鎖開始
	        if (!isChainActive) {
	            isChainActive = true;
	            chainCount++; // 連鎖回数を増加
	        }

	        // 得点加算の初期化
	        let matchScore = 0;
	        let bonusScore = 0;

	        
			// マッチしたぷよごとに得点を設定
			matches.forEach(([x, y]) => {
	            const puyoType = Stage.board[y][x]?.classList[1]; // ぷよの種類を取得
	            if (!puyoType) return;

	            if (["puyo1", "puyo2", "puyo3"].includes(puyoType)) {
	                matchScore += 400; // puyo_1 ～ puyo_3 の場合は400点
	            } else if (["puyo4", "puyo5", "puyo6"].includes(puyoType)) {
	                matchScore += 800; // puyo_4 ～ puyo_6 の場合は800点
	            } else if (["puyo7", "puyo8", "puyo9"].includes(puyoType)) {
	                matchScore += 1200; // puyo_7 ～ puyo_9 の場合は1200点
	            } else if (["puyo10", "puyo11", "puyo12"].includes(puyoType)) {
	                matchScore += 2000; // puyo_10 ～ puyo_12 の場合は2000点
	            }
	        });

	        // 連鎖によるボーナス得点
	        if (chainCount === 2) {
	            bonusScore = 2000; // 2連鎖で2000点
	        } else if (chainCount === 3) {
	            bonusScore = 4000; // 3連鎖で4000点
	        } else if (chainCount >= 4) {
	            bonusScore = 8000; // 4連鎖以上で8000点
	        }

	        // 得点を加算
	        score += matchScore + bonusScore;
	        document.getElementById("score").textContent = score;

	        // マッチしたぷよを削除
	        matches.forEach(([x, y]) => Stage.removePuyo(x, y));

	        // 一定時間後に重力を適用し、再帰的にマッチを確認
	        setTimeout(() => {
	            Stage.applyGravity();
	            setTimeout(() => {
	                handleMatches(); // 再帰的にチェック
	            }, 300); // 少し遅延を入れる
	        }, 300);
	    } else {
	        // 連鎖終了時の処理
	        if (isChainActive) {
	            isChainActive = false;
	        }
	        chainCount = 0; // 連鎖回数リセット

	        // 新しいぷよを生成
	        if (!spawnPuyo()) {
	            alert("ゲームオーバー");
	        }
	    }
	}


    // ゲームループ
    function gameLoop() {
        if (isDropping && currentPuyo) dropPuyo();
        updateFallSpeed();
        setTimeout(gameLoop, Config.fallSpeed * 1000);
    }

    // ぷよ落下
    function dropPuyo() {
        if (!movePuyo(0, 1)) fixPuyo();
    }

    // キー操作
    function handleKeyPress(event) {
        if (!currentPuyo || !isDropping) return;
        switch (event.key) {
            case "ArrowLeft": movePuyo(-1, 0); break;
            case "ArrowRight": movePuyo(1, 0); break;
            case "ArrowDown": dropPuyo(); break;
        }
    }
	
	function gameOver(finalScore) {
	    console.log("ゲームオーバー - スコア送信中:", finalScore);

	    // サーバーにスコアをPOST送信
	    fetch('/puyosushi/score', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	        body: `score=${finalScore}`
	    })
	    .then(response => {
	        if (!response.ok) throw new Error('スコア送信に失敗しました');
	        console.log("スコア送信完了");
	    })
	    .catch(error => console.error('スコア送信エラー:', error));

		

		// ユーザーにスコアを表示
		alert(`ゲームオーバー! あなたのスコア: ${finalScore}`);

	}

	
	



    document.addEventListener("keydown", handleKeyPress);
    spawnPuyo();
    gameLoop();

});
	
	
