// NLCB UNIFIED SMART DASHBOARD - FINAL INTEGRATION
// Created and Built By Michael "CODEWITHGLASGOW" Glasgow
// 6-GAME INTEGRATION WITH PERSISTENT LOGIC & ANIMATIONS
// ADDED: Active Highlighting for Pick 2 & Pick 4 (matching combinations)
// ADDED: Carousel for previous weeks/months ABOVE fixed current week/month

const TICKER_URL = "https://script.google.com/macros/s/AKfycbymSUZ3cuBP7wZSKkxs8QmjMkKP6q3j-LOW_CVpY3n6Sw1EzsdwPu6yTEkpOmiAJz95/exec";
const COMPARISON_API = "https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar";

// =========================================
// UPDATED API ENDPOINTS (NEW BASE URL FOR CP, P5, W4L)
// =========================================
const NEW_BASE_URL = "https://script.google.com/macros/s/AKfycbxgvg-meXhPYHdN-pb7BIToR_Z_rUlQivXA5STThEcWwKKbzF97_XgnZ0JWWtKeRjzBVg/exec";

// Cash Pot (Daily/Weekly grouping)
const CP_API = `${NEW_BASE_URL}?action=calendar&game=CASHPOT&weeks=21`;

// Lotto Plus (Monthly grouping)
const P5_API = `${NEW_BASE_URL}/exec?action=monthly&game=LOTTO&months=9`;

// Win For Life (Monthly grouping)
const W4L_API = `${NEW_BASE_URL}/exec?action=monthly&game=WFL&months=9`;

// Keep original APIs for PW, P2, P4
const PW_API = COMPARISON_API + "&game=P2WHE&weeks=96";//29 wks initially
const P2_API = COMPARISON_API + "&game=PIKII&weeks=96";//29 wks initially
const P4_API = COMPARISON_API + "&game=PIKIV&weeks=96";//29 wks initially

if (config.runsInWidget) {
  let widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
} else {
  await presentUnifiedDashboard();
}

// =========================================
// 1. WIDGET LOGIC (UNCHANGED ORIGINAL)
// =========================================
async function createWidget() {
  const startTime = Date.now();
  let widget = new ListWidget();
  widget.url = URLScheme.forRunningScript();
  let gradient = new LinearGradient();
  gradient.colors = [new Color("#020617"), new Color("#1e293b")];
  gradient.locations = [0, 1];
  widget.backgroundGradient = gradient;
  widget.setPadding(12, 20, 12, 20);

  let dc = new DrawContext();
  dc.size = new Size(800, 800);
  dc.opaque = false;
  dc.setTextColor(new Color("#ffffff", 0.08));
  dc.setFont(Font.boldSystemFont(120));
  dc.setTextAlignedCenter();
  dc.drawTextInRect("FSP SAGi", new Rect(0, 340, 800, 200));
  widget.backgroundImage = dc.getImage();

  let json;
  try {
    let req = new Request(TICKER_URL + "?action=ticker");
    req.timeoutInterval = 5;
    json = await req.loadJSON();
    json.responseTime = Date.now() - startTime;
  } catch {
    json = JSON.parse(Keychain.get("cache_ticker") || "{}");
  }

  let games = json.games || {};
  let updated = json.lastUpdated || "Just now";

  // Header
let header = widget.addText(`NLCB LATEST GAME RESULTS • ⏰ ${updated}`)
header.textColor = new Color("#888888")
header.font = Font.mediumSystemFont(9.5)
header.centerAlignText()
widget.addSpacer(2)

const pwColors = {"01":"#ff6b6b","02":"#ffa94d","03":"#ffd43b","04":"#69db7c","05":"#38d9a9","06":"#4dabf7","07":"#9775fa","08":"#f783ac","09":"#ff922b","10":"#fab005","11":"#82c91e","12":"#20c997","13":"#339af0","14":"#845ef7","15":"#e599f7","16":"#ff8787","17":"#ffc078","18":"#ffe066","19":"#8ce99a","20":"#63e6be","21":"#74c0fc","22":"#b197fc","23":"#faa2c1","24":"#ffa8a8","25":"#ffec99","26":"#c0eb75","27":"#96f2d7","28":"#a5d8ff","29":"#d0bfff","30":"#fcc2d7","31":"#ff6b6b","32":"#ffa94d","33":"#ffd43b","34":"#69db7c","35":"#4dabf7","36":"#9775fa"}

function addBall(p, txt, bg, fg = "#030202", sz = 25) {
  let b = p.addStack()
  b.backgroundColor = new Color(bg)
  b.cornerRadius = sz/2
  b.size = new Size(sz, sz)
  b.centerAlignContent()
  let t = b.addText(txt)
  t.font = Font.boldSystemFont(sz === 30 ? 14 : 11)
  t.textColor = new Color(fg)
}

function addGame(emoji, title, data) {
  if (!data || data.length === 0) return
  let d = data[data.length-1]
  let n = d.numbers.trim()

  let head = widget.addText(`${emoji} ${title}`)
  head.textColor = new Color("#ffa500")
  head.font = Font.boldSystemFont(12.5)

  let row = widget.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  row.spacing = 6

  if (title === "PLAY WHE") {
    let m = n.match(/^(\d+).*?\(([^)]+)\)/)
    if (m) {
      addBall(row, m[1], pwColors[m[1]] || "#ffffff")
      m[2].split(",").forEach(k => {
        let mk = k.trim()
        let bg = mk==="WB"?"#ffffff":mk==="PB"?"#9c8308":m=="BB"?"#ffa500":mk==="GB"?"#9c8308":"#cc0000"
        let fg = mk==="WB"?"#000000":"#ffffff"
        addBall(row, mk, bg, fg, 24)
      })
    }
  }
  else if (title === "PICK 2") {
    let parts = n.split(" ")
    let balls = parts[0].split("/")
    addBall(row, balls[0], "#054517", "#ffff00")
    addBall(row, balls[1], "#ffff00", "#000000")
    if (parts[1]) {
      let bg = parts[1]==="WB"?"#ffffff":"#cc0000"
      let fg = parts[1]==="WB"?"#000000":"#ffffff"
      addBall(row, parts[1], bg, fg, 24)
    }
  }
  else if (title === "PICK 4") {
    let clean = n.length===8 ? n.match(/.{2}/g).map(x=>parseInt(x)+"") : n.split(" ")
    const colors = ["#cc0000", "#ffd700", "#00aa00", "#ffffff"]
    const textColors = ["#ffffff", "#000000", "#ffffff", "#000000"]
    clean.forEach((num, i) => {
      addBall(row, num, colors[i], textColors[i])
    })
  }
  else {
    let main = n.split("|")[0].trim().split(/\s+/)
    main.forEach(num => addBall(row, num, "#ffd700", "#000000"))

    if (n.includes("PB")) {
      let pb = n.match(/PB\s*(\d+)/i)[1]
      addBall(row, pb, "#cc0000", "#ffffff")
    }
    else if (n.includes("CB")) {
      let cb = n.match(/CB\s*(\d+)/i)[1]
      addBall(row, cb, "#00aa00", "#ffffff")
    }

    let mult = n.match(/X\s*(\d+)x?/i)
    if (mult) addBall(row, mult[1]+"x", "#ffffff", "#000000", 26)
  }

  let info = widget.addText(`${d.name} • ${d.time}`)
  info.textColor = new Color("#aaaaaa")
  info.font = Font.systemFont(9.5)
  info.centerAlignText()
  widget.addSpacer(5)
}

// Render all games exactly as before
addGame("💵", "PLAY WHE",   games.PLAYWHE)
addGame("💵", "PICK 2",     games.PICK2)
addGame("💵", "PICK 4",     games.PICK4)
addGame("💰💰", "CASH POT",   games.CP0)
addGame("💰💰", "WIN 4 LIFE", games.W4L)

// LOTTO — only change: now shows live jackpot but keeps exact same style
let jackpotText = "2 MILLION"
try {
  let r = new Request("https://www.nlcbplaywhelotto.com/nlcb-lotto-plus-results/")
  r.timeoutInterval = 6
  let html = await r.loadString()
  let match = html.match(/Next Estimated Jackpot[\s\S]*?([\d.,]+)\s*MILLION/i)
  if (match && match[1]) jackpotText = match[1].trim() + " MILLION"
} catch(e) {}

let lottoRow = widget.addStack()
lottoRow.layoutHorizontally()

let lottoLabel = lottoRow.addText("💰💰 LOTTO • ")
lottoLabel.textColor = new Color("#ffa500")
lottoLabel.font = Font.boldSystemFont(12.5)

let jackpotLabel = lottoRow.addText("Jackpot: ")
jackpotLabel.textColor = Color.green()
jackpotLabel.font = Font.boldSystemFont(12.5)

let jackpotValue = lottoRow.addText(jackpotText)
jackpotValue.textColor = Color.green()
jackpotValue.font = Font.boldSystemFont(12.5)

let lottoData = games.P5 || []
if (lottoData.length > 0) {
  let d = lottoData[lottoData.length-1]
  let n = d.numbers.trim()

  let row = widget.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  row.spacing = 6

  let main = n.split("|")[0].trim().split(/\s+/)
  main.forEach(num => addBall(row, num, "#ffd700", "#000000"))

  if (n.includes("PB")) {
    let pb = n.match(/PB\s*(\d+)/i)[1]
    addBall(row, pb, "#cc0000", "#ffffff")
  }

  let mult = n.match(/X\s*(\d+)x?/i)
  if (mult) addBall(row, mult[1]+"x", "#ffffff", "#000000", 26)

  let info = widget.addText(`${d.name} • ${d.time}`)
  info.textColor = new Color("#aaaaaa")
  info.font = Font.systemFont(9.5)
  info.centerAlignText()
}
widget.addSpacer(5)

// Footer with latency
const now = new Date()
const foot = widget.addStack()
foot.layoutHorizontally()
foot.centerAlignContent()
foot.spacing = 4

// Latency indicator
const latencyTime = json.responseTime ? parseInt(json.responseTime) : 0
let latencyText
if (latencyTime < 1000) {
    latencyText = `♠️SAGi ⚡ ${latencyTime}ms`
} else {
    latencyText = `♠️SAGi ⚡ ${(latencyTime / 1000).toFixed(1)}s`
}

const footText = foot.addText(`⏰ • ${now.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
})} • ${latencyText} • CODEWITHGLASGOW • v2.5.6`)

footText.textColor = new Color("#555555")
footText.font = Font.mediumSystemFont(8)
footText.centerAlignText()

// -----------------------------------------
// AUTO-REFRESH (Silent, iOS-approved)
// ----------------------------------------
widget.refreshAfterDate = new Date(Date.now() + 4 * 60 * 1000) // every 4 minutes

  return widget;
}


// =========================================
// MONTHLY STATS CAROUSEL FUNCTION (UNIVERSAL - WORKS FOR ALL 6 GAMES)
// =========================================
function renderMonthlyCarousel(weeksData, gameType, title) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Define number ranges for each game type
  function getNumberRange(gameType) {
    switch(gameType) {
      case "P2WHE": return { min: 1, max: 36 };      // Play Whe: 1-36
      case "PIKII": return { min: 1, max: 36 };      // Pick 2: 1-36
      case "PIKIV": return { min: 0, max: 9 };       // Pick 4: 0-9
      case "CASHPOT": return { min: 1, max: 20 };    // Cash Pot: 1-20
      case "LOTTO": return { min: 1, max: 35 };      // Lotto Plus: 1-35
      case "W4L": return { min: 1, max: 28 };        // Win For Life: 1-28
      default: return { min: 1, max: 36 };
    }
  }
  
  // Helper to extract numbers based on game type
  function extractNumbers(value, gameType, drawIndex = null) {
    if (!value || value === "-" || value === "PENDING" || value === "SCHEDULED") return [];
    
    const range = getNumberRange(gameType);
    
    if (gameType === "P2WHE") {
      let num = parseInt(value, 10);
      if (!isNaN(num) && num >= range.min && num <= range.max) return [num];
      return [];
    }
    else if (gameType === "PIKII") {
      let results = [];
      let strVal = String(value);
      let parts = strVal.split(/[,/ ]+/);
      for (let part of parts) {
        let num = parseInt(part, 10);
        if (!isNaN(num) && num >= range.min && num <= range.max) {
          results.push(num);
        }
      }
      return results;
    }
    else if (gameType === "PIKIV") {
      let results = [];
      let strVal = String(value);
      let cleanVal = strVal.replace(/[^0-9]/g, '');
      for (let i = 0; i < cleanVal.length; i++) {
        let digit = parseInt(cleanVal.charAt(i), 10);
        if (!isNaN(digit) && digit >= range.min && digit <= range.max) {
          results.push(digit);
        }
      }
      return results;
    }
    else if (gameType === "CASHPOT") {
      let results = [];
      for (let n = 1; n <= 5; n++) {
        let num = value[`Num${n}`];
        if (num && num !== "-" && num !== "") {
          let parsed = parseInt(num, 10);
          if (!isNaN(parsed) && parsed >= range.min && parsed <= range.max) {
            results.push(parsed);
          }
        }
      }
      return results;
    }
    else if (gameType === "LOTTO") {
      let results = [];
      for (let n = 1; n <= 5; n++) {
        let num = value[`Num${n}`];
        if (num && num !== "-" && num !== "") {
          let parsed = parseInt(num, 10);
          if (!isNaN(parsed) && parsed >= range.min && parsed <= range.max) {
            results.push(parsed);
          }
        }
      }
      return results;
    }
    else if (gameType === "W4L") {
      let results = [];
      for (let n = 1; n <= 6; n++) {
        let num = value[`Num${n}`];
        if (num && num !== "-" && num !== "") {
          let parsed = parseInt(num, 10);
          if (!isNaN(parsed) && parsed >= range.min && parsed <= range.max) {
            results.push(parsed);
          }
        }
      }
      return results;
    }
    return [];
  }
  
