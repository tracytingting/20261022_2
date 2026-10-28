// 設定六個化妝常識題目與對應圖示。
const quizItems = [
  { icon: "☀️", title: "防曬乳", answer: "出門前擦防曬，幫皮膚抵擋紫外線。" },
  { icon: "💄", title: "化妝品分享", answer: "口紅和眼妝用品不共用，避免細菌傳染。" },
  { icon: "🫧", title: "睡前清潔", answer: "睡前溫和卸妝、洗臉，讓皮膚保持乾淨。" },
  { icon: "🧪", title: "肌膚測試", answer: "新產品先在手臂小範圍測試，確認沒有不舒服。" },
  { icon: "🖌️", title: "化妝工具", answer: "化妝刷要定期清洗並晾乾，才不容易藏污納垢。" },
  { icon: "📅", title: "保存期限", answer: "使用前看保存期限，開封太久的產品要丟掉。" }
]; // 結束題目資料設定。

// 記錄每個答案目前所在的位置，-1 代表還在下方選項區。
let answerPositions = []; // 建立答案位置清單。
let draggedAnswer = -1; // 記錄目前拖曳的答案編號。
let dragOrigin = -1; // 記錄拖曳前的答案位置。
let pointerX = 0; // 記錄拖曳游標的水平座標。
let pointerY = 0; // 記錄拖曳游標的垂直座標。
let isSubmitted = false; // 記錄是否已經交卷。
let finalScore = 0; // 記錄本次測驗的得分。
let isBubbleActive = false; // 記錄美人魚泡泡效果是否啟動。
let bubbles = []; // 儲存畫面中的泡泡動畫。
let sparklePhase = 0; // 控制圖示的循環動畫。
let layout = {}; // 儲存響應式版面座標。
let submitButton = {}; // 儲存交卷按鈕範圍。
let restartButton = {}; // 儲存重新挑戰按鈕範圍。

// 初始化全螢幕畫布與測驗狀態。
function setup() { // 開始設定 p5.js 畫布。
  createCanvas(windowWidth, windowHeight); // 建立符合視窗大小的畫布。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // 限制高解析螢幕的繪圖倍率。
  textFont("Microsoft JhengHei, Noto Sans TC, sans-serif"); // 設定適合繁體中文的字型。
  textAlign(CENTER, CENTER); // 設定文字預設置中對齊。
  if ("speechSynthesis" in window) { window.speechSynthesis.getVoices(); } // 提前載入瀏覽器語音清單。
  resetQuiz(); // 初始化答案位置和測驗狀態。
  calculateLayout(); // 依畫面尺寸計算題目版面。
} // 完成 p5.js 初始設定。

// 每一影格重繪測驗介面與動畫。
function draw() { // 開始繪製畫面。
  sparklePhase += 0.035; // 推進圖示的動畫時間。
  drawBackground(); // 繪製柔和的海洋漸層背景。
  calculateLayout(); // 配合畫布尺寸更新元件位置。
  drawHeader(); // 繪製標題和遊戲說明。
  drawQuestionCards(); // 繪製六個動畫圖示和放置區。
  drawAnswerCards(); // 繪製下方六個可拖曳文字選項。
  drawActionArea(); // 繪製交卷按鈕與成績回饋。
  drawBubbles(); // 繪製高分時的美人魚泡泡動畫。
} // 完成每一影格的畫面繪製。

