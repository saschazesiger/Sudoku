
//Elements
const bstart = document.getElementById('b-start');
const btext = document.getElementById('b-text');
const bloader = document.getElementById('b-loader');
const difficulty = document.getElementById('d-difficulty');
const logs = document.getElementById('d-logs');

//Variables
const http = new XMLHttpRequest();


const difficultylevel = document.getElementsByName('difficulty');

bstart.onclick = function startbutton(){
    let level = 4;
    if(document.getElementById('d-0').checked === true){
        console.log('level');
        level = 0;
    } else if (document.getElementById('d-1').checked === true){
        level = 1;
    } else if (document.getElementById('d-2').checked === true){
        level = 2;
    } else if (document.getElementById('d-3').checked === true){
        level = 3;
    };
    
    if (level === 4){
        if (bstart.innerText === 'Start!'){
            bstart.innerText = 'Choose a level';
        }else if (bstart.innerText === 'Choose a level'){
            bstart.innerText = 'CHOOSE A LEVEL';
        }else {
            bstart.innerText = bstart.innerText + "!"
        };
    } else {    
        bloader.style.display = 'block';
        bstart.style.display = 'none';
        difficulty.style.opacity = 0;
        difficulty.style.width = '0px';
        difficulty.style.height = '0px';
        http.open("POST", `/get`);
        http.send();
        http.onreadystatechange = function(){
            if(this.readyState === 4){
                if(this.status === 200){               
                    const sudokupuzzle = JSON.parse(http.responseText).puzzle;
                    for (let i = 0; i < sudokupuzzle.length; i++) {
                        if(sudokupuzzle[i] != -1){
                            document.getElementById(i).innerText = sudokupuzzle[i]
                        };
                        document.getElementById('playground').style.display = 'block';
                        bloader.style.display = 'none';
                    }
                }else{
                    bstart.innerText = 'Try again'
                    bloader.style.display = 'none';
                    bstart.style.display = 'block';
                }
            }
        };
    };
};