// Calculate stats for the month
function getMonthStats(targetMonth, targetYear) {
  const range = getNumberRange(gameType);
  let counts = {};
  let lastPlayed = {};
  
  // Initialize counts for the correct number range
  for (let i = range.min; i <= range.max; i++) {
    counts[i] = 0;
    lastPlayed[i] = null;
  }
  
  // Helper to get actual date from week structure
  function getDrawDate(week, day) {
    if (!week.startDate) return null;
    let parts = week.startDate.split(" ");
    let monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    let d = new Date(parts[2], monthMap[parts[1]], parts[0]);
    let dayOrderLocal = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayIndex = dayOrderLocal.indexOf(day.dayName);
    if (dayIndex !== -1) {
      d.setDate(d.getDate() + dayIndex);
    }
    return d;
  }
  
  // Get the actual data array
  let dataArray = null;
  
  // Extract the array based on game type and data structure
  if (gameType === "P2WHE" || gameType === "PIKII" || gameType === "PIKIV") {
    if (weeksData && weeksData.weeks && Array.isArray(weeksData.weeks)) {
      dataArray = weeksData.weeks;
    } else if (weeksData && Array.isArray(weeksData)) {
      dataArray = weeksData;
    }
  } 
  else if (gameType === "CASHPOT") {
    if (weeksData && weeksData.data && Array.isArray(weeksData.data)) {
      dataArray = weeksData.data;
    } else if (weeksData && Array.isArray(weeksData)) {
      dataArray = weeksData;
    }
  }
  else if (gameType === "LOTTO" || gameType === "W4L") {
    if (weeksData && weeksData.data && Array.isArray(weeksData.data)) {
      dataArray = weeksData.data;
    } else if (weeksData && Array.isArray(weeksData)) {
      dataArray = weeksData;
    }
  }
  
  if (!dataArray || dataArray.length === 0) {
    return { top: [], bottom: [] };
  }
  
  // Process based on game type
  if (gameType === "P2WHE" || gameType === "PIKII" || gameType === "PIKIV") {
    for (let weekIdx = 0; weekIdx < dataArray.length; weekIdx++) {
      let week = dataArray[weekIdx];
      if (week && week.days && Array.isArray(week.days)) {
        for (let dayIdx = 0; dayIdx < week.days.length; dayIdx++) {
          let day = week.days[dayIdx];
          let drawDate = getDrawDate(week, day);
          if (drawDate && drawDate.getMonth() === targetMonth && drawDate.getFullYear() === targetYear) {
            if (day.draws) {
              let drawValues = Object.values(day.draws);
              for (let v = 0; v < drawValues.length; v++) {
                let numbers = extractNumbers(drawValues[v], gameType);
                for (let n = 0; n < numbers.length; n++) {
                  let num = numbers[n];
                  counts[num]++;
                  if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                    lastPlayed[num] = new Date(drawDate);
                  }
                }
              }
            }
          }
        }
      }
    }
  } 
  else if (gameType === "CASHPOT") {
    for (let weekIdx = 0; weekIdx < dataArray.length; weekIdx++) {
      let week = dataArray[weekIdx];
      if (week && week.days && Array.isArray(week.days)) {
        for (let dayIdx = 0; dayIdx < week.days.length; dayIdx++) {
          let day = week.days[dayIdx];
          if (day.date && day.date !== "SCHEDULED") {
            let drawDate = new Date(day.date);
            if (!isNaN(drawDate) && drawDate.getMonth() === targetMonth && drawDate.getFullYear() === targetYear) {
              let numbers = extractNumbers(day.draws, gameType);
              for (let n = 0; n < numbers.length; n++) {
                let num = numbers[n];
                counts[num]++;
                if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                  lastPlayed[num] = new Date(drawDate);
                }
              }
            }
          }
        }
      }
    }
  }
  else if (gameType === "LOTTO" || gameType === "W4L") {
    for (let monthIdx = 0; monthIdx < dataArray.length; monthIdx++) {
      let month = dataArray[monthIdx];
      if (month && month.days && Array.isArray(month.days)) {
        for (let dayIdx = 0; dayIdx < month.days.length; dayIdx++) {
          let day = month.days[dayIdx];
          if (day.date && day.date !== "SCHEDULED") {
            let drawDate = new Date(day.date);
            if (!isNaN(drawDate) && drawDate.getMonth() === targetMonth && drawDate.getFullYear() === targetYear) {
              let numbers = extractNumbers(day.draws, gameType);
              for (let n = 0; n < numbers.length; n++) {
                let num = numbers[n];
                counts[num]++;
                if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                  lastPlayed[num] = new Date(drawDate);
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Create array of all numbers with their counts
  let allNumbers = [];
  for (let num = range.min; num <= range.max; num++) {
    let daysAgo = "Never";
    if (lastPlayed[num]) {
      let diffDays = Math.floor((now - lastPlayed[num]) / (1000 * 60 * 60 * 24));
      daysAgo = diffDays;
    }
    allNumbers.push({ 
      num: num, 
      count: counts[num],
      lastPlayed: lastPlayed[num],
      daysAgo: daysAgo
    });
  }
  
  // DYNAMIC FILTERING - No hardcoded limits
  // TOP: 3 or more hits
  let top = allNumbers.filter(item => item.count >= 3).sort((a, b) => b.count - a.count);
  // BOTTOM: 2 or fewer hits (including zeros)
  let bottom = allNumbers.filter(item => item.count <= 2).sort((a, b) => a.count - b.count);
  
  return { top: top, bottom: bottom };
}
  
  // Get the actual data array for validation
  let hasValidData = false;
  if (gameType === "P2WHE" || gameType === "PIKII" || gameType === "PIKIV") {
    hasValidData = (weeksData && weeksData.weeks && weeksData.weeks.length > 0) || (weeksData && Array.isArray(weeksData) && weeksData.length > 0);
  } else {
    hasValidData = (weeksData && weeksData.data && weeksData.data.length > 0) || (weeksData && Array.isArray(weeksData) && weeksData.length > 0);
  }
  
  if (!hasValidData) {
    return '<div style="text-align:center; padding:20px; color:#666;">Loading monthly stats...</div>';
  }
  
  const thisMonthStats = getMonthStats(currentMonth, currentYear);
  const lastMonthStats = getMonthStats(lastMonth, lastMonthYear);
  
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  const lastMonthName = new Date(lastMonthYear, lastMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  
  function formatLastPlayed(date) {
    if (!date) return "Never";
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/(\d{2})(\d{2})$/, "'$2");
  }
  
  function generateStatsTable(marksArray, monthName, isMostPlayed = true) {
    if (!marksArray || marksArray.length === 0) {
      return '<div style="text-align:center; padding:20px; color:#666;">No data meets threshold</div>';
    }
    
    // Filter based on thresholds
    let filteredArray;
    if (isMostPlayed) {
      filteredArray = marksArray.filter(item => item.count >= 3);
    } else {
      filteredArray = marksArray.filter(item => item.count <= 2);
    }
    
    if (filteredArray.length === 0) {
      return '<div style="text-align:center; padding:20px; color:#666;">No data meets threshold</div>';
    }
    
    let displayNum = (num) => {
      return num.toString();
    };
    
    let tableHtml = `
      <div class="stats-card">
        <div class="stats-card-header">
          <h4>${monthName}</h4>
          <p style="font-size: 9px; margin-top: 2px; color: #aaa;">${filteredArray.length} numbers</p>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
          <table class="stats-table">
            <thead>
              <tr style="position: sticky; top: 0; background: var(--card);">
                <th>#</th>
                <th>Mark</th>
                <th>Hits</th>
                <th>Last</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    filteredArray.forEach((item, idx) => {
      let rankClass = '';
      if (idx === 0 && isMostPlayed) rankClass = 'stats-rank-1';
      else if (idx === 1 && isMostPlayed) rankClass = 'stats-rank-2';
      else if (idx === 2 && isMostPlayed) rankClass = 'stats-rank-3';
      
      const lastPlayedFormatted = formatLastPlayed(item.lastPlayed);
      const daysAgoText = item.daysAgo === "Never" ? "Never" : item.daysAgo + "d";
      const numDisplay = displayNum(item.num);
      
      let hitColor = '#10b981';
      if (item.count >= 10) hitColor = '#bf5af2';
      else if (item.count >= 7) hitColor = '#5856d6';
      else if (item.count >= 4) hitColor = '#007aff';
      else if (item.count >= 2) hitColor = '#ff9f0a';
      else if (item.count >= 1) hitColor = '#10b981';
      
      if (item.count === 0) hitColor = '#666';
      
      tableHtml += `
        <tr class="${rankClass}">
          <td style="font-weight: 700; color: #ff9d00;">${idx + 1}</td>
          <td style="font-weight: 800; font-size: 14px;">${numDisplay}</td>
          <td style="font-weight: 700; color: ${hitColor};">${item.count}x</span></td>
          <td style="font-size: 9px;">${lastPlayedFormatted}</td>
          <td style="font-size: 9px; font-weight: bold; color: ${item.daysAgo !== "Never" && item.daysAgo > 14 ? '#ff453a' : '#888'};">${daysAgoText}</td>
        </tr>
      `;
    });
    
    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    return tableHtml;
  }
  
  return `
    <div class="fsp-carousel-wrapper" style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px;">
        <span style="font-size: 14px; font-weight: 800; color: #ff9d00;">📊 ${title} MONTHLY STATS</span>
        <div style="display: flex; gap: 8px;">
          <button class="carousel-prev-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer;">◀</button>
          <button class="carousel-next-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer;">▶</button>
        </div>
      </div>
      <div class="fsp-carousel" id="monthlyCarousel-${gameType}" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; padding: 4px 0 16px 0; scroll-behavior: smooth;">
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔺 MOST PLAYED (THIS MONTH)</div>
          <div class="stats-container">${generateStatsTable(thisMonthStats.top, currentMonthName, true)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Numbers with 3+ hits this month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔻 LEAST PLAYED (THIS MONTH)</div>
          <div class="stats-container">${generateStatsTable(thisMonthStats.bottom, currentMonthName, false)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Numbers with 0-2 hits this month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔺 MOST PLAYED (LAST MONTH)</div>
          <div class="stats-container">${generateStatsTable(lastMonthStats.top, lastMonthName, true)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Numbers with 3+ hits last month</div>
        </div>
        <div class="carousel-item" style="flex: 0 0 calc(100% - 40px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden;">
          <div class="carousel-header" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: #ff9d00;">🔻 LEAST PLAYED (LAST MONTH)</div>
          <div class="stats-container">${generateStatsTable(lastMonthStats.bottom, lastMonthName, false)}</div>
          <div class="carousel-subtitle" style="font-size: 9px; color: #888; text-align: center; padding: 8px; border-top: 1px solid #333;">Numbers with 0-2 hits last month</div>
        </div>
      </div>
      <div class="carousel-dots" style="display: flex; justify-content: center; gap: 8px; margin-top: 12px;" id="carouselDots-${gameType}"></div>
    </div>
    
    <style>
      .fsp-carousel::-webkit-scrollbar {
        height: 4px;
      }
      .fsp-carousel::-webkit-scrollbar-track {
        background: #333;
        border-radius: 10px;
      }
      .fsp-carousel::-webkit-scrollbar-thumb {
        background: #ff9d00;
        border-radius: 10px;
      }
      .stats-card {
        background: var(--card);
      }
      .stats-card-header h4 {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        color: #888;
        padding: 8px;
        text-align: center;
        background: rgba(0,0,0,0.2);
      }
      .stats-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      .stats-table th {
        background: rgba(0, 0, 0, 0.2);
        padding: 8px 4px;
        text-align: center;
        font-weight: 700;
        color: #ff9d00;
      }
      .stats-table td {
        padding: 6px 4px;
        text-align: center;
        border-bottom: 1px solid #333;
        font-weight: 600;
      }
      .stats-rank-1 {
        background: rgba(255, 215, 0, 0.2);
        font-weight: 800;
      }
      .stats-rank-2 {
        background: rgba(192, 192, 192, 0.15);
      }
      .stats-rank-3 {
        background: rgba(205, 127, 50, 0.15);
      }
    </style>
    
    <script>
      (function() {
        var carousel = document.getElementById('monthlyCarousel-${gameType}');
        var prevBtn = document.querySelector('.carousel-prev-${gameType}');
        var nextBtn = document.querySelector('.carousel-next-${gameType}');
        var dotsContainer = document.getElementById('carouselDots-${gameType}');
        var slides = carousel ? carousel.children : [];
        var currentIndex = 0;
        
        function updateDots() {
          if (!dotsContainer) return;
          var dots = dotsContainer.querySelectorAll('.monthly-dot');
          dots.forEach(function(dot, i) {
            if (i === currentIndex) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
        
        function scrollToSlide(index) {
          if (!carousel || slides.length === 0) return;
          if (index < 0) index = 0;
          if (index >= slides.length) index = slides.length - 1;
          currentIndex = index;
          var slideWidth = slides[0].offsetWidth;
          var gap = 16;
          carousel.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' });
          updateDots();
        }
        
        function handleScroll() {
          if (!carousel || slides.length === 0) return;
          var slideWidth = slides[0].offsetWidth;
          var gap = 16;
          var scrollPosition = carousel.scrollLeft;
          var newIndex = Math.round(scrollPosition / (slideWidth + gap));
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (prevBtn) prevBtn.onclick = function() { scrollToSlide(currentIndex - 1); };
        if (nextBtn) nextBtn.onclick = function() { scrollToSlide(currentIndex + 1); };
        if (carousel) carousel.addEventListener('scroll', handleScroll);
        
        if (dotsContainer && slides.length > 1) {
          dotsContainer.innerHTML = '';
          for (var i = 0; i < slides.length; i++) {
            var dot = document.createElement('div');
            dot.className = 'monthly-dot' + (i === currentIndex ? ' active' : '');
            dot.style.cssText = 'width: 6px; height: 6px; background: #555; border-radius: 50%; transition: all 0.3s ease; cursor: pointer;';
            if (i === currentIndex) dot.style.cssText += 'background: #ff9d00; width: 16px; border-radius: 4px;';
            dot.onclick = (function(idx) { return function() { scrollToSlide(idx); }; })(i);
            dotsContainer.appendChild(dot);
          }
        }
        
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}
//////////////////Report//////////////////
// =====================================
// PLAY WHE ANALYSIS READOUT (Intelligent - Previous Week + Current Week Updates)
// =====================================
function generatePlayWheReadout(weeksData) {
  // Check if we have valid data
  if (!weeksData || weeksData.length === 0) {
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">📊 Waiting for Play Whe data to load...</div>';
  }
  
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  // Format current week date range (e.g., "3 May '26 - 9 May '26")
  function formatWeekRange(week) {
    if (!week || !week.startDate) return "Current Week";
    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  function formatPreviousWeekRange(week) {
    if (!week || !week.startDate) return "Last Week";
    const startDate = new Date(week.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatOptions = { day: 'numeric', month: 'short', year: '2-digit' };
    const startFormatted = startDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    const endFormatted = endDate.toLocaleDateString('en-US', formatOptions).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
    
    return `${startFormatted} - ${endFormatted}`;
  }
  
  const currentWeekRange = formatWeekRange(currentWeek);
  const previousWeekRange = formatPreviousWeekRange(previousWeek);
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const todayName = dayNames[todayIdx];
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "💀", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐯", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  function formatDate(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).replace(/,/g, '');
  }
  
  function formatNumberList(numbers) {
    if (!numbers || numbers.length === 0) return "";
    const numbersCopy = [...numbers];
    if (numbersCopy.length === 1) return `${numbersCopy[0]}`;
    if (numbersCopy.length === 2) return `${numbersCopy[0]} and ${numbersCopy[1]}`;
    const last = numbersCopy.pop();
    return `${numbersCopy.join(", ")} and ${last}`;
  }
  
  // Get today's draws from previous week (the carousel display)
  const todayDraws = [];
  slots.forEach(slot => {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayDraws.push(draw);
  });
  
  if (todayDraws.length === 0) {
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">📊 No previous week data available for today\'s analysis</div>';
  }
  
  // Get all draws from previous week for baseline analysis
  const previousWeekDraws = [];
  dayNames.forEach(day => {
    slots.forEach(slot => {
      const draw = getDraw(previousWeek, day, slot);
      if (draw) previousWeekDraws.push(draw);
    });
  });
  
  // Get all draws from current week so far (up to today)
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    slots.forEach(slot => {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    });
  }
  
  // Count occurrences for previous week and current week
  const previousWeekCounts = {};
  previousWeekDraws.forEach(draw => {
    previousWeekCounts[draw] = (previousWeekCounts[draw] || 0) + 1;
  });
  
  const currentWeekCounts = {};
  currentWeekDraws.forEach(draw => {
    currentWeekCounts[draw] = (currentWeekCounts[draw] || 0) + 1;
  });
  
  // Lines analysis - start with previous week missing, then remove if played in current week
  const lines = {
    1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
    4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
    7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
  };
  
  const linesOutput = [];
  for (let line = 1; line <= 9; line++) {
    const lineNumbers = lines[line];
    const playedInLinePrev = lineNumbers.filter(num => previousWeekDraws.includes(num));
    const playedInLineCurrent = lineNumbers.filter(num => currentWeekDraws.includes(num));
    const allPlayedInLine = [...new Set([...playedInLinePrev, ...playedInLineCurrent])];
    const missingInLine = lineNumbers.filter(num => !allPlayedInLine.includes(num));
    
    if (playedInLinePrev.length === 0 && playedInLineCurrent.length === 0) {
      linesOutput.push(`${line} Line missing`);
    } else if (missingInLine.length > 0 && missingInLine.length < 4) {
      const missingText = formatNumberList(missingInLine);
      linesOutput.push(`${missingText} to complete ${line} Line`);
    }
  }
  
  // Suites analysis - start with previous week missing, then remove if played in current week
  const suites = {
    0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
    3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
    6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
  };
  
  const suitesOutput = [];
  for (let suite = 0; suite <= 9; suite++) {
    const suiteNumbers = suites[suite];
    const playedInSuitePrev = suiteNumbers.filter(num => previousWeekDraws.includes(num));
    const playedInSuiteCurrent = suiteNumbers.filter(num => currentWeekDraws.includes(num));
    const allPlayedInSuite = [...new Set([...playedInSuitePrev, ...playedInSuiteCurrent])];
    const missingInSuite = suiteNumbers.filter(num => !allPlayedInSuite.includes(num));
    
    if (playedInSuitePrev.length === 0 && playedInSuiteCurrent.length === 0) {
      suitesOutput.push(`${suite} Suite missing`);
    } else if (missingInSuite.length > 0 && missingInSuite.length < suiteNumbers.length) {
      const missingText = formatNumberList(missingInSuite);
      suitesOutput.push(`${missingText} to complete ${suite} Suite`);
    }
  }
  
  // Build timeline for PREVIOUS WEEK + CURRENT WEEK (for tracking events)
  const timeline = [];
  const prevWeekStart = new Date(previousWeek.startDate);
  const currWeekStart = new Date(currentWeek.startDate);
  
  // Add previous week draws
  for (let d = 0; d < dayNames.length; d++) {
    const drawDate = new Date(prevWeekStart);
    drawDate.setDate(prevWeekStart.getDate() + d);
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(previousWeek, dayNames[d], slots[s]);
      if (draw) {
        timeline.push({ 
          num: draw, 
          date: drawDate, 
          day: dayNames[d], 
          slot: slots[s],
          timestamp: drawDate.getTime(),
          week: "prev"
        });
      }
    }
  }
  
  // Add current week draws (up to today)
  for (let d = 0; d <= todayIdx; d++) {
    const drawDate = new Date(currWeekStart);
    drawDate.setDate(currWeekStart.getDate() + d);
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        timeline.push({ 
          num: draw, 
          date: drawDate, 
          day: dayNames[d], 
          slot: slots[s],
          timestamp: drawDate.getTime(),
          week: "curr"
        });
      }
    }
  }
  
  timeline.sort((a, b) => a.timestamp - b.timestamp);
  
  // LAST DATE PLAY - most recent draw from timeline
  let lastPlayDate = null;
  let lastPlayNumbers = [];
  if (timeline.length > 0) {
    const lastDraw = timeline[timeline.length - 1];
    lastPlayDate = lastDraw.date;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].day === lastDraw.day) {
        if (!lastPlayNumbers.includes(timeline[i].num)) {
          lastPlayNumbers.unshift(timeline[i].num);
        }
      } else {
        break;
      }
    }
  }
  
  // LAST FLIP - scan backwards (includes current week)
  let lastFlip = { num1: null, num2: null, date: null };
  const partners = {};
  for (let i = 1; i <= 18; i++) {
    partners[i] = 37 - i;
    partners[37 - i] = i;
  }
  
  for (let i = timeline.length - 1; i >= 1; i--) {
    const curr = timeline[i];
    const prev = timeline[i-1];
    if (partners[curr.num] === prev.num || partners[prev.num] === curr.num) {
      lastFlip = { num1: prev.num, num2: curr.num, date: curr.date };
      break;
    }
  }
  
  // ENHANCED DOUBLE/TRIPLE/QUADRUPLE LOGIC
  
  // Double numbers are ONLY 8, 11, 22, 33
  const doubleNumbers = [8, 11, 22, 33];
  
  // TO DOUBLE (Missing) - Double numbers that haven't played in previous week OR current week
  const toDoubleMissing = [];
  doubleNumbers.forEach(num => {
    if (!previousWeekDraws.includes(num) && !currentWeekDraws.includes(num)) {
      toDoubleMissing.push(num);
    }
  });
  
  // TO DOUBLE (Current Week) - ONLY double numbers (11,22,33) that have played once in current week
  const toDoubleCurrent = [];
  doubleNumbers.forEach(num => {
    const currCount = currentWeekCounts[num] || 0;
    if (currCount === 1) {
      toDoubleCurrent.push(num);
    }
  });
  
  // TO TRIPLE (Missing from previous week) - Numbers that played twice in previous week and haven't played in current week
  const toTripleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = previousWeekCounts[num] || 0;
    const currCount = currentWeekCounts[num] || 0;
    if (prevCount === 2 && currCount === 0) {
      toTripleMissing.push(num);
    }
  }
  
  // TO TRIPLE (Current Week) - Numbers that have played twice in current week so far (need one more for triple)
  const toTripleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currentWeekCounts[num] || 0;
    if (currCount === 2) {
      toTripleCurrent.push(num);
    }
  }
  
  // TO QUADRUPLE (Missing from previous week) - Numbers that played three times in previous week and haven't played in current week
  const toQuadrupleMissing = [];
  for (let num = 1; num <= 36; num++) {
    const prevCount = previousWeekCounts[num] || 0;
    const currCount = currentWeekCounts[num] || 0;
    if (prevCount === 3 && currCount === 0) {
      toQuadrupleMissing.push(num);
    }
  }
  
  // TO QUADRUPLE (Current Week) - Numbers that have played three times in current week so far (need one more for quadruple)
  const toQuadrupleCurrent = [];
  for (let num = 1; num <= 36; num++) {
    const currCount = currentWeekCounts[num] || 0;
    if (currCount === 3) {
      toQuadrupleCurrent.push(num);
    }
  }
  
  // WAPPI: number repeats in same day (MOR→MID, MID→NON, NON→EVE, EVE→next day MOR)
  // Includes both previous week and current week
  const wappiList = [];
  for (let i = timeline.length - 1; i >= 1; i--) {
    const curr = timeline[i];
    const prev = timeline[i-1];
    
    if (curr.num === prev.num) {
      const isSameDayConsecutive = (prev.day === curr.day && 
        ((prev.slot === "MOR" && curr.slot === "MID") ||
         (prev.slot === "MID" && curr.slot === "NON") ||
         (prev.slot === "NON" && curr.slot === "EVE")));
      
      const isEveningToNextMorning = (prev.slot === "EVE" && curr.slot === "MOR" && 
        dayNames.indexOf(prev.day) + 1 === dayNames.indexOf(curr.day));
      
      if (isSameDayConsecutive || isEveningToNextMorning) {
        wappiList.push({ num: curr.num, date: curr.date });
      }
    }
  }
  
  const uniqueWappi = [];
  for (let i = wappiList.length - 1; i >= 0 && uniqueWappi.length < 3; i--) {
    if (!uniqueWappi.find(w => w.num === wappiList[i].num)) {
      uniqueWappi.push(wappiList[i]);
    }
  }
  
  // DAMBALAY: MOR→NON, MID→EVE, or cross-day repeats
  // Includes both previous week and current week
  const dambalayList = [];
  for (let i = timeline.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (timeline[i].num === timeline[j].num && i !== j) {
        const later = timeline[i];
        const earlier = timeline[j];
        
        const isMorToNon = (earlier.slot === "MOR" && later.slot === "NON" && earlier.day === later.day);
        const isMidToEve = (earlier.slot === "MID" && later.slot === "EVE" && earlier.day === later.day);
        const isCrossDay = (earlier.day !== later.day);
        
        if (isMorToNon || isMidToEve || isCrossDay) {
          dambalayList.push({ num: later.num, date: later.date });
          break;
        }
      }
    }
  }
  
  const uniqueDambalay = [];
  for (let i = dambalayList.length - 1; i >= 0 && uniqueDambalay.length < 3; i--) {
    if (!uniqueDambalay.find(d => d.num === dambalayList[i].num)) {
      uniqueDambalay.push(dambalayList[i]);
    }
  }
  
  // PULL BACK: number played on a day and again 2+ days later
  // Includes both previous week and current week
  const pullBackList = [];
  for (let i = timeline.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (timeline[i].num === timeline[j].num && timeline[i].day !== timeline[j].day) {
        const dayDiff = dayNames.indexOf(timeline[i].day) - dayNames.indexOf(timeline[j].day);
        if (dayDiff >= 2 || (dayDiff < 0 && dayDiff + 7 >= 2)) {
          pullBackList.push({ num: timeline[i].num, date: timeline[i].date });
          break;
        }
      }
    }
  }
  
  const uniquePullBack = [];
  for (let i = pullBackList.length - 1; i >= 0 && uniquePullBack.length < 3; i--) {
    if (!uniquePullBack.find(p => p.num === pullBackList[i].num)) {
      uniquePullBack.push(pullBackList[i]);
    }
  }
  
  // ====================================
  // NEW: LEAVING & TO MEET CONTAINERS (2x2 Grid with Line/Suit)
  // =====================================
  
  // Helper to get Line and Suit for a number
  function getLineAndSuitForNumber(num) {
    const linesChart = {
      1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
      4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
      7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
    };
    const suitsChart = {
      0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
      3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
      6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
    };
    
    let line = null;
    let suit = null;
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(num)) {
        line = key;
        break;
      }
    }
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(num)) {
        suit = key;
        break;
      }
    }
    return { line, suit };
  }
  
  // Helper to format day and slot (e.g., "Wed # • EVE")
  function formatDaySlot(day, slot, date) {
    const dayShort = day.slice(0,3).toUpperCase();
    const dayNum = date ? date.getDate() : '';
    return `${dayShort} ${dayNum} • ${slot}`;
  }
  
  // Find last played number in current week
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  const currWeekStartDate = new Date(currentWeek.startDate);
  const todayIdxLocal = now.getDay();
  
  for (let d = todayIdxLocal; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStartDate);
        leavingDate.setDate(currWeekStartDate.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // Find meeting number (same day/time slot from previous week)
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      meetingNumber = getDraw(previousWeek, dayNames[nextDayIdx], slots[nextSlotIdx]);
      if (meetingNumber) {
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        const prevWeekStartDate = new Date(previousWeek.startDate);
        meetingDate = new Date(prevWeekStartDate);
        meetingDate.setDate(prevWeekStartDate.getDate() + nextDayIdx);
      }
    }
  }
  
  // Get Line/Suit for both numbers
  const leavingLineSuit = leavingNumber ? getLineAndSuitForNumber(leavingNumber) : { line: null, suit: null };
  const meetingLineSuit = meetingNumber ? getLineAndSuitForNumber(meetingNumber) : { line: null, suit: null };
  
  // Helper to format line/suit string
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line} Line` : "";
    const suitStr = suit !== null ? `${suit} Suit` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  // Helper to format short date
  function formatShortDateForContainer(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(/,/g, '');
  }
  
  // Build the two containers in a 2x2 grid
  const leavingHtml = leavingNumber ? `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #58a6ff;">
      <div style="font-size: 14px; color: #58a6ff; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">LEAVING</div>
      <div style="font-size: 36px; font-weight: 900; color: #58a6ff; line-height: 1;">${leavingNumber}${spiritEmoji[leavingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${formatDaySlot(leavingDay, leavingSlot, leavingDate)}</div>
      <div style="font-size: 9px; color: #ff9d00; margin-top: 2px; font-weight: 600;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #58a6ff;">
      <div style="font-size: 14px; color: #58a6ff; font-weight: bold; margin-bottom: 2px;">LEAVING</div>
      <div style="font-size: 24px; font-weight: 900; color: #555;">—</div>
      <div style="font-size: 9px; color: #888; margin-top: 2px;">No data yet</div>
    </div>
  `;
  
  const meetingHtml = meetingNumber ? `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #ff9d00;">
      <div style="font-size: 14px; color: #ff9d00; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">MEETING</div>
      <div style="font-size: 36px; font-weight: 900; color: #ff9d00; line-height: 1;">${meetingNumber}${spiritEmoji[meetingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${formatDaySlot(meetingDay, meetingSlot, meetingDate)}</div>
      <div style="font-size: 9px; color: #58a6ff; margin-top: 2px; font-weight: 600;">${formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit)}</div>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #ff9d00;">
      <div style="font-size: 14px; color: #ff9d00; font-weight: bold; margin-bottom: 4px;">MEETING</div>
      <div style="font-size: 24px; font-weight: 900; color: #555;">—</div>
      <div style="font-size: 9px; color: #888; margin-top: 6px;">Waiting for next draw</div>
    </div>
  `;
  
  // 2x2 Grid Layout
  const leavingMeetingHtml = `
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 6px 0;">
    ${leavingHtml}
    ${meetingHtml}
  </div>
  `;
  
// ========== TREND ALERT - Track specific numbers in current week ==========
  // Numbers to track: 4, 12, 16, 29
  const trendNumbers = [4, 12, 16, 29];
  
  // Define flip partners (mirror numbers)
  const flipPartners = {
    4: 33, 33: 4,
    12: 25, 25: 12,
    16: 21, 21: 16,
    29: 8, 8: 29
  };
  
  // Find which trend number triggered the alert and when
  let triggerNumber = null;
  let triggerDate = null;
  let triggerDay = null;
  let triggerSlot = null;
  
  // Scan current week draws to find the first trend number that played
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw && trendNumbers.includes(draw)) {
        triggerNumber = draw;
        triggerDate = new Date(currWeekStart);
        triggerDate.setDate(currWeekStart.getDate() + d);
        triggerDay = dayNames[d];
        triggerSlot = slots[s];
        break;
      }
    }
    if (triggerNumber) break;
  }
  
  // Collect all trend numbers data
  const trendAlertData = [];
  for (let num of trendNumbers) {
    // Find when this number played in current week
    let playedDate = null;
    let playedDay = null;
    let playedSlot = null;
    let playedCount = 0;
    
    for (let d = 0; d <= todayIdx; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(currentWeek, dayNames[d], slots[s]);
        if (draw === num) {
          playedCount++;
          if (!playedDate) {
            playedDate = new Date(currWeekStart);
            playedDate.setDate(currWeekStart.getDate() + d);
            playedDay = dayNames[d];
            playedSlot = slots[s];
          }
        }
      }
    }
    
    const flipNum = flipPartners[num];
    let flipPlayedDate = null;
    let flipPlayedDay = null;
    let flipPlayedSlot = null;
    let flipPlayedCount = 0;
    
    if (flipNum) {
      for (let d = 0; d <= todayIdx; d++) {
        for (let s = 0; s < slots.length; s++) {
          const draw = getDraw(currentWeek, dayNames[d], slots[s]);
          if (draw === flipNum) {
            flipPlayedCount++;
            if (!flipPlayedDate) {
              flipPlayedDate = new Date(currWeekStart);
              flipPlayedDate.setDate(currWeekStart.getDate() + d);
              flipPlayedDay = dayNames[d];
              flipPlayedSlot = slots[s];
            }
          }
        }
      }
    }
    
    trendAlertData.push({
      num: num,
      playedCount: playedCount,
      playedDate: playedDate,
      playedDay: playedDay,
      playedSlot: playedSlot,
      flipNum: flipNum,
      flipPlayedCount: flipPlayedCount,
      flipPlayedDate: flipPlayedDate,
      flipPlayedDay: flipPlayedDay,
      flipPlayedSlot: flipPlayedSlot
    });
  }
  
  // Format date for display (e.g., "Fri 2 May")
  function formatShortDate(date) {
    if (!date) return null;
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '');
  }
  
  // Format time slot (MOR, MID, NON, EVE)
  function formatSlot(slot) {
    if (!slot) return "";
    const slotNames = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
    return `${slotNames[slot] || ""} ${slot}`;
  }
  
  // Format Trend Alert HTML
  let trendAlertHtml = '';
  
  // Only show if at least one trend number has played
  const hasAnyPlayed = trendAlertData.some(item => item.playedCount > 0);
  
  if (hasAnyPlayed) {
    // Build the 4 rows for all trend numbers
    const trendRows = trendAlertData.map(item => {
      // Main number display with flame if played
      const mainDisplay = item.playedCount > 0 
        ? `<span style="font-size: 18px; font-weight: 900; color: #ff9d00;">${item.num}${spiritEmoji[item.num] || ''} 🔥</span>`
        : `<span style="font-size: 18px; font-weight: 900; opacity: 0.5;">${item.num}${spiritEmoji[item.num] || ''}</span>`;
      
      // Main number date if played
      const mainDate = item.playedDate ? `${formatShortDate(item.playedDate)} ${formatSlot(item.playedSlot)}` : 'pending';
      
      // Flip number display
      const flipDisplay = item.flipPlayedCount > 0
        ? `<span style="font-size: 16px; font-weight: 700; color: #58a6ff;">🪞${item.flipNum}${spiritEmoji[item.flipNum] || ''}</span>`
        : `<span style="font-size: 14px; font-weight: 500; opacity: 0.5;">🪞${item.flipNum}${spiritEmoji[item.flipNum] || ''}</span>`;
      
      // Flip number date if played
      const flipDate = item.flipPlayedDate ? `${formatShortDate(item.flipPlayedDate)} ${formatSlot(item.flipPlayedSlot)}` : 'pending';
      
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,157,0,0.1); border-radius: 8px; padding: 8px 12px; margin-bottom: 4px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 100px;">
            ${mainDisplay}
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 9px; color: #888;">Played</span>
              <span style="font-size: 10px; font-weight: 500;">${mainDate}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
              <span style="font-size: 9px; color: #888;">Mirror</span>
              <span style="font-size: 10px; font-weight: 500;">${flipDate}</span>
            </div>
            ${flipDisplay}
          </div>
        </div>
      `;
    }).join('');
    
    // Build trigger info line
    let triggerInfoHtml = '';
    if (triggerNumber) {
      const triggerDateFormatted = formatShortDate(triggerDate);
      triggerInfoHtml = `
        <div style="background: rgba(255,157,0,0.2); border-radius: 8px; padding: 6px 10px; margin-bottom: 10px; text-align: center;">
          <span style="font-size: 11px; font-weight: bold;">⚡️TRIGGERED BY</span>
          <span style="font-size: 14px; font-weight: 900; color: #ff9d00; margin-left: 8px;">${triggerNumber}${spiritEmoji[triggerNumber] || ''} 🔥</span>
          <span style="font-size: 11px; margin-left: 8px;">• ${triggerDateFormatted}</span>
          <span style="font-size: 11px; margin-left: 4px;">${formatSlot(triggerSlot)}</span>
<br>
<br>⚠️▶️ 4💀⚰️, 12🤴🏽, 16💃🏽, 29🍻 ◀️⚠️
        </div>
      `;
    }
    
    trendAlertHtml = `
      <div style="background: rgba(255,157,0,0.08); border-radius: 12px; padding: 10px; margin-bottom: 7px; border-left: 3px solid #ff9d00;">
        <div style="font-size: 11px; color: #ff9d00; font-weight: bold; margin-bottom: 8px; text-align: center;">
          🆘 PLAY ALL 4 🆘
        </div>
        ${triggerInfoHtml}
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${trendRows}
        </div>
        <div style="font-size: 8px; color: #666; margin-top: 8px; text-align: center; padding-top: 4px; border-top: 1px solid rgba(255,157,0,0.2);">
          Play any of these 4 numbers - when one hits, along with the mirrior of the triggered number
        </div>
      </div>
    `;
  }
  
  // Format numbers with emojis
  const formatNumbersWithEmoji = (numbers) => {
    if (!numbers || numbers.length === 0) return "";
    const formatted = numbers.map(n => `${n}${spiritEmoji[n] || ''}`);
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return formatted.join(" and ");
    const formattedCopy = [...formatted];
    const last = formattedCopy.pop();
    return `${formattedCopy.join(", ")} and ${last}`;
  };
  
  // Build HTML sections
  const linesHtml = linesOutput.length > 0 ? linesOutput.join('<br>') : "None";
  const suitesHtml = suitesOutput.length > 0 ? suitesOutput.join('<br>') : "None";
  const wappiHtml = uniqueWappi.length > 0 ? uniqueWappi.map(w => `#${w.num} ${spiritEmoji[w.num] || ''} (${formatDate(w.date)})`).join(' | ') : "";
  const dambalayHtml = uniqueDambalay.length > 0 ? uniqueDambalay.map(d => `#${d.num} ${spiritEmoji[d.num] || ''} (${formatDate(d.date)})`).join(' | ') : "";
  const pullBackHtml = uniquePullBack.length > 0 ? uniquePullBack.map(p => `#${p.num} ${spiritEmoji[p.num] || ''} (${formatDate(p.date)})`).join(' | ') : "";
  
  const toDoubleMissingHtml = toDoubleMissing.length > 0 ? formatNumbersWithEmoji(toDoubleMissing) : "";
  const toDoubleCurrentHtml = toDoubleCurrent.length > 0 ? formatNumbersWithEmoji(toDoubleCurrent) : "";
  const toTripleMissingHtml = toTripleMissing.length > 0 ? formatNumbersWithEmoji(toTripleMissing) : "";
  const toTripleCurrentHtml = toTripleCurrent.length > 0 ? formatNumbersWithEmoji(toTripleCurrent) : "";
  const toQuadrupleMissingHtml = toQuadrupleMissing.length > 0 ? formatNumbersWithEmoji(toQuadrupleMissing) : "";
  const toQuadrupleCurrentHtml = toQuadrupleCurrent.length > 0 ? formatNumbersWithEmoji(toQuadrupleCurrent) : "";
  
  const lastFlipText = lastFlip.num1 ? `${formatDate(lastFlip.date)} (${lastFlip.num1}${spiritEmoji[lastFlip.num1] || ''}🪞↔🪞${lastFlip.num2}${spiritEmoji[lastFlip.num2] || ''})` : "";
  const lastPlayText = lastPlayDate ? `${formatDate(lastPlayDate)} • ${lastPlayNumbers.map(n => '#' + n + ' ' + (spiritEmoji[n] || '')).join(' ')}` : "N/A";
  
  const todayDrawsText = todayDraws.map(num => `${num}${spiritEmoji[num] || ''}`).join('  ');
  
  return `
    <div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00;">
      <div style="font-size: 14px; font-weight: 800; color: #ff9d00; margin-bottom: 6px;">📅 UNDER TODAY • ${today} • CWG ©️</div>
      <div style="font-size: 20px; font-weight: 900; text-align: center; margin-bottom: 6px; background: rgba(255,157,0,0.15); padding: 6px; border-radius: 12px;">
        ${todayDrawsText}
      </div>
      ${leavingMeetingHtml}
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 6px;">
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ LINES MISSING</div>
          <div style="font-size: 11px; font-weight: bold; color: #ff9d00;">${linesHtml}</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ SUITS MISSING</div>
          <div style="font-size: 11px; font-weight: bold; color: #ff9d00;">${suitesHtml}</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🗓️ LAST DATE PLAY</div>
        <div style="font-size: 13px; font-weight: bold;">${lastPlayText}</div>
      </div>
      ${lastFlipText ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔄 LAST FLIP</div>
        <div style="font-size: 13px; font-weight: bold;">${lastFlipText}</div>
      </div>` : ''}
      
      <!-- TO DOUBLE SECTION - ONLY 11,22,33 -->
      ${toDoubleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE (MISSING)</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Double numbers that haven't played</div>
      </div>` : ''}
      ${toDoubleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE x2 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Played once this week - could double</div>
      </div>` : ''}
      
      <!-- TO TRIPLE SECTION -->
      ${toTripleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 2 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toTripleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 2 plays this week - needs 1 more for triple</div>
      </div>` : ''}
      
      <!-- TO QUADRUPLE SECTION -->
      ${toQuadrupleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 3 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toQuadrupleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 6px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 3 plays this week - needs 1 more for quadruple</div>
      </div>` : ''}
      
      ${wappiHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔥🔥🔥 LAST THREE WAPPI</div>
        <div style="font-size: 11px;">${wappiHtml}</div>
      </div>` : ''}
      ${dambalayHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 9px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE DAMBALAY</div>
        <div style="font-size: 11px;">${dambalayHtml}</div>
      </div>` : ''}
      ${pullBackHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 7px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE PULL BACK</div>
        <div style="font-size: 11px;">${pullBackHtml}</div>
      </div>` : ''}
      <div style="padding: 6px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 7px; color: #333; background: #fafafa;">
          CHARTS & READOUTS WHATSAPP CHANNEL <br>CODEWITHGLASGOW CHARTS ANALYSIS ©️ CWG
        </div>
      <br>
      ${trendAlertHtml}

       <div style="padding: 6px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 7px; color: #333; background: #fafafa;">
          CHARTS & READOUTS WHATSAPP CHANNEL <br>CODEWITHGLASGOW CHARTS ANALYSIS ©️ CWG
        </div>
      
    </div>
  `;
}
///////////////End of Report//////////////

