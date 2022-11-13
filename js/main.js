angular.module('dodgem',[]).controller('MainController',($scope,$timeout,$interval) =>{
    $scope.gameStarted = false;
    $scope.lastMoved = null;
    $scope.congratulationMessage = null;
    $scope.baseLineGameProperties = {
        played : 0,
        playWin : 0,
        thisMatch:{
            map : [
                [
                    {
                        selected: false,
                        active : 'player'
                    },
                    {
                        selected: false,
                        active : ''
                    },
                    {
                        selected:false,
                        active : ''
                    }
                ],
                [
                    {
                        selected: false,
                        active : 'player'
                    },
                    {
                        selected: false,
                        active : ''
                    },
                    {
                        selected: false,
                        active : ''
                    }
                ],
                [
                    {
                        selected: false,
                        active : ''
                    },
                    {
                        selected: false,
                        active : 'com'
                    },
                    {
                        selected: false,
                        active : 'com'
                    }
                ]
            ],
            playerMoved : 0,
            comMoved : 0,
            playerLeft : 2,
            comLeft :2,
            overview: {
                player: [
                  [
                    {
                        score: 10
                    },
                    {
                        score: 25
                    },
                    {
                        score: 40
                    }
                  ],
                  [
                    {
                        score: 5
                    },
                    {
                        score: 20
                    },
                    {
                        score: 35
                    }
                  ],
                  [
                    {
                        score: 0
                    },
                    {
                        score: 15
                    },
                    {
                        score: 30
                    }
                  ]
                ],
                com: [
                  [
                    {
                        score: 30
                    },
                    {
                        score: 35
                    },
                    {
                        score: 40
                    }
                  ],
                  [
                    {
                        score: 15
                    },
                    {
                        score: 20
                    },
                    {
                        score: 25
                    }
                  ],
                  [
                    {
                        score: 0
                    },
                    {
                        score: 5
                    },
                    {
                        score: 10
                    }
                  ]
                ]
            },
            directionCanMove:{
                top: true,
                left: true,
                right: true,
                bottom: true
            },
            selectedChessPiece: null
        }
    };
    $scope.root = {
        data : undefined,
        childs : []
    };

    $scope.initGame = (playerMoveFirst) =>{
        $scope.gameProperties = angular.copy($scope.baseLineGameProperties);
        $scope.gameStarted = true;

        $scope.lastMoved = !playerMoveFirst;
        $scope.root.data = angular.copy($scope.gameProperties.thisMatch.map);
        $scope.initTree($scope.root,playerMoveFirst ? 'player' : 'com',2);

        if(playerMoveFirst){
            $scope.setSelectedChessPiece($scope.gameProperties.thisMatch.map[0][0],0,0);
        }else{
            $scope.comMove();
        }
    };
    $scope.initTree = (root,active,level) =>{
        if(!level) return;
        let points = [];
        let map = root.data;

        for(let i = 0; i < map.length ;i++)
            for(let j = 0; j < map[i].length ;j++)
                if(map[i][j].active == active){
                   let  point = angular.copy(map[i][j]);
                    point.x = i;
                    point.y = j;
                    points.push(point);
                }
        if(points.length){
            for(let i = 0 ; i < points.length ;i++){
               let  point = points[i];
                let direction = $scope.checkingDirection(point,point.x,point.y);
                if(direction.top || direction.bottom || direction.left || direction.right){
                    let leaf = {
                        data : angular.copy(map),
                        childs : []
                    }
                    leaf.data[point.x][point.y].active = '';
                    let child = angular.copy(leaf);
                    if(direction.top){
                        child.query = `top ${point.x-1} ${point.y}`;
                        if(point.x !=0) {
                            child.data[point.x-1][point.y].active = point.active;
                        }
                        root.childs.push(child);
                    }
                    child = angular.copy(leaf);
                    if(direction.left){
                        child.query = `left ${point.x} ${point.y-1}`;
                        if(point.y!=0) child.data[point.x][point.y-1].active = point.active;
                        root.childs.push(child);
                    }
                    child = angular.copy(leaf);
                    if(direction.right){
                        child.query = `right ${point.x} ${point.y+1}`;
                        if(point.y!=2) child.data[point.x][point.y+1].active = point.active;
                        root.childs.push(child);
                    }
                    child = angular.copy(leaf);
                    if(direction.bottom){
                        child.query = `bottom ${point.x+1} ${point.y}`;
                        if(point.x!=2) child.data[point.x+1][point.y].active = point.active;
                        root.childs.push(child);
                    }
                }
            }
        }
    };
    $scope.setSelectedChessPiece = (c,x,y) =>{
        if(c.active!='' && c.active!= ($scope.lastMoved ? 'player' : 'com')){
            $scope.gameProperties.thisMatch.selectedChessPiece ={
                c:c,
                x:x,
                y:y
            };
            for(let i = 0; i < $scope.gameProperties.thisMatch.map.length ;i++)
                for(let j = 0;j< $scope.gameProperties.thisMatch.map[i].length ;j++)
                    $scope.gameProperties.thisMatch.map[i][j].selected = false;
            c.selected = true;
            $scope.checkingDirection(c,x,y);
        }
    };
    $scope.checkingDirection = (c,x,y) =>{
        let direction = $scope.gameProperties.thisMatch.directionCanMove;
        getTop = (x,y) =>{
            if(c.active =='com' && x==0){
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active : ''};
            }
            if(x = $scope.gameProperties.thisMatch.map[x-1]) return x[y];
            return undefined;
        }
        getBottom = (x,y) => {
            if((x = $scope.gameProperties.thisMatch.map[x+1]) && c.active == 'player'){
                return x[y];
            }
            return undefined;
        }
        getLeft = (x,y) => {
            if(c.active == 'player') return undefined;
            return $scope.gameProperties.thisMatch.map[x][y-1];
        }
        getRight = (x,y) => {
            if(c.active == 'player' && y==2){
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active : ''};
            }
            return $scope.gameProperties.thisMatch.map[x][y+1];
        }
        z = getTop(x,y);
        direction.top = z ? z.active == '' ? true : false :false;
        z = getBottom(x,y);
        direction.bottom = z ? z.active == '' ? true : false : false;
        z = getLeft(x,y);
        direction.left = z ? z.active == '' ? true : false : false;
        z = getRight(x,y);
        direction.right = z ? z.active == '' ? true : false : false;
        return direction;
    };
    $scope.move = (nextStep) =>{
        let sel = $scope.gameProperties.thisMatch.selectedChessPiece;
        x = nextStep == 'top' ? sel.x-1 : nextStep == 'bottom' ? sel.x+1 : sel.x;
        y = nextStep == 'left' ? sel.y-1 : nextStep == 'right' ? sel.y+1 : sel.y;
        let nextMap = $scope.root.childs.find((child) =>{
            return child.query == `${nextStep} ${x} ${y}`;
        });
        sel.c.selected = false;
        $scope.gameProperties.thisMatch.map = angular.copy(nextMap.data);
        $scope.root = nextMap;
        $scope.root.childs = [];
        $scope.initTree($scope.root,sel.c.active == 'player' ? 'com' : 'player',1);

        $scope.gameProperties.thisMatch.playerLeft = 0;
        $scope.gameProperties.thisMatch.comLeft = 0;
        $scope.gameProperties.thisMatch.map.forEach((it)=>{
            it.forEach((it2)=>{
                if(it2.active == 'player'){
                    $scope.gameProperties.thisMatch.playerLeft ++;
                }
                else if(it2.active == 'com'){
                    $scope.gameProperties.thisMatch.comLeft ++;
                }
            })
        })
        let isPlayerMove = sel.c.active == 'player';
        sel.c.active = '';
        $scope.gameProperties.thisMatch.overview = angular.copy($scope.baseLineGameProperties.thisMatch.overview);
        $scope.findPostion('player').concat($scope.findPostion('com')).forEach((it,ind) =>{
            $scope.reCalculatorScore(it.active,it.x,it.y,false);
        })
        $scope.lastMoved = !$scope.lastMoved;
        if(!$scope.gameProperties.thisMatch.playerLeft || !$scope.gameProperties.thisMatch.comLeft) {
            $scope.endGame();
        }

        if(isPlayerMove) $scope.comMove();
    };

    $scope.comMove = () => {
        let comNextStep = $scope.comFindingNextStep();
        if(comNextStep){
            $scope.setSelectedChessPiece($scope.gameProperties.thisMatch.map[comNextStep.x][comNextStep.y], comNextStep.x, comNextStep.y);
            $scope.move(comNextStep.nextStep);
            let playerPos = $scope.findPostion('player');
            if(playerPos.length == 1){
                let playerCanMove = $scope.checkingDirection($scope.gameProperties.thisMatch.map[playerPos[0].x][playerPos[0].y],
                    playerPos[0].x,playerPos[0].y);
                if(!playerCanMove.top && !playerCanMove.right && !playerCanMove.bottom){
                    $scope.gameProperties.thisMatch.comLeft = 0;
                    $scope.endGame();
                }
            }
        }else{
            $scope.gameProperties.thisMatch.comLeft = 0;
            $scope.endGame();
        }
    };

    $scope.reCalculatorScore = (type, x, y, w) => {
        let thisMatch = $scope.gameProperties.thisMatch;
        let s = angular.copy(thisMatch.overview[type][x][y].score);
        for (i = 0; i < 2; i++) {
            if (type === 'player') {
                if (z = thisMatch.map[x + i + 1]) {
                    if (z[y].active === 'com') {
                        if (w == true) {
                            s += 40 - 10 * i;
                        }
                        else {
                            thisMatch.overview[type][x][y].score += 40 - 10 * i;
                        }
                    }
                }
            }
            else {
                if (z = thisMatch.map[x][y - i - 1]) {
                    if (z.active === 'player') {
                        if (w == true) {
                            s += 40 - 10 * i;
                        }
                        else {
                            thisMatch.overview[type][x][y].score += 40 - 10 * i;
                        }
                    }
                }
            }
        }

        return s;
    }

    $scope.comFindingNextStep = () =>{
        let com = {};
        com.posCanBeNextStep = [];
        com.chessPiece = $scope.findPostion('com');
        com.chessPiece.forEach((it,ind) =>{
            it.directionCanMove = angular.copy($scope.checkingDirection(it,it.x,it.y));
            if(it.directionCanMove.top){
                com.posCanBeNextStep.push({
                    x : it.x,
                    y : it.y,
                    nextStep : 'top',
                    totalScore: it.x - 1 < 0 ? 0 : $scope.reCalculatorScore('com', it.x - 1, it.y, true)
                });
            }
            if(it.directionCanMove.left){
                com.posCanBeNextStep.push({
                    x : it.x,
                    y : it.y,
                    nextStep : 'left',
                    totalScore: $scope.reCalculatorScore('com', it.x, it.y - 1, true)
                });
            }
            if(it.directionCanMove.right){
                com.posCanBeNextStep.push({
                    x : it.x,
                    y : it.y,
                    nextStep : 'right',
                    totalScore: $scope.reCalculatorScore('com', it.x, it.y + 1, true)
                });
            }
        });
        if(com.chessPiece.length >1){
            com.posCanBeNextStep.forEach((it) =>{
                let t = com.chessPiece.find((it2) => {
                    return it2.x!= it.x || it2.y!=it.y;
                });
                if(it.nextStep == 'top' && it.x == 0){
                    it.totalScore = t.score + 50;
                }else{
                    it.totalScore += t.score;
                }
            })
        }else if(com.chessPiece.length == 1){
                let t = com.chessPiece[0];
                let indexPosCanExist = com.posCanBeNextStep.findIndex((it) =>{
                    return it.nextStep == 'top' && it.x == 0;
                });
                if(indexPosCanExist != -1){
                    com.posCanBeNextStep[indexPosCanExist].totalScore = 50;
                }
        }
        let caculateNextStep = () =>{
            let tempArr = com.posCanBeNextStep.map((it) =>{
                return it.totalScore;
            });
            let maxScore = Math.max(...tempArr);
            let tempposCanBeNextStep = angular.copy(com.posCanBeNextStep).filter((it,ind) =>{
                it.index = ind;
                return it.totalScore == maxScore;
            });
            let rand = Math.floor((Math.random() * tempposCanBeNextStep.length -1 ) +1);
            if(tempposCanBeNextStep.length == 0){
                $scope.gameProperties.thisMatch.playerLeft = 0;
                return $scope.endGame();
            }
            return com.posCanBeNextStep[tempposCanBeNextStep[rand].index];
        }
        let result = caculateNextStep();
        return result;
    };

    $scope.findPostion = (type) =>{
        pos = [];
        $scope.gameProperties.thisMatch.map.forEach((it,ind) => {
            it.forEach((it2,ind2) => {
                if(it2.active == type) {
                    pos.push({
                        x : ind,
                        y : ind2,
                        active : it2.active,
                        score: $scope.gameProperties.thisMatch.overview[type][ind][ind2].score
                    })
                }
            })
        })
        return pos;
    };
    $scope.endGame = () => {
        if (!$scope.gameProperties.thisMatch.playerLeft) {
            m = 'PLAYER';
        }
        else {
            m = 'COM';
        }
        $scope.congratulationMessage = `${m} WIN!!!`;
        m = 5;

        $timeout(() => {
            handle = $interval(() => {
                m--;
                $scope.congratulationMessage = `Restart game in ${m}s`;
                if (!m) {
                    $interval.cancel(handle)
                    $scope.gameStarted = false;
                }
            }, 1000);
        }, 1000);
    }
});