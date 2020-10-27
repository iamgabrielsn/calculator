
function add(num1, num2) {
  return num1 + num2;
}

function subtract(num1, num2) {
  return num1 - num2;
}

function multiply(num1, num2) {
  return num1 * num2;
}

function  divide(num1, num2) {
  return num1 / num2;
}

function power(base, expoent) {
  return base ** expoent;
}

function fixBrokenNumber(number) {
  let str = String(number);

  return Math.round(number*100)/100;
}

function catchNumber(event, target = null) {
  if(target === null) {
    target = event.target;
  }
  if(target.tagName.toUpperCase() != "BUTTON") return;
  let number = target.getAttribute("data-action-type");
  if(number == null) return;

  if(actualOperation.number == '' && operations.length == 0) {
    disableLastResult();
    sendInputStatus(null, true);
  }

  if(number == ".") {

    if(actualOperation.number.includes(".")) {
      sendMessage("You already add dot.");
      return;
    }
    
    actualOperation.number += ".";
    sendInputStatus(".");

    return;
  }

  if(number == "0" && actualOperation.number.length == 1) {

    if(actualOperation.number == "0") {
      sendMessage("You already add zero.");
      return;
    }

  }

  actualOperation.number += number;
  sendInputStatus(number);
}


function catchOperator(event, target = null) {
  if(target === null) {
    target = event.target;
  }
  if(target.tagName.toUpperCase() != "BUTTON") return;
  let operator = target.getAttribute("data-action-type");

  if(operator == null || operator == "c") {
    return;
  } else if(operator == "=") {
    return showCalcResult();
  }

  if(actualOperation.number.length == 0) {

    if(operations.length > 0) {
      undoOperation();
      sendInputStatus(null, false, true);
    } else {
      sendMessage("You need to add any number first.");
      return;
    }

  }

  if(actualOperation.operator != null) {
    sendMessage("You already add an operator.");
    return;
  }

  actualOperation.operator = operator;
  saveActualOperation();
  sendInputStatus(operator);
}

let actionOperations = ['+', '-', '*', '/'];
function catchKey(event) {
  let key = event.key.toLowerCase();
  let element = getElement(`[data-action-type=\"${key}\"]`);

  if(element == null) return;

  event.preventDefault();
  if(actionOperations.includes(key)) {
    catchOperator(null, element);
  } else if(key == "c") {
    clearCalc(null, element);
  } else {
    catchNumber(null, element);
  }
}

function showCalcResult() {

  if(operations.length == 0 || actualOperation.number == '') {
    sendMessage("Create any operation.");
    return;
  }

  if(actualOperation.operator == null) {
    actualOperation.operator = '=';
  }

  saveActualOperation();
  let result = fixBrokenNumber(calculate(operations));
  operations = [];

  sendLastResult(result);
  sendInputStatus(result, true);
}

let clearAll_TimeStart = 0;
function clearCalc(event, target = null) {
  if(target === null) {
    target = event.target;
  }

  if(target.tagName.toUpperCase() != "BUTTON") return;
  let operator = target.getAttribute("data-action-type");

   if(operator == null || operator != "c") return;
  
  if(event != null) {

    if(event.type == "mousedown") {
      if(clearAll_TimeStart == 0) {
        clearAll_TimeStart = Date.now();
      }
    }

    if(event.type == "mouseup") {
      let timeDiff = Date.now() - clearAll_TimeStart;
      if(timeDiff >= 500 ) { 
        clearAllContent();
        clearAll_TimeStart = 0;
      }else{
        clearOne();
        clearAll_TimeStart = 0;
      }
      return;
    }
  } else {
    clearAllContent();
  }
  
  function clearAllContent() {
    operations = [];
    actualOperation = getNewOperation();
    sendMessage("You cleared all.");
    sendInputStatus(null, true);
  }

  function clearOne() {

  if(actualOperation.number == '' && operations.length > 0) {
      undoOperation();
      sendInputStatus(null, false, true);
      sendMessage("Press C button to clear all");
      return;
    }

    if(actualOperation.number.length > 1) {

      actualOperation.number = actualOperation.number.substring(0, actualOperation.number.length-1);
      sendInputStatus(null, false, true);
      sendMessage("Press C button to clear all");

    } else if(actualOperation.number.length <= 1) {
      actualOperation.number = '';
      sendInputStatus(null, false, true);
    }
  }

}