////////////CHART PLAY MAPPING///////////
// =========================================
// PLAY WHE CHART PLAY MAPPING - With Line, Suite & Spirit Info
// =========================================
function renderChartPlayMapping(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="chart-mapping-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading chart mapping data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const currWeekStart = new Date(currentWeek.startDate);
  const prevWeekStart = new Date(previousWeek.startDate);
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  // Find LEAVING number (last played in current week)
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // Find MEETING number
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      meetingNumber = getDraw(previousWeek, dayNames[nextDayIdx], slots[nextSlotIdx]);
      if (meetingNumber) {
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = new Date(prevWeekStart);
        meetingDate.setDate(prevWeekStart.getDate() + nextDayIdx);
      }
    }
  }
  
  // ========== HELPER FUNCTIONS FOR LINE & SUITE ==========
  const linesChart = {
    1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 5: [5, 14, 23, 32], 6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24, 34], 5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  };
  
  // Spirit Names mapping
  const spiritNames = {
    1: "Centipede", 2: "Old Lady", 3: "Carriage", 4: "Dead Man", 5: "Parson Man",
    6: "Belly", 7: "Hog", 8: "Tiger", 9: "Cattle", 10: "Monkey",
    11: "Corbeau", 12: "King", 13: "Crapaud", 14: "Money", 15: "Sick Woman",
    16: "Jamette", 17: "Pigeon", 18: "Water Boat", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Rat", 23: "House", 24: "Queen", 25: "Morrocoy",
    26: "Fowl", 27: "Little Snake", 28: "Red Fish", 29: "Opium Man", 30: "House Cat",
    31: "Parson Wife", 32: "Shrimp", 33: "Spider", 34: "Blind Man", 35: "Big Snake", 36: "Donkey"
  };
  
  function getLineAndSuitForNumber(num) {
    if (!num) return { line: null, suit: null };
    
    let line = null;
    let suit = null;
    
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(num)) {
        line = key;
        break;
      }
    }
    
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(num)) {
        suit = key;
        break;
      }
    }
    
    return { line, suit };
  }
  
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line} Line` : "";
    const suitStr = suit !== null ? `${suit} Suit` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  // Get Line & Suit for leaving and meeting numbers
  const leavingLineSuit = getLineAndSuitForNumber(leavingNumber);
  const meetingLineSuit = getLineAndSuitForNumber(meetingNumber);
  
  // Get Spirit Names
  const leavingSpiritName = leavingNumber ? spiritNames[leavingNumber] : null;
  const meetingSpiritName = meetingNumber ? spiritNames[meetingNumber] : null;
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "💀", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };

  // Exact 10x10 structure from handwriting screenshot
  const gridMatrix = [
    [33,  4, 11, 13, 17, 22, 36, null, null, null],
    [21, 28,  4, 20, 10, 15, 29,   24, null, null],
    [ 5, 12,  3, 10,  8, 23,  1,   17,    7, null],
    [24, 17, 16, 16, 16, 30,  4,   36,   20, null],
    [18, 25, 23,  9,  2, 29, 11,   33,   27,   15],
    [ 8, 14,  7, 14, 22,  6, 20,   26,    8,    9],
    [null, 21,  6, 31, 24, 35, 19,   19,    5,    2],
    [null, null, 13, 21, 32, 12,  3,   34, null, null],
    [null, null, null, 25,  6, 32, null, null, null],
    [null, null, null, null, 13, null, null, null, null, null]
  ];

  // Generate Diamond Grid HTML
  let gridCellsHtml = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const num = gridMatrix[r][c];
      if (num !== null && num !== undefined) {
        const isLeaving = (num === leavingNumber);
        const isMeeting = (num === meetingNumber);
        let cellBg = 'background: rgba(30, 41, 59, 0.7);';
        let borderStyle = 'border: 1px solid rgba(88, 166, 255, 0.4);';
        let txtColor = '#ffffff';

        if (isLeaving) {
          cellBg = 'background: rgba(88, 166, 255, 0.35);';
          borderStyle = 'border: 2px solid #58a6ff;';
          txtColor = '#58a6ff';
        } else if (isMeeting) {
          cellBg = 'background: rgba(255, 157, 0, 0.35);';
          borderStyle = 'border: 2px solid #ff9d00;';
          txtColor = '#ff9d00';
        }

        const emoji = spiritEmoji[num] || '';

        gridCellsHtml += `
          <div style="
            position: relative;
            grid-row: ${r + 1};
            grid-column: ${c + 1};
            width: 100%;
            padding-top: 100%;
            ${cellBg}
            ${borderStyle}
            box-sizing: border-box;
          ">
            <div style="
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              transform: rotate(-45deg);
            ">
              <span style="font-size: 16px; font-weight: 900; color: ${txtColor}; line-height: 1;">${num}</span>
              <span style="font-size: 8px; margin-top: 1px; opacity: 0.7;">${emoji}</span>
            </div>
          </div>
        `;
      }
    }
  }
  
  function formatDaySlot(day, slot, date) {
    if (!day || !slot) return "—";
    const dayShort = day.slice(0,3).toUpperCase();
    const dayNum = date ? date.getDate() : '';
    return `${dayShort} ${dayNum} • ${slot}`;
  }
  
  return `
    <div class="chart-mapping-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 8px; margin-bottom: 7px; border: 1px solid #58a6ff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box;">
      <div style="font-size: 16px; font-weight: 800; color: #ff9d00; margin-bottom: 11px; text-align: center; letter-spacing: 0.5px;">PlayWhe Diamond Chart Mapping</div>
  
      <!-- LEAVING and MEETING Containers with Spirit, Line & Suite -->
      <div style="display: flex; gap: 12px; margin-top: 4px;">
        <div style="flex: 1; background: rgba(88,166,255,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #58a6ff;">
          <div style="font-size: 12px; color: #58a6ff; font-weight: bold; letter-spacing: 0.5px;">LEAVING</div>
          <div style="font-size: 28px; font-weight: 900; color: #58a6ff; line-height: 1.1;">${leavingNumber || '—'} ${leavingNumber ? spiritEmoji[leavingNumber] || '' : ''}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-weight: 500;">${leavingSpiritName || '—'}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${formatDaySlot(leavingDay, leavingSlot, leavingDate)}</div>
          <div style="font-size: 10px; color: #ff9d00; margin-top: 4px; font-weight: 600;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
        </div>
        <div style="flex: 1; background: rgba(255,157,0,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #ff9d00;">
          <div style="font-size: 12px; color: #ff9d00; font-weight: bold; letter-spacing: 0.5px;">MEETING</div>
          <div style="font-size: 28px; font-weight: 900; color: #ff9d00; line-height: 1.1;">${meetingNumber || '—'} ${meetingNumber ? spiritEmoji[meetingNumber] || '' : ''}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-weight: 500;">${meetingSpiritName || '—'}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${meetingNumber ? formatDaySlot(meetingDay, meetingSlot, meetingDate) : 'Next Draw'}</div>
          <div style="font-size: 10px; color: #58a6ff; margin-top: 4px; font-weight: 600;">${meetingNumber ? formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit) : '—'}</div>
        </div>
      </div>
      
      <!-- Diamond Grid -->
      <div style="
        width: 100%; 
        overflow: hidden; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        padding: 75px 0;
      ">
        <div style="
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          grid-template-rows: repeat(10, 1fr);
          width: 82vw;
          height: 82vw;
          max-width: 380px;
          max-height: 380px;
          transform: rotate(45deg);
        ">
          ${gridCellsHtml}
        </div>
      </div>
      
      <div style="font-size: 9px; color: #64748b; text-align: center; margin-top: 6px; padding-top: 8px; border-top: 1px solid rgba(88,166,255,0.15);">
        LEAVING highlighted in Blue • MEETING highlighted in Gold • CWG ©️
      </div>
    </div>
  `;
}

/////////END OF CHART PLAY MAPPING/////////

/////PLAYWHE CHART MAPPING MATRIX//////////
// ==========================================================================
// THE DEVELOPED CHART MAPPING GRID & CONTAINERS (NLCB TRACKER PLATFORM)
// ==========================================================================
function renderPlayWheChartMapping(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading chart mapping data...</div>';
  }
  
  // Sort weeks chronologically to extract current drawing state
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const todayIdx = now.getDay();
  const currWeekStart = new Date(currentWeek.startDate);
  const prevWeekStart = new Date(previousWeek.startDate);
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  // Dynamic lookup for LEAVING number
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        leavingNumber = draw;
        leavingDate = new Date(currWeekStart);
        leavingDate.setDate(currWeekStart.getDate() + d);
        leavingDay = dayNames[d];
        leavingSlot = slots[s];
        leavingDayIdx = d;
        leavingSlotIdx = s;
        break;
      }
    }
    if (leavingNumber) break;
  }
  
  // Dynamic lookup for MEETING number
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
    let nextDayIdx = leavingDayIdx;
    let nextSlotIdx = leavingSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = leavingDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      meetingNumber = getDraw(previousWeek, dayNames[nextDayIdx], slots[nextSlotIdx]);
      if (meetingNumber) {
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = new Date(prevWeekStart);
        meetingDate.setDate(prevWeekStart.getDate() + nextDayIdx);
      }
    }
  }
  
  const linesChart = {
    1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 5: [5, 14, 23, 32], 6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24, 34], 5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  };
  
  const spiritNames = {
    1: "Centipede", 2: "Old Lady", 3: "Carriage", 4: "Dead Man", 5: "Parson Man",
    6: "Belly", 7: "Hog", 8: "Tiger", 9: "Cattle", 10: "Monkey",
    11: "Corbeau", 12: "King", 13: "Crapaud", 14: "Money", 15: "Sick Woman",
    16: "Jamette", 17: "Pigeon", 18: "Water Boat", 19: "Horse", 20: "Dog",
    21: "Mouth", 22: "Rat", 23: "House", 24: "Queen", 25: "Morrocoy",
    26: "Fowl", 27: "Little Snake", 28: "Red Fish", 29: "Opium Man", 30: "House Cat",
    31: "Parson Wife", 32: "Shrimp", 33: "Spider", 34: "Blind Man", 35: "Big Snake", 36: "Donkey"
  };
  
  function getLineAndSuitForNumber(num) {
    if (!num) return { line: null, suit: null };
    let line = null, suit = null;
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(num)) { line = key; break; }
    }
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(num)) { suit = key; break; }
    }
    return { line, suit };
  }
  
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line}L` : "";
    const suitStr = suit !== null ? `${suit}S` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  const leavingLineSuit = getLineAndSuitForNumber(leavingNumber);
  const meetingLineSuit = getLineAndSuitForNumber(meetingNumber);
  const leavingSpiritName = leavingNumber ? spiritNames[leavingNumber] : null;
  const meetingSpiritName = meetingNumber ? spiritNames[meetingNumber] : null;

  // The Developed Chart Matrix - Exact structural transcription row-by-row
  const fullChartMatrix = [
    // Row 1
    [
      {n:1, bg:"#fbcfe8"}, {n:5, bg:"#fbcfe8"}, {n:2, bg:"#ffffff"}, {n:6, bg:"#ffffff"},
      {n:3, bg:"#fbcfe8"}, {n:7, bg:"#fbcfe8"}, {n:4, bg:"#ffffff"}, {n:8, bg:"#ffffff"},
      {n:5, bg:"#fbcfe8"}, {n:9, bg:"#fbcfe8"}, {n:6, bg:"#ffffff"}, {n:10, bg:"#ffffff"},
      {n:7, bg:"#fbcfe8"}, {n:11, bg:"#fbcfe8"}, {n:8, bg:"#ffffff"}, {n:12, bg:"#ffffff"},
      {n:9, bg:"#fbcfe8"}, {n:13, bg:"#fbcfe8"}
    ],
    // Row 2
    [
      {n:25, bg:"#fbcfe8"}, {n:18, bg:"#fbcfe8"}, {n:26, bg:"#ffffff"}, {n:19, bg:"#ffffff"},
      {n:27, bg:"#fbcfe8"}, {n:20, bg:"#fbcfe8"}, {n:28, bg:"#ffffff"}, {n:21, bg:"#ffffff"},
      {n:29, bg:"#fbcfe8"}, {n:22, bg:"#fbcfe8"}, {n:30, bg:"#ffffff"}, {n:23, bg:"#ffffff"},
      {n:31, bg:"#fbcfe8"}, {n:24, bg:"#fbcfe8"}, {n:32, bg:"#ffffff"}, {n:25, bg:"#ffffff"},
      {n:33, bg:"#fbcfe8"}, {n:26, bg:"#fbcfe8"}
    ],
    // Row 3
    [
      {n:10, bg:"#ffffff"}, {n:14, bg:"#ffffff"}, {n:11, bg:"#22d3ee"}, {n:15, bg:"#22d3ee"},
      {n:12, bg:"#ffffff"}, {n:16, bg:"#ffffff"}, {n:13, bg:"#22d3ee"}, {n:17, bg:"#22d3ee"},
      {n:14, bg:"#ffffff"}, {n:18, bg:"#ffffff"}, {n:15, bg:"#22d3ee"}, {n:19, bg:"#22d3ee"},
      {n:16, bg:"#ffffff"}, {n:20, bg:"#ffffff"}, {n:17, bg:"#22d3ee"}, {n:21, bg:"#22d3ee"},
      {n:18, bg:"#ffffff"}, {n:22, bg:"#ffffff"}
    ],
    // Row 4
    [
      {n:34, bg:"#ffffff"}, {n:27, bg:"#ffffff"}, {n:35, bg:"#22d3ee"}, {n:28, bg:"#22d3ee"},
      {n:36, bg:"#ffffff"}, {n:29, bg:"#ffffff"}, {n:1, bg:"#22d3ee"}, {n:30, bg:"#22d3ee"},
      {n:2, bg:"#ffffff"}, {n:31, bg:"#ffffff"}, {n:3, bg:"#22d3ee"}, {n:32, bg:"#22d3ee"},
      {n:4, bg:"#ffffff"}, {n:33, bg:"#ffffff"}, {n:5, bg:"#22d3ee"}, {n:34, bg:"#22d3ee"},
      {n:6, bg:"#ffffff"}, {n:35, bg:"#ffffff"}
    ],
    // Row 5
    [
      {n:19, bg:"#facc15"}, {n:23, bg:"#facc15"}, {n:20, bg:"#ffffff"}, {n:24, bg:"#ffffff"},
      {n:21, bg:"#facc15"}, {n:25, bg:"#facc15"}, {n:22, bg:"#ffffff"}, {n:26, bg:"#ffffff"},
      {n:23, bg:"#facc15"}, {n:27, bg:"#facc15"}, {n:24, bg:"#ffffff"}, {n:28, bg:"#ffffff"},
      {n:25, bg:"#facc15"}, {n:29, bg:"#facc15"}, {n:26, bg:"#ffffff"}, {n:30, bg:"#ffffff"},
      {n:27, bg:"#facc15"}, {n:31, bg:"#facc15"}
    ],
    // Row 6
    [
      {n:7, bg:"#facc15"}, {n:36, bg:"#facc15"}, {n:8, bg:"#ffffff"}, {n:1, bg:"#ffffff"},
      {n:9, bg:"#facc15"}, {n:2, bg:"#facc15"}, {n:10, bg:"#ffffff"}, {n:3, bg:"#ffffff"},
      {n:11, bg:"#facc15"}, {n:4, bg:"#facc15"}, {n:12, bg:"#ffffff"}, {n:5, bg:"#ffffff"},
      {n:13, bg:"#facc15"}, {n:6, bg:"#facc15"}, {n:14, bg:"#ffffff"}, {n:7, bg:"#ffffff"},
      {n:15, bg:"#facc15"}, {n:8, bg:"#facc15"}
    ],
    // Row 7
    [
      {n:28, bg:"#ffffff"}, {n:32, bg:"#ffffff"}, {n:29, bg:"#4ade80"}, {n:33, bg:"#4ade80"},
      {n:30, bg:"#ffffff"}, {n:34, bg:"#ffffff"}, {n:31, bg:"#4ade80"}, {n:35, bg:"#4ade80"},
      {n:32, bg:"#ffffff"}, {n:36, bg:"#ffffff"}, {n:33, bg:"#4ade80"}, {n:1, bg:"#4ade80"},
      {n:34, bg:"#ffffff"}, {n:2, bg:"#ffffff"}, {n:35, bg:"#4ade80"}, {n:36, bg:"#4ade80"},
      {n:36, bg:"#ffffff"}, {n:4, bg:"#ffffff"}
    ],
    // Row 8
    [
      {n:16, bg:"#ffffff"}, {n:9, bg:"#ffffff"}, {n:17, bg:"#4ade80"}, {n:10, bg:"#4ade80"},
      {n:18, bg:"#ffffff"}, {n:11, bg:"#ffffff"}, {n:19, bg:"#4ade80"}, {n:12, bg:"#4ade80"},
      {n:20, bg:"#ffffff"}, {n:13, bg:"#ffffff"}, {n:21, bg:"#4ade80"}, {n:14, bg:"#4ade80"},
      {n:22, bg:"#ffffff"}, {n:15, bg:"#ffffff"}, {n:23, bg:"#4ade80"}, {n:16, bg:"#4ade80"},
      {n:24, bg:"#ffffff"}, {n:17, bg:"#ffffff"}
    ]
  ];

  let rowsHtml = "";
  for (let r = 0; r < fullChartMatrix.length; r++) {
    rowsHtml += "<tr>";
    for (let c = 0; c < fullChartMatrix[r].length; c++) {
      let cell = fullChartMatrix[r][c];
      let isLeaving = (cell.n === leavingNumber);
      let isMeeting = (cell.n === meetingNumber);
      
      let borderStyle = "border: 1px solid #000000;";
      let extraClass = "";
      let runtimeBg = cell.bg;
      let fontColor = "#000000";

      // Apply highlighting layers gracefully over native map colors
      if (isLeaving) {
        runtimeBg = "#00f2ff";
        borderStyle = "border: 2px solid #000000; box-shadow: inset 0 0 4px #000;";
        extraClass = "animation-pulse";
      } else if (isMeeting) {
        runtimeBg = "#ff453a";
        borderStyle = "border: 2px solid #ffffff;";
        fontColor = "#ffffff";
      }

      rowsHtml += `<td class="${extraClass}" style="background: ${runtimeBg}; color: ${fontColor}; font-size: 13px; font-weight: 900; padding: 7px 2px; ${borderStyle} text-align: center; width: 5.55%;">
        ${cell.n}
      </td>`;
    }
    rowsHtml += "</tr>";
  }

  function formatDaySlot(day, slot, date) {
    if (!day || !slot) return "—";
    return `${day.slice(0,3).toUpperCase()} ${date ? date.getDate() : ''} • ${slot}`;
  }

  return `
  <div class="table-wrapper" style="margin-bottom: 15px; background: var(--card); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
    <div class="table-header" style="background: #0f172a; padding: 12px; font-size: 14px; font-weight: 900; color: #ff9d00; text-align: center; display: block; border-bottom: 1px solid rgba(255,255,255,0.1); letter-spacing: 0.5px;">
      THE PLAY WHE CHART MAPPING MATRIX
    </div>
    
    <div style="display: flex; gap: 8px; padding: 10px; background: rgba(0,0,0,0.2);">
      <div style="flex: 1; background: rgba(0, 242, 255, 0.1); border-radius: 8px; padding: 8px; text-align: center; border-left: 4px solid #00f2ff;">
        <div style="font-size: 10px; color: #00f2ff; font-weight: bold; letter-spacing: 0.5px;">LEAVING</div>
        <div style="font-size: 20px; font-weight: 900; color: #00f2ff; line-height: 1.2;">${leavingNumber || '—'}</div>
        <div style="font-size: 9px; color: var(--text-main); font-weight: 600;">${leavingSpiritName || '—'}</div>
        <div style="font-size: 8px; color: var(--text-dim);">${formatDaySlot(leavingDay, leavingSlot, leavingDate)}</div>
        <div style="font-size: 9px; color: #ff9d00; font-weight: bold; margin-top: 2px;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
      </div>
      
      <div style="flex: 1; background: rgba(255, 69, 58, 0.1); border-radius: 8px; padding: 8px; text-align: center; border-left: 4px solid #ff453a;">
        <div style="font-size: 10px; color: #ff453a; font-weight: bold; letter-spacing: 0.5px;">MEETING</div>
        <div style="font-size: 20px; font-weight: 900; color: #ff453a; line-height: 1.2;">${meetingNumber || '—'}</div>
        <div style="font-size: 9px; color: var(--text-main); font-weight: 600;">${meetingSpiritName || '—'}</div>
        <div style="font-size: 8px; color: var(--text-dim);">${meetingNumber ? formatDaySlot(meetingDay, meetingSlot, meetingDate) : 'Next Draw Slot'}</div>
        <div style="font-size: 9px; color: #00f2ff; font-weight: bold; margin-top: 2px;">${meetingNumber ? formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit) : '—'}</div>
      </div>
    </div>

    <div style="width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 8px 4px; background: #ffffff;">
      <table style="width: 100%; min-width: 660px; border-collapse: collapse; table-layout: fixed; margin: 0 auto;">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    
    <div style="font-size: 9px; color: var(--text-dim); text-align: center; padding: 6px; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.05);">
      ⚡ Cyan Target = LEAVING • Red Target = MEETING • CWG ©️ CodeWithGlasgow
    </div>
  </div>
  `;
}

///END OF PLAYWHE CHART MAPPING MATRIX///

