var genericGetRequest = function(URL, callback){
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    if (this.status == 200){
      callback(JSON.parse(this.response));
    }
  };
  xhr.open("GET", URL);
  xhr.send();
};

var wordList = [];//The word array retrieved from php
var buttonclick = [];//An array of buttons
var correctWords = [];
var score = 0;
var won = false;


var txtinput="";

const MAX_INPUT_LENGTH = 6;
const ROUND_TIME = 120;

var inputBox = document.getElementById('input');
var rackRow = document.getElementById('rack');

//https://text-twist-project-ekhaemba.c9users.io/ttwist.php

function init_game(response){
    wordList = response;
    buttonclick = createButtons(wordList[wordList.length -1]);
    shuffle(buttonclick);
    renderbuttons(buttonclick);
    renderScore(score);
}

function start_game(){
    genericGetRequest('https://text-twist-project-ekhaemba.c9users.io/backup_before_sessions/ttwist.php', init_game);
    var seconds_left = ROUND_TIME;
    var interval = setInterval(function() {
    
        document.getElementById('timer_div').innerHTML = --seconds_left;
        saveGameState();
        if (seconds_left <= 0)
        {  
           clearInterval(interval);//stops the timer
           if(won == true){
               //Keep score, go to the next round, reset timer, gather the next rack, clear list
               won=false;
               correctWords = [];
               document.getElementById("words").innerHTML = '';
               start_game();
               
           }
           else{
               var game = document.getElementById('game');
               game.innerHTML = '<div class="text-center">GAME OVER</div>';
               var btn = document.createElement("button");
               btn.innerHTML ="START GAME"
               game.appendChild(btn);
               btn.addEventListener("click", function() {
                localStorage.clear();
                location.reload(true);
               });
           }
        //   won = false;
        }
    }, 1000);
}


//renders the buttons on the document given a list of buttons
function renderbuttons(buttons)
{   
    //Clears what is inside the html
    rackRow.innerHTML = '';
    //Appends each button to the rack div
    for(var i = 0; i < buttons.length; i++){
      rackRow.appendChild(buttons[i]);
    }
}

//for clicking twist
document.getElementById("twist").addEventListener('click', function(){
  shuffle(buttonclick);
  renderbuttons(buttonclick);
});

//for input text
document.getElementById("enter").addEventListener('click', function(){
  readbox();
  inputBox.value = '';
  txtinput = '';
});

//for clearing text
document.getElementById('clear').addEventListener('click',function(){
   inputBox.value = "";
   txtinput = "";
});

//Triggered every key press in the input box
inputBox.addEventListener('keyup',function(e){
    if(e.keyCode == 13) { //Enter keycode
        readbox();
        inputBox.value = '';
        txtinput = '';
   }else{
        txtinput = inputBox.value;
   }
});


//Shuffles an array in-place. Thanks stackoverflow! 
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

//Creates and returns array of buttons given a string
function createButtons(word){
  var buttons = [];
  
  for(var i = 0; i < word.length; i++){
    var button = document.createElement("button");
    button.innerHTML = word[i];
    button.value = word[i];
    button.addEventListener('click', function(){
        if(inputBox.value.length != MAX_INPUT_LENGTH){
            inputBox.value += this.value;
            txtinput = inputBox.value;
        }
    });
    buttons.push(button);
  }
  return buttons;
}


function readbox()
{
    var placeholder = txtinput.toUpperCase();
    if(wordList.indexOf(placeholder) >= 0) {
        if(correctWords.indexOf(placeholder) >= 0)
        {
            console.log("word already entered");
        }
        else{
           if(placeholder.length == MAX_INPUT_LENGTH){
               won = true;
           }
           correctWords.push(placeholder);
           score+=placeholder.length*10;
           
           console.log(score);
           console.log(correctWords);
           
        }
        
       //TODO: display the word
    }
    renderCorrectWords(correctWords);
    renderScore(score);
    //document.write(txtinput); This will overwrite the whole document if called after it is loaded 
}

//Takes in a word in the list, then displays it on the screen
function renderCorrectWords(arr){
    var out = "";
    var i;
    for(i = 0; i < arr.length; i++) {
        out += '<li>' + arr[i] + '</li>';
    }
    document.getElementById("words").innerHTML = out;
}

function renderScore(score){
    document.getElementById("score").innerHTML = score;    
}
//to reset the text box on page reload
function init() {
    // Clear forms here
    inputBox.value = "";
    start_game();
}

function buttonToString(){
    var string_return = ''
    buttonclick.forEach(function(element){
        string_return += element.value
    })
    return string_return
}

window.onload = init;
window.onbeforeunload = onLeaving

function onLeaving(){
    if(confirm('Do you want to save?')){
        saveGameState()
        return true
    }
    else{
        localStorage.clear();
        return false
    }
}
//local storage
//whenever change occurs in the game we call this function
function saveGameState() {
    if(window.localStorage!==undefined){
        localStorage.setItem('wordList',JSON.stringify(wordList));
        localStorage.setItem('correctWords',JSON.stringify(correctWords));
        localStorage.setItem('score',''+score);
        localStorage.setItem('won',won ? "true":"false");
        localStorage.setItem('buttonclick',buttonToString());
    }else{
        alert('Your browser is outdated!');
    }
}

function setgameresume() {
    
}