function calculate(operations, position = 0, result = 0) {
/*
INICIA NA POSIÇÃO 0
PEGA O NÚMERO DA POSIÇÃO ZERO
PEGA O OPERADOR DA POSIÇÃO ZERO
VAI PARA A POSIÇÃO 1
PEGA O NÚMERO DA POSIÇÃO 1
CALCULA O NÚMERO DA POSIÇÃO 0 COM O OPERADOR DA POSIÇÃO 0 COM O NÚMERO DA POSIÇÃO 1, OU SEJA:
--- NÚMERO0 + OPERADOR0 + NUMERO1
PEGA O RESULTADO
PEGA O OPERADOR 1
PEGA O NÚMERO 2
CALCULA A OPERAÇÃO:
--- RESULTADO ANTERIOR + OPERADOR + NUMERO 2
PEGA O RESULTADO
PEGA O OPERADOR N-1
PEGA O NÚMERO N
CALCULA A OPERAÇÃO
--- RESULTADO + OPERADOR N-1 + NUMERO N
*/
  let num1;
  let operator;
  let num2;

  let primaryOperation = operations[position];

  if(primaryOperation == null)
    return result;

  num1 = parseFloat(primaryOperation.number);

  operator = primaryOperation.operator;

  let secondaryOperation = operations[position+1];

  if(secondaryOperation == null)
    return result;

  num2 = parseFloat(secondaryOperation.number);

  if(position == 0)
    result = calcOperation(num1, operator, num2);
  else
    result = calcOperation(result, operator, num2);

  return calculate(operations, ++position, result);
}

function calcOperation(num1, operator, num2) {
  if((num1 == 0 || num2 == 0) && operator == "/") {
    sendMessage(".ROTALUCLAC YM KAERB T'NOD");
    return 0;
  }

  switch(operator) {
    case '+': 
      return add(num1, num2);
    case '-':
      return subtract(num1, num2);
    case '*':
      return multiply(num1, num2);
    case '/':
      return divide(num1, num2);
    case '^':
      return power(num1, num2);
    default:
      return num1;
  }

}

function undoOperation() {
  let lastOperation = operations[operations.length-1];
  actualOperation = getNewOperation(lastOperation.number);
  operations.splice(operations.length-1, 1);
  return actualOperation;
}

function saveActualOperation() {
  operations.push(actualOperation);
  actualOperation = getNewOperation();
}

function getNewOperation(number = '', operator = undefined) {
  return {number, operator};
}

let statusTimerID;
function sendMessage(message) {
  calcStatus.textContent = message;
  calcStatus.classList.remove("hide");
  if(statusTimerID != null) clearTimeout(statusTimerID);
  statusTimerID = setTimeout(() => calcStatus.classList.add("hide"), 3000);
}

function sendInputStatus(input, clear = false, subtract = false) {
  if(clear) {
    calcContent.textContent = '';
    if(input == null)
      return;
  }

  if(subtract) {
    let content = calcContent.textContent;
    calcContent.textContent = content.substring(0, content.length-1);
    return;
  }

  calcContent.textContent += input;
}

function sendLastResult(result) {
  calcLastResult.textContent = `Last result: ${result}`;
  calcLastResult.classList.remove("hide");
}

function disableLastResult() {
  calcLastResult.classList.add("hide");
}

function getElement(actionType) {
  return document.querySelector(actionType);
}

let numbersContainer = document.getElementById("numbers");
let operatorsContainer = document.getElementById("operators");
let additionalOperatorsContainer = document.getElementById("additional-operators");

let calcStatus = document.getElementById("status");
let calcContent = document.getElementById("content");
let calcLastResult = document.getElementById("last-result");

numbersContainer.addEventListener("click", catchNumber, false);
operatorsContainer.addEventListener("click", catchOperator, false);
additionalOperatorsContainer.addEventListener("click", catchOperator, false);
additionalOperatorsContainer.addEventListener("mousedown", clearCalc, false);
additionalOperatorsContainer.addEventListener("mouseup", clearCalc, false);
window.addEventListener("keydown", catchKey, false);

let operations = [];
let actualOperation = getNewOperation();