/////////////SAGi INSIGHT 2.0//////////////
// =========================================
// CHART PLAY ANALYSIS - Complete Table View with Confidence
// =========================================
function generateChartPlayAnalysis(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="chart-play-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading chart data...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const slotDisplay = { MOR: "🌅 Morning", MID: "☀️ Midday", NON: "🌤️ Afternoon", EVE: "🌙 Evening" };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  const currWeekStart = new Date(currentWeek.startDate);
  const prevWeekStart = new Date(previousWeek.startDate);
  const todayIdx = now.getDay();
  
  // Build timeline for cycle tracking
  const timeline = [];
  sortedWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    week.days.forEach(day => {
      const dayOffset = dayNames.indexOf(day.dayName);
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + dayOffset);
      if (drawDate <= now) {
        slots.forEach(slot => {
          const dayData = week.days.find(d => d.dayName === day.dayName);
          if (dayData) {
            const val = dayData.draws[slot];
            if (val && val !== "-" && val !== "PENDING") {
              timeline.push({ num: parseInt(val, 10), date: drawDate });
            }
          }
        });
      }
    });
  });
  
  // Calculate cycle counts for confidence
  const totalDraws = timeline.length;
  const gaps = {};
  for (let n = 1; n <= 36; n++) {
    let lastIndex = -1;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].num === n) {
        lastIndex = i;
        break;
      }
    }
    gaps[n] = lastIndex === -1 ? totalDraws : (totalDraws - 1) - lastIndex;
  }
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  function formatShortDate(date) {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(/,/g, '');
  }
  
  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // ========== CHART DEFINITIONS ==========
  
  const chart16 = {
    1: [1, 16, 29], 2: [2, 17, 30], 3: [3, 18, 31], 4: [4, 19, 32],
    5: [5, 20, 33], 6: [6, 21, 34], 7: [7, 22, 35], 8: [8, 23, 36],
    9: [9, 24, 1], 10: [10, 25, 2], 11: [11, 26, 3], 12: [12, 27, 4],
    13: [13, 28, 5], 14: [14, 29, 6], 15: [15, 30, 7], 16: [16, 31, 8],
    17: [17, 32, 9], 18: [18, 33, 10], 19: [19, 34, 11], 20: [20, 35, 12],
    21: [21, 36, 13], 22: [22, 1, 14], 23: [23, 2, 15], 24: [24, 3, 16],
    25: [25, 4, 17], 26: [26, 5, 18], 27: [27, 6, 19], 28: [28, 7, 20],
    29: [29, 8, 21], 30: [30, 9, 22], 31: [31, 10, 23], 32: [32, 11, 24],
    33: [33, 12, 25], 34: [34, 13, 26], 35: [35, 14, 27], 36: [36, 15, 28]
  };
  
  const chart8 = {
    1: [1, 8, 25], 2: [2, 9, 26], 3: [3, 10, 27], 4: [4, 11, 28],
    5: [5, 12, 29], 6: [6, 13, 30], 7: [7, 14, 31], 8: [8, 15, 32],
    9: [9, 16, 33], 10: [10, 17, 34], 11: [11, 18, 35], 12: [12, 19, 36],
    13: [13, 20, 1], 14: [14, 21, 2], 15: [15, 22, 3], 16: [16, 23, 4],
    17: [17, 24, 5], 18: [18, 25, 6], 19: [19, 26, 7], 20: [20, 27, 8],
    21: [21, 28, 9], 22: [22, 29, 10], 23: [23, 30, 11], 24: [24, 31, 12],
    25: [25, 32, 13], 26: [26, 33, 14], 27: [27, 34, 15], 28: [28, 35, 16],
    29: [29, 36, 17], 30: [30, 1, 18], 31: [31, 2, 19], 32: [32, 3, 20],
    33: [33, 4, 21], 34: [34, 5, 22], 35: [35, 6, 23], 36: [36, 7, 24]
  };
  
  const chart7 = {
    1: [1, 13, 25, 31], 2: [2, 14, 26, 32], 3: [3, 15, 27, 33],
    4: [4, 16, 28, 34], 5: [5, 17, 29, 35], 6: [6, 18, 30, 36],
    7: [7, 19, 13], 8: [8, 20, 14], 9: [9, 21, 15], 10: [10, 22, 16],
    11: [11, 23, 17], 12: [12, 24, 18], 13: [13, 19, 7], 14: [14, 20, 8],
    15: [15, 21, 9], 16: [16, 22, 10], 17: [17, 23, 11], 18: [18, 24, 12],
    19: [19, 25, 7], 20: [20, 26, 8], 21: [21, 27, 9], 22: [22, 28, 10],
    23: [23, 29, 11], 24: [24, 30, 12], 25: [25, 31, 13], 26: [26, 32, 14],
    27: [27, 33, 15], 28: [28, 34, 16], 29: [29, 35, 17], 30: [30, 36, 18],
    31: [31, 13, 25], 32: [32, 14, 26], 33: [33, 15, 27], 34: [34, 16, 28],
    35: [35, 17, 29], 36: [36, 18, 30]
  };
  
  const linesChart = {
    1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 5: [5, 14, 23, 32], 6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 8: [8, 17, 26, 35], 9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 1: [1, 11, 21, 31], 2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 4: [4, 14, 24, 34], 5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 7: [7, 17, 27], 8: [8, 18, 28], 9: [9, 19, 29]
  };
  
  // ========== FIND CURRENT POSITION ==========
  let lastPlayedNumber = null;
  let lastPlayedDate = null;
  let lastPlayedDay = null;
  let lastPlayedSlot = null;
  let lastPlayedDayIdx = -1;
  let lastPlayedSlotIdx = -1;
  
  for (let d = todayIdx; d >= 0; d--) {
    for (let s = slots.length - 1; s >= 0; s--) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        lastPlayedNumber = draw;
        lastPlayedDate = new Date(currWeekStart);
        lastPlayedDate.setDate(currWeekStart.getDate() + d);
        lastPlayedDay = dayNames[d];
        lastPlayedSlot = slots[s];
        lastPlayedDayIdx = d;
        lastPlayedSlotIdx = s;
        break;
      }
    }
    if (lastPlayedNumber) break;
  }
  
  // ======== FIND MEETING NUMBER =======
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  
  if (lastPlayedDayIdx !== -1 && lastPlayedSlotIdx !== -1) {
    let nextDayIdx = lastPlayedDayIdx;
    let nextSlotIdx = lastPlayedSlotIdx + 1;
    
    if (nextSlotIdx >= slots.length) {
      nextSlotIdx = 0;
      nextDayIdx = lastPlayedDayIdx + 1;
    }
    
    if (nextDayIdx >= dayNames.length) {
      nextDayIdx = 0;
    }
    
    if (nextDayIdx < dayNames.length) {
      meetingNumber = getDraw(previousWeek, dayNames[nextDayIdx], slots[nextSlotIdx]);
      if (meetingNumber) {
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = new Date(prevWeekStart);
        meetingDate.setDate(prevWeekStart.getDate() + nextDayIdx);
      }
    }
  }
  
  // Get Line and Suit for a number
  function getLineAndSuit(number) {
    let line = null;
    let suit = null;
    for (let [key, group] of Object.entries(linesChart)) {
      if (group.includes(number)) {
        line = key;
        break;
      }
    }
    for (let [key, group] of Object.entries(suitsChart)) {
      if (group.includes(number)) {
        suit = key;
        break;
      }
    }
    return { line, suit };
  }
  
  // Get the actual numbers in a chart group for a given number
  function getChartNumbers(number, chart) {
    for (let [key, group] of Object.entries(chart)) {
      if (group.includes(number)) {
        return group.filter(n => n !== number);
      }
    }
    return [];
  }
  
  // Calculate confidence based on cycle count and gap (0-100%)
  function calculateConfidence(number) {
    const gap = gaps[number] || 0;
    const avgCycle = totalDraws / 36;
    let confidence = Math.min(Math.round((gap / avgCycle) * 100), 100);
    if (confidence < 5) confidence = 5;
    return confidence;
  }
  
  // Get confidence level (low, mid, high)
  function getConfidenceLevel(confidence) {
    if (confidence <= 33) return { text: "LOW", color: "#ff453a" };
    if (confidence <= 66) return { text: "MID", color: "#ff9f0a" };
    return { text: "HIGH", color: "#32d74b" };
  }
  
  function formatNumberWithConfidence(num) {
    const confidence = calculateConfidence(num);
    const level = getConfidenceLevel(confidence);
    return `
      <div style="display: inline-block; text-align: center; margin: 0 4px;">
        <div style="font-size: 16px; font-weight: bold;">${num}${spiritEmoji[num] || ''}</div>
        <div style="width: 40px; height: 4px; background: #333; border-radius: 2px; overflow: hidden; margin: 2px 0;">
          <div style="width: ${confidence}%; height: 100%; background: ${level.color};"></div>
        </div>
        <div style="font-size: 8px; color: ${level.color};">${level.text}</div>
      </div>
    `;
  }
  
  // Build the HTML
  let chartPlayHtml = '';
  
  if (lastPlayedNumber) {
    const lastPlayedFormatted = formatShortDate(lastPlayedDate);
    const meetingFormatted = meetingDate ? formatShortDate(meetingDate) : "Pending";
    const leavingLineSuit = getLineAndSuit(lastPlayedNumber);
    const meetingLineSuit = meetingNumber ? getLineAndSuit(meetingNumber) : null;
    const leavingNumbers = {
      chart16: getChartNumbers(lastPlayedNumber, chart16),
      chart8: getChartNumbers(lastPlayedNumber, chart8),
      chart7: getChartNumbers(lastPlayedNumber, chart7)
    };
    const meetingNumbers = meetingNumber ? {
      chart16: getChartNumbers(meetingNumber, chart16),
      chart8: getChartNumbers(meetingNumber, chart8),
      chart7: getChartNumbers(meetingNumber, chart7)
    } : null;
    
    chartPlayHtml = `
      <div class="chart-play-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff;">
        <div style="font-size: 14px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">📐 CHART PLAY ANALYSIS</div>
        
        <!-- Leaving and Meeting Summary -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="flex: 1; background: rgba(88,166,255,0.15); border-radius: 12px; padding: 8px; text-align: center;">
            <div style="font-size: 10px; color: #58a6ff;">📫 LEAVING</div>
            <div style="font-size: 24px; font-weight: 900; color: #58a6ff;">${lastPlayedNumber}${spiritEmoji[lastPlayedNumber] || ''}</div>
            <div style="font-size: 10px;">${lastPlayedDay} ${slotDisplay[lastPlayedSlot]}<br>${lastPlayedFormatted}</div>
            <div style="font-size: 11px; margin-top: 4px;">${leavingLineSuit.line} Line / ${leavingLineSuit.suit} Suit</div>
          </div>
          ${meetingNumber ? `
          <div style="flex: 1; background: rgba(255,157,0,0.15); border-radius: 12px; padding: 8px; text-align: center;">
            <div style="font-size: 10px; color: #ff9d00;">📭 MEETING</div>
            <div style="font-size: 24px; font-weight: 900; color: #ff9d00;">${meetingNumber}${spiritEmoji[meetingNumber] || ''}</div>
            <div style="font-size: 10px;">${meetingDay} ${slotDisplay[meetingSlot]}<br>${meetingFormatted}</div>
            <div style="font-size: 11px; margin-top: 4px;">${meetingLineSuit.line} Line / ${meetingLineSuit.suit} Suit</div>
          </div>
          ` : ''}
        </div>
        
        <!-- Chart Tables -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: rgba(88,166,255,0.2); border-bottom: 2px solid #58a6ff;">
                <th style="padding: 4px; text-align: center;">&nbsp;</th>
                <th style="padding: 4px; text-align: center;">1/16 Chart</th>
                <th style="padding: 4px; text-align: center;">1/8 Chart</th>
                <th style="padding: 4px; text-align: center;">1/7 Chart</th>
              </tr>
            </thead>
            <tbody>
              <!-- LEAVING ROW -->
              <tr style="border-bottom: 1px solid rgba(88,166,255,0.2);">
                <td style="padding: 4px; text-align: center; font-weight: bold; color: #58a6ff;">📫</td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${leavingNumbers.chart16.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${leavingNumbers.chart8.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${leavingNumbers.chart7.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
              </tr>
              ${meetingNumber ? `
              <!-- MEETING ROW -->
              <tr style="border-bottom: 1px solid rgba(255,157,0,0.2);">
                <td style="padding: 4px; text-align: center; font-weight: bold; color: #ff9d00;">📭</td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${meetingNumbers.chart16.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${meetingNumbers.chart8.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
                <td style="padding: 4px; text-align: center;">
                  <div style="display: flex; flex-wrap: nowrap; justify-content: center; gap: 3px;">
                    ${meetingNumbers.chart7.map(n => formatNumberWithConfidence(n)).join('')}
                  </div>
                </td>
              </tr>
              ` : `
              <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: #888;">⏳ No meeting number available yet - waiting for next draw</td>
              </table>
              `}
            </tbody>
          </table>
        </div>
        
        <div style="font-size: 8px; color: #555; text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(88,166,255,0.2);">
          Confidence: <span style="color:#ff453a;">LOW (0-33%)</span> • <span style="color:#ff9f0a;">MID (34-66%)</span> • <span style="color:#32d74b;">HIGH (67-100%)</span>
        </div>
      </div>
    `;
  } else {
    chartPlayHtml = `
      <div class="chart-play-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        📐 No draws yet this week to analyze
      </div>
    `;
  }
  
  return chartPlayHtml;
}
////////End of SAGi INSIGHT 2.0//////////

/////////////SAGi INSIGHT 1.0//////////////
// =======================================
// ADVANCED PLAY WHE ANALYSIS (HOT/COLD, DUE NUMBERS, PARTNERS, TRENDS, PREDICTIONS)
// =======================================
function renderAdvancedAnalysis(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="text-align:center; padding:40px; color:#888;">Loading advanced analysis...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  // Build timeline for analysis
  const timeline = [];
  sortedWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    week.days.forEach((day, idx) => {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + idx);
      if (drawDate <= now) {
        slots.forEach(slot => {
          const draw = getDraw(week, day.dayName, slot);
          if (draw) {
            timeline.push({ num: draw, date: drawDate, day: day.dayName, slot: slot });
          }
        });
      }
    });
  });
  
  timeline.sort((a, b) => a.date - b.date);
  
  // Calculate frequencies for different periods
  const last7Days = [];
  const last14Days = [];
  const last21Days = [];
  const last30Days = [];
  const cutoff7 = new Date(); cutoff7.setDate(now.getDate() - 7);
  const cutoff14 = new Date(); cutoff14.setDate(now.getDate() - 14);
  const cutoff21 = new Date(); cutoff21.setDate(now.getDate() - 21);
  const cutoff30 = new Date(); cutoff30.setDate(now.getDate() - 30);
  
  timeline.forEach(draw => {
    if (draw.date >= cutoff7) last7Days.push(draw.num);
    if (draw.date >= cutoff14) last14Days.push(draw.num);
    if (draw.date >= cutoff21) last21Days.push(draw.num);
    if (draw.date >= cutoff30) last30Days.push(draw.num);
  });
  
  function getFrequencyCounts(arr) {
    const counts = {};
    for (let i = 1; i <= 36; i++) counts[i] = 0;
    arr.forEach(num => counts[num]++);
    return counts;
  }
  
  const freq7 = getFrequencyCounts(last7Days);
  const freq14 = getFrequencyCounts(last14Days);
  const freq21 = getFrequencyCounts(last21Days);
  const freq30 = getFrequencyCounts(last30Days);
  
  // HOT NUMBERS (most frequent in last 7 days)
  const hotNumbers = Object.entries(freq7)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([num, count]) => ({ num: parseInt(num), count }));
  
  // COLD NUMBERS (least frequent in last 30 days)
  const coldNumbers = Object.entries(freq30)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(([num, count]) => ({ num: parseInt(num), count }));
  
  // DUE NUMBERS (based on average gap)
  const numberGaps = {};
  const lastPlayed = {};
  for (let n = 1; n <= 36; n++) {
    let lastIndex = -1;
    for (let i = timeline.length - 1; i >= 0; i--) {
      if (timeline[i].num === n) {
        lastIndex = i;
        break;
      }
    }
    const drawsSince = lastIndex === -1 ? timeline.length : (timeline.length - 1) - lastIndex;
    lastPlayed[n] = lastIndex === -1 ? null : timeline[lastIndex].date;
    
    // Calculate average gap
    let positions = [];
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].num === n) positions.push(i);
    }
    let avgGap = 14; // default
    if (positions.length >= 2) {
      let totalGap = 0;
      for (let i = 1; i < positions.length; i++) {
        totalGap += positions[i] - positions[i-1];
      }
      avgGap = Math.round(totalGap / (positions.length - 1));
    }
    numberGaps[n] = { drawsSince, avgGap, lastDate: lastPlayed[n] };
  }
  
  const dueNumbers = Object.entries(numberGaps)
    .filter(([_, data]) => data.drawsSince > data.avgGap)
    .sort((a, b) => (b[1].drawsSince / b[1].avgGap) - (a[1].drawsSince / a[1].avgGap))
    .slice(0, 10)
    .map(([num, data]) => ({ num: parseInt(num), drawsSince: data.drawsSince, avgGap: data.avgGap }));
  
  // Partner & Spirit mapping from the book
  const partners = {
    1: 36, 2: 35, 3: 34, 4: 33, 5: 32, 6: 31, 7: 30, 8: 29, 9: 28,
    10: 27, 11: 26, 12: 25, 13: 24, 14: 23, 15: 22, 16: 21, 17: 20, 18: 19,
    19: 18, 20: 17, 21: 16, 22: 15, 23: 14, 24: 13, 25: 12, 26: 11, 27: 10,
    28: 9, 29: 8, 30: 7, 31: 6, 32: 5, 33: 4, 34: 3, 35: 2, 36: 1
  };
  
  const spirits = {
    1: 16, 2: 24, 3: 19, 4: 3, 5: 1, 6: 15, 7: 13, 8: 29, 9: 33,
    10: 28, 11: 11, 12: 32, 13: 7, 14: 25, 15: 9, 16: 17, 17: 18, 18: 30,
    19: 5, 20: 22, 21: 23, 22: 20, 23: 21, 24: 2, 25: 14, 26: 27, 27: 16,
    28: 10, 29: 4, 30: 12, 31: 34, 32: 8, 33: 26, 34: 31, 35: 4, 36: 11
  };
  
  // Get recent draws for partner suggestions
  const recentDraws = timeline.slice(-5).map(d => d.num);
  const uniqueRecent = [...new Set(recentDraws)];
  
  const suggestions = [];
  uniqueRecent.forEach(num => {
    if (partners[num]) suggestions.push({ num: partners[num], reason: `Partner of ${num}` });
    if (spirits[num]) suggestions.push({ num: spirits[num], reason: `Spirit of ${num}` });
  });
  const uniqueSuggestions = [...new Map(suggestions.map(s => [s.num, s])).values()].slice(0, 8);
  
  // Line/Suite trends
  const lines = {
    1: [1,10,19,28], 2: [2,11,20,29], 3: [3,12,21,30],
    4: [4,13,22,31], 5: [5,14,23,32], 6: [6,15,24,33],
    7: [7,16,25,34], 8: [8,17,26,35], 9: [9,18,27,36]
  };
  
  const suites = {
    0: [10,20,30], 1: [1,11,21,31], 2: [2,12,22,32],
    3: [3,13,23,33], 4: [4,14,24,34], 5: [5,15,25,35],
    6: [6,16,26,36], 7: [7,17,27], 8: [8,18,28], 9: [9,19,29]
  };
  
  // Track line/suite performance this week
  const currentWeekDraws = [];
  for (let d = 0; d <= now.getDay(); d++) {
    slots.forEach(slot => {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    });
  }
  
  const lineHits = {};
  const suiteHits = {};
  for (let l = 1; l <= 9; l++) {
    lineHits[l] = lines[l].filter(n => currentWeekDraws.includes(n)).length;
  }
  for (let s = 0; s <= 9; s++) {
    suiteHits[s] = suites[s].filter(n => currentWeekDraws.includes(n)).length;
  }
  
  const hotLines = Object.entries(lineHits).filter(([_, hits]) => hits >= 2).map(([line, hits]) => ({ line: parseInt(line), hits }));
  const sleepingLines = Object.entries(lineHits).filter(([_, hits]) => hits === 0).map(([line, hits]) => ({ line: parseInt(line), hits }));
  const hotSuites = Object.entries(suiteHits).filter(([_, hits]) => hits >= 2).map(([suite, hits]) => ({ suite: parseInt(suite), hits }));
  const sleepingSuites = Object.entries(suiteHits).filter(([_, hits]) => hits === 0).map(([suite, hits]) => ({ suite: parseInt(suite), hits }));
  
  // Kiss numbers (pairs that frequently play together)
  const kissNumbers = {
    "1 & 36": "Centipede & Donkey",
    "2 & 35": "Old Lady & Big Snake",
    "3 & 34": "Carriage & Blind Man",
    "4 & 33": "Dead Man & Spider",
    "5 & 32": "Parson Man & Shrimp",
    "11 & 26": "Corbeau & Fowl",
    "12 & 25": "King & Morocoy",
    "13 & 24": "Crapaud & Queen",
    "14 & 23": "Money & House"
  };
  
  // Prediction engine
  const predictions = [];
  
  // Add due numbers
  dueNumbers.slice(0, 3).forEach(d => {
    predictions.push({ num: d.num, reason: `Due (${d.drawsSince} draws, avg ${d.avgGap})` });
  });
  
  // Add hot numbers
  hotNumbers.slice(0, 2).forEach(h => {
    if (!predictions.find(p => p.num === h.num)) {
      predictions.push({ num: h.num, reason: `Hot (${h.count}x in 7 days)` });
    }
  });
  
  // Add partner suggestions
  uniqueSuggestions.slice(0, 2).forEach(s => {
    if (!predictions.find(p => p.num === s.num)) {
      predictions.push({ num: s.num, reason: s.reason });
    }
  });
  
  // Spirit emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "💀⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐯", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  function formatNumber(num) {
    return `${num}${spiritEmoji[num] || ''}`;
  }
  
  function formatList(arr, formatter) {
    if (!arr || arr.length === 0) return "None";
    return arr.map(formatter).join(", ");
  }
  
  // Dream interpretation dictionary
  const dreamMeanings = {
    "snake": [27, 35, 1, 5],
    "money": [14, 30, 33, 34], 
    "death": [4, 3, 35],
    "baby": [10, 13, 6], 
    "wedding": [31, 24, 12], 
    "school": [23, 5, 26],
    "hospital": [15, 7, 12], 
    "police": [20, 11], 
    "fire": [25, 4, 13],
    "water": [18, 21, 27], 
    "road": [35, 27, 3], 
    "bird": [11, 17, 26, 28],
    "cat": [30, 21], 
    "dog": [20, 8], 
    "fish": [28, 18]
  };
  
  return `
    <div style="margin-top: 15px;">
      <!-- Section 1: HOT & COLD NUMBERS -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; border: 1px solid #ff4444;">
          <div style="font-size: 12px; font-weight: bold; color: #ff4444; margin-bottom: 8px;">🔥 HOT NUMBERS (Last 7 Days)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${hotNumbers.map(h => `<span style="background: #ff4444; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold;">${formatNumber(h.num)} (${h.count}x)</span>`).join('')}
            ${hotNumbers.length === 0 ? '<span style="color: #888;">No hot numbers</span>' : ''}
          </div>
        </div>
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; border: 1px solid #00aaff;">
          <div style="font-size: 12px; font-weight: bold; color: #00aaff; margin-bottom: 8px;">❄️ COLD NUMBERS (Last 30 Days)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${coldNumbers.map(c => `<span style="background: #00aaff; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold;">${formatNumber(c.num)} (${c.count}x)</span>`).join('')}
            ${coldNumbers.length === 0 ? '<span style="color: #888;">No cold numbers</span>' : ''}
          </div>
        </div>
      </div>
      
      <!-- Section 2: DUE NUMBERS -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; margin-bottom: 15px; border: 1px solid #ff9d00;">
        <div style="font-size: 12px; font-weight: bold; color: #ff9d00; margin-bottom: 8px;">⏰ DUE NUMBERS (Exceeding Average Gap)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${dueNumbers.map(d => `<span style="background: #ff9d00; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold;">${formatNumber(d.num)} (${d.drawsSince}d, avg ${d.avgGap}d)</span>`).join('')}
          ${dueNumbers.length === 0 ? '<span style="color: #888;">No due numbers</span>' : ''}
        </div>
      </div>
      
      <!-- Section 3: PARTNER & SPIRIT SUGGESTIONS -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; margin-bottom: 15px; border: 1px solid #aa44ff;">
        <div style="font-size: 12px; font-weight: bold; color: #aa44ff; margin-bottom: 8px;">🤝 PARTNER & SPIRIT SUGGESTIONS</div>
        <div style="margin-bottom: 8px;">
          <div style="font-size: 10px; color: #888; margin-bottom: 5px;">Recent draws: ${recentDraws.slice(-3).map(n => formatNumber(n)).join(', ')}</div>
          <div class="suggestion-list" style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${uniqueSuggestions.map(s => `<span style="background: #aa44ff; color: white; padding: 4px 10px; border-radius: 20px; font-weight: bold;">${formatNumber(s.num)} (${s.reason})</span>`).join('')}
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div style="font-size: 11px; font-weight: bold; color: #aa44ff;">💋 KISS NUMBERS (Frequent Pairs)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
            ${Object.entries(kissNumbers).slice(0, 6).map(([pair, name]) => `<span style="background: rgba(170,68,255,0.3); padding: 3px 8px; border-radius: 15px; font-size: 10px;">${pair} (${name.substring(0, 15)}...)</span>`).join('')}
          </div>
        </div>
      </div>
      
      <!-- Section 4: LINE & SUITE TRENDS -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px;">
          <div style="font-size: 12px; font-weight: bold; color: #32cd32; margin-bottom: 8px;">📊 LINE TRENDS</div>
          ${hotLines.length > 0 ? `<div style="margin-bottom: 6px;"><span style="color: #32cd32;">🔥 Hot:</span> ${hotLines.map(l => `Line ${l.line} (${l.hits}x)`).join(', ')}</div>` : ''}
          ${sleepingLines.length > 0 ? `<div><span style="color: #ff6b6b;">💤 Sleeping:</span> ${sleepingLines.map(l => `Line ${l.line}`).join(', ')}</div>` : ''}
          ${hotLines.length === 0 && sleepingLines.length === 0 ? '<span style="color: #888;">No line trends</span>' : ''}
        </div>
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px;">
          <div style="font-size: 12px; font-weight: bold; color: #32cd32; margin-bottom: 8px;">🎯 SUITE TRENDS</div>
          ${hotSuites.length > 0 ? `<div style="margin-bottom: 6px;"><span style="color: #32cd32;">🔥 Hot:</span> ${hotSuites.map(s => `Suite ${s.suite} (${s.hits}x)`).join(', ')}</div>` : ''}
          ${sleepingSuites.length > 0 ? `<div><span style="color: #ff6b6b;">💤 Sleeping:</span> ${sleepingSuites.map(s => `Suite ${s.suite}`).join(', ')}</div>` : ''}
          ${hotSuites.length === 0 && sleepingSuites.length === 0 ? '<span style="color: #888;">No suite trends</span>' : ''}
        </div>
      </div>
      
      <!-- Section 5: PREDICTION ENGINE -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; margin-bottom: 15px; border: 2px solid #ff9d00;">
        <div style="font-size: 12px; font-weight: bold; color: #ff9d00; margin-bottom: 8px;">🔮 PREDICTION ENGINE (Next 3 Draws)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
          ${predictions.slice(0, 5).map((p, idx) => `
            <div style="text-align: center;">
              <div style="width: 55px; height: 55px; background: linear-gradient(135deg, #ff9d00, #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 24px; font-weight: bold; color: #000;">${p.num}</span>
              </div>
              <div style="font-size: 9px; margin-top: 5px; color: #aaa; max-width: 70px;">${p.reason.substring(0, 20)}${p.reason.length > 20 ? '...' : ''}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 10px; color: #888; text-align: center; margin-top: 10px;">Based on due numbers, hot streaks, and partner/spirit relationships</div>
      </div>
      
      <!-- Section 6: DREAM INTERPRETATION DICTIONARY -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px; margin-bottom: 15px;">
        <div style="font-size: 12px; font-weight: bold; color: #ff69b4; margin-bottom: 8px;">💭 DREAM INTERPRETATION</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px;">
          ${Object.entries(dreamMeanings).slice(0, 12).map(([dream, nums]) => `
            <div style="background: rgba(255,105,180,0.1); border-radius: 10px; padding: 5px 8px;">
              <span style="font-weight: bold; color: #ff69b4;">${dream.charAt(0).toUpperCase() + dream.slice(1)}</span>
              <span style="color: #ccc; margin-left: 5px; font-size: 10px;">${nums.map(n => formatNumber(n)).join(', ')}</span>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 9px; color: #888; text-align: center; margin-top: 8px;">"Record your dreams and match them to these symbols"</div>
      </div>
      
      <!-- Section 7: WEEKLY SUMMARY -->
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 16px; padding: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: #00ffff; margin-bottom: 8px;">📋 WEEKLY SUMMARY</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div>
            <div style="font-size: 10px; color: #888;">Total draws this week:</div>
            <div style="font-size: 16px; font-weight: bold;">${currentWeekDraws.length}/28</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #888;">Unique numbers played:</div>
            <div style="font-size: 16px; font-weight: bold;">${new Set(currentWeekDraws).size}/36</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #888;">Most frequent:</div>
            <div style="font-size: 12px;">${hotNumbers.slice(0, 3).map(h => formatNumber(h.num)).join(', ') || 'None'}</div>
          </div>
          <div>
            <div style="font-size: 10px; color: #888;">Biggest miss:</div>
            <div style="font-size: 12px;">${dueNumbers.slice(0, 1).map(d => formatNumber(d.num)).join(', ') || 'None'}</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 9px; color: #666; text-align: center;">
          Data based on ${timeline.length} total draws • Last updated ${now.toLocaleDateString()}
        </div>
      </div>
    </div>
  `;
}
////////End of SAGi INSIGHT 1.0//////////

////////////Pattern-Confidence////////////
function generateConfidenceInsights(weeksData) {
  if (!weeksData || weeksData.length < 6) return "";

  const allDraws = [];
  const weeks = Array.isArray(weeksData) ? weeksData : (weeksData.weeks || []);
  
  // 1. Flatten all draws into a chronological timeline
  weeks.forEach(wk => {
    wk.days?.forEach(d => {
      Object.values(d.draws || {}).forEach(val => {
        if (val && val !== "-" && val !== "PENDING") {
          allDraws.push(parseInt(val));
        }
      });
    });
  });

  const totalDraws = allDraws.length;
  const analysis = {};

  // 2. Calculate Skips and Frequency
  for (let i = 1; i <= 36; i++) {
    const appearances = allDraws.map((num, idx) => num === i ? idx : -1).filter(idx => idx !== -1);
    const count = appearances.length;
    
    if (count > 1) {
      let totalSkip = 0;
      for (let j = 1; j < appearances.length; j++) {
        totalSkip += (appearances[j] - appearances[j-1]);
      }
      const avgSkip = totalSkip / (count - 1);
      const lastSeenIdx = appearances[appearances.length - 1];
      const currentSkip = (totalDraws - 1) - lastSeenIdx;
      
      // Confidence Ratio: Higher if currentSkip > avgSkip
      let ratio = (currentSkip / avgSkip) * 100;
      // Cap at 98% to keep it realistic
      analysis[i] = Math.min(Math.round(ratio), 98);
    } else {
      analysis[i] = 10; // Low confidence for rare numbers
    }
  }

  // 3. Get Top 3 by Confidence
  const topPicks = Object.entries(analysis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return `
    <div style="background: rgba(15, 23, 42, 0.9); border-radius: 16px; padding: 15px; border: 1px solid rgba(0, 255, 136, 0.2); backdrop-filter: blur(10px);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #00ff88; font-size: 10px; font-weight: 800; letter-spacing: 1px;">ALGORITHMIC CONFIDENCE</span>
        <span style="color: #64748b; font-size: 10px;">${new Date().toLocaleDateString()}</span>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${topPicks.map(([num, conf]) => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 30px; height: 30px; background: #00ff88; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 14px;">
                ${num}
              </div>
              <div style="color: white; font-size: 11px; font-weight: 600;">MARK ${num}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #00ff88; font-size: 12px; font-weight: 900;">${conf}%</div>
              <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 4px;">
                <div style="width: ${conf}%; height: 100%; background: #00ff88; border-radius: 2px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 10px; color: #64748b; font-size: 9px; font-style: italic; text-align: center;">
        *Calculated based on historical skip-interval deviation.
      </div>
    </div>
  `;
}
//////////End of Pattern-Confidence//////

///////////GenerateLegacyInsights////////
/**
 * ANALYTICAL FUNCTION: Play Whe Legacy Engine
 * Author: CODEWITHGLASGOW / FinFolio Suite Projects
 * Logic: Pull-Down (Time-Slot Correlation) & 1/16 Partner Charts
 */
function generateLegacyInsights(weeksData) {
  // Defensive check for data availability
  if (!weeksData) return "";
  
  const weeks = Array.isArray(weeksData) ? weeksData : (weeksData.weeks || []);
  if (weeks.length < 2) return "";

  const currentWeek = weeks[weeks.length - 1];
  const lastWeek = weeks[weeks.length - 2];
  
  /**
   * 1/16 Chart Partner Logic (Mapped from PDF Analysis)
   * These numbers are "Spirit-Linked" or part of the same "Line"
   */
  const chart1_16 = {
    1: [8, 11, 14],
    2: [17, 26, 35],
    4: [13, 22, 31],
    8: [1, 16, 24],
    13: [4, 25],
    16: [31, 8, 1],
    25: [13, 34],
    31: [16, 4]
  };

  const pullDownPicks = [];
  const linePicks = [];

  // 1. "PULL DOWN" LOGIC: Analysis of numbers played at the exact same time-slot last week
  if (lastWeek && currentWeek) {
    const lastWeekDays = lastWeek.days || [];
    const currentWeekDays = currentWeek.days || [];
    
    lastWeekDays.forEach((lastDay, dayIdx) => {
      const currentDay = currentWeekDays[dayIdx];
      // Only pull down if we are looking at the corresponding day/time for the current week
      if (currentDay && lastDay.draws) {
        Object.keys(lastDay.draws).forEach(time => {
          const val = lastDay.draws[time];
          if (val && val !== "-" && val !== "PENDING") {
            pullDownPicks.push(val);
          }
        });
      }
    });
  }

  // 2. "PARTNER LINE" LOGIC: Identify partners of the most recent results
  const flattenedRecent = [];
  currentWeek.days?.forEach(d => {
    Object.values(d.draws || {}).forEach(v => {
      if (v && v !== "-" && v !== "PENDING") flattenedRecent.push(parseInt(v));
    });
  });

  // Take the last 3 results and find their chart partners
  flattenedRecent.slice(-4).forEach(mark => {
    if (chart1_16[mark]) {
      chart1_16[mark].forEach(p => linePicks.push(p));
    }
  });

  // Filter unique values and take the top 3 for each category
  const finalPullDown = [...new Set(pullDownPicks)].slice(-4);
  const finalLine = [...new Set(linePicks)].slice(0, 4);

  // Return formatted HTML for the PWA UI
  return `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 18px; border: 1px solid rgba(255, 215, 0, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: system-ui, -apple-system, sans-serif; color: white;">
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="color: #ffd700; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Legacy Pattern Engine</div>
        <div style="color: rgba(255,255,255,0.5); font-size: 9px; margin-top: 4px;">PULL-DOWN & PARTNER ANALYSIS</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="color: #38bdf8; font-size: 9px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 12px;">🔄</span> PULL DOWN
          </div>
          ${finalPullDown.length ? finalPullDown.map(n => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 6px; height: 6px; background: #38bdf8; border-radius: 50%;"></div>
              <span style="color: white; font-size: 13px; font-weight: 800;">${n}</span>
            </div>
          `).join('') : '<div style="color: rgba(255,255,255,0.2); font-size: 9px;">Scan in progress...</div>'}
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="color: #f472b6; font-size: 9px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 12px;">🔗</span> LINE CHART
          </div>
          ${finalLine.length ? finalLine.map(n => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 6px; height: 6px; background: #f472b6; border-radius: 50%;"></div>
              <span style="color: white; font-size: 13px; font-weight: 800;">${n}</span>
            </div>
          `).join('') : '<div style="color: rgba(255,255,255,0.2); font-size: 9px;">Waiting for signal...</div>'}
        </div>
      </div>
      
      <div style="margin-top: 15px; font-size: 8px; color: rgba(255,255,255,0.4); text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; line-height: 1.4;">
        BANKER STRATEGY V1.0<br/>
        Time-Slot Correlation & Historical Line-Mapping
      </div>
    </div>
  `;
}

/////////End of GenerateLegacyInsights/////

//////////Momentum vs. Probability////////
function generateDualInsights(weeksData) {
  if (!weeksData || weeksData.length < 12) return "";

  const allDraws = [];
  const weeks = Array.isArray(weeksData) ? weeksData : (weeksData.weeks || []);
  
  // 1. Flatten draws
  weeks.forEach(wk => {
    wk.days?.forEach(d => {
      Object.values(d.draws || {}).forEach(val => {
        if (val && val !== "-" && val !== "PENDING") allDraws.push(parseInt(val));
      });
    });
  });

  const totalDraws = allDraws.length;
  const freqMap = {};
  const confidenceMap = {};

  // 2. Run Analysis for all 36 Marks
  for (let i = 1; i <= 36; i++) {
    const appearances = allDraws.map((num, idx) => num === i ? idx : -1).filter(idx => idx !== -1);
    const count = appearances.length;
    
    // Frequency (Hot)
    freqMap[i] = count;

    // Confidence (Probability based on skips)
    if (count > 1) {
      let totalSkip = 0;
      for (let j = 1; j < appearances.length; j++) {
        totalSkip += (appearances[j] - appearances[j-1]);
      }
      const avgSkip = totalSkip / (count - 1);
      const lastSeenIdx = appearances[appearances.length - 1];
      const currentSkip = (totalDraws - 1) - lastSeenIdx;
      confidenceMap[i] = Math.min(Math.round((currentSkip / avgSkip) * 100), 98);
    } else {
      confidenceMap[i] = 10;
    }
  }

  // 3. Sort Data
  const hotPicks = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const smartPicks = Object.entries(confidenceMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return `
    <div style="background: rgba(15, 23, 42, 0.9); border-radius: 16px; padding: 15px; border: 1px solid rgba(0, 255, 136, 0.2); backdrop-filter: blur(10px); font-family: sans-serif;">
      
      <div style="display: flex; gap: 15px;">
        
        <!-- COLUMN 1: HOT MARKS -->
        <div style="flex: 1;">
          <div style="color: #ff3b30; font-size: 9px; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase;">🔥 Hot Momentum</div>
          ${hotPicks.map(([num, count]) => `
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 8px; margin-bottom: 6px; border-left: 3px solid #ff3b30;">
              <div style="width: 24px; height: 24px; background: #ff3b30; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px;">${num}</div>
              <div style="color: white; font-size: 10px; font-weight: 600;">Hits: ${count}</div>
            </div>
          `).join('')}
        </div>

        <!-- COLUMN 2: SAGi SMART PICKS -->
        <div style="flex: 1;">
          <div style="color: #00ff88; font-size: 9px; font-weight: 800; letter-spacing: 1px; margin-bottom: 10px; text-transform: uppercase;">♠️SAGi Smart Picks</div>
          ${smartPicks.map(([num, conf]) => `
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 8px; margin-bottom: 6px; border-left: 3px solid #00ff88;">
              <div style="width: 24px; height: 24px; background: #00ff88; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 11px;">${num}</div>
              <div style="color: white; font-size: 10px; font-weight: 600;">${conf}%</div>
            </div>
          `).join('')}
        </div>

      </div>

      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 8px; text-align: center; line-height: 1.4;">
        REAL-TIME ENGINE: <span style="color: #94a3b8;">Frequency Tracking vs. Skip-Interval Deviation</span>
      </div>
    </div>
  `;
}
//////End of Momentum vs. Probability/////

/////Coming Under Modal Chart Display/////
// ======================================
// COMING UNDER MODAL - Weekly Games with Carousel (Play Whe only)
// Pick 2 and Pick 4 remain as original modal
// ======================================
function renderComingUnderModalWeekly(weeksData, gameName, gameType) {
  if (!weeksData || weeksData.length === 0) return "";
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const today = new Date();
  const todayIdx = today.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[todayIdx];
  const slots = ["MOR", "MID", "NON", "EVE"];
  
  // Partner mapping (from the book)
  const partners = {};
  for (let i = 1; i <= 18; i++) {
    partners[i] = 37 - i;
    partners[37 - i] = i;
  }
  
  // Spirit mapping from Play Whe book
  const spirits = {
    1: 16, 2: 24, 3: 19, 4: 3, 5: 1, 6: 15, 7: 13, 8: 29, 9: 33,
    10: 28, 11: 11, 12: 32, 13: 7, 14: 25, 15: 9, 16: 17, 17: 18, 18: 30,
    19: 5, 20: 22, 21: 23, 22: 20, 23: 21, 24: 2, 25: 14, 26: 27, 27: 16,
    28: 10, 29: 4, 30: 12, 31: 34, 32: 8, 33: 26, 34: 31, 35: 4, 36: 11
  };
  
  // Helper to get draw
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
  }
  
  function formatDisplayDate(date) {
    if (!date) return "N/A";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
  }
  
  function getPartnerOrSpirit(value, isPartner = true) {
    if (!value) return null;
    const num = parseInt(value, 10);
    if (isNaN(num)) return null;
    if (isPartner && partners[num]) return partners[num].toString();
    if (!isPartner && spirits[num]) return spirits[num].toString();
    return null;
  }
  
  const titleDate = formatDisplayDate(today);
  const pastWeeks = sortedWeeks.slice(-13, -1);
  
  // Collect all historical draws for the tables
  const historicalData = [];
  pastWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    const dayOffset = dayNames.indexOf(todayName);
    const drawDate = new Date(weekStart);
    drawDate.setDate(weekStart.getDate() + dayOffset);
    
    if (drawDate <= today) {
      const morDraw = getDraw(week, todayName, "MOR");
      const midDraw = getDraw(week, todayName, "MID");
      const nonDraw = getDraw(week, todayName, "NON");
      const eveDraw = getDraw(week, todayName, "EVE");
      const allMissing = !morDraw && !midDraw && !nonDraw && !eveDraw;
      
      historicalData.push({
        date: drawDate,
        dateFormatted: formatDisplayDate(drawDate),
        mor: morDraw,
        mid: midDraw,
        non: nonDraw,
        eve: eveDraw,
        isHoliday: allMissing
      });
    }
  });
  
  // For Pick 2 and Pick 4 - return original simple modal (no carousel)
  if (gameType !== "P2WHE") {
    const modalId = `comingUnderModal-${gameType}`;
    
    // Build table rows for original view
    const originalRows = historicalData.map(row => {
      if (row.isHoliday) {
        return `
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 8px 6px; font-weight: 600; color: #333;">${row.dateFormatted}</td>
            <td colspan="4" style="padding: 10px; text-align: center; color: #ff453a; font-weight: bold;">🇹🇹 HOLIDAY 🇹🇹</span></td>
          </tr>
        `;
      }
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 8px 6px; font-weight: 600; color: #333;">${row.dateFormatted}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${row.mor || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${row.mid || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${row.non || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${row.eve || '<span style="color:#999;">—</span>'}</td>
        </tr>
      `;
    }).join('');
    
    return `
      <div id="${modalId}" class="coming-under-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; overflow: auto;">
        <div style="max-width: 650px; margin: 30px auto; background: #ffffff; border-radius: 24px; border: 1px solid #ff9d00; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <div style="padding: 16px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #ff9d00;">CWG Charts • ${gameName}<br>Under Today ${titleDate}</div>
              <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Historical draws for ${gameName} on ${todayName}s</div>
            </div>
            <button onclick="closeComingUnderModal('${gameType}')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 30px; padding: 8px 18px; color: white; font-weight: bold; cursor: pointer;">✕ CLOSE</button>
          </div>
          
          <div style="padding: 16px; overflow-x: auto; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5; border-bottom: 2px solid #ff9d00;">
                  <th style="padding: 12px 8px; text-align: left; color: #333; font-size: 11px;">DATE</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">MOR</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">MID</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">NON</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">EVE</th>
                </tr>
              </thead>
              <tbody>
                ${originalRows}
              </tbody>
            </table>
          </div>
          
          <div style="padding: 12px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 9px; color: #999; background: #fafafa;">
            Last 12 Weeks • ${todayName} Draws • CODEWITHGLASGOW CHARTS ANALYSIS ©️ CWG
          </div>
        </div>
      </div>
      
      <style>
        .coming-under-modal::-webkit-scrollbar { width: 4px; }
        .coming-under-modal::-webkit-scrollbar-track { background: #333; }
        .coming-under-modal::-webkit-scrollbar-thumb { background: #ff9d00; border-radius: 4px; }
      </style>
      
      <script>
        window.openComingUnderModal = function(gameType) {
          var m = document.getElementById('comingUnderModal-' + gameType);
          if (m) {
            m.style.display = 'block';
            document.body.style.overflow = 'hidden';
          }
        };
        window.closeComingUnderModal = function(gameType) {
          var m = document.getElementById('comingUnderModal-' + gameType);
          if (m) {
            m.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        };
      </script>
    `;
  }
  
  // =========================================
  // PLAY WHE ONLY - Dynamic Table Switcher (No pre-built slides)
  // =========================================
  const modalId = `comingUnderModal-${gameType}`;
  
  // Build the three different table views as strings
  function buildTableView(viewType) {
    return historicalData.map(row => {
      if (row.isHoliday) {
        return `
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 8px 6px; font-weight: 600; color: #333;">${row.dateFormatted}</td>
            <td colspan="4" style="padding: 10px; text-align: center; color: #ff453a; font-weight: bold;">🇹🇹 HOLIDAY 🇹🇹</span></td>
          </table>
        `;
      }
      
      let morVal = row.mor;
      let midVal = row.mid;
      let nonVal = row.non;
      let eveVal = row.eve;
      
      if (viewType === "partners") {
        morVal = getPartnerOrSpirit(row.mor, true);
        midVal = getPartnerOrSpirit(row.mid, true);
        nonVal = getPartnerOrSpirit(row.non, true);
        eveVal = getPartnerOrSpirit(row.eve, true);
      } else if (viewType === "spirits") {
        morVal = getPartnerOrSpirit(row.mor, false);
        midVal = getPartnerOrSpirit(row.mid, false);
        nonVal = getPartnerOrSpirit(row.non, false);
        eveVal = getPartnerOrSpirit(row.eve, false);
      }
      
      return `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 8px 6px; font-weight: 600; color: #333;">${row.dateFormatted}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${morVal || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${midVal || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${nonVal || '<span style="color:#999;">—</span>'}</td>
          <td style="padding: 8px 4px; text-align: center; font-weight: 700; color: #333;">${eveVal || '<span style="color:#999;">—</span>'}</td>
        <tr>
      `;
    }).join('');
  }
  
  return `
    <div id="${modalId}" class="coming-under-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; overflow: auto;">
      <div style="max-width: 650px; margin: 30px auto; background: #ffffff; border-radius: 24px; border: 1px solid #ff9d00; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        
        <!-- Header with dynamic title -->
        <div style="padding: 16px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div id="comingUnderTitle-${gameType}" style="font-size: 16px; font-weight: 800; color: #ff9d00;">CWG Charts • PLAY WHE<br>Under Today ${titleDate}</div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Historical draws on ${todayName}s </div>
          </div>
          <button onclick="closeComingUnderModal('${gameType}')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 30px; padding: 8px 18px; color: white; font-weight: bold; cursor: pointer;">✕ CLOSE</button>
        </div>
        
        <!-- Simple Swipe Area - Dynamic Table -->
        <div id="swipeArea-${gameType}" style="position: relative; overflow: hidden; touch-action: pan-y pinch-zoom;">
          <div id="tableContainer-${gameType}" class="table-container" style="padding: 16px; overflow-x: auto; background: #ffffff; max-height: 480px; overflow-y: auto; -webkit-overflow-scrolling: touch;">
            <table id="dynamicTable-${gameType}" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5; border-bottom: 2px solid #ff9d00; position: sticky; top: 0;">
                  <th style="padding: 12px 8px; text-align: left; color: #333; font-size: 11px;">DATE</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">MOR</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">MID</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">NON</th>
                  <th style="padding: 12px 8px; text-align: center; color: #333; font-size: 11px;">EVE</th>
                </tr>
              </thead>
              <tbody id="tableBody-${gameType}">
                ${buildTableView("original")}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style="padding: 12px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 9px; color: #999; background: #fafafa;">
            Last 12 Weeks • ${todayName} Draws • CODEWITHGLASGOW CHARTS ANALYSIS ©️ CWG
        </div>
      </div>
    </div>
    
    <style>
      .coming-under-modal::-webkit-scrollbar { width: 4px; }
      .coming-under-modal::-webkit-scrollbar-track { background: #333; }
      .coming-under-modal::-webkit-scrollbar-thumb { background: #ff9d00; border-radius: 4px; }
      .table-container {
        scroll-behavior: smooth;
      }
    </style>
    
    <script>
      (function() {
        var currentView = 0; // 0=original, 1=partners, 2=spirits
        var startX = 0;
        var startY = 0;
        var isDragging = false;
        var isHorizontalSwipe = false;
        var swipeArea = document.getElementById('swipeArea-${gameType}');
        var tableBody = document.getElementById('tableBody-${gameType}');
        var titleDiv = document.getElementById('comingUnderTitle-${gameType}');
        
        // Pre-built table HTML for each view
        var tableViews = [
          ${JSON.stringify(buildTableView("original"))},
          ${JSON.stringify(buildTableView("partners"))},
          ${JSON.stringify(buildTableView("spirits"))}
        ];
        
        var titles = [
          "CWG Charts • PLAY WHE<br>Under Today ${titleDate}",
          "CWG Charts • PLAY WHE<br>Partners Today ${titleDate}",
          "CWG Charts • PLAY WHE<br>Spirits Today ${titleDate}"
        ];
        
        function updateView(index) {
          if (index < 0) index = 0;
          if (index > 2) index = 2;
          currentView = index;
          if (tableBody) {
            tableBody.innerHTML = tableViews[currentView];
          }
          if (titleDiv) {
            titleDiv.innerHTML = titles[currentView];
          }
        }
        
        if (swipeArea) {
          swipeArea.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            isHorizontalSwipe = false;
          });
          
          swipeArea.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            var diffX = e.touches[0].clientX - startX;
            var diffY = e.touches[0].clientY - startY;
            
            if (!isHorizontalSwipe && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
              isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
            }
            
            if (isHorizontalSwipe) {
              e.preventDefault();
            }
          });
          
          swipeArea.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            
            if (isHorizontalSwipe) {
              var diffX = e.changedTouches[0].clientX - startX;
              var threshold = 50;
              
              if (Math.abs(diffX) > threshold) {
                if (diffX > 0 && currentView > 0) {
                  updateView(currentView - 1);
                } else if (diffX < 0 && currentView < 2) {
                  updateView(currentView + 1);
                }
              }
            }
            
            startX = 0;
            startY = 0;
            isHorizontalSwipe = false;
          });
        }
        
        window.openComingUnderModal = function(gameType) {
          var m = document.getElementById('comingUnderModal-' + gameType);
          if (m) {
            m.style.display = 'block';
            document.body.style.overflow = 'hidden';
            updateView(0);
          }
        };
        
        window.closeComingUnderModal = function(gameType) {
          var m = document.getElementById('comingUnderModal-' + gameType);
          if (m) {
            m.style.display = 'none';
            document.body.style.overflow = 'auto';
          }
        };
      })();
    </script>
  `;
}

//////////End of C.U.M.C. Display/////////

/////////PK2 C.WKS PLAY///////////////////
// ======================================
// PICK 2 CURRENT WEEK PLAYS INFO (WITH CAROUSEL - 10 ITEMS PER SLIDE)
// ======================================
function renderPick2CurrentWeekPlays(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading Pick 2 data...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const slotDisplay = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  const currWeekStart = new Date(currentWeek.startDate);
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
  }
  
  function formatDisplayDate(date, slot) {
    if (!date) return "Never";
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'};
    return `${date.toLocaleDateString('en-US', options).replace(/,/g, '')} ${slotDisplay[slot] || ''}`;
  }
  
  // Collect all Pick 2 draws from current week
  const currentWeekPlays = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        // Parse the draw (e.g., "25,5" or "12/21")
        const parts = draw.split(/[,/ ]+/);
        if (parts.length >= 2) {
          const first = parseInt(parts[0], 10);
          const second = parseInt(parts[1], 10);
          if (!isNaN(first) && !isNaN(second)) {
            const playDate = new Date(currWeekStart);
            playDate.setDate(currWeekStart.getDate() + d);
            currentWeekPlays.push({
              straight: `${first},${second}`,
              reverse: `${second},${first}`,
              first: first,
              second: second,
              date: playDate,
              day: dayNames[d],
              slot: slots[s],
              slotIcon: slotDisplay[slots[s]]
            });
          }
        }
      }
    }
  }
  
  // Build history map from ALL previous weeks (for hit counts and last played)
  const historyMap = new Map(); // key: "first,second"
  
  // Scan ALL previous weeks (excluding current week) for accurate history
  const historyWeeks = sortedWeeks.slice(0, -1);
  historyWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          const parts = draw.split(/[,/ ]+/);
          if (parts.length >= 2) {
            const first = parseInt(parts[0], 10);
            const second = parseInt(parts[1], 10);
            if (!isNaN(first) && !isNaN(second)) {
              const comboKey = `${first},${second}`;
              const drawDate = new Date(weekStart);
              drawDate.setDate(weekStart.getDate() + d);
              
              if (!historyMap.has(comboKey)) {
                historyMap.set(comboKey, { hits: 0, lastDate: null, lastSlot: null });
              }
              const comboData = historyMap.get(comboKey);
              comboData.hits++;
              if (!comboData.lastDate || drawDate > comboData.lastDate) {
                comboData.lastDate = drawDate;
                comboData.lastSlot = slots[s];
              }
            }
          }
        }
      }
    }
  });
  
  // Build table rows for each unique straight play in current week
  const uniquePlays = new Map();
  currentWeekPlays.forEach(play => {
    const key = play.straight;
    if (!uniquePlays.has(key)) {
      uniquePlays.set(key, {
        straight: play.straight,
        reverse: play.reverse,
        first: play.first,
        second: play.second,
        playedDate: play.date,
        playedDay: play.day,
        playedSlot: play.slot,
        playedSlotIcon: play.slotIcon
      });
    }
  });
  
  // Convert to array for pagination
  const allPlays = Array.from(uniquePlays.values());
  const itemsPerPage = 8;
  const totalPages = Math.ceil(allPlays.length / itemsPerPage);
  
  // Build all pages HTML
  const pagesHtml = [];
  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pagePlays = allPlays.slice(start, end);
    
    let pageRowsHtml = '';
    for (let play of pagePlays) {
      // Get data for straight combination
      const straightData = historyMap.get(play.straight) || { hits: 0, lastDate: null, lastSlot: null };
      
      // Get data for reverse combination (separate lookup)
      const reverseData = historyMap.get(play.reverse) || { hits: 0, lastDate: null, lastSlot: null };
      
      const straightLastPlayed = straightData.lastDate ? formatDisplayDate(straightData.lastDate, straightData.lastSlot) : "Never";
      const reverseLastPlayed = reverseData.lastDate ? formatDisplayDate(reverseData.lastDate, reverseData.lastSlot) : "Never";
      
      pageRowsHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 4px 4px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="background: #054517; color: #ffff00; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.first}</span>
              <span style="color: #ff9d00;">/</span>
              <span style="background: #ffff00; color: #000; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.second}</span>
            </div>
            <div style="font-size: 9px; color: #888; margin-top: 4px;">${play.playedDay} ${play.playedSlotIcon}</div>
           </td>
          <td style="padding: 4px 4px; text-align: center; font-weight: bold; color: #32d74b;">${straightData.hits}x</td>
          <td style="padding: 4px 4px; text-align: center; font-size: 11px;">${straightLastPlayed}</td>
          <td style="padding:4px 4px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              <span style="background: #ffff00; color: #000; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.second}</span>
              <span style="color: #ff9d00;">/</span>
              <span style="background: #054517; color: #ffff00; padding: 4px 4px; border-radius: 50px; font-weight: bold; font-size: 14px;">${play.first}</span>
            </div>
          </td>
          <td style="padding: 4px 4px; text-align: center; font-weight: bold; color: #32d74b;">${reverseData.hits}x</td>
          <td style="padding: 4px 4px; text-align: center; font-size: 11px;">${reverseLastPlayed}</td>
        </tr>
      `;
    }
    
    pagesHtml.push(`
      <div class="carousel-slide-pick2" style="min-width: 100%; scroll-snap-align: start;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tbody>
            ${pageRowsHtml}
          </tbody>
        </table>
      </div>
    `);
  }
  
  if (allPlays.length === 0) {
    return `
      <div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 8px;">📊 PICK 2 CURRENT WEEK PLAYS INFO</div>
        <div style="color: #888;">No Pick 2 plays recorded in current week yet</div>
      </div>
    `;
  }
  
  // Generate dots for pagination
  let dotsHtml = '';
  for (let i = 0; i < totalPages; i++) {
    dotsHtml += `<span class="carousel-dot-pick2" data-slide="${i}" style="width: 8px; height: 8px; background: #555; border-radius: 50%; display: inline-block; margin: 0 4px; cursor: pointer; transition: all 0.3s ease;"></span>`;
  }
  
  const carouselId = 'pick2-carousel-' + Date.now();
  
  return `
    <div class="pick2-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff;">
      <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">📊 PICK 2 CURRENT WEEK PLAYS INFO</div>
      <div style="overflow-x: auto;">
        <!-- Fixed Header Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: rgba(88,166,255,0.2); border-bottom: 2px solid #58a6ff;">
              <th style="padding: 10px; text-align: center;">Straight Play</th>
              <th style="padding: 10px; text-align: center;">Hit</th>
              <th style="padding: 10px; text-align: center;">Last Played</th>
              <th style="padding: 10px; text-align: center;">Reverse Play</th>
              <th style="padding: 10px; text-align: center;">Hit</th>
              <th style="padding: 10px; text-align: center;">Last Played</th>
            </tr>
          </thead>
        </table>
      </div>
      
      <!-- Swipeable Carousel Container -->
      <div id="${carouselId}" style="overflow-x: auto; scroll-snap-type: x mandatory; display: flex; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; gap: 0; margin-top: 10px;">
        ${pagesHtml.join('')}
      </div>
      
      <!-- Page Indicators -->
      <div style="display: flex; justify-content: center; margin-top: 12px; gap: 6px;" id="${carouselId}-dots">
        ${dotsHtml}
      </div>
      
      <div style="font-size: 8px; color: #555; text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(88,166,255,0.2);">
        Based on current week plays • Historical data from previous weeks • ${allPlays.length} total plays • Swipe for more
      </div>
    </div>
    
    <script>
      (function() {
        var container = document.getElementById('${carouselId}');
        var dots = document.querySelectorAll('#${carouselId}-dots .carousel-dot-pick2');
        var currentIndex = 0;
        var totalSlides = ${totalPages};
        
        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#58a6ff';
              dot.style.width = '16px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#555';
              dot.style.width = '8px';
              dot.style.borderRadius = '50%';
            }
          });
        }
        
        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          if (slideWidth > 0) {
            container.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          var scrollPosition = container.scrollLeft;
          var newIndex = Math.round(scrollPosition / slideWidth);
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (container) {
          container.addEventListener('scroll', handleScroll);
          dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function() {
              scrollToSlide(idx);
            });
          });
        }
        
        updateDots();
      })();
    </script>
  `;
}
////////END OF PK2 C.WKS PLAY/////////////