// 依目前視窗尺寸重新計算所有元件座標。
function calculateLayout() { // 開始計算響應式版面。
  const narrowScreen = width < 620; // 判斷目前是否使用窄螢幕版面。
  const margin = Math.max(14, Math.min(34, width * 0.035)); // 依畫面寬度計算左右留白。
  const gap = narrowScreen ? 8 : 16; // 設定卡片之間的間距。
  const columns = narrowScreen ? 2 : 3; // 窄螢幕兩欄，桌機三欄。
  const rows = Math.ceil(quizItems.length / columns); // 依欄數計算題目與答案的列數。
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns; // 計算每張卡片寬度。
  const cardTop = narrowScreen ? 111 : 139; // 設定放大後題目卡片的上方位置。
  const actionY = height - (narrowScreen ? 34 : 43); // 設定按鈕中心高度並保留底部空間。
  const answerGap = narrowScreen ? 7 : 10; // 設定答案卡片垂直間距。
  const answerHeight = narrowScreen ? 51 : 62; // 放大答案卡片，方便幼兒閱讀與觸控。
  const answerRowsHeight = rows * answerHeight + (rows - 1) * answerGap; // 計算答案選項需要的總高度。
  const trayBottom = actionY - (narrowScreen ? 61 : 72); // 預留成績提示與交卷按鈕的空間。
  const trayTop = trayBottom - answerRowsHeight; // 依答案卡片高度計算選項區上緣。
  const answerLabelY = trayTop - (narrowScreen ? 16 : 21); // 計算答案區標籤的垂直位置。
  const cardBottom = answerLabelY - (narrowScreen ? 22 : 29); // 預留題目與答案區標籤的間距。
  const cardHeight = Math.max(58, Math.min(narrowScreen ? 105 : 148, (cardBottom - cardTop - (rows - 1) * gap) / rows)); // 依螢幕高度計算放大後的題目卡片高度。
  layout = { narrowScreen, margin, gap, columns, rows, cardWidth, cardTop, cardHeight, trayTop, trayBottom, answerLabelY, answerGap, answerHeight, actionY }; // 儲存目前版面資料。
} // 完成響應式版面計算。

// 繪製柔和的海洋色背景和裝飾。
function drawBackground() { // 開始繪製背景。
  const topColor = color("#f0fbff"); // 設定背景上方的淺藍色。
  const bottomColor = color("#dff6f1"); // 設定背景下方的薄荷綠。
  for (let y = 0; y < height; y += 2) { // 逐列繪製漸層背景。
    const blend = map(y, 0, height, 0, 1); // 計算目前列的漸層比例。
    stroke(lerpColor(topColor, bottomColor, blend)); // 設定目前列的混合顏色。
    line(0, y, width, y); // 繪製目前列的背景線。
  } // 完成漸層背景繪製。
  noStroke(); // 關閉裝飾圖形的外框。
  fill(255, 255, 255, 95); // 設定左上裝飾泡泡顏色。
  circle(width * 0.06, height * 0.15, 52); // 繪製左上角的柔和泡泡。
  circle(width * 0.93, height * 0.28, 76); // 繪製右側的柔和泡泡。
  fill(255, 255, 255, 70); // 設定下方裝飾泡泡顏色。
  circle(width * 0.9, height * 0.82, 38); // 繪製右下角的小泡泡。
} // 完成背景繪製。

// 繪製標題與操作提示。
function drawHeader() { // 開始繪製標題區。
  const narrowScreen = layout.narrowScreen; // 讀取目前畫面是否為窄螢幕。
  noStroke(); // 關閉標題文字外框。
  fill("#236b72"); // 設定標題的深海綠顏色。
  textStyle(BOLD); // 設定標題使用粗體。
  textSize(narrowScreen ? 29 : 38); // 依畫面尺寸放大標題字體。
  text("小小美妝安全王", width / 2, narrowScreen ? 37 : 48); // 繪製測驗主標題。
  fill("#5c8589"); // 設定副標題顏色。
  textStyle(NORMAL); // 將文字樣式切回一般字重。
  textSize(narrowScreen ? 15 : 18); // 依畫面尺寸放大說明字體。
  text("點圖片聽說明，再拖曳小知識配對！", width / 2, narrowScreen ? 67 : 84); // 提醒幼兒點擊圖片聽取說明。
} // 完成標題區繪製。

