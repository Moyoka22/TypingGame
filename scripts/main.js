
const sampleText = document.querySelector('.main-content__sample-text');
const userInputText = document.querySelector('.main-content__user-text');
const fullText = sampleText.innerHTML;
const correctSpanStartTag = '<span class="correct">';

let index = 0;


function spanAround(spanDefinition){
    return function (string,start,end){
        return string.slice(0,start) + spanDefinition + string.slice(start,end) + '</span>' + string.slice(end,string.length);
    };
}

function keyPressHandler(e,self) {
    let characterPressed = e.key;
    let keyCode = e.keyCode;
    console.log("Expected: " + fullText[index]);
    console.log("Pressed: " + characterPressed);
    console.log(keyCode);
    console.log(fullText.codePointAt(index));
    function checkMatchesNext(characterPressed,keyCode){
        if (characterPressed == fullText[index]){
            index++;
            sampleText.innerHTML = spanCorrect(fullText,index);
            if (keyCode == 32){
                self.value = '';
            }
        }
        
    }
    return checkMatchesNext(characterPressed,keyCode);
}


spanCorrect = function (fullText,end) {
    return spanAround(correctSpanStartTag)(fullText,0,end); 
};


userInputText.addEventListener('keypress',function(){
    keyPressHandler(event,this);
},false);