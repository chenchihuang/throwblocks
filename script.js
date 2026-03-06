/**
 * 擲茭網頁核心邏輯
 * 此程式負責處理茭杯的機率計算、動畫控制與 UI 狀態更新
 */

// 取得 DOM 元素，使用 const 確保參照不被覆寫
const btnToss = document.getElementById('toss-btn');
const textResult = document.getElementById('result-text');
const textDesc = document.getElementById('result-desc');
const bweiInner1 = document.getElementById('bwei-inner-1');
const bweiInner2 = document.getElementById('bwei-inner-2');
const historyList = document.getElementById('history-list');

/**
 * 等待指定的毫秒數
 * 這個輔助函式讓我們可以使用 async/await 來暫停程式碼執行
 * 非常適合用來等待 CSS 動畫播放完畢
 * @param {number} ms 毫秒數
 * @returns {Promise} 
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 加入一筆歷史紀錄
 * @param {string} name 擲茭結果名稱
 * @param {string} desc 擲茭結果敘述
 */
const addHistoryRecord = (name, desc) => {
  if (!historyList) return;

  const li = document.createElement('li');

  // 取得現在時間 (格式：HH:mm:ss)
  const now = new Date();
  const timeString = now.toLocaleTimeString('zh-TW', { hour12: false });

  li.innerHTML = `
    <span class="history-time">${timeString}</span>
    <span class="history-result-name">${name}</span>
    <span class="history-result-desc">${desc}</span>
  `;

  // 插入到最前面，讓新紀錄在最上方
  historyList.prepend(li);
};

/**
 * 產生擲茭的結果
 * 邏輯：隨機生成兩個杯的狀態（平或凸）
 * 0 代表 'flat' (平)
 * 1 代表 'round' (凸)
 * @returns {Object} 包含杯1、杯2 的狀態以及最終判定的文字
 */
const getTossResult = () => {
  // Math.random() 回傳 0 到 1 之間的浮點數
  // Math.round() 則將其四捨五入為 0 或 1
  const b1 = Math.round(Math.random());
  const b2 = Math.round(Math.random());

  let type = '';
  let name = '';
  let desc = '';

  // 判斷擲茭結果：
  if (b1 === 0 && b2 === 0) {
    // 兩平（陽面朝上） -> 笑杯
    type = 'laugh';
    name = '笑杯';
    desc = '神明在笑，請再重新說明問題或重新擲茭。';
  } else if (b1 === 1 && b2 === 1) {
    // 兩凸（陰面朝上） -> 陰杯 / 蓋杯 / 怒杯
    type = 'no';
    name = '陰杯';
    desc = '神明不同意，或代表事情不宜執行。';
  } else {
    // 一平一凸 -> 聖杯
    type = 'yes';
    name = '聖杯';
    desc = '神明同意，祈求的事情順利。';
  }

  return {
    cup1: b1 === 0 ? 'flat' : 'round',
    cup2: b2 === 0 ? 'flat' : 'round',
    name,
    desc
  };
};

/**
 * 執行擲茭動作與動畫
 * 這是綁定在按鈕上的主要處理函式，使用 async/await 處理非同步流程
 */
const handleToss = async () => {
  // 1. 禁用按鈕並更新 UI 狀態，避免連續點擊
  btnToss.disabled = true;
  textResult.textContent = '擲茭中...';
  textDesc.textContent = '誠心祈求中';

  // 清除先前的最後狀態 class (清除 is-flat, is-round)
  bweiInner1.className = 'bwei-inner';
  bweiInner2.className = 'bwei-inner';

  // 取得運算結果
  const result = getTossResult();

  // 2. 加入動畫 class 觸發 CSS keyframes (@keyframes toss)
  // 此動畫時間為 1.5s
  bweiInner1.classList.add('animating');
  bweiInner2.classList.add('animating');

  // 等待動畫即將結束前的一點時間 (例如等 1.4秒)
  // 在動畫最高點落地時設定最終的狀態
  await delay(1400);

  // 移除動畫 class，然後賦予最終面向的 class (is-flat 或 is-round)
  bweiInner1.classList.remove('animating');
  bweiInner2.classList.remove('animating');

  // 強制讓瀏覽器重繪 (reflow)，確保 class 更動有效
  void bweiInner1.offsetWidth;
  void bweiInner2.offsetWidth;

  // 設定最終的面
  bweiInner1.classList.add(`is-${result.cup1}`);
  bweiInner2.classList.add(`is-${result.cup2}`);

  // 3. 更新文字結果
  textResult.textContent = result.name;
  textDesc.textContent = result.desc;

  // 新增：加入歷史紀錄
  addHistoryRecord(result.name, result.desc);

  // 4. 重啟按鈕
  btnToss.disabled = false;
};

// 綁定點擊事件
btnToss.addEventListener('click', handleToss);

// 頁面載入時先給定初始狀態 (預設都給平)
bweiInner1.classList.add('is-flat');
bweiInner2.classList.add('is-flat');