// 繪製圖示題目卡片和動畫插圖。
function drawQuestionCards() { // 開始繪製題目卡片。
  const labels = layout.narrowScreen ? ["防曬", "分享衛生", "清潔", "肌膚測試", "工具清潔", "保存期限"] : quizItems.map((item) => item.title); // 設定各卡片的簡短標籤。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一繪製六個題目卡片。
    const card = getCardRect(index); // 取得目前題目卡片的座標。
    const assignedAnswer = answerPositions.indexOf(index); // 找出目前卡片已放置的答案。
    const isDropTarget = draggedAnswer !== -1 && isPointInside(pointerX, pointerY, card); // 判斷目前卡片是否為拖曳中的放置目標。
    const displayAnswer = assignedAnswer === draggedAnswer || isDropTarget ? -1 : assignedAnswer; // 拖曳時隱藏重疊文字，顯示清楚的放置提示。
    const isCorrect = isSubmitted && assignedAnswer === index; // 判斷目前卡片答案是否正確。
    const isWrong = isSubmitted && assignedAnswer !== index; // 判斷目前卡片答案是否錯誤。
    const pulse = Math.sin(sparklePhase + index * 0.8) * 2; // 計算插圖的上下浮動幅度。
    noStroke(); // 關閉卡片外框繪製。
    fill(255, 255, 255, 218); // 設定卡片的白色半透明底色。
    rect(card.x, card.y, card.w, card.h, 19); // 繪製圓角題目卡片。
    stroke(isCorrect || isDropTarget ? "#45ae82" : isWrong ? "#e59a8d" : "#cbe9e5"); // 依答題或拖曳狀態設定卡片外框。
    strokeWeight(isCorrect || isWrong || isDropTarget ? 3 : 1.5); // 放大外框，清楚提示目前的放置目標。
    noFill(); // 讓卡片外框不填滿顏色。
    rect(card.x, card.y, card.w, card.h, 19); // 繪製題目卡片外框。
    noStroke(); // 關閉圖示底座的外框。
    fill("#eff9f7"); // 設定圖示底座的淺薄荷綠。
    circle(card.x + card.w / 2, card.y + card.h * 0.21, Math.min(card.h * 0.48, 76)); // 放大圖示底座並置於卡片中央。
    textSize(Math.min(layout.narrowScreen ? 37 : 54, card.h * 0.42)); // 依卡片高度調整放大的動畫圖示。
    text(quizItems[index].icon, card.x + card.w / 2, card.y + card.h * 0.21 + pulse); // 繪製上下浮動且置中的動畫圖示。
    fill("#376b70"); // 設定卡片標籤的文字顏色。
    textStyle(BOLD); // 設定卡片標籤使用粗體。
    textSize(Math.min(layout.narrowScreen ? 15 : 19, card.h * 0.18)); // 依卡片高度調整放大的題目標籤字體。
    text(labels[index], card.x + card.w / 2, card.y + card.h * 0.53); // 將題目標籤水平與垂直置中。
    drawDropLabel(card, displayAnswer, isCorrect, isWrong); // 繪製已放置的答案文字或拖放提示。
  } // 完成六個題目卡片繪製。
} // 完成題目區繪製。

// 繪製卡片內的拖放提示或已放置的答案。
function drawDropLabel(card, answerIndex, isCorrect, isWrong) { // 開始繪製卡片的答案區。
  const textValue = answerIndex >= 0 ? quizItems[answerIndex].answer : "把答案拖到這裡"; // 決定卡片目前要顯示的內容。
  const labelHeight = Math.max(22, Math.min(layout.narrowScreen ? 35 : 46, card.h * 0.3)); // 配合卡片高度設定答案區，避免遮住標題。
  const labelY = card.y + card.h - labelHeight - 5; // 計算答案區上緣。
  noStroke(); // 關閉答案區底色外框。
  fill(answerIndex >= 0 ? (isCorrect ? "#e4f7ed" : isWrong ? "#fff0ed" : "#edf8f7") : "#f4fbfa"); // 依答案狀態設定答案區底色。
  rect(card.x + 7, labelY, card.w - 14, labelHeight, 10); // 繪製圓角答案區。
  fill(answerIndex >= 0 ? (isCorrect ? "#27845f" : isWrong ? "#b35c51" : "#34777a") : "#8aabad"); // 依答案狀態設定答案文字顏色。
  textStyle(answerIndex >= 0 ? BOLD : NORMAL); // 已放置答案使用粗體顯示。
  textSize(Math.min(layout.narrowScreen ? 12 : 15, Math.max(10, labelHeight * 0.42))); // 依答案區高度調整置中文字的大小並保留易讀下限。
  text(textValue, card.x + card.w / 2, labelY + labelHeight / 2, card.w - 20, labelHeight - 4); // 讓答案文字在卡片中央換行顯示。
} // 完成卡片答案區繪製。

