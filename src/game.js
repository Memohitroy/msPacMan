//////////////////////////////////////////////////////////////////////////////////////
// Game

// game modes
var GAME_PACMAN = 0;
var GAME_MSPACMAN = 1;
var GAME_COOKIE = 2;
var GAME_OTTO = 3;

var practiceMode = false;
var turboMode = false;

// current game mode
var gameMode = GAME_PACMAN;
var getGameName = (function(){

    var names = ["PAC-MAN", "MS PAC-MAN", "COOKIE-MAN","CRAZY OTTO"];
    
    return function(mode) {
        if (mode == undefined) {
            mode = gameMode;
        }
        return names[mode];
    };
})();

var getGameDescription = (function(){

    var desc = [
        [
            "MADE IN:",
            "2024",
            "",
            "MADE BY:",
            "MOHIT ROY",
            "",
            "INSTA ID:",
            "mohitroy2004",
        ],
        [
            "ADDRESS:",
            "RUDRAPUR",
            "",
            "BLOCK:",
            "UDHAM SINGH NAGAR",
            "",
            "INSTA ID:",
            "mohitroy2004",
        ],
        [
            "A NEW PAC-MAN GAME",
            "WITH RANDOM MAZES:",
            "MOHIT ROY 2024",
            "",
            "COOKIE MONSTER DESIGN:",
            "MOHIT ROY",
            "",
            "PAC-MAN CROSSOVER CONCEPT:",
            "MOHIT ROY",
        ],
        [
            "THE BIRTH DATE",
            "14-DECEMBER-2004:",
            "",
            "",
            "SPRITES REFERENCED FROM",
            "MOHIT ROY",
            "",
            "",
            "REMAKE:",
            "MOHIT ROY",
        ],
    ];
    
    return function(mode) {
        if (mode == undefined) {
            mode = gameMode;
        }
        return desc[mode];
    };
})();

var getGhostNames = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return ["plato","darwin","freud","newton"];
    }
    else if (mode == GAME_MSPACMAN) {
        return ["blinky","pinky","inky","sue"];
    }
    else if (mode == GAME_PACMAN) {
        return ["blinky","pinky","inky","clyde"];
    }
    else if (mode == GAME_COOKIE) {
        return ["elmo","piggy","rosita","zoe"];
    }
};

var getGhostDrawFunc = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return atlas.drawMonsterSprite;
    }
    else if (mode == GAME_COOKIE) {
        return atlas.drawMuppetSprite;
    }
    else {
        return atlas.drawGhostSprite;
    }
};

var getPlayerDrawFunc = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return atlas.drawOttoSprite;
    }
    else if (mode == GAME_PACMAN) {
        return atlas.drawPacmanSprite;
    }
    else if (mode == GAME_MSPACMAN) {
        return atlas.drawMsPacmanSprite;
    }
    else if (mode == GAME_COOKIE) {
        //return atlas.drawCookiemanSprite;
        return drawCookiemanSprite;
    }
};


// for clearing, backing up, and restoring cheat states (before and after cutscenes presently)
var clearCheats, backupCheats, restoreCheats;
(function(){
    clearCheats = function() {
        pacman.invincible = false;
        pacman.ai = false;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = false;
            actors[i].isDrawTarget = false;
        }
        executive.setUpdatesPerSecond(60);
    };

    var i, invincible, ai, isDrawPath, isDrawTarget;
    isDrawPath = {};
    isDrawTarget = {};
    backupCheats = function() {
        invincible = pacman.invincible;
        ai = pacman.ai;
        for (i=0; i<5; i++) {
            isDrawPath[i] = actors[i].isDrawPath;
            isDrawTarget[i] = actors[i].isDrawTarget;
        }
    };
    restoreCheats = function() {
        pacman.invincible = invincible;
        pacman.ai = ai;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = isDrawPath[i];
            actors[i].isDrawTarget = isDrawTarget[i];
        }
    };
})();

// current level, lives, and score
var level = 1;
var extraLives = 0;

// VCR functions

var savedLevel = {};
var savedExtraLives = {};
var savedHighScore = {};
var savedScore = {};
var savedState = {};

var saveGame = function(t) {
    savedLevel[t] = level;
    savedExtraLives[t] = extraLives;
    savedHighScore[t] = getHighScore();
    savedScore[t] = getScore();
    savedState[t] = state;
};
var loadGame = function(t) {
    level = savedLevel[t];
    if (extraLives != savedExtraLives[t]) {
        extraLives = savedExtraLives[t];
        renderer.drawMap();
    }
    setHighScore(savedHighScore[t]);
    setScore(savedScore[t]);
    state = savedState[t];
};

/// SCORING
// (manages scores and high scores for each game type)

var scores = [
    0,0, // pacman
    0,0, // mspac
    0,0, // cookie
    0,0, // otto
    0 ];
var highScores = [
    10000,10000, // pacman
    10000,10000, // mspac
    10000,10000, // cookie
    10000,10000, // otto
    ];

var getScoreIndex = function() {
    if (practiceMode) {
        return 8;
    }
    return gameMode*2 + (turboMode ? 1 : 0);
};

// handle a score increment
var addScore = function(p) {

    // get current scores
    var score = getScore();

    // handle extra life at 10000 points
    if (score < 10000 && score+p >= 10000) {
        extraLives++;
        renderer.drawMap();
    }

    score += p;
    setScore(score);

    if (!practiceMode) {
        if (score > getHighScore()) {
            setHighScore(score);
        }
    }
};

var getScore = function() {
    return scores[getScoreIndex()];
};
var setScore = function(score) {
    scores[getScoreIndex()] = score;
};

var getHighScore = function() {
    return highScores[getScoreIndex()];
};
var setHighScore = function(highScore) {
    highScores[getScoreIndex()] = highScore;
    saveHighScores();
};
// High Score Persistence

var loadHighScores = function() {
    var hs;
    var hslen;
    var i;
    if (localStorage && localStorage.highScores) {
        hs = JSON.parse(localStorage.highScores);
        hslen = hs.length;
        for (i=0; i<hslen; i++) {
            highScores[i] = Math.max(highScores[i],hs[i]);
        }
    }
};
var saveHighScores = function() {
    if (localStorage) {
        localStorage.highScores = JSON.stringify(highScores);
    }
};
