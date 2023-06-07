
//Elements
const bstart = document.getElementById('b-start');
const btext = document.getElementById('b-text');
const bloader = document.getElementById('b-loader');
const playground = document.getElementById('playground');
const history = document.getElementById('history');
const difficulty = document.getElementById('d-difficulty');
const logs = document.getElementById('d-logs');
let solution = ""
let startfilled = 0

//Variables
const http = new XMLHttpRequest();
const difficultylevel = document.getElementsByName('difficulty');
const fields = document.querySelectorAll(".field");
fields.forEach(field => {
    field.addEventListener("blur", handleBlur);
});



bstart.onclick = function startbutton() {
    let level = 4;
    if (document.getElementById('d-0').checked === true) {
        level = 0;
    } else if (document.getElementById('d-1').checked === true) {
        level = 1;
    } else if (document.getElementById('d-2').checked === true) {
        level = 2;
    } else if (document.getElementById('d-3').checked === true) {
        level = 3;
    };

    if (level === 4) {
        if (bstart.innerText === 'Start 🚀') {
            bstart.innerText = 'Choose a level';
        } else if (bstart.innerText === 'Choose a level') {
            bstart.innerText = 'CHOOSE A LEVEL';
        } else {
            bstart.innerText = bstart.innerText + "!"
        };
    } else {
        playground.style.display = 'block';
        history.style.display = 'none';
        bloader.style.display = 'block';
        bstart.style.display = 'none';
        difficulty.style.opacity = 0;
        difficulty.style.width = '0px';
        difficulty.style.height = '0px';
        http.open("POST", `/get`);
        http.send();
        http.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const sudokupuzzle = JSON.parse(http.responseText).puzzle;
                    solution = JSON.parse(http.responseText).answer;
                    
                    for (let i = 0; i < sudokupuzzle.length; i++) {
                        if (sudokupuzzle[i] != -1) {
                            document.getElementById(i).value = sudokupuzzle[i]
                            document.getElementById(i).disabled = true;
                            startfilled++
                        } else {
                            document.getElementById(i).innerHTML = '<input class="inputfield" value=0>'
                        };
                        
                        bloader.style.display = 'none';
                        document.getElementById(i).classList.add('expand');

                    }
                } else {
                    bstart.innerText = 'Try again'
                    bloader.style.display = 'none';
                    bstart.style.display = 'block';
                }
            }
        };
    };
};

function handleBlur(field) {
    if (this.value >= 1 && this.value <= 9) {
        document.getElementById(this.id).style.backgroundColor = '#dae6f3';
        document.getElementById(this.id).style.color = 'black';
        let correct = 0
        let wrong = 0
        let empty = 0
        let number = 0
        let progress = ""
        let sudoku = ""
        solution.forEach((s) => {
            sudoku = sudoku + s
            if(document.getElementById(number).value === ""){
                progress = progress + 0
            } else {
                progress = progress + document.getElementById(number).value
            }

            if (s === Number(document.getElementById(number).value)) {
                correct++
            } else if (document.getElementById(number).value === "") {
                empty++
            } else {
                wrong++
            }
            number++
        })
        console.log(correct, wrong, empty, number, startfilled, correct - startfilled,sudoku,progress)
        fetch(`/api?reason=save&progress=${progress}&solution=${sudoku}`)
            .then(response => response.text())
            .then(body => console.log(body))
            .catch(error => console.error('Fehler:', error));
        if (empty === 0 && wrong === 0) {
            for (let i = 0; i < 81; i++) {
                setTimeout(() => {
                    document.getElementById(i).style.backgroundColor = 'green';
                    document.getElementById(i).style.color = 'white';
                    document.getElementById(i).disabled = true;
                }, i * 50);

            } 
        } else if  (empty === 0){
            for (let i = 0; i < 81; i++) {
                setTimeout(() => {
                    document.getElementById(i).style.backgroundColor = 'red';
                    document.getElementById(i).style.color = 'white';
                }, i * 3);
                setTimeout(() => {
                    document.getElementById(i).style.backgroundColor = '#dae6f3';
                    document.getElementById(i).style.color = 'black';
                }, i * 10);
            } 
            
        }
        document.getElementById('correct').innerText = Math.round((correct - startfilled) / 3) * 3;
        document.getElementById('wrong').innerText = Math.round(wrong / 3) * 3;
        document.getElementById('empty').innerText = empty;
        document.getElementById('info').style.display = 'flex';
    } else if (this.value === "") {
        document.getElementById(this.id).style.backgroundColor = '#dae6f3';
        document.getElementById(this.id).style.color = 'black';
    } else {
        document.getElementById(this.id).style.backgroundColor = 'red';
        document.getElementById(this.id).style.color = 'white';
    }
}



function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}