// 以親切的語音朗讀圖示卡片的題目和說明。
function speakQuestion(index) { // 開始朗讀指定題目。
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) { // 確認瀏覽器支援語音合成功能。
    return; // 不支援時安靜結束，避免影響測驗操作。
  } // 完成語音功能支援檢查。
  window.speechSynthesis.cancel(); // 停止上一段朗讀，避免多段語音重疊。
  const speech = new SpeechSynthesisUtterance(`小朋友，這一題是${quizItems[index].title}。${quizItems[index].answer}記得保護自己，做個健康又開心的小寶貝喔！`); // 建立親切有趣的繁體中文朗讀內容。
  const voices = window.speechSynthesis.getVoices(); // 取得瀏覽器目前提供的語音清單。
  const chineseVoices = voices.filter((voice) => /zh[-_](TW|HK|CN)/i.test(voice.lang)); // 優先挑選繁體中文或中文語音。
  const femaleVoice = chineseVoices.find((voice) => /female|woman|girl|婷|美|玲|芳/i.test(voice.name)); // 優先挑選名稱看起來較像女性的中文語音。
  speech.voice = femaleVoice || chineseVoices.find((voice) => /zh[-_]TW/i.test(voice.lang)) || chineseVoices[0] || null; // 優先使用女性中文語音，其次使用繁體中文語音。
  speech.lang = speech.voice ? speech.voice.lang : "zh-TW"; // 設定語音使用繁體中文。
  speech.rate = 0.88; // 放慢語速，讓幼兒容易聽懂。
  speech.pitch = 1.25; // 提高音調，營造親切活潑的聲音感受。
  speech.volume = 1; // 將朗讀音量設定為最大值。
  window.speechSynthesis.speak(speech); // 播放目前題目的語音說明。
} // 完成題目語音朗讀。

// 繪製下方六個可以拖曳的文字選項。
function drawAnswerCards() { // 開始繪製答案選項區。
  noStroke(); // 關閉答案區標題外框。
  fill("#39777a"); // 設定答案區標題顏色。
  textStyle(BOLD); // 設定答案區標題使用粗體。
  textSize(layout.narrowScreen ? 15 : 19); // 放大答案區標題，方便幼兒閱讀。
  text("請拖曳六個小知識到上方配對", width / 2, layout.answerLabelY); // 繪製置中的答案區說明。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一繪製六個文字選項。
    if (answerPositions[index] !== -1 && index !== draggedAnswer) { // 略過已放進上方卡片的答案。
      continue; // 繼續繪製下一個答案選項。
    } // 完成已放置答案的判斷。
    const answerRect = getAnswerRect(index); // 取得答案選項的座標。
    const isDragging = index === draggedAnswer; // 判斷目前答案是否正在拖曳。
    const dragTarget = isDragging ? findDropTarget(pointerX, pointerY) : -1; // 檢查答案是否正在移向題目卡片。
    if (isDragging && dragTarget >= 0) { // 判斷拖曳文字是否會遮住題目文字。
      continue; // 目標卡片會以外框提示，暫時隱藏拖曳卡片避免文字重疊。
    } // 完成拖曳文字遮擋的判斷。
    const cardX = isDragging ? constrain(pointerX - answerRect.w - 14, layout.margin, width - answerRect.w - layout.margin) : answerRect.x; // 將拖曳卡片放在手指左側並限制於畫面內。
    const cardY = isDragging ? constrain(pointerY - answerRect.h / 2, 4, height - answerRect.h - 4) : answerRect.y; // 將拖曳卡片置中對齊手指並限制於畫面內。
    noStroke(); // 關閉選項卡片陰影外框。
    fill(44, 104, 110, isDragging ? 35 : 22); // 設定選項卡片的柔和陰影。
    rect(cardX + 2, cardY + 3, answerRect.w, answerRect.h, 12); // 繪製選項卡片陰影。
    fill(isDragging ? "#d9f4ed" : "#ffffff"); // 設定選項卡片底色。
    rect(cardX, cardY, answerRect.w, answerRect.h, 12); // 繪製答案選項卡片。
    fill("#3c696c"); // 設定答案文字顏色。
    textStyle(NORMAL); // 設定答案文字為一般字重。
    textSize(layout.narrowScreen ? 13 : 16); // 放大答案文字，方便幼兒閱讀。
    text(quizItems[index].answer, cardX + answerRect.w / 2, cardY + answerRect.h / 2, answerRect.w - 16, answerRect.h - 6); // 將答案文字置中並在卡片內換行。
  } // 完成六個文字選項繪製。
} // 完成答案選項區繪製。