/////////PK4 C.WKS PLAY///////////////////
// ======================================
// PICK 4 CURRENT WEEK PLAYS INFO - PERMUTATION ANALYSIS
// Shows all historical permutations of digits from each current week draw
// ======================================
function renderPick4CurrentWeekPlays(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">📊 Loading Pick 4 data...</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const slotDisplay = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const allWeeks = sortedWeeks;
  
  const currWeekStart = new Date(currentWeek.startDate);
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
  }
  
  function formatDisplayDate(date, slot) {
    if (!date) return "Never";
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'};
    return `${date.toLocaleDateString('en-US', options).replace(/,/g, '')} ${slotDisplay[slot] || ''}`;
  }
  
  // Helper to get the 4-digit number from a draw
  function getPick4Number(draw) {
    if (!draw) return null;
    const cleanDraw = draw.toString().replace(/[^0-9]/g, '');
    if (cleanDraw.length === 8) {
      return cleanDraw;
    }
    return cleanDraw.padStart(4, '0');
  }
  
  // Helper to generate all unique permutations of 4 digits
  function getAllPermutations(digits) {
    const results = new Set();
    
    function permute(arr, start) {
      if (start === arr.length - 1) {
        results.add(arr.join(''));
        return;
      }
      for (let i = start; i < arr.length; i++) {
        [arr[start], arr[i]] = [arr[i], arr[start]];
        permute(arr, start + 1);
        [arr[start], arr[i]] = [arr[i], arr[start]];
      }
    }
    
    permute([...digits], 0);
    return Array.from(results);
  }
  
  // Build history map from ALL weeks (for hit counts and last played)
  const historyMap = new Map(); // key: "4-digit number" -> { hits, lastDate, lastSlot, occurrences }
  
  // Scan ALL weeks for historical data
  allWeeks.forEach(week => {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      for (let s = 0; s < slots.length; s++) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          const number = getPick4Number(draw);
          if (number && number.length === 4) {
            const drawDate = new Date(weekStart);
            drawDate.setDate(weekStart.getDate() + d);
            
            if (!historyMap.has(number)) {
              historyMap.set(number, { hits: 0, lastDate: null, lastSlot: null, occurrences: [] });
            }
            const comboData = historyMap.get(number);
            comboData.hits++;
            comboData.occurrences.push({ date: drawDate, slot: slots[s], day: dayNames[d] });
            if (!comboData.lastDate || drawDate > comboData.lastDate) {
              comboData.lastDate = drawDate;
              comboData.lastSlot = slots[s];
            }
          }
        }
      }
    }
  });
  
  // Collect all Pick 4 draws from current week and their permutations
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) {
        const number = getPick4Number(draw);
        if (number && number.length === 4) {
          const playDate = new Date(currWeekStart);
          playDate.setDate(currWeekStart.getDate() + d);
          currentWeekDraws.push({
            original: number,
            digits: number.split(''),
            date: playDate,
            day: dayNames[d],
            slot: slots[s],
            slotIcon: slotDisplay[slots[s]]
          });
        }
      }
    }
  }
  
  // Build a map of all permutations for each unique draw
  const drawPermutationsMap = new Map(); // key: original number, value: { original, permutations[], plays }
  
  currentWeekDraws.forEach(draw => {
    const key = draw.original;
    if (!drawPermutationsMap.has(key)) {
      // Generate all unique permutations of the digits
      const allPerms = getAllPermutations(draw.digits);
      // Filter to only permutations that have actually been played in history
      const playedPermutations = allPerms.filter(perm => historyMap.has(perm));
      // Sort by hit count (most frequent first)
      playedPermutations.sort((a, b) => {
        const hitsA = historyMap.get(a)?.hits || 0;
        const hitsB = historyMap.get(b)?.hits || 0;
        return hitsB - hitsA;
      });
      
      drawPermutationsMap.set(key, {
        original: draw.original,
        permutations: playedPermutations,
        playedDate: draw.date,
        playedDay: draw.day,
        playedSlot: draw.slot,
        playedSlotIcon: draw.slotIcon
      });
    }
  });
  
  // Convert to array for pagination
  const allDraws = Array.from(drawPermutationsMap.values());
  const itemsPerPage = 5; // 5 draws per page (each with its permutations)
  const totalPages = Math.ceil(allDraws.length / itemsPerPage);
  
  // Function to format permutation with styling
  function formatPermutation(perm, isOriginal = false, highlightColor = null) {
    if (isOriginal) {
      return `<span style="font-weight: bold; font-size: 16px; color: #ff9d00; background: rgba(255,157,0,0.2); padding: 4px 8px; border-radius: 8px;">${perm}</span>`;
    }
    if (highlightColor) {
      return `<span style="color: ${highlightColor}; border: 1px solid ${highlightColor}; background: ${highlightColor}15; border-radius: 6px; padding: 4px 8px; font-weight: 500; display: inline-block;">${perm}</span>`;
    }
    return `<span style="font-family: monospace; font-size: 13px; padding: 4px 8px;">${perm}</span>`;
  }
  
  // Build all pages HTML
  const pagesHtml = [];
  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDraws = allDraws.slice(start, end);
    
    let pageRowsHtml = '';
    for (let draw of pageDraws) {
      const comboData = historyMap.get(draw.original) || { hits: 0, lastDate: null, lastSlot: null };
      const lastPlayed = comboData.lastDate ? formatDisplayDate(comboData.lastDate, comboData.lastSlot) : "Never";
      
      // Build permutations list with hit counts
      let permutationsHtml = '';
      draw.permutations.forEach(perm => {
        const permData = historyMap.get(perm);
        const isOriginal = (perm === draw.original);
        const hitCount = permData?.hits || 0;
        // Get highlight color from comboColors if this permutation was played in current week
        // (we'll check if any current week draw matches this permutation)
        let highlightColor = null;
        for (let cd of currentWeekDraws) {
          if (cd.original === perm) {
            highlightColor = "#58a6ff";
            break;
          }
        }
        
        permutationsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 6px 12px; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${formatPermutation(perm, isOriginal, highlightColor)}
              <span style="font-size: 11px; color: #32d74b;">${hitCount}x</span>
            </div>
            <span style="font-size: 9px; color: #888;">Last: ${permData?.lastDate ? formatDisplayDate(permData.lastDate, permData.lastSlot) : 'Never'}</span>
          </div>
        `;
      });
      
      pageRowsHtml += `
        <div style="margin-bottom: 20px; background: rgba(88,166,255,0.05); border-radius: 16px; padding: 12px; border: 1px solid rgba(88,166,255,0.3);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 14px; font-weight: 800; color: #58a6ff;">🎲 DRAWN:</span>
              <span style="font-size: 20px; font-weight: 900; color: #ff9d00; margin-left: 8px;">${draw.original}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #888;">${draw.playedDay} ${draw.playedSlotIcon}</div>
              <div style="font-size: 11px; color: #aaa;">Hits: ${comboData.hits}x | Last: ${lastPlayed}</div>
            </div>
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #58a6ff; margin-bottom: 8px;">📊 PERMUTATIONS PLAYED IN HISTORY (${draw.permutations.length} of 24 possible):</div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${permutationsHtml}
          </div>
          ${draw.permutations.length === 0 ? '<div style="color: #666; text-align: center; padding: 10px;">No permutations of this number have been played in history</div>' : ''}
        </div>
      `;
    }
    
    pagesHtml.push(`
      <div class="carousel-slide-pick4-perm" style="min-width: 100%; scroll-snap-align: start;">
        <div style="padding: 4px;">
          ${pageRowsHtml}
        </div>
      </div>
    `);
  }
  
  if (allDraws.length === 0) {
    return `
      <div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 8px;">📊 PICK 4 CURRENT WEEK PLAYS INFO</div>
        <div style="color: #888;">No Pick 4 plays recorded in current week yet</div>
      </div>
    `;
  }
  
  // Generate dots for pagination
  let dotsHtml = '';
  for (let i = 0; i < totalPages; i++) {
    dotsHtml += `<span class="carousel-dot-pick4-perm" data-slide="${i}" style="width: 8px; height: 8px; background: #555; border-radius: 50%; display: inline-block; margin: 0 4px; cursor: pointer; transition: all 0.3s ease;"></span>`;
  }
  
  const carouselId = 'pick4-perm-carousel-' + Date.now();
  
  return `
    <div class="pick4-current-plays" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff;">
      <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">📊 PICK 4 PERMUTATION ANALYSIS</div>
      <div style="font-size: 10px; color: #aaa; text-align: center; margin-bottom: 12px;">
        For each drawn number, showing all permutations that have appeared in history
      </div>
      
      <!-- Swipeable Carousel Container -->
      <div id="${carouselId}" style="overflow-x: auto; scroll-snap-type: x mandatory; display: flex; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; gap: 16px; margin-top: 10px;">
        ${pagesHtml.join('')}
      </div>
      
      <!-- Page Indicators -->
      <div style="display: flex; justify-content: center; margin-top: 12px; gap: 6px;" id="${carouselId}-dots">
        ${dotsHtml}
      </div>
      
      <div style="font-size: 8px; color: #555; text-align: center; margin-top: 10px; padding-top: 6px; border-top: 1px solid rgba(88,166,255,0.2);">
        🔄 Swipe to see more draws • ${allDraws.length} draws this week • Showing historical permutations
      </div>
    </div>
    
    <script>
      (function() {
        var container = document.getElementById('${carouselId}');
        var dots = document.querySelectorAll('#${carouselId}-dots .carousel-dot-pick4-perm');
        var currentIndex = 0;
        var totalSlides = ${totalPages};
        
        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#58a6ff';
              dot.style.width = '16px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#555';
              dot.style.width = '8px';
              dot.style.borderRadius = '50%';
            }
          });
        }
        
        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          if (slideWidth > 0) {
            container.scrollTo({ left: index * (slideWidth + 16), behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          var scrollPosition = container.scrollLeft;
          var newIndex = Math.round(scrollPosition / (slideWidth + 16));
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
            currentIndex = newIndex;
            updateDots();
          }
        }
        
        if (container) {
          container.addEventListener('scroll', handleScroll);
          dots.forEach(function(dot, idx) {
            dot.addEventListener('click', function() {
              scrollToSlide(idx);
            });
          });
        }
        
        updateDots();
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}
////////END OF PK4 C.WKS PLAY/////////////

// =======================================
// 2. DASHBOARD (INTEGRATED LOGIC WITH CAROUSEL ABOVE CURRENT)
// =======================================
async function presentUnifiedDashboard() {
  let webview = new WebView();
  await webview.loadHTML(`<body style="background:#020617;display:flex;justify-content:center;align-items:center;height:100vh;color:orange;font-family:sans-serif;"><h2>Synchronizing SAGi Hub...</h2></body>`);
  
  const [pw, p2, p4, cp, lotto, w4l] = await Promise.all([
    fetchData(PW_API),
    fetchData(P2_API),
    fetchData(P4_API),
    fetchData(CP_API),
    fetchData(P5_API),
    fetchData(W4L_API)
  ]);

// Inject game data into the window object
const gameDataForWindow = {
  pw: pw?.weeks || [],
  p2: p2?.weeks || [],
  p4: p4?.weeks || []
};

// Complete working draw chart functions
const workingDrawChartFunctions = `
  // Game data injected from server
  window.gameData = ${JSON.stringify(gameDataForWindow)};
  
  // Number colors mapping
  const numberColorsMap = ${JSON.stringify({
    "01":"#ff6b6b","02":"#ffa94d","03":"#ffd43b","04":"#69db7c","05":"#38d9a9","06":"#4dabf7",
    "07":"#9775fa","08":"#f783ac","09":"#ff922b","10":"#fab005","11":"#82c91e","12":"#20c997",
    "13":"#339af0","14":"#845ef7","15":"#e599f7","16":"#ff8787","17":"#ffc078","18":"#ffe066",
    "19":"#8ce99a","20":"#63e6be","21":"#74c0fc","22":"#b197fc","23":"#faa2c1","24":"#ffa8a8",
    "25":"#ffec99","26":"#c0eb75","27":"#96f2d7","28":"#a5d8ff","29":"#d0bfff","30":"#fcc2d7",
    "31":"#ff6b6b","32":"#ffa94d","33":"#ffd43b","34":"#69db7c","35":"#4dabf7","36":"#9775fa"
  })};

  window.openDrawChart = function(gameType) {
    var modal = document.getElementById('drawChartModal-' + gameType);
    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      renderDrawChart(gameType);
    }
  };
  
  window.closeDrawChart = function(gameType) {
    var modal = document.getElementById('drawChartModal-' + gameType);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };
  
  window.filterDrawChart = function(gameType) {
    renderDrawChart(gameType);
  };
  
  document.getElementById('searchInput-pw').addEventListener('input', function() {
  filterDrawChart('pw');
});
  
  // Helper: Find current position in current week (like renderExportTable)
  function findCurrentDrawPosition(weeks) {
    if (!weeks || weeks.length === 0) return { dayIndex: -1, slot: null, dayName: "" };
    
    var currentWk = weeks[weeks.length - 1];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var slots = ["MOR", "MID", "NON", "EVE"];
    
    function getDraw(wk, dayName, slot) {
      if (!wk) return null;
      var day = wk.days.find(function(d) { return d.dayName === dayName; });
      if (!day) return null;
      var val = day.draws[slot];
      return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
    }
    
    for (var d = dayNames.length - 1; d >= 0; d--) {
      var day = currentWk.days.find(function(dy) { return dy.dayName === dayNames[d]; });
      if (day) {
        for (var s = slots.length - 1; s >= 0; s--) {
          if (getDraw(currentWk, dayNames[d], slots[s])) {
            return { dayIndex: d, slot: slots[s], dayName: dayNames[d] };
          }
        }
      }
    }
    return { dayIndex: -1, slot: null, dayName: "" };
  }
  
  // Helper: Deep search through previous weeks (like renderExportTable)
  function findDeepDraw(sortedWeeks, dayIdx, targetSlot) {
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var slots = ["MOR", "MID", "NON", "EVE"];
    var targetDayName = dayNames[dayIdx];
    
    function getDraw(wk, dayName, slot) {
      if (!wk) return null;
      var day = wk.days.find(function(d) { return d.dayName === dayName; });
      if (!day) return null;
      var val = day.draws[slot];
      return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
    }
    
    for (var w = sortedWeeks.length - 2; w >= 0; w--) {
      // Special handling for Monday holidays
      if (dayIdx === 1) {
        var checkDay = sortedWeeks[w].days.find(function(d) { return d.dayName === "Monday"; });
        var isHoliday = !checkDay || slots.every(function(s) { 
          return !checkDay.draws[s] || checkDay.draws[s] === "HOLIDAY" || checkDay.draws[s] === "-";
        });
        if (isHoliday) continue;
      }
      var val = getDraw(sortedWeeks[w], targetDayName, targetSlot);
      if (val && val !== "HOLIDAY" && val !== "-" && val !== "PENDING") {
        return val;
      }
    }
    return null;
  }
  
  // Get active highlights for Play Whe (Leaving & Meeting logic)
  function getActiveHighlights(weeks) {
    if (!weeks || weeks.length === 0) return [];
    
    var sortedWeeks = weeks.slice().sort(function(a, b) {
      var pa = a.startDate.split(" ");
      var pb = b.startDate.split(" ");
      var dateA = new Date(pa[2] + "-" + pa[1] + "-" + pa[0]);
      var dateB = new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
      return dateA - dateB;
    });
    
    var currentWk = sortedWeeks[sortedWeeks.length - 1];
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var slots = ["MOR", "MID", "NON", "EVE"];
    
    function getDraw(wk, dayName, slot) {
      if (!wk) return null;
      var day = wk.days.find(function(d) { return d.dayName === dayName; });
      if (!day) return null;
      var val = day.draws[slot];
      return val && val !== "-" && val !== "PENDING" ? val.toString() : null;
    }
    
    // Find current position
    var currentDayIndex = -1;
    var currentDayName = "";
    var currentSlot = "";
    
    for (var d = dayNames.length - 1; d >= 0; d--) {
      var day = currentWk.days.find(function(dy) { return dy.dayName === dayNames[d]; });
      if (day) {
        for (var s = slots.length - 1; s >= 0; s--) {
          if (getDraw(currentWk, dayNames[d], slots[s])) {
            currentDayIndex = d;
            currentDayName = dayNames[d];
            currentSlot = slots[s];
            break;
          }
        }
      }
      if (currentDayIndex !== -1) break;
    }
    
    if (currentDayIndex === -1) return [];
    
    var highlightA = [];
    var highlightB = [];
    
    if (currentSlot === "MOR") {
      highlightA = [getDraw(currentWk, currentDayName, "MOR")];
      highlightB = [findDeepDraw(sortedWeeks, currentDayIndex, "MID")];
    } else if (currentSlot === "MID") {
      highlightA = [getDraw(currentWk, currentDayName, "MID")];
      highlightB = [findDeepDraw(sortedWeeks, currentDayIndex, "NON")];
    } else if (currentSlot === "NON") {
      highlightA = [getDraw(currentWk, currentDayName, "NON")];
      highlightB = [findDeepDraw(sortedWeeks, currentDayIndex, "EVE")];
    } else if (currentSlot === "EVE") {
      highlightA = [
        getDraw(currentWk, currentDayName, "NON"),
        getDraw(currentWk, currentDayName, "EVE")
      ];
      
      if (currentDayIndex < 6) {
        var nextDayIdx = currentDayIndex + 1;
        var valMor = findDeepDraw(sortedWeeks, nextDayIdx, "MOR");
        var valMid = findDeepDraw(sortedWeeks, nextDayIdx, "MID");
        
        if (!valMor && nextDayIdx === 1) {
          valMor = findDeepDraw(sortedWeeks, 2, "MOR");
          valMid = findDeepDraw(sortedWeeks, 2, "MID");
        }
        highlightB = [valMor, valMid];
      }
    }
    
    var activeHighlights = [];
    highlightA.concat(highlightB).forEach(function(val) {
      if (val && activeHighlights.indexOf(val) === -1) {
        activeHighlights.push(val);
      }
    });
    
    return activeHighlights;
  }
  
function renderDrawChart(gameType) {
  var container = document.getElementById('drawChartContent-' + gameType);
  if (!container) return;
  
  var weeks = window.gameData[gameType] || [];
  var weekSelect = document.getElementById('weekCount-' + gameType);
  var weekLimit = weekSelect ? parseInt(weekSelect.value) || 12 : 12;
  var searchInput = document.getElementById('searchInput-' + gameType);
  var searchTerm = searchInput ? searchInput.value.trim() : '';
  
  if (!weeks || weeks.length === 0) {
    container.innerHTML = "<div style='color:#ff453a; padding:60px 20px; text-align:center;'>⚠️ No data available</div>";
    return;
  }
  
  // Sort weeks chronologically
  var sortedWeeks = weeks.slice().sort(function(a, b) {
    var pa = a.startDate.split(" ");
    var pb = b.startDate.split(" ");
    var dateA = new Date(pa[2] + "-" + pa[1] + "-" + pa[0]);
    var dateB = new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    return dateA - dateB;
  });
  
  var displayWeeks = sortedWeeks.slice(-weekLimit);
  
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var slots = ["MOR", "MID", "NON", "EVE"];
  var today = new Date();
  var todayIdx = today.getDay();
  var todayName = dayNames[todayIdx];
  
  // Helper to format date as d/mm/yy (e.g., 24/3/26)
  function formatShortDate(date) {
    if (!date) return "N/A";
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear().toString().slice(-2);
    return d + "/" + m + "/" + y;
  }
  
  // Helper to format full date for header (e.g., "Sun 2 May '26")
  function formatFullDate(date) {
    if (!date) return "N/A";
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dayName = days[date.getDay()];
    var dayNum = date.getDate();
    var monthName = months[date.getMonth()];
    var year = "'" + date.getFullYear().toString().slice(-2);
    return dayName + " " + dayNum + " " + monthName + " " + year;
  }
  
  // Helper to trim leading zeros (01 → 1, 00 → 0)
  function trimLeadingZeros(str) {
    if (!str) return "";
    var num = parseInt(str, 10);
    return isNaN(num) ? str : num.toString();
  }
  
  // Format week date display (short format for WEEK column: d/mm/yy)
  function formatWeekDateShort(weekStartDate) {
    if (!weekStartDate) return "Week";
    var parts = weekStartDate.split(" ");
    var monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    var startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0], 10));
    return formatShortDate(startDate);
  }
  
  // Helper to check if a date is in the future (for current week pending draws)
  function isFutureDate(week, dayIdx, slotIdx) {
    if (!week.isCurrentWeek) return false;
    var parts = week.startDate.split(" ");
    var monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    var weekStart = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0], 10));
    var drawDate = new Date(weekStart);
    drawDate.setDate(weekStart.getDate() + dayIdx);
    
    // Adjust for time slot (later slots are later in the day)
    if (slotIdx === 1) drawDate.setHours(12); // MID
    else if (slotIdx === 2) drawDate.setHours(16); // NON
    else if (slotIdx === 3) drawDate.setHours(19); // EVE
    
    return drawDate > today;
  }
  
  // Update range display (full date format for header)
  if (displayWeeks.length > 0) {
    var firstWeekStart = displayWeeks[0].startDate;
    var lastWeekStart = displayWeeks[displayWeeks.length - 1].startDate;
    
    var firstParts = firstWeekStart.split(" ");
    var lastParts = lastWeekStart.split(" ");
    var monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    
    var firstDate = new Date(firstParts[2], monthMap[firstParts[1]], parseInt(firstParts[0], 10));
    var lastDate = new Date(lastParts[2], monthMap[lastParts[1]], parseInt(lastParts[0], 10));
    var lastEndDate = new Date(lastDate);
    lastEndDate.setDate(lastDate.getDate() + 6);
    
    var rangeSpan = document.getElementById('drawChartRange-' + gameType);
    if (rangeSpan) {
      rangeSpan.innerText = formatFullDate(firstDate) + " to " + formatFullDate(lastEndDate);
    }
  }
  
// PLAYWHE HIGHLIGHT LOGIC Leaving / Meeting
  var activeHighlights = [];
  
  if (gameType === 'pw') {
    // Find current position in current week
    var currentWk = sortedWeeks[sortedWeeks.length - 1];
    var currentDayIndex = -1;
    var currentDayName = "";
    var currentSlot = "";
    
    function getDraw(wk, dayName, slot) {
      if (!wk) return null;
      var day = wk.days.find(function(d) { return d.dayName === dayName; });
      if (!day) return null;
      var val = day.draws[slot];
      return val && val !== "-" && val !== "PENDING" ? trimLeadingZeros(val.toString()) : null;
    }
    
    // Find last completed draw
    for (var d = dayNames.length - 1; d >= 0; d--) {
      var day = currentWk.days.find(function(dy) { return dy.dayName === dayNames[d]; });
      if (day) {
        for (var s = slots.length - 1; s >= 0; s--) {
          if (getDraw(currentWk, dayNames[d], slots[s])) {
            currentDayIndex = d;
            currentDayName = dayNames[d];
            currentSlot = slots[s];
            break;
          }
        }
      }
      if (currentDayIndex !== -1) break;
    }
    
    // Deep search helper (skips holidays)
    function findDeepDraw(dayIdx, targetSlot) {
      var targetDayName = dayNames[dayIdx];
      for (var w = sortedWeeks.length - 2; w >= 0; w--) {
        // Special handling for Monday holidays
        if (dayIdx === 1) {
          var checkDay = sortedWeeks[w].days.find(function(d) { return d.dayName === "Monday"; });
          var isHoliday = !checkDay || slots.every(function(s) { 
            return !checkDay.draws[s] || checkDay.draws[s] === "HOLIDAY" || checkDay.draws[s] === "-";
          });
          if (isHoliday) continue;
        }
        var val = getDraw(sortedWeeks[w], targetDayName, targetSlot);
        if (val && val !== "HOLIDAY" && val !== "-" && val !== "PENDING") {
          return val;
        }
      }
      return null;
    }
    
    // Build highlight arrays based on last draw position
    var highlightA = [];
    var highlightB = [];
    
    if (currentDayIndex !== -1) {
      if (currentSlot === "MOR") {
        highlightA = [getDraw(currentWk, currentDayName, "MOR")];
        highlightB = [findDeepDraw(currentDayIndex, "MID")];
      } else if (currentSlot === "MID") {
        highlightA = [getDraw(currentWk, currentDayName, "MID")];
        highlightB = [findDeepDraw(currentDayIndex, "NON")];
      } else if (currentSlot === "NON") {
        highlightA = [getDraw(currentWk, currentDayName, "NON")];
        highlightB = [findDeepDraw(currentDayIndex, "EVE")];
      } else if (currentSlot === "EVE") {
        highlightA = [
          getDraw(currentWk, currentDayName, "NON"),
          getDraw(currentWk, currentDayName, "EVE")
        ];
        
        if (currentDayIndex < 6) {
          var nextDayIdx = currentDayIndex + 1;
          var valMor = findDeepDraw(nextDayIdx, "MOR");
          var valMid = findDeepDraw(nextDayIdx, "MID");
          
          if (!valMor && nextDayIdx === 1) {
            valMor = findDeepDraw(2, "MOR");
            valMid = findDeepDraw(2, "MID");
          }
          highlightB = [valMor, valMid];
        }
      }
    }
    
    // Combine active highlights
    highlightA.concat(highlightB).forEach(function(val) {
      if (val && activeHighlights.indexOf(val) === -1) {
        activeHighlights.push(val);
      }
    });
  }
  
  // Active colors mapping (bright colors for highlights - from index.html)
  var activeColors = {
    "01":"#ff6b6b",
    "1":"#ff6b6b", 
    "02":"#ffa94d",
    "2":"#ffa94d", 
    "03":"#ffd43b",
    "3":"#ffd43b",
    "04":"#69db7c",
    "4":"#69db7c", 
    "05":"#38d9a9",
    "5":"#38d9a9", 
    "06":"#4dabf7",
    "6":"#4dabf7",
    "07":"#9775fa",
    "7":"#9775fa", 
    "08":"#f783ac",
    "8":"#f783ac", 
    "09":"#ff922b",
    "9":"#ff922b",
    "10":"#fab005", 
    "11":"#82c91e", 
    "12":"#20c997", 
    "13":"#339af0", 
    "14":"#845ef7", 
    "15":"#e599f7",
    "16":"#ff8787", 
    "17":"#ffc078", 
    "18":"#f28005", 
    "19":"#8ce99a", 
    "20":"#63e6be", 
    "21":"#74c0fc",
    "22":"#b197fc", 
    "23":"#faa2c1", 
    "24":"#ffa8a8", 
    "25":"#ffec99", 
    "26":"#c0eb75", 
    "27":"#96f2d7",
    "28":"#a5d8ff", 
    "29":"#d0bfff", 
    "30":"#fcc2d7", 
    "31":"#ff6b6b", 
    "32":"#ffa94d", 
    "33":"#ffd43b",
    "34":"#69db7c", 
    "35":"#4dabf7", 
    "36":"#9775fa"
  };
  
  function isHighlighted(value, gameType, searchTerm) {
    if (!value) return false;
    var valStr = value.toString();
    
    // For Play Whe: check Leaving/Meeting highlights
    if (gameType === 'pw' && activeHighlights.indexOf(valStr) !== -1) {
      return true;
    }
    
    // Check user search (auto-highlight as they type)
    if (searchTerm && searchTerm.length > 0) {
      var searchTerms = searchTerm.split(/[ ,]+/);
      for (var s = 0; s < searchTerms.length; s++) {
        var term = searchTerms[s].trim();
        if (term && valStr === term) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Get background color (light mode: white background for non-highlighted numbers)
  function getNumberStyle(value, gameType, isHigh) {
    if (!value) return "";
    var valStr = value.toString();
    
    if (isHigh) {
      var color = activeColors[valStr] || "#ff9f0a";
      return 'style="background:' + color + '; color:#000; font-weight:bold; border-radius:50%; display:inline-block; width:24px; height:24px; line-height:24px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.1);"';
    }
    
    // Non-highlighted: just plain text (no colored ball)
    return 'style="font-weight:bold; color:#333; display:inline-block; text-align:center; min-width:24px;"';
  }
  
  function formatDisplayValue(value, gameType) {
    if (!value) return "—";
    var valStr = value.toString();
    
    if (gameType === 'pw') {
      // Trim leading zeros: "01" → "1"
      return trimLeadingZeros(valStr);
    } else if (gameType === 'p2') {
      // Pick 2: format as "#/#" (e.g., "12/34")
      var parts = valStr.split(/[,/ ]+/);
      if (parts.length >= 2) {
        return trimLeadingZeros(parts[0]) + "/" + trimLeadingZeros(parts[1]);
      }
      return trimLeadingZeros(valStr);
    } else if (gameType === 'p4') {
      // Pick 4: format as "####" (4 digits) - preserve leading zeros within the number
      var cleanNum = valStr.replace(/[^0-9]/g, '');
      if (cleanNum.length === 8) {
        // Show as 4-digit number (e.g., "0340" not "340")
        return cleanNum;
      }
      return valStr;
    }
    return trimLeadingZeros(valStr);
  }
  
  // Build HTML table - LIGHT MODE (white background, black text)
  var html = "<div style='overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%;'>";
  html += "<table style='width: auto; min-width: 1000px; border-collapse:collapse; font-size:12px; background:#ffffff; color:#333; box-shadow:0 1px 3px rgba(0,0,0,0.1);'>";
  html += "<thead>";
  html += "<tr style='background:#f5f5f5; border-bottom:2px solid #ddd;'>";
  html += "<th style='padding:5px 4px; position:sticky; left:0; background:#f5f5f5; z-index:20; text-align:center; font-weight:800; color:#555;'>WEEK</th>";
  for (var i = 0; i < dayNames.length; i++) {
    html += "<th colspan='4' style='padding:2px 2px; border-left:1px solid #ddd; text-align:center; font-weight:800; color:#555;'>" + dayNames[i].slice(0,3).toUpperCase() + "</th>";
  }
  html += "</tr>";
  html += "<tr style='background:#fafafa; border-bottom:1px solid #ddd;'>";
  html += "<th style='padding:3px 2px; position:sticky; left:0; background:#fafafa; z-index:20;'></th>";
  for (var j = 0; j < dayNames.length; j++) {
    for (var s = 0; s < slots.length; s++) {
      html += "<th style='padding:3px 2px; font-size:10px; color:#888; font-weight:600; text-align:center;'>" + slots[s] + "</th>";
    }
  }
  html += "<tr></thead><tbody>";
  
  for (var w = 0; w < displayWeeks.length; w++) {
    var week = displayWeeks[w];
    // WEEK column shows short date format: d/mm/yy
    var weekDate = week.startDate ? formatWeekDateShort(week.startDate) : 'Week ' + (w + 1);
    var isCurrent = week.isCurrentWeek === true;
    var rowStyle = isCurrent ? "background: #fff9db; outline: 1px solid #ff9d00;" : "border-bottom:1px solid #eee;";
    
    html += "<tr style='" + rowStyle + "'>";
    html += "<td style='background:#f5f5f5; padding:4px 3px; font-weight:bold; font-size:10px; border-right:1px solid #ddd; white-space:nowrap; position:sticky; left:0; z-index:10; text-align:center;'>" + weekDate + "</td>";
    
    for (var d = 0; d < dayNames.length; d++) {
      var day = week.days.find(function(dy) { return dy.dayName === dayNames[d]; });
      
      // Check if this entire day has no draws
      var hasAnyDraw = day && slots.some(function(slot) {
        var val = day.draws[slot];
        return val && val !== "-" && val !== "PENDING";
      });
      
      // For non-current weeks with no draws → HOLIDAY
      // For current week with no draws → show "..." (pending)
      if (!hasAnyDraw) {
        if (isCurrent) {
          // Current week with no draws yet → show pending dots
          html += "<td colspan='4' style='background:#fafafa; font-size:10px; text-align:center; border-left:1px solid #eee; padding:12px 4px; color:#aaa;'>...</td>";
        } else {
          // Past week with no draws → HOLIDAY
          html += "<td colspan='4' style='background:#fafafa; color:#ff453a; font-size:10px; text-align:center; border-left:1px solid #eee; padding:12px 4px; font-weight:bold;'>🇹🇹HOLIDAY🇹🇹</td>";
        }
      } else {
        for (var sIdx = 0; sIdx < slots.length; sIdx++) {
          var val = day ? day.draws[slots[sIdx]] : null;
          var hasValue = (val && val !== "-" && val !== "PENDING");
          var borderLeft = (sIdx === 0) ? "1px solid #ddd" : "1px solid #eee";
          var isFuture = isFutureDate(week, d, sIdx);
          
          html += "<td style='border-left:" + borderLeft + "; text-align:center; padding:6px 2px; min-width:36px;'>";
          
          if (hasValue) {
            var valStr = val.toString();
            var isHigh = isHighlighted(valStr, gameType, searchTerm);
            var displayVal = formatDisplayValue(valStr, gameType);
            var styleAttr = getNumberStyle(valStr, gameType, isHigh);
            
            if (gameType === 'pw' && isHigh) {
              html += "<span " + styleAttr + ">" + displayVal + "</span>";
            } else if (gameType === 'pw' && !isHigh) {
              html += "<span style='font-weight:bold; color:#333; display:inline-block; text-align:center; min-width:28px;'>" + displayVal + "</span>";
            } else if (gameType === 'p2') {
              html += "<span style='font-weight:bold; color:#333; font-size:12px;'>" + displayVal + "</span>";
            } else if (gameType === 'p4') {
              html += "<span style='font-weight:bold; color:#333; font-family:monospace; font-size:12px;'>" + displayVal + "</span>";
            } else {
              html += "<span style='font-weight:bold; color:#333;'>" + displayVal + "</span>";
            }
          } else if (isCurrent && (isFuture || !hasValue)) {
            // Current week: future draws or pending slots → show "..."
            html += "<span style='color:#aaa; font-size:12px;'>...</span>";
          } else {
            html += "<span style='color:#ccc;'>—</span>";
          }
          html += "</td>";
        }
      }
    }
    html += "</tr>";
  }
  
  html += "</tbody></table></div>";
  container.innerHTML = html;
}
`;

  const html = `
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <style>
      :root { 
      --bg: #020617; 
      --accent: #ff9d00; 
      --card: rgba(255,255,255,0.05); 
      }
      body { 
      background: linear-gradient(180deg, var(--bg) 0%, #0f172a 100%); 
      color: white; 
      font-family: -apple-system, sans-serif;
      margin: 0; 
      padding-bottom: 18px; 
      }
      .nav-scroll { 
      position: sticky; 
      top: 0; 
      background: rgba(2,6,23,0.95); 
      backdrop-filter: blur(15px); 
      padding: 6px; 
      overflow-x: auto; 
      white-space: nowrap; 
      border-bottom: 1px solid rgba(255,255,255,0.1); 
      z-index: 1000; 
      display: flex; 
      gap: 8px; 
      }
      .nav-scroll::-webkit-scrollbar { 
      display: none; 
      }
      .tab { 
      padding: 5px 14px; 
      border-radius: 8px; 
      background: var(--card); 
      color: #888; 
      font-weight: 800; 
      font-size: 12px; 
      border: none; 
      flex-shrink: 0; 
      }
      .tab.active { 
      background: linear-gradient(135deg, #ff9d00, #ff6b00); 
      color: black; 
      box-shadow: 0 4px 12px rgba(255,157,0,0.2); 
      }
      
      .container { 
      display: none; 
      padding: 12px; 
      animation: fadeIn 0.3s ease; 
      }
      .container.active { 
      display: block; 
      }
      @keyframes fadeIn { 
        from { 
          opacity: 0; 
          transform: translateY(5px); 
          } 
      to { opacity: 1; transform: translateY(0); } 
      }

      /* Carousel Styles - for previous weeks only */
      .carousel-container {
        margin-bottom: 2px;
        background: rgba(0,0,0,0.2);
        border-radius: 20px;
        padding: 2px 0;
      }
      .carousel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2px;
        padding: 0 2px;
      }
      .carousel-title {
        font-size: 12px;
        font-weight: bold;
        color: #94a3b8;
        letter-spacing: 1px;
      }
      .carousel-nav {
        display: flex;
        gap: 2px;
      }
      .carousel-btn {
        background: var(--card);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 2px 2px;
        color: white;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .carousel-btn:hover {
        background: var(--accent);
        color: black;
        border-color: var(--accent);
      }
      .carousel-btn:active {
        transform: scale(0.95);
      }
      .carousel-indicators {
        display: flex;
        justify-content: center;
        gap: 2px;
        margin-top: -10px;
        margin-bottom: 2px;
      }
      .carousel-dot {
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .carousel-dot.active {
        background: var(--accent);
        width: 2px;
        border-radius: 3px;
      }
      .carousel-track {
        overflow-x: scroll;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        display: flex;
        gap: 2px;
        padding: 2px 2px;
      }
      .carousel-track::-webkit-scrollbar {
        display: none;
      }
      .carousel-slide {
        scroll-snap-align: start;
        flex: 0 0 100%;
        min-width: 0;
      }
      
      /* Current week/month section - fixed at bottom */
      .current-section {
        margin-top: 5px;
        border-top: 1px solid rgba(255,157,0,0.3);
        padding-top: 11px;
      }
      .current-label {
        font-size: 12px;
        font-weight: bold;
        color: #00ff88;
        text-align: center;
        margin-bottom: 10px;
        letter-spacing: 2px;
      }

      .table-wrapper { 
      background: var(--card); 
      border-radius: 20px; 
      margin-bottom: 2px; 
      border: 1px solid rgba(255,255,255,0.1); 
      overflow: hidden; 
      backdrop-filter: blur(10px); 
      }
      .section-header { 
      padding: 7px 7px; 
      font-size: 12px; 
      color: var(--accent); 
      font-weight: 900; 
      background: rgba(255,255,255,0.05); 
      display: flex; 
      justify-content: space-between; 
      border-left: 4px solid var(--accent); 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      }
      .current-header {
        border-left-color: #00ff88;
        color: #00ff88;
      }
      
      table { 
      width: 100%; 
      border-collapse: collapse; 
      }
      th { 
      font-size: 14px; 
      color: #64748b; 
      padding: 3px; 
      text-align: center; 
      border-bottom: 1px solid rgba(255,255,255,0.05); 
      }
      td { 
      padding: 2px 2px; 
      text-align: center; 
      border-bottom: 1px solid rgba(255,255,255,0.05); 
      }
      
      .day-label { 
      color: var(--accent); 
      font-weight: 900; 
      font-size: 14px; 
      text-align: left; 
      padding-left: 9px; 
      }
      .res-text { 
      font-family: 'SF Mono', monospace; 
      font-size: 18px; 
      font-weight: 800; 
      }
      
      /* Pulse Animation */
      @keyframes pulse { 0% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; color: var(--accent); } 100% { opacity: 0.4; transform: scale(0.98); } }
      
      .awaiting { 
      font-size: 10px; 
      font-weight: bold; 
      animation: pulse 2s infinite; letter-spacing: 1px; 
      color: #94a3b8; 
      }
      .holiday { 
      background: #1e293b; 
      color: #f1f5f9; 
      padding: 4px 6px; 
      border-radius: 4px; 
      font-size: 10px; 
      font-weight: 800; 
      display: inline-block;
      }

      /* Ball Styles */
      .ball-grid { 
      display: flex; 
      justify-content: flex-end; 
      gap: 2px; 
      flex-wrap: wrap;
      }
      .ball { 
      width: 22px; 
      height: 22px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: rgba(255,255,255,0.1); 
      border-radius: 8px; 
      font-family: monospace; 
      font-weight: bold; 
      font-size: 12px; 
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.1); 
      }
      .ball.main { 
      background: #ffd700; 
      color: black; 
      border: none; 
      }
      .ball.pb { 
      background: #cc0000; 
      color: white; 
      border: none; 
      }
      .ball.cb { 
      background: #00aa00; 
      color: white; 
      border: none; 
      }
      .ball.mult { 
      background: white; 
      color: black; 
      border: none; 
      }
      
      /* Modal Landscape Mode Styles */
      #drawChartModal-pw, #drawChartModal-p2, #drawChartModal-p4 {
        overflow: auto !important;
      }
      #drawChartContent-pw, #drawChartContent-p2, #drawChartContent-p4 {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      #drawChartContent-pw table, #drawChartContent-p2 table, #drawChartContent-p4 table {
        min-width: 1000px;
        width: auto;
      }

      .footer { 
      text-align: center; 
      padding: 6px; 
      color: #555; 
      font-size: 14px; 
      letter-spacing: 1px; 
      }
    </style>
  </head>
  <body>
    <div class="nav-scroll">
      <button class="tab active" onclick="sw('pw', this)">PLAY WHE <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('p2', this)">PICK 2 <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('p4', this)">PICK 4 <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('cp', this)">CASH POT <br> Week to Week <br> Chart</button>
      <button class="tab" onclick="sw('p5', this)">LOTTO PLUS <br> Month to Month <br> Chart</button>
      <button class="tab" onclick="sw('w4l', this)">WIN 4 LIFE <br> Month to Month <br> Chart</button>
    </div>

<div id="pw" class="container active">
  <!-- 2x2 Button Row: Coming Under + Draw Chart -->
  <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
    <button onclick="openComingUnderModal('P2WHE')" style="background: linear-gradient(135deg, #ff9d00, #ff6b00); border: none; border-radius: 30px; padding: 10px 10px; color: black; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(255,157,0,0.3);">
      <span>♠️</span> COMING UNDER: PLAY WHE <br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
    <button onclick="openDrawChart('pw')" style="background: linear-gradient(135deg, #4a90e2, #357abd); border: none; border-radius: 30px; padding: 10px 10px; color: white; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(74,144,226,0.3);">
      <span>📅</span> DRAW CHART: PLAY WHE<br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
  </div>
  
  ${renderCarouselWithCurrentGrid(pw, "pw")}
  <br>
  ${generatePlayWheReadout(pw ? pw.weeks : [])}
  <br>
  ${generateChartPlayAnalysis(pw ? pw.weeks : [])}
  <br>
${renderChartPlayMapping(pw ? pw.weeks : [])}
  <br>
  ${renderPlayWheChartMapping(pw ? pw.weeks : [])}
  <br>
  ${renderMonthlyCarousel(pw, "P2WHE", "PLAY WHE")}
  <br>
  ${generateConfidenceInsights(pw)}
  <br>
  ${generateDualInsights(pw)}
  <br>
  ${generateLegacyInsights(pw)}
  <br>
  ${renderAdvancedAnalysis(pw ? pw.weeks : [])}
  ${renderComingUnderModalWeekly(pw ? pw.weeks : [], "PLAY WHE", "P2WHE")}
</div>

<div id="p2" class="container">
  <!-- 2x2 Button Row: Coming Under + Draw Chart -->
  <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
    <button onclick="openComingUnderModal('PIKII')" style="background: linear-gradient(135deg, #ff9d00, #ff6b00); border: none; border-radius: 30px; padding: 10px 10px; color: black; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(255,157,0,0.3);">
      <span>♠️</span> COMING UNDER: PICK 2<br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
    <button onclick="openDrawChart('p2')" style="background: linear-gradient(135deg, #4a90e2, #357abd); border: none; border-radius: 30px; padding: 10px 10px; color: white; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(74,144,226,0.3);">
      <span>📅</span> DRAW CHART: PICK 2<br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
  </div>
  
  ${renderCarouselWithCurrentPick2(p2)}
  <br>
  ${renderMonthlyCarousel(p2, "PIKII", "PICK 2")}
  <br>
  ${renderPick2CurrentWeekPlays(p2 ? p2.weeks : [])}
  ${renderComingUnderModalWeekly(p2 ? p2.weeks : [], "PICK 2", "PIKII")}
</div>

<div id="p4" class="container">
  <!-- 2x2 Button Row: Coming Under + Draw Chart -->
  <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">
    <button onclick="openComingUnderModal('PIKIV')" style="background: linear-gradient(135deg, #ff9d00, #ff6b00); border: none; border-radius: 30px; padding: 10px 10px; color: black; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(255,157,0,0.3);">
      <span>♠️</span> COMING UNDER: PICK 4<br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
    <button onclick="openDrawChart('p4')" style="background: linear-gradient(135deg, #4a90e2, #357abd); border: none; border-radius: 30px; padding: 10px 10px; color: white; font-weight: 800; font-size: 9px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(74,144,226,0.3);">
      <span>📅</span> DRAW CHART: PICK 4<br> ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(/,/g, ' ')}
    </button>
  </div>
  
  ${renderCarouselWithCurrentPick4(p4)}
  <br>
  ${renderMonthlyCarousel(p4, "PIKIV", "PICK 4")}
  <br>
  ${renderPick4CurrentWeekPlays(p4 ? p4.weeks : [])}
  ${renderComingUnderModalWeekly(p4 ? p4.weeks : [], "PICK 4", "PIKIV")}
</div>

<div id="cp" class="container">
  ${renderCarouselWithCurrentCashPot(cp)}
  <br>
  ${renderMonthlyCarousel(cp, "CASHPOT", "CASH POT")}
</div>

<div id="p5" class="container">
  ${renderCarouselWithCurrentLotto(lotto)}
  <br>
  ${renderMonthlyCarousel(lotto, "LOTTO", "LOTTO PLUS")}
</div>

<div id="w4l" class="container">
  ${renderCarouselWithCurrentWinForLife(w4l)}
  <br>
  ${renderMonthlyCarousel(w4l, "W4L", "WIN 4 LIFE")}
</div>

    <div class="footer" style="padding: 15px; margin-top: 10px; position: relative;">
  <div style="height: 1px; width: 100%; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.3; margin-bottom: 15px;"></div>
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10px;">
    <div style="text-align: left;">
      <div style="font-size: 11px; font-weight: bold; color: #fff;">FSP SAGi</div>
      <div style="font-size: 9px; color: #64748b;">Unified Intelligence Dashboard</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: bold; color: var(--accent);">CWG ANALYTICS</div>
      <div style="font-size: 9px; color: #64748b;">Build: 310126-C</div>
    </div>
  </div>
</div>

  <!-- DRAW CHART MODALS -->
  <div id="drawChartModal-pw" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; overflow: auto;">
    <div style="max-width: 100%; margin: 20px auto; background: #0f172a; border-radius: 20px; border: 1px solid #4a90e2; overflow: hidden;">
      <div style="padding: 4px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: #ff9d00;">📅 DRAW CHART • PLAY WHE</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;" id="drawChartRange-pw">Loading...</div>
        </div>
        <button onclick="closeDrawChart('pw')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 30px; padding: 8px 18px; color: white; font-weight: bold; cursor: pointer;">✕ CLOSE</button>
      </div>
<div style="padding: 4px 8px; background: #f0f0f0; border-bottom: 1px solid #ddd;">
  <div style="display: flex; gap: 5px; align-items: center; flex-wrap: wrap;">
    <span style="color: #555; font-size: 12px;">🔍 Search Marks:</span>
    <input type="text" id="searchInput-pw" placeholder="e.g., 4,12,16,29" style="flex: 1; padding: 4px 6px; border-radius: 20px; border: 1px solid #4a90e2; background: #fff; color: #333; font-size: 9px;">
    <label style="display: flex; align-items: center; gap: 4px; color: #555; font-size: 11px;">
      <span>Weeks:</span>
      <select id="weekCount-pw" onchange="filterDrawChart('pw')" style="background: #fff; color: #333; border: 1px solid #4a90e2; border-radius: 8px; padding: 6px 10px;">
        <option value="4">4 Weeks</option>
        <option value="8">8 Weeks</option>
        <option value="12" selected>12 Weeks</option>
        <option value="16">16 Weeks</option>
        <option value="24">24 Weeks</option>
      </select>
    </label>
  </div>
</div>
      <div id="drawChartContent-pw" style="padding: 4px; overflow-x: auto; max-height: 65vh; overflow-y: auto;"></div>
      <div style="padding: 10px; text-align: center; border-top: 1px solid #334155; font-size: 9px; color: #64748b;">CHART ANALYSIS • CWG ©️ DRAW HISTORY</div>
    </div>
  </div>
  
  <div id="drawChartModal-p2" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; overflow: auto;">
    <div style="max-width: 95%; margin: 20px auto; background: #0f172a; border-radius: 20px; border: 1px solid #4a90e2; overflow: hidden;">
      <div style="padding: 4px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: #ff9d00;">📅 DRAW CHART • PICK 2</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;" id="drawChartRange-p2">Loading...</div>
        </div>
        <button onclick="closeDrawChart('p2')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 30px; padding: 8px 18px; color: white; font-weight: bold; cursor: pointer;">✕ CLOSE</button>
      </div>
      <div style="padding: 4px 8px; background: #1e293b; border-bottom: 1px solid #334155;">
        <label style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 11px;">
          <span>Weeks:</span>
          <select id="weekCount-p2" onchange="filterDrawChart('p2')" style="background: #0f172a; color: white; border: 1px solid #4a90e2; border-radius: 8px; padding: 6px 5px;">
            <option value="4">4 Weeks</option>
            <option value="8">8 Weeks</option>
            <option value="12" selected>12 Weeks</option>
            <option value="16">16 Weeks</option>
            <option value="24">24 Weeks</option>
          </select>
        </label>
      </div>
      <div id="drawChartContent-p2" style="padding: 4px; overflow-x: auto; max-height: 65vh; overflow-y: auto;"></div>
      <div style="padding: 10px; text-align: center; border-top: 1px solid #334155; font-size: 9px; color: #64748b;">CHART ANALYSIS • CWG ©️ DRAW HISTORY</div>
    </div>
  </div>
  
  <div id="drawChartModal-p4" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; overflow: auto;">
    <div style="max-width: 100%; margin: 20px auto; background: #0f172a; border-radius: 20px; border: 1px solid #4a90e2; overflow: hidden;">
      <div style="padding: 4px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: #ff9d00;">📅 DRAW CHART • PICK 4</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;" id="drawChartRange-p4">Loading...</div>
        </div>
        <button onclick="closeDrawChart('p4')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 30px; padding: 8px 18px; color: white; font-weight: bold; cursor: pointer;">✕ CLOSE</button>
      </div>
      <div style="padding: 4px 8px; background: #1e293b; border-bottom: 1px solid #334155;">
        <label style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 11px;">
          <span>Weeks:</span>
          <select id="weekCount-p4" onchange="filterDrawChart('p4')" style="background: #0f172a; color: white; border: 1px solid #4a90e2; border-radius: 8px; padding: 6px 10px;">
            <option value="4">4 Weeks</option>
            <option value="8">8 Weeks</option>
            <option value="12" selected>12 Weeks</option>
            <option value="16">16 Weeks</option>
            <option value="24">24 Weeks</option>
          </select>
        </label>
      </div>
      <div id="drawChartContent-p4" style="padding: 4px; overflow-x: auto; max-height: 65vh; overflow-y: auto;"></div>
      <div style="padding: 6px; text-align: center; border-top: 1px solid #334155; font-size: 9px; color: #64748b;">CHART ANALYSIS • CWG ©️ DRAW HISTORY</div>
    </div>
  </div>
  </div>
  
    <script>
    ${workingDrawChartFunctions}
    
      function sw(id, el) {
document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        el.classList.add('active');
        window.scrollTo(0,0);
      }
      
      function initPrevCarousel(containerId, itemsLength) {
        const track = document.getElementById(containerId + '-track');
        const prevBtn = document.getElementById(containerId + '-prev');
        const nextBtn = document.getElementById(containerId + '-next');
        const dotsContainer = document.getElementById(containerId + '-dots');
        if (!track || !prevBtn || !nextBtn || itemsLength <= 0) return;
        
        let currentIndex = 0;
        let scrollTimeout;
        
        function updateDots() {
          if (!dotsContainer) return;
          const dots = dotsContainer.querySelectorAll('.carousel-dot');
          dots.forEach((dot, i) => {
            if (i === currentIndex) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }

        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= itemsLength) index = itemsLength - 1;
          currentIndex = index;
          const slideWidth = track.children[0]?.offsetWidth || 0;
          if (slideWidth > 0) {
            track.scrollTo({ left: index * (slideWidth + 16), behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            const slideWidth = track.children[0]?.offsetWidth || 0;
            const scrollPosition = track.scrollLeft;
            const newIndex = Math.round(scrollPosition / (slideWidth + 16));
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < itemsLength) {
              currentIndex = newIndex;
              updateDots();
            }
          }, 100);
        }
        
        prevBtn.onclick = () => scrollToSlide(currentIndex - 1);
        nextBtn.onclick = () => scrollToSlide(currentIndex + 1);
        track.addEventListener('scroll', handleScroll);
        
        if (dotsContainer && itemsLength > 1) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i < itemsLength; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
            dot.onclick = () => scrollToSlide(i);
            dotsContainer.appendChild(dot);
          }
        }
        
        setTimeout(() => scrollToSlide(0), 100);
      }
      
    </script>
  </body>
  </html>`;

 let wv = new WebView();
  await wv.loadHTML(html);
  await wv.present();
}

async function fetchData(url) {
  try { return (await new Request(url).loadJSON()).data; } catch(e) { return null; }
}

// ======================================
// Helper function to trim leading zeros
// ======================================
function trimLeadingZeros(str) {
  if (!str) return "";
  let strVal = String(str);
  let trimmed = strVal.replace(/^0+/, '');
  return trimmed === "" ? "0" : trimmed;
}

// ======================================
// Helper function to get sort key for matching combinations
// ======================================
function getSortKey(value) {
  if (!value || value === "-" || value === "PENDING" || value === "") return null;
  let strVal = String(value).trim();
  let parts = strVal.includes(",") || strVal.includes("/") ? strVal.split(/[,/]/) : strVal.split("");
  return parts.map(n => n.trim()).filter(n => n !== "").sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).join("|");
}

