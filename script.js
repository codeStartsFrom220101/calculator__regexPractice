// 初始化狀態
const state = {
  expression: "0", // 當前表達式
  lastExpression: "", // 上一次的表達式
  lastChar: "0", // 上一個輸入的字符
  shouldClearAll: false, // 是否需要清除所有
  bracketCount: 0, // 括號計數
  togglePoint: true, // 是否允許輸入小數點
  changeOldResult: false, // 是否更新舊結果
};

// DOM 元素選擇
const calculator = document.querySelector(".calculator");
const newResult = document.querySelector(".calculator__newResult");
const oldResult = document.querySelector('.calculator__oldResult');
const CEAC = document.querySelector('button[data-value="C"]');

// 監聽計算機按鈕點擊事件
calculator.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!e.target.classList.contains("btn")) return;
  const value = e.target.dataset.value;
  processInput(value);
});

// 處理輸入
function processInput(value) {
  if (state.changeOldResult) {
    state.lastExpression = state.expression;
    oldResult.textContent = `Ans = ${state.expression}`;
    state.changeOldResult = false;
  }
  if (!isNaN(value)) handleNumber(value); // 處理數字輸入
  else if (value === "C") clearLastInput(); // 清除功能
  else if (value === "=") calculate(); // 計算功能
  else handleOperator(value); // 處理運算符輸入

  updateCalculator();
  state.lastChar = state.expression.slice(-1); // 更新最後一個字符
}

// 處理數字輸入
function handleNumber(value) {
  if(/%/.test(state.lastChar)) return;
  if (state.shouldClearAll) {
    state.expression = value;
    state.shouldClearAll = false;
  } else {
    state.expression = state.expression === "0" ? value : state.expression + value;
  }
}

// 處理運算符輸入
function handleOperator(value) {
  if (state.shouldClearAll) {
    state.shouldClearAll = false;
  }
  switch (value) {
    case "(":
      handleLeftBracket();
      break;
    case ")":
      handleRightBracket();
      break;
    case "%":
      handlePercentage();
      break;
    case "÷":
    case "×":
    case "+":
      handleBasicOperator(value);
      break;
    case "-":
      handleMinusOperator();
      break;
    case ".":
      handleDecimalPoint();
      break;
  }
}

function handleLeftBracket() {
  if (state.expression === "0") {
    state.expression = "(";
  } else {
    state.expression += "(";
  }
  state.bracketCount++;
  state.togglePoint = true;
}

function handleRightBracket() {
  if (state.bracketCount > 0 && /[\d%]/.test(state.lastChar)) {
    state.expression += ")";
    state.bracketCount--;
    state.togglePoint = true;
  }
}

function handlePercentage() {
  if (/[\d%]/.test(state.lastChar)) {
    state.expression += "%";
  }
}

function handleBasicOperator(value) {
  if (/[\d%)]/.test(state.lastChar)) {
    state.expression += value;
    state.togglePoint = true;
    console.log(state.lastChar);
  }
}

function handleMinusOperator() {
  if (state.expression === "0") {
    state.expression = "-";
  } else if (/[\d%÷×)]/.test(state.lastChar)) {
    state.expression += "-";
  }
  state.togglePoint = true;
}

function handleDecimalPoint() {
  if (/[\d]/.test(state.lastChar) && state.togglePoint) {
    state.expression += ".";
    state.togglePoint = false;
  }
}

// 清除功能
function clearLastInput() {
  if (state.shouldClearAll || state.expression.length === 1) {
    resetState();
  } else {
    handleClearLogic();
  }
}

function resetState() {
  Object.assign(state, {
    expression: "0",
    lastChar: "0",
    shouldClearAll: false,
    bracketCount: 0,
    togglePoint: true,
  });
}

function handleClearLogic() {
  const lastChar = state.lastChar;

  if (lastChar === ")") {
    state.bracketCount++;
  } else if (lastChar === "(") {
    state.bracketCount--;
  } else if (lastChar === ".") {
    state.togglePoint = true;
  }

  state.expression = state.expression.slice(0, -1);
}

// 計算功能
function calculate() {
  state.changeOldResult = true;
  if (state.bracketCount > 0) {
    for (let i = 0; i < state.bracketCount; i++) {
      state.expression += ")";
      state.bracketCount--;
    }
  }
  state.lastExpression = `${state.expression} =`;
  const sanitizedExpression = state.expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/%/g, " * (1/100)")
    .replace(/(?<=[\d\)])\(/g, "*(")
    .replace(/(?=\d)\)/g, ")*");

  try {
    state.expression = eval(sanitizedExpression).toString();
    oldResult.textContent = state.lastExpression;
    state.bracketCount = 0;
  } catch {
    state.expression = "ERROR";
  }
  state.shouldClearAll = true;
  toggleActive(oldResult);
  toggleActive(newResult);
}

// 更新介面
function updateCalculator() {
  toggleClearSign();
  newResult.value = state.expression || "0";
}

// 切換清除按鈕文本
function toggleClearSign() {
  CEAC.textContent = state.shouldClearAll ? "AC" : "CE";
}

function toggleActive(doc) {
  doc.classList.add('active');
  setTimeout(() => {
    doc.classList.remove('active');
  }, 100);
}

// 鍵盤對應表
const keyMap = {
  "(": "(",
  ")": ")",
  "%": "%",
  "Enter": "=",
  "=": "=",
  "Backspace": "C",
  "/": "÷",
  "*": "×",
  "+": "+",
  "-": "-",
  ".": ".",
};

// 添加鍵盤監聽
document.addEventListener("keydown", (e) => {
  e.preventDefault();
  const key = e.key;  

  // 檢查是否為數字或對應操作符
  if (!isNaN(key)) {
    processInput(key);
  } else if (key in keyMap) {
    processInput(keyMap[key]);
  }

  // 阻止預設動作（例如按下 "Enter" 可能提交表單）
  if (["Enter", "Backspace"].includes(key)) {
    e.preventDefault();
  }
});