// 繪製交卷按鈕與作答結果。
function drawActionArea() { // 開始繪製交卷區域。
  const buttonWidth = layout.narrowScreen ? 176 : 205; // 設定交卷按鈕寬度。
  const buttonHeight = layout.narrowScreen ? 43 : 48; // 設定交卷按鈕高度。
  submitButton = { x: width / 2 - buttonWidth / 2, y: layout.actionY - buttonHeight / 2, w: buttonWidth, h: buttonHeight }; // 儲存交卷按鈕的點擊範圍。
  restartButton = { x: width / 2 - buttonWidth / 2, y: layout.actionY - buttonHeight / 2, w: buttonWidth, h: buttonHeight }; // 儲存重新挑戰按鈕的點擊範圍。
  const allPlaced = answerPositions.every((position) => position !== -1); // 判斷六個答案是否都已經放置。
  const buttonEnabled = isSubmitted || allPlaced; // 判斷目前是否可以交卷或重新挑戰。
  noStroke(); // 關閉交卷按鈕外框。
  fill(buttonEnabled ? "#39a886" : "#a8c9c4"); // 依按鈕狀態設定按鈕顏色。
  rect(submitButton.x, submitButton.y, submitButton.w, submitButton.h, 24); // 繪製圓角交卷按鈕。
  fill("#ffffff"); // 設定按鈕文字為白色。
  textStyle(BOLD); // 設定按鈕文字為粗體。
  textSize(layout.narrowScreen ? 15 : 17); // 依畫面尺寸調整按鈕文字大小。
  text(isSubmitted ? "再玩一次" : "交卷看成績", width / 2, layout.actionY); // 繪製交卷或重新挑戰按鈕文字。
  if (isSubmitted) { // 判斷是否已經完成交卷。
    fill("#286f70"); // 設定成績回饋的文字顏色。
    textStyle(BOLD); // 設定成績回饋使用粗體。
    textSize(layout.narrowScreen ? 15 : 19); // 依畫面尺寸調整成績文字大小。
    text(`答對 ${finalScore}%！${finalScore >= 80 ? "太棒了，你是美妝安全小達人！" : "再記住這些安全小知識，下次會更棒！"}`, width / 2, layout.actionY - (layout.narrowScreen ? 34 : 39)); // 顯示答對百分比與鼓勵文字。
  } else if (!allPlaced) { // 判斷是否還有答案尚未放置。
    fill("#6e9292"); // 設定尚未完成提示的文字顏色。
    textStyle(NORMAL); // 設定提示文字為一般字重。
    textSize(layout.narrowScreen ? 10 : 12); // 依畫面尺寸調整提示文字大小。
    text("完成全部配對後，就能交卷看成績喔！", width / 2, layout.actionY - (layout.narrowScreen ? 31 : 34)); // 提醒玩家完成六題才能交卷。
  } // 完成交卷狀態的提示繪製。
} // 完成交卷區域繪製。

// 取得指定題目卡片的座標與尺寸。
function getCardRect(index) { // 開始計算題目卡片座標。
  const column = index % layout.columns; // 計算目前題目所在欄位。
  const row = Math.floor(index / layout.columns); // 計算目前題目所在列數。
  return { x: layout.margin + column * (layout.cardWidth + layout.gap), y: layout.cardTop + row * (layout.cardHeight + layout.gap), w: layout.cardWidth, h: layout.cardHeight }; // 讓每一列題目卡片分開排列。
} // 完成題目卡片座標計算。

// 取得指定答案在下方選項區的座標與尺寸。
function getAnswerRect(index) { // 開始計算答案卡片座標。
  const column = index % layout.columns; // 計算答案所在欄位。
  const row = Math.floor(index / layout.columns); // 計算答案所在列數。
  const answerWidth = layout.cardWidth; // 讓答案卡片與上方題目卡片等寬。
  return { x: layout.margin + column * (answerWidth + layout.gap), y: layout.trayTop + row * (layout.answerHeight + layout.answerGap), w: answerWidth, h: layout.answerHeight }; // 回傳答案卡片的矩形範圍。
} // 完成答案卡片座標計算。