// ======================================
// Helper function to get consistent colors for matching combinations
// ======================================
function getMatchColor(index) {
  const colors = ["#00f2ff", "#7c02b5", "#32d74b", "#ff375f", "#ffd60a", "#ff9f0a", "#007aff", "#ff2d55", "#5856d6", "#bf5af2"];
  return colors[index % colors.length];
}

// ======================================
// RENDER PLAY WHE WITH CAROUSEL ABOVE + CURRENT FIXED
// ======================================
function renderCarouselWithCurrentGrid(data, containerId) {
  if (!data?.weeks) return "";
  
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let slots = ["MOR", "MID", "NON", "EVE"];
  
  const now = new Date();
  const filteredWeeks = data.weeks.filter(wk => new Date(wk.startDate) <= now || wk.isCurrentWeek);
  const sortedWeeks = filteredWeeks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  if (sortedWeeks.length === 0) return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No data available</div>';
  
  const previousWeeks = sortedWeeks.slice(0, -1);
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Build carousel slides for previous weeks
  const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
    const sDate = new Date(wk.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const weekNum = previousWeeks.length - idx;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ P.WK ${weekNum}</span>
          <span>${wk.startDate} — ${formattedEndDate}</span>
        </div>
        <table>
          <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
          ${dayNames.map((dName, dIdx) => {
            let day = wk.days.find(d => d.dayName === dName);
            const isToday = dName === todayName;
            
   // --- Day Number Calculation ---
            let dayDisplay = dName.slice(0,3).toUpperCase();
            if (wk.startDate && !isNaN(sDate.getTime())) {
              let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${targetDate.getDate()}`;
            }
            
            const allSlotsEmpty = slots.every(s => {
              let val = day?.draws[s];
              return !val || val === "-" || val === "PENDING";
            });
            
            if (allSlotsEmpty) {
              return `<tr style="${isToday ? 'background: rgba(255, 157, 0, 0.08);' : ''}">
                <td class="day-label" style="${isToday ? 'color: #ff9d00;' : ''}">${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 3px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                </td>
              </tr>`;
            } else {
              return `<tr style="${isToday ? 'background: rgba(255, 157, 0, 0.08);' : ''}">
                <td class="day-label" style="${isToday ? 'color: #ff9d00;' : ''}">${dayDisplay}</td>
                ${slots.map(s => {
                  let val = day?.draws[s];
                  let display = (val && val !== "-" && val !== "PENDING") ? val : '<span class="awaiting">...</span>';
                  return `<td class="res-text">${display}</td>`;
                }).join('')}
              </tr>`;
            }
          }).join('')}
        </table>
      </div>
    </div>`;
  }).join('');
  
  // Render current week
// Render current week
  const sDate = new Date(currentWeek.startDate);
  const eDate = new Date(sDate);
  eDate.setDate(sDate.getDate() + 6);
  const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // Helper function to check if a day has passed
  function isDayPassed(weekStartDate, dayIndex) {
    const start = new Date(weekStartDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  }
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT WEEK ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentWeek.startDate} — ${formattedEndDate}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${dayNames.map((dName, dIdx) => {
          let day = currentWeek.days.find(d => d.dayName === dName);
          const isToday = dName === todayName;
          
          // --- Day Number Calculation ---
          let dayDisplay = dName.slice(0,3).toUpperCase();
          if (currentWeek.startDate && !isNaN(sDate.getTime())) {
            let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
            dayDisplay += ` ${targetDate.getDate()}`;
          }
          
          // Check if all slots are empty for this day
          const allSlotsEmpty = slots.every(s => {
            let val = day?.draws[s];
            return !val || val === "-" || val === "PENDING";
          });
          
          // If all slots empty AND the day has passed, show HOLIDAY
          if (allSlotsEmpty && isDayPassed(currentWeek.startDate, dIdx)) {
            return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
              <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }

          return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
            <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
            ${slots.map(s => {
              let val = day?.draws[s];
              let display = (val && val !== "-" && val !== "PENDING") ? val : '<span class="awaiting">...</span>';
              return `<td class="res-text">${display}</td>`;
            }).join('')}
          </tr>`;
        }).join('')}
      </table>
    </div>
  </div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="${containerId}-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.Wks (${previousWeeks.length} available)</span>
    </div>
    <div class="carousel-track" id="${containerId}-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="${containerId}-dots"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.18; font-weight:600; letter-spacing:2px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:12px;">CODEWITHGLASGOW ©️ DIGITAL CHARTS</p></div>
  <script>initPrevCarousel('${containerId}', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}

// ======================================
// RENDER PICK 2 WITH CAROUSEL ABOVE + CURRENT FIXED (Bidirectional Highlighting)
// ======================================
function renderCarouselWithCurrentPick2(data) {
  if (!data?.weeks) return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No Pick 2 data available</div>';
  
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let slots = ["MOR", "MID", "NON", "EVE"];
  
  const now = new Date();
  const filteredWeeks = data.weeks.filter(wk => new Date(wk.startDate) <= now || wk.isCurrentWeek);
  const sortedWeeks = filteredWeeks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  if (sortedWeeks.length === 0) return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No data available</div>';
  
  const previousWeeks = sortedWeeks.slice(0, -1);
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  let currentWeekCombos = new Set();
  let colorMap = {};
  let colorIndex = 0;
  
  currentWeek.days.forEach(day => {
    slots.forEach(slot => {
      let key = getSortKey(day.draws[slot]);
      if (key) currentWeekCombos.add(key);
    });
  });
  
  currentWeekCombos.forEach(key => {
    colorMap[key] = getMatchColor(colorIndex);
    colorIndex++;
  });
  
  // Build carousel slides for previous weeks
  const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
    const sDate = new Date(wk.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const weekNum = previousWeeks.length - idx;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ P.Wk ${weekNum}</span>
          <span>${wk.startDate} — ${formattedEndDate}</span>
        </div>
        <table>
          <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
          ${dayNames.map((dName, dIdx) => {
            let day = wk.days.find(d => d.dayName === dName);
            
     // --- Day Number Calculation ---
            let dayDisplay = dName.slice(0,3).toUpperCase();
            if (wk.startDate && !isNaN(sDate.getTime())) {
              let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${targetDate.getDate()}`;
            }

            const allSlotsEmpty = slots.every(slot => {
              let val = day?.draws[slot];
              return !val || val === "-" || val === "PENDING";
            });
            
            if (allSlotsEmpty) {
              return `<tr>
                <td class="day-label">${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 3px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                </td>
              </tr>`;
            } else {
              return `<tr>
                <td class="day-label">${dayDisplay}</td>
                ${slots.map(slot => {
                  let val = day?.draws[slot];
                  let key = getSortKey(val);
                  let matchColor = colorMap[key];
                  let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:6px; font-weight:900; display:inline-block; padding:2px 2px;"` : `style="font-family: monospace; font-weight:900; font-size:16px;"`;
                  return `<td><span ${style}>${val || '—'}</span></td>`;
                }).join('')}
              </tr>`;
            }
          }).join('')}
        </table>
      </div>
    </div>`;
  }).join('');
  
  // Render current week
// Helper function to check if a day has passed
  function isDayPassed(weekStartDate, dayIndex) {
    const start = new Date(weekStartDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  }
  
  // Render current week
  const sDate = new Date(currentWeek.startDate);
  const eDate = new Date(sDate);
  eDate.setDate(sDate.getDate() + 6);
  const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT WEEK ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentWeek.startDate} — ${formattedEndDate}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${dayNames.map((dName, dIdx) => {
          let day = currentWeek.days.find(d => d.dayName === dName);
          const isToday = dName === todayName;
          
          // --- Day Number Calculation ---
          let dayDisplay = dName.slice(0,3).toUpperCase();
          if (currentWeek.startDate && !isNaN(sDate.getTime())) {
            let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
            dayDisplay += ` ${targetDate.getDate()}`;
          }
          
          // Check if all slots are empty for this day
          const allSlotsEmpty = slots.every(slot => {
            let val = day?.draws[slot];
            return !val || val === "-" || val === "PENDING";
          });
          
          // If all slots empty AND the day has passed, show HOLIDAY
          if (allSlotsEmpty && isDayPassed(currentWeek.startDate, dIdx)) {
            return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
              <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }

          return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
            <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
            ${slots.map(slot => {
              let val = day?.draws[slot];
              let key = getSortKey(val);
              let matchColor = colorMap[key];
              if (!val || val === "-" || val === "PENDING") {
                return `<td><span class="awaiting">...</span></td>`;
              }
              let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:6px; font-weight:900; display:inline-block; padding:2px 2px;"` : `style="font-family: monospace; font-weight:900; font-size:16px;"`;
              return `<td><span ${style}>${val}</span></td>`;
            }).join('')}
          </tr>`;
        }).join('')}
      </table>
    </div>
  </div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="p2-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.Wks (${previousWeeks.length} available)</span>
    </div>
    <div class="carousel-track" id="p2-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="p2-dots"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.18; font-weight:600; letter-spacing:2px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:12px;">CODEWITHGLASGOW ©️ DIGITAL CHARTS</p></div>
  <script>initPrevCarousel('p2', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}

// =======================================
// RENDER PICK 4 WITH CAROUSEL ABOVE + CURRENT FIXED
// =======================================
function renderCarouselWithCurrentPick4(data) {
  if (!data?.weeks) return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No Pick 4 data available</div>';
  
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let slots = ["MOR", "MID", "NON", "EVE"];
  
  const now = new Date();
  const filteredWeeks = data.weeks.filter(wk => new Date(wk.startDate) <= now || wk.isCurrentWeek);
  const sortedWeeks = filteredWeeks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  if (sortedWeeks.length === 0) return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No data available</div>';
  
  const previousWeeks = sortedWeeks.slice(0, -1);
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  let drawCounts = {};
  let colorMap = {};
  let colorIndex = 0;
  
  sortedWeeks.forEach(wk => {
    wk.days.forEach(day => {
      slots.forEach(slot => {
        let key = getSortKey(day.draws[slot]);
        if (key) {
          drawCounts[key] = (drawCounts[key] || 0) + 1;
        }
      });
    });
  });
  
  Object.keys(drawCounts).forEach(key => {
    if (drawCounts[key] > 1) {
      colorMap[key] = getMatchColor(colorIndex);
      colorIndex++;
    }
  });
  
  // Build carousel slides for previous weeks
  const prevSlidesHtml = previousWeeks.reverse().map((wk, idx) => {
    const sDate = new Date(wk.startDate);
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 6);
    const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const weekNum = previousWeeks.length - idx;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ P.Wk ${weekNum}</span>
          <span>${wk.startDate} — ${formattedEndDate}</span>
        </div>
        <table>
          <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
          ${dayNames.map((dName, dIdx) => {
            let day = wk.days.find(d => d.dayName === dName);
            
            // --- Day Number Calculation ---
            let dayDisplay = dName.slice(0,3).toUpperCase();
            if (wk.startDate && !isNaN(sDate.getTime())) {
              let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
              dayDisplay += ` ${targetDate.getDate()}`;
            }

            const allSlotsEmpty = slots.every(slot => {
              let val = day?.draws[slot];
              return !val || val === "-" || val === "PENDING";
            });
            
            if (allSlotsEmpty) {
              return `<tr>
                <td class="day-label">${dayDisplay}</td>
                <td colspan="4" style="text-align: center; padding: 3px; background: rgba(0,0,0,0.2);">
                  <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
                </td>
              </tr>`;
            } else {
              return `<tr>
                <td class="day-label">${dayDisplay}</td>
                ${slots.map(slot => {
                  let val = day?.draws[slot];
                  let key = getSortKey(val);
                  let matchColor = colorMap[key];
                  let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:6px; font-weight:900; display:inline-block; padding:2px 2px;"` : `style="font-family: monospace; font-weight:900; font-size:16px;"`;
                  return `<td><span ${style}>${val}</span></td>`;
                }).join('')}
              </tr>`;
            }
          }).join('')}
        </table>
      </div>
    </div>`;
  }).join('');
  
  // Render current week
// Helper function to check if a day has passed
  function isDayPassed(weekStartDate, dayIndex) {
    const start = new Date(weekStartDate);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  }
  
  // Render current week
  const sDate = new Date(currentWeek.startDate);
  const eDate = new Date(sDate);
  eDate.setDate(sDate.getDate() + 6);
  const formattedEndDate = eDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT WEEK ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentWeek.startDate} — ${formattedEndDate}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>
        <tr><th>DAY</th><th>MOR</th><th>MID</th><th>NON</th><th>EVE</th></tr>
        ${dayNames.map((dName, dIdx) => {
          let day = currentWeek.days.find(d => d.dayName === dName);
          const isToday = dName === todayName;
          
          // --- Day Number Calculation ---
          let dayDisplay = dName.slice(0,3).toUpperCase();
          if (currentWeek.startDate && !isNaN(sDate.getTime())) {
            let targetDate = new Date(sDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
            dayDisplay += ` ${targetDate.getDate()}`;
          }
          
          // Check if all slots are empty for this day
          const allSlotsEmpty = slots.every(slot => {
            let val = day?.draws[slot];
            return !val || val === "-" || val === "PENDING";
          });
          
          // If all slots empty AND the day has passed, show HOLIDAY
          if (allSlotsEmpty && isDayPassed(currentWeek.startDate, dIdx)) {
            return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
              <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
              <td colspan="4" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2);">
                <span style="color: #ff453a; font-weight: bold; font-size: 14px;">🇹🇹 HOLIDAY 🇹🇹</span>
              </td>
            </tr>`;
          }

          return `<tr style="${isToday ? 'background: rgba(0, 255, 136, 0.1);' : ''}">
            <td class="day-label" style="${isToday ? 'color: #00ff88;' : ''}">${dayDisplay}</td>
            ${slots.map(slot => {
              let val = day?.draws[slot];
              let key = getSortKey(val);
              let matchColor = colorMap[key];
              if (!val || val === "-" || val === "PENDING") {
                return `<td><span class="awaiting">...</span></td>`;
              }
              let style = matchColor ? `style="color:${matchColor}; border:1px solid ${matchColor}; background:${matchColor}15; border-radius:6px; font-weight:900; display:inline-block; padding:2px 2px;"` : `style="font-family: monospace; font-weight:900; font-size:16px;"`;
              return `<td><span ${style}>${val}</span></td>`;
            }).join('')}
          </tr>`;
        }).join('')}
      </table>
    </div>
  </div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="p4-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.Wks (${previousWeeks.length} available)</span>
    </div>
    <div class="carousel-track" id="p4-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="p4-dots"></div>
  </div>
  <div style="text-align:center; padding:3px 3px; opacity:0.18; font-weight:600; letter-spacing:2px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:12px;">CODEWITHGLASGOW ©️ DIGITAL CHARTS</p></div>
  <script>initPrevCarousel('p4', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}

// =========================================
// RENDER CASH POT WITH CAROUSEL ABOVE + CURRENT FIXED
// =========================================
function renderCarouselWithCurrentCashPot(gameData) {
  let weeksData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    weeksData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    weeksData = gameData;
  }
  
  if (!weeksData || weeksData.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No Cash Pot data available</div>';
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const weeksWithDays = [];
  
  weeksData.forEach(week => {
    if (week.days && Array.isArray(week.days)) {
      const validDays = week.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate) && drawDate <= today) {
            return true;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        weeksWithDays.push({
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          days: validDays,
          timestamp: validDays[0]?.date ? new Date(validDays[0].date).getTime() : 0
        });
      }
    }
  });
  
  if (weeksWithDays.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No draws for current period</div>';
  }
  
  weeksWithDays.sort((a, b) => a.timestamp - b.timestamp);
  
  const previousWeeks = weeksWithDays.slice(0, -1);
  const currentWeek = weeksWithDays[weeksWithDays.length - 1];
  
  // Build previous weeks carousel
  const prevSlidesHtml = previousWeeks.reverse().map((week, idx) => {
    const weekNum = previousWeeks.length - idx;
    const weekRange = week.startDate ? `Wk ${week.weekNumber} (${week.startDate})` : `Week ${week.weekNumber}`;
    
    let daysHtml = '';
    week.days.forEach(day => {
      const draws = day.draws || {};
      const special = day.special || {};
      const isMissing = day.status === "missing";
      const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
      
      let numberGrid = '';
      if (isMissing) {
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else if (isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else {
        let numberArray = [];
        for (let n = 1; n <= 5; n++) {
          let val = draws[`Num${n}`];
          if (val && val !== "-" && val.toString().trim() !== "") {
            numberArray.push(trimLeadingZeros(val.toString().trim()));
          }
        }
        numberArray.forEach(num => {
          numberGrid += `<div class="ball main">${num}</div>`;
        });
        if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
          numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
        } else if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "") {
          numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
        }
      }
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      daysHtml += `
        <tr>
          <td class="day-label" style="padding-bottom:10px;">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ P.Wk ${weekNum}</span>
          <span>${weekRange}</span>
        </div>
        <table>${daysHtml}</table>
      </div>
    </div>`;
  }).join('');
  
  // Build current week (fixed)
  const currentWeekRange = currentWeek.startDate ? `Wk ${currentWeek.weekNumber} (${currentWeek.startDate})` : `Week ${currentWeek.weekNumber}`;
  let currentDaysHtml = '';
  currentWeek.days.forEach(day => {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
    
    let numberGrid = '';
    if (isMissing) {
      numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
    } else if (isEmptyDraw && !isMissing) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    } else {
      let numberArray = [];
      for (let n = 1; n <= 5; n++) {
        let val = draws[`Num${n}`];
        if (val && val !== "-" && val.toString().trim() !== "") {
          numberArray.push(trimLeadingZeros(val.toString().trim()));
        }
      }
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      } else if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "") {
        numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
      }
    }
    
    const dayName = day.dayName || "";
    const displayDate = day.date || "";
    
    currentDaysHtml += `
      <tr>
        <td class="day-label" style="padding-bottom:10px;">
          ${dayName.slice(0,3)}
          <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
        </td>
        <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
      </tr>
    `;
  });
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT WEEK ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentWeekRange}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${currentDaysHtml}</table>
    </div>
  </div>`;
  
  const carouselHtml = previousWeeks.length > 0 ? `
  <div class="carousel-container" id="cp-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.Wks (${previousWeeks.length} available)</span>

    </div>
    <div class="carousel-track" id="cp-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="cp-dots"></div>
  </div>
  <script>initPrevCarousel('cp', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}

// =========================================
// RENDER LOTTO WITH CAROUSEL ABOVE + CURRENT FIXED
// =========================================
function renderCarouselWithCurrentLotto(gameData) {
  let monthsData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    monthsData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    monthsData = gameData;
  }
  
  if (!monthsData || monthsData.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No Lotto Plus data available</div>';
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const processedMonths = [];
  
  monthsData.forEach(month => {
    if (month.days && Array.isArray(month.days)) {
      const validDays = month.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate) && drawDate <= today) {
            return true;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        processedMonths.push({
          monthName: month.month || "",
          days: validDays,
          timestamp: validDays[0]?.date ? new Date(validDays[0].date).getTime() : 0
        });
      }
    }
  });
  
  if (processedMonths.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No draws available for current period</div>';
  }
  
  processedMonths.sort((a, b) => a.timestamp - b.timestamp);
  
  const previousMonths = processedMonths.slice(0, -1);
  const currentMonth = processedMonths[processedMonths.length - 1];
  
  // Build previous months carousel
  const prevSlidesHtml = previousMonths.reverse().map((month, idx) => {
    const monthNum = previousMonths.length - idx;
    
    let daysHtml = '';
    month.days.forEach(day => {
      const draws = day.draws || {};
      const special = day.special || {};
      const isMissing = day.status === "missing";
      const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
      
      let numberGrid = '';
      if (isMissing) {
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else if (isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else {
        let numberArray = [];
        for (let n = 1; n <= 5; n++) {
          let val = draws[`Num${n}`];
          if (val && val !== "-" && val.toString().trim() !== "") {
            numberArray.push(trimLeadingZeros(val.toString().trim()));
          }
        }
        numberArray.forEach(num => {
          numberGrid += `<div class="ball main">${num}</div>`;
        });
        if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
          numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
        }
        if (special.powerBall && special.powerBall !== "-" && special.powerBall !== "") {
          numberGrid += `<div class="ball pb">${trimLeadingZeros(special.powerBall.toString())}</div>`;
        }
        if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "") {
          numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
        }
      }
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      daysHtml += `
        <tr>
          <td class="day-label" style="padding-bottom:10px;">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:6px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    
    return `
<div class="carousel-slide">
  <div class="table-wrapper">
    <div class="section-header">
      <span>⌛ PREVIOUS MONTH ${monthNum}</span>
      <span>${month.monthName}</span>
    </div>
    <table style="width:100%; border-collapse:collapse;">${daysHtml}</table>
  </div>
</div>`;
  }).join('');
  
  // Build current month (fixed)
  let currentDaysHtml = '';
  currentMonth.days.forEach(day => {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
    
    let numberGrid = '';
    if (isMissing) {
      numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
    } else if (isEmptyDraw && !isMissing) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    } else {
      let numberArray = [];
      for (let n = 1; n <= 5; n++) {
        let val = draws[`Num${n}`];
        if (val && val !== "-" && val.toString().trim() !== "") {
          numberArray.push(trimLeadingZeros(val.toString().trim()));
        }
      }
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      }
      if (special.powerBall && special.powerBall !== "-" && special.powerBall !== "") {
        numberGrid += `<div class="ball pb">${trimLeadingZeros(special.powerBall.toString())}</div>`;
      }
      if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "") {
        numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
      }
    }
    
    const dayName = day.dayName || "";
    const displayDate = day.date || "";
    
    currentDaysHtml += `
      <tr>
        <td class="day-label" style="padding-bottom:10px;">
          ${dayName.slice(0,3)}
          <div style="font-size:10px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
        </td>
        <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
      </tr>
    `;
  });
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT MONTH ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentMonth.monthName}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${currentDaysHtml}</table>
    </div>
  </div>`;
  
  const carouselHtml = previousMonths.length > 0 ? `
  <div class="carousel-container" id="p5-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.MONTHS (${previousMonths.length} available)</span>

    </div>
    <div class="carousel-track" id="p5-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="p5-dots"></div>
  </div>
  <script>initPrevCarousel('p5', ${previousMonths.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous months available</div>';
  
  return carouselHtml + currentHtml;
}

// =========================================
// RENDER WIN FOR LIFE WITH CAROUSEL ABOVE + CURRENT FIXED
// =========================================
function renderCarouselWithCurrentWinForLife(gameData) {
  let monthsData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    monthsData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    monthsData = gameData;
  }
  
  if (!monthsData || monthsData.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No Win For Life data available</div>';
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const processedMonths = [];
  
  monthsData.forEach(month => {
    if (month.days && Array.isArray(month.days)) {
      const validDays = month.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate) && drawDate <= today) {
            return true;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        processedMonths.push({
          monthName: month.month || "",
          days: validDays,
          timestamp: validDays[0]?.date ? new Date(validDays[0].date).getTime() : 0
        });
      }
    }
  });
  
  if (processedMonths.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No draws available for current period</div>';
  }
  
  processedMonths.sort((a, b) => a.timestamp - b.timestamp);
  
  const previousMonths = processedMonths.slice(0, -1);
  const currentMonth = processedMonths[processedMonths.length - 1];
  
  // Build previous months carousel
  const prevSlidesHtml = previousMonths.reverse().map((month, idx) => {
    const monthNum = previousMonths.length - idx;
    
    let daysHtml = '';
    month.days.forEach(day => {
      const draws = day.draws || {};
      const special = day.special || {};
      const isMissing = day.status === "missing";
      const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
      
      let numberGrid = '';
      if (isMissing) {
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else if (isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">🇹🇹 HOLIDAY 🇹🇹</span>';
      } else {
        let numberArray = [];
        for (let n = 1; n <= 6; n++) {
          let val = draws[`Num${n}`];
          if (val && val !== "-" && val.toString().trim() !== "") {
            numberArray.push(trimLeadingZeros(val.toString().trim()));
          }
        }
        numberArray.forEach(num => {
          numberGrid += `<div class="ball main">${num}</div>`;
        });
        if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
          numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
        }
        if (special.cashBall && special.cashBall !== "-" && special.cashBall !== "") {
          numberGrid += `<div class="ball cb">${trimLeadingZeros(special.cashBall.toString())}</div>`;
        }
      }
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      daysHtml += `
        <tr>
          <td class="day-label" style="padding-bottom:10px;">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ PREVIOUS MONTH ${monthNum}</span>
          <span>${month.monthName}</span>
        </div>
        <table>${daysHtml}</table>
      </div>
    </div>`;
  }).join('');
  
  // Build current month (fixed)
  let currentDaysHtml = '';
  currentMonth.days.forEach(day => {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isEmptyDraw = (!draws.Num1 || draws.Num1.toString().trim() === "" || draws.Num1.toString().trim() === "SCHEDULED");
    
    let numberGrid = '';
    if (isMissing) {
      numberGrid = '<span class="holiday">🚫 HOLIDAY</span>';
    } else if (isEmptyDraw && !isMissing) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    } else {
      let numberArray = [];
      for (let n = 1; n <= 6; n++) {
        let val = draws[`Num${n}`];
        if (val && val !== "-" && val.toString().trim() !== "") {
          numberArray.push(trimLeadingZeros(val.toString().trim()));
        }
      }
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      if (numberArray.length === 0 && !isEmptyDraw && !isMissing) {
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      }
      if (special.cashBall && special.cashBall !== "-" && special.cashBall !== "") {
        numberGrid += `<div class="ball cb">${trimLeadingZeros(special.cashBall.toString())}</div>`;
      }
    }
    
    const dayName = day.dayName || "";
    const displayDate = day.date || "";
    
    currentDaysHtml += `
      <tr>
        <td class="day-label" style="padding-bottom:10px;">
          ${dayName.slice(0,3)}
          <div style="font-size:10px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
        </td>
        <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
      </tr>
    `;
  });
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT MONTH ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentMonth.monthName}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${currentDaysHtml}</table>
    </div>
  </div>`;
  
  const carouselHtml = previousMonths.length > 0 ? `
  <div class="carousel-container" id="w4l-carousel">
    <div class="carousel-header">
      <span class="carousel-title">↻ SWIPE P.MONTHS (${previousMonths.length} available)</span>

    </div>
    <div class="carousel-track" id="w4l-track">
      ${prevSlidesHtml}
    </div>
    <div class="carousel-indicators" id="w4l-dots"></div>
  </div>
  <script>initPrevCarousel('w4l', ${previousMonths.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous months available</div>';
  
  return carouselHtml + currentHtml;
}
