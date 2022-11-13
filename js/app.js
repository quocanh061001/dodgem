angular.module('dodgem', []).controller('MainController', ($scope, $timeout, $interval) => {
    // các biến
    $scope.gameStarted = false;
    $scope.lastMoved = null;
    $scope.congratulationMessage = null;
    $scope.baseLineGameProperties = {
        played: 0,
        playerWin: 0,
        thisMatch: {
            map: [
              [
                {
                    selected: false,
                    active: 'player'
                },
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: ''
                }
              ],
              [
                {
                    selected: false,
                    active: 'player'
                },
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: ''
                }
              ],
              [
                {
                    selected: false,
                    active: ''
                },
                {
                    selected: false,
                    active: 'com'
                },
                {
                    selected: false,
                    active: 'com'
                }
              ]
            ],
            playerMoved: 0,
            comMoved: 0,
            playerLeft: 2,
            comLeft: 2,
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
            directionCanMove: {
                top: true,
                left: true,
                right: true,
                bottom: true
            },
            selectedChessPiece: null
        }
    };
    $scope.history = [];
    $scope.root = {
        data: undefined,
        childs: []
    };

    // Khởi tạo trò chơi
    $scope.initGame = (playerMoveFirst) => {
        $scope.history.unshift([]);
        $scope.history.selectedIndex = 0;

        $scope.gameProperties = angular.copy($scope.baseLineGameProperties);
        $scope.gameStarted = true;
        // thiết lập vị trí quân cờ
        $scope.lastMoved = !playerMoveFirst;

        // vẽ cây
        $scope.root.data = angular.copy($scope.gameProperties.thisMatch.map);
        $scope.initTree($scope.root, playerMoveFirst ? 'player' : 'com', 3);

        if (playerMoveFirst) {
            $scope.setSelectedChessPiece($scope.gameProperties.thisMatch.map[0][0], 0, 0);
        }
        else {
            $scope.comMove();
        }
    }

    $scope.initTree = (root, active, level)=>{
        if(!level){
            return;
        }

        let points = [];
        let map = root.data;

        for(let i = 0; i < map.length; i++){
            for(let j = 0; j < map[i].length; j++){
                if(map[i][j].active === active){
                    let point = angular.copy(map[i][j]);
                    point.x = i;
                    point.y = j;
                    points.push(point);
                }
            }
        }

        if(points.length){
            for(let i = 0; i < points.length; i++){
                let point = points[i];
                let direction = $scope.checkingDirection(point, point.x, point.y, map);
                if(!direction.top && !direction.left && !direction.right && !direction.bottom &&
                     ($scope.gameProperties.thisMatch.comLeft == 2 && $scope.gameProperties.thisMatch.playerLeft == 1)){
                    $scope.gameProperties.thisMatch.comLeft = 0 ;
                     return $scope.endGame();
                }
                if(!direction.top && !direction.left && !direction.right && !direction.bottom &&
                    ($scope.gameProperties.thisMatch.comLeft == 1 && $scope.gameProperties.thisMatch.playerLeft == 2)){
                   $scope.gameProperties.thisMatch.playerLeft = 0 ;
                   return $scope.endGame();
               }
                if(direction.top === true || direction.bottom === true
                || direction.left === true || direction.right === true){
                     let leaf = {
                        data: angular.copy(map),
                        childs: []
                    };
                    leaf.data[point.x][point.y].active = '';

                    let child = angular.copy(leaf);
                    if(direction.top === true){
                        child.query = `top ${point.x - 1} ${point.y}`;
                        if(point.x !== 0){
                            child.data[point.x - 1][point.y].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.bottom === true){
                        child.query = `bottom ${point.x  + 1} ${point.y}`;
                        if(point.x !== 2){
                            child.data[point.x + 1][point.y].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.left === true){
                        child.query = `left ${point.x} ${point.y - 1}`;
                        if(point.y !== 0){
                            child.data[point.x][point.y - 1].active = point.active;
                        }
                        root.childs.push(child);
                    }

                    child = angular.copy(leaf);
                    if(direction.right === true){
                        child.query = `right ${point.x} ${point.y + 1}`;
                        if(point.y !== 2){
                            child.data[point.x][point.y + 1].active = point.active;
                        }
                        root.childs.push(child);
                    }
                }
            }

            // for(let i = 0; i < root.childs.length; i++){
            //     ////console.log(`Level ${level}: ${i}`);
            //     $scope.initTree(root.childs[i], active === 'com' ? 'player' : 'com', level - 1);
            // }
        }
    }

    $scope.setSelectedChessPiece = (c, x, y) => {
        if (c.active != '' && c.active !== ($scope.lastMoved ? 'player' : 'com')) {
            $scope.gameProperties.thisMatch.selectedChessPiece = {
                c: c,
                x: x,
                y: y
            };
            for(let i = 0; i < $scope.gameProperties.thisMatch.map.length; i++){
                for(let j = 0; j < $scope.gameProperties.thisMatch.map[i].length; j++){
                    $scope.gameProperties.thisMatch.map[i][j].selected = false;
                }
            }
            c.selected = true;
            $scope.checkingDirection(c, x, y);
        }
    }

    $scope.checkingDirection = (c, x, y, m) => {  //Kiểm tra hướng
        direction = $scope.gameProperties.thisMatch.directionCanMove;
        getTop = (x, y) => {
            //trường hợp có thể tồn tại
            if (c.active === 'com' && x === 0) {
                if(m){
                    return {active:''};
                }
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active: '' }//ngoại lệ
            }
            if (x = m ? m[x - 1] : $scope.gameProperties.thisMatch.map[x - 1]) {
                return x[y];
            }
            return undefined;
        }
        getBottom = (x, y) => {
            if ((x = m ? m[x + 1] : $scope.gameProperties.thisMatch.map[x + 1]) && (c.active === 'player')) {
                return x[y];
            }
            return undefined;
        }
        getLeft = (x, y) => {
            if (c.active === 'player') {
                return undefined;
            }
            return m ? m[x][y - 1] : $scope.gameProperties.thisMatch.map[x][y - 1];
        }
        getRight = (x, y) => {
            if (c.active === 'player' && y === 2) {
                if(m){
                    return {active:''};
                }
                $scope.gameProperties.thisMatch.selectedChessPiece.canExist = true;
                return { active: '' }//ngoại lệ
            }
            return m ? m[x][y + 1] : $scope.gameProperties.thisMatch.map[x][y + 1];
        }

        //checking is beside border
        z = getTop(x, y);
        direction.top = z ? z.active === '' ? true : false : false;
        z = getBottom(x, y);
        direction.bottom = z ? z.active === '' ? true : false : false;
        z = getLeft(x, y);
        direction.left = z ? z.active === '' ? true : false : false;
        z = getRight(x, y);
        direction.right = z ? z.active === '' ? true : false : false;

        return direction;
    }

    $scope.findPosition = (type) => {
        pos = [];

        $scope.gameProperties.thisMatch.map.forEach((it, ind) => {
            it.forEach((it2, ind2) => {
                if (it2.active === type) {
                    pos.push({ x: ind, y: ind2, active: it2.active, score: $scope.gameProperties.thisMatch.overview[type][ind][ind2].score });
                }
            })
        })
        return pos;
    }

    // $scope.reCalculatorScore = (type, x, y, w) => {
    //     let thisMatch = $scope.gameProperties.thisMatch;
    //     let s = angular.copy(thisMatch.overview[type][x][y].score);
    //     //let chessPieceLeft = type === 'player' ? thisMatch.playerLeft : thisMatch.comLeft;
    //     for (i = 0; i < 2; i++) {
    //         if (type === 'player') {
    //             if (z = thisMatch.map[x + i + 1]) {
    //                 if (z[y].active === 'com') {
    //                     if (w === true) {
    //                         s += 40 - 10 * i;
    //                     }
    //                     else {
    //                         thisMatch.overview[type][x][y].score += 40 - 10 * i;
    //                     }
    //                 }
    //             }
    //         }
    //         else {
    //             if (z = thisMatch.map[x][y - i - 1]) {
    //                 if (z.active === 'player') {
    //                     if (w === true) {
    //                         s += 40 - 10 * i;
    //                     }
    //                     else {
    //                         thisMatch.overview[type][x][y].score += 40 - 10 * i;
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return s;
    // }

    $scope.move = (nextStop) => {
        let sel = $scope.gameProperties.thisMatch.selectedChessPiece;
        x = nextStop === 'top' ? sel.x - 1 : nextStop === 'bottom' ? sel.x + 1 : sel.x;
        y = nextStop === 'left' ? sel.y - 1 : nextStop === 'right' ? sel.y + 1 : sel.y;

        let nextMap = $scope.root.childs.find((child)=>{
            return child.query === `${nextStop} ${x} ${y}`;
        })
        sel.c.selected = false;

        $scope.gameProperties.thisMatch.map = angular.copy(nextMap.data);
        $scope.root = nextMap;
        $scope.root.childs = [];
        $scope.initTree($scope.root, sel.c.active === 'player' ? 'com' : 'player', 3);

        $scope.gameProperties.thisMatch.playerLeft = 0;
        $scope.gameProperties.thisMatch.comLeft = 0;
        $scope.gameProperties.thisMatch.map.forEach((it)=>{
            it.forEach((it2)=>{
                if(it2.active === 'player'){
                    $scope.gameProperties.thisMatch.playerLeft ++;
                }
                else if(it2.active === 'com'){
                    $scope.gameProperties.thisMatch.comLeft ++;
                }
            })
        })

        if(!$scope.gameProperties.thisMatch.playerLeft ||
        !$scope.gameProperties.thisMatch.comLeft){
            $scope.endGame();
        }

        isPlayerMove = sel.c.active === 'player';
        sel.c.active = '';

        $scope.gameProperties.thisMatch.overview = angular.copy($scope.baseLineGameProperties.thisMatch.overview);
        // $scope.findPosition('player').concat($scope.findPosition('com')).forEach((it, ind) => {
        //     $scope.reCalculatorScore(it.active, it.x, it.y, false);
        // })

        $scope.lastMoved ? $scope.gameProperties.thisMatch.comMoved++ : $scope.gameProperties.thisMatch.playerMoved++;
        $scope.lastMoved = !$scope.lastMoved;
    }

    $scope.endGame = () => {
        $scope.baseLineGameProperties.played++;
        if (!$scope.gameProperties.thisMatch.playerLeft) {
            $scope.gameProperties.playerWin++;
            $scope.baseLineGameProperties.playerWin++;
            m = 'Player 1';
        }
        else {
            $scope.gameProperties.comWin++;
            $scope.baseLineGameProperties.comWin++;
            m = 'Player 2';
        }
        $scope.congratulationMessage = `${m} thắng!!!`;
        m = 5;
        $timeout(() => {
            handle = $interval(() => {
                m--;
                $scope.congratulationMessage = `Bắt đầu lại game mới trong ${m} giây`;
                if (!m) {
                    $interval.cancel(handle)
                    $scope.gameStarted = false;
                }
            }, 1000);
        }, 1000);
    }
})