// 開始拖曳答案時記錄拖曳來源。
function mousePressed() { // 開始處理滑鼠或觸控按下事件。
  if (isSubmitted) { // 判斷畫面是否已經顯示測驗結果。
    if (isPointInside(mouseX, mouseY, restartButton)) { // 判斷是否點擊重新挑戰按鈕。
      resetQuiz(); // 重設全部答案與成績。
    } // 完成重新挑戰按鈕判斷。
    return false; // 停止已交卷畫面的拖曳操作。
  } // 完成已交卷狀態判斷。
  if (isPointInside(mouseX, mouseY, submitButton) && answerPositions.every((position) => position !== -1)) { // 判斷是否點擊已解鎖的交卷按鈕。
    submitQuiz(); // 計算並顯示本次測驗成績。
    return false; // 停止本次點擊的其他操作。
  } // 完成交卷按鈕判斷。
  const pictureIndex = findDropTarget(mouseX, mouseY); // 檢查使用者是否按到上方的圖示題目卡片。
  if (pictureIndex >= 0 && mouseY < getCardRect(pictureIndex).y + getCardRect(pictureIndex).h * 0.68) { // 將圖示與題目標籤區域設為語音播放區。
    speakQuestion(pictureIndex); // 朗讀該圖示對應的題目與化妝常識。
    return false; // 避免點擊圖示時誤觸答案拖曳。
  } // 完成圖示語音點擊判斷。
  pointerX = mouseX; // 更新拖曳游標的水平位置。
  pointerY = mouseY; // 更新拖曳游標的垂直位置。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一檢查目前畫面上的答案卡片。
    const answerRect = answerPositions[index] === -1 ? getAnswerRect(index) : getCardRect(answerPositions[index]); // 取得答案目前所在位置的範圍。
    if (isPointInside(mouseX, mouseY, answerRect)) { // 判斷使用者是否按到答案卡片。
      draggedAnswer = index; // 設定目前正在拖曳的答案。
      dragOrigin = answerPositions[index]; // 記錄答案拖曳前所在的位置。
      return false; // 開始拖曳並停止其他按下事件。
    } // 完成答案卡片命中判斷。
  } // 完成全部答案卡片的檢查。
  return false; // 避免瀏覽器將觸控操作解讀為頁面捲動。
} // 完成按下事件處理。

// 拖曳期間持續更新文字選項的位置。
function mouseDragged() { // 開始處理滑鼠或觸控拖曳事件。
  if (draggedAnswer !== -1) { // 判斷目前是否有正在拖曳的答案。
    pointerX = mouseX; // 更新答案卡片的水平位置。
    pointerY = mouseY; // 更新答案卡片的垂直位置。
  } // 完成拖曳狀態更新。
  return false; // 避免拖曳時瀏覽器滑動頁面。
} // 完成拖曳事件處理。

// 放開滑鼠或手指時將答案放進目標卡片。
function mouseReleased() { // 開始處理滑鼠或觸控放開事件。
  if (draggedAnswer === -1) { // 判斷目前是否沒有正在拖曳的答案。
    return false; // 結束不需要處理的放開事件。
  } // 完成無拖曳狀態判斷。
  const targetIndex = findDropTarget(mouseX, mouseY); // 找出答案放開時位於哪個題目卡片。
  if (targetIndex >= 0) { // 判斷答案是否放在題目卡片上。
    const displacedAnswer = answerPositions.indexOf(targetIndex); // 找出目標卡片原本放置的答案。
    if (displacedAnswer >= 0 && displacedAnswer !== draggedAnswer) { // 判斷目標卡片是否已有其他答案。
      answerPositions[displacedAnswer] = dragOrigin; // 將被替換答案移回拖曳來源位置。
    } // 完成目標卡片答案替換處理。
    answerPositions[draggedAnswer] = targetIndex; // 將目前拖曳的答案放進目標卡片。
  } else if (isPointInside(mouseX, mouseY, { x: 0, y: layout.trayTop, w: width, h: height - layout.trayTop })) { // 判斷答案是否放回下方選項區。
    answerPositions[draggedAnswer] = -1; // 將答案移回未作答選項區。
  } // 完成放開位置判斷。
  draggedAnswer = -1; // 清除目前拖曳中的答案編號。
  dragOrigin = -1; // 清除拖曳前的位置記錄。
  return false; // 停止瀏覽器預設的拖曳行為。
} // 完成放開事件處理。

// 找出游標目前命中的題目卡片。
function findDropTarget(x, y) { // 開始尋找答案放置目標。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一檢查六個題目卡片。
    if (isPointInside(x, y, getCardRect(index))) { // 判斷游標是否位於目前卡片內。
      return index; // 回傳命中的題目編號。
    } // 完成目前卡片的命中判斷。
  } // 完成全部題目卡片的檢查。
  return -1; // 回傳沒有命中卡片的結果。
} // 完成放置目標搜尋。

// 判斷座標是否落在指定矩形範圍內。
function isPointInside(x, y, rect) { // 開始檢查點擊座標。
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h; // 回傳座標是否位於矩形內。
} // 完成矩形範圍判斷。

// 計算答對題數並啟動對應的成績特效。
function submitQuiz() { // 開始計算測驗結果。
  const correctCount = answerPositions.reduce((count, position, answerIndex) => count + (position === answerIndex ? 1 : 0), 0); // 計算答案放置正確的題數。
  finalScore = Math.round((correctCount / quizItems.length) * 100); // 將答對題數換算成百分比。
  isSubmitted = true; // 設定測驗已交卷。
  if (finalScore >= 80) { // 判斷成績是否達到泡泡特效門檻。
    isBubbleActive = true; // 啟動美人魚泡泡效果。
    bubbles = []; // 清除之前留下的泡泡。
  } // 完成高分特效判斷。
} // 完成測驗計分。

// 將所有測驗狀態還原，讓玩家重新挑戰。
function resetQuiz() { // 開始重設測驗狀態。
  answerPositions = quizItems.map(() => -1); // 將六個答案全部放回下方選項區。
  draggedAnswer = -1; // 清除正在拖曳的答案。
  dragOrigin = -1; // 清除拖曳來源記錄。
  isSubmitted = false; // 清除已交卷狀態。
  finalScore = 0; // 清除上一輪的成績。
  isBubbleActive = false; // 關閉上一輪的泡泡特效。
  bubbles = []; // 清除上一輪產生的泡泡。
} // 完成測驗狀態重設。

// 產生並繪製達標時的美人魚泡泡效果。
function drawBubbles() { // 開始繪製泡泡特效。
  if (!isBubbleActive) { // 判斷泡泡特效目前是否關閉。
    return; // 結束不需要繪製的泡泡動畫。
  } // 完成泡泡特效狀態判斷。
  if (frameCount % 5 === 0 && bubbles.length < 90) { // 控制泡泡產生速度並限制泡泡總數。
    bubbles.push({ x: random(width), y: height + 12, size: random(8, 24), speed: random(0.7, 2.1), sway: random(TWO_PI), hue: random(160, 205) }); // 新增一顆帶有海洋色調的泡泡。
  } // 完成泡泡產生處理。
  for (let index = bubbles.length - 1; index >= 0; index -= 1) { // 從後往前更新所有泡泡。
    const bubble = bubbles[index]; // 取得目前正在更新的泡泡。
    bubble.y -= bubble.speed; // 讓泡泡往畫面上方飄升。
    bubble.x += Math.sin(frameCount * 0.025 + bubble.sway) * 0.55; // 讓泡泡左右輕輕搖擺。
    colorMode(HSB, 360, 100, 100, 100); // 切換成 HSB 色彩模式繪製彩色泡泡。
    stroke(bubble.hue, 38, 100, 72); // 設定泡泡外框的珍珠色。
    strokeWeight(1.5); // 設定泡泡外框粗細。
    fill(bubble.hue, 35, 100, 18); // 設定泡泡內部的透明色。
    circle(bubble.x, bubble.y, bubble.size); // 繪製漂浮的泡泡。
    noStroke(); // 關閉泡泡亮點的外框。
    fill(0, 0, 100, 90); // 設定泡泡亮點為白色。
    circle(bubble.x - bubble.size * 0.2, bubble.y - bubble.size * 0.2, bubble.size * 0.18); // 繪製泡泡上的珍珠亮點。
    colorMode(RGB, 255, 255, 255, 255); // 切回一般 RGB 色彩模式。
    if (bubble.y < -bubble.size) { // 判斷泡泡是否已經飄出畫面。
      bubbles.splice(index, 1); // 移除已經離開畫面的泡泡。
    } // 完成畫面外泡泡的清理。
  } // 完成所有泡泡動畫更新。
} // 完成泡泡特效繪製。

// 畫面尺寸改變時重新調整全螢幕畫布。
function windowResized() { // 開始處理瀏覽器視窗尺寸變更。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布配合新的視窗大小。
  calculateLayout(); // 重新計算所有響應式元件座標。
} // 完成視窗尺寸變更處理。
