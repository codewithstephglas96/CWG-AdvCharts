// CWG AdvCharts Widget & WebApp
// Created and Built By Michael "CODEWITHGLASGOW" Glasgow
// 6-GAME INTEGRATION WITH PERSISTENT LOGIC & ANIMATIONS
// ADDED: Active Highlighting for Pick 2 & Pick 4 (matching combinations)
// ADDED: Carousel for previous weeks/months ABOVE fixed current week/month
// Last Modified: Sept 11 @ 7:20 am
//========================================
const TICKER_URL = "https://script.google.com/macros/s/AKfycbymSUZ3cuBP7wZSKkxs8QmjMkKP6q3j-LOW_CVpY3n6Sw1EzsdwPu6yTEkpOmiAJz95/exec";
const COMPARISON_API = "https://script.google.com/macros/s/AKfycbwyr-M_ZzIscNgxJmR_UYHgZqmamn62Np4msDFaCjX9KgyUmyjuzuIYbawBmT0_mw4j/exec?action=calendar";

// =====================================
// UPDATED API ENDPOINTS 
// (NEW BASE URL FOR CP, P5, W4L)
// =====================================
const NEW_BASE_URL = "https://script.google.com/macros/s/AKfycbxgvg-meXhPYHdN-pb7BIToR_Z_rUlQivXA5STThEcWwKKbzF97_XgnZ0JWWtKeRjzBVg/exec";

// Cash Pot (Daily/Weekly grouping)
const CP_API = `${NEW_BASE_URL}?action=calendar&game=CASHPOT&weeks=41`;

// Lotto Plus (Monthly grouping)
const P5_API = `${NEW_BASE_URL}/exec?action=monthly&game=LOTTO&months=41`;

// Win For Life (Monthly grouping)
const W4L_API = `${NEW_BASE_URL}/exec?action=monthly&game=WFL&months=41`;

// Original APIs for PW, P2, P4
// Play Whe Data
const PW_API = COMPARISON_API + "&game=P2WHE&weeks=250";//29 wks initially

// Pick 2 Data
const P2_API = COMPARISON_API + "&game=PIKII&weeks=196";//29 wks initially

// Pick 4 Data
const P4_API = COMPARISON_API + "&game=PIKIV&weeks=176";//29 wks initially

/////////////////////////////////////////
if (config.runsInWidget) {
  let widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
} else {
  await presentUnifiedDashboard();
}

// ====================================
// 1. WIDGET LOGIC (UNCHANGED ORIGINAL)
// ====================================
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
})} • ${latencyText} • CWG CHARTS • v2.5.6`)

footText.textColor = new Color("#555555")
footText.font = Font.mediumSystemFont(8)
footText.centerAlignText()

// -------------------------------------
// AUTO-REFRESH (Silent, iOS-approved)
// ------------------------------------
widget.refreshAfterDate = new Date(Date.now() + 4 * 60 * 1000) // every 4 minutes

  return widget;
}

// ===================================
// MONTHLY STATS CAROUSEL FUNCTION 
// (UNIVERSAL - WORKS FOR ALL 6 GAMES)
// UPDATED: 
// Shows 6 months (now + 5 prev) 
// ==================================
function renderMonthlyCarousel(weeksData, gameType, title) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
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
  
  // Get month stats for a specific month
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
      let d = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
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
  
  // ============================
  // BUILD MONTHS ARRAY (Now + 5 Prev)
  // =============================
  const monthsToShow = 7;// adjust
  const monthData = [];
  
  for (let i = 0; i < monthsToShow; i++) {
    let month = currentMonth - i;
    let year = currentYear;
    if (month < 0) {
      month += 12;
      year -= 1;
    }
    monthData.push({
      month: month,
      year: year,
      name: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' }),
      stats: getMonthStats(month, year)
    });
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
  
  function formatLastPlayed(date) {
    if (!date) return "Never";
    const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/(\d{2})(\d{2})$/, "'$2");
  }
  
  function generateStatsTable(marksArray, monthName, isMostPlayed = true, monthIndex = 0) {
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
    
    // Determine if this is the current month (first slide)
    const isCurrentMonth = monthIndex === 0;
    const accentColor = isCurrentMonth ? '#00ff88' : '#ff9d00';
    
    let tableHtml = `
      <div class="stats-card">
        <div class="stats-card-header" style="border-bottom: 2px solid ${accentColor};">
          <h4 style="color: ${accentColor};">${monthName} ${isCurrentMonth ? '⚜️ CURRENT' : ''}</h4>
          <p style="font-size: 9px; margin-top: 2px; color: #aaa;">${filteredArray.length} numbers</p>
        </div>
        <div style="max-height: 480px; overflow-y: auto;">
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
  
  // ====================================
  // BUILD CAROUSEL SLIDES (6 months)
  // ====================================
  const slidesHtml = monthData.map((data, index) => {
    const isCurrent = index === 0;
    const borderColor = isCurrent ? '#00ff88' : '#ff9d00';
    
    return `
      <div class="carousel-item" style="flex: 0 0 calc(100% - 20px); min-width: 320px; scroll-snap-align: start; background: var(--card); border-radius: 16px; overflow: hidden; border: 1px solid ${borderColor}40;">
        <div class="carousel-header" style="background: linear-gradient(135deg, ${isCurrent ? '#1a6b3a' : '#1e3a8a'}, ${isCurrent ? '#0f4a2a' : '#1e40af'}); padding: 12px; text-align: center; font-size: 13px; font-weight: 800; color: ${isCurrent ? '#00ff88' : '#ff9d00'};">
          ${isCurrent ? '⚜️ ' : ''}${data.name} ${isCurrent ? '⚜️' : ''}
          <span style="font-size: 9px; color: #94a3b8; display: block; margin-top: 2px; font-weight: 400;">
            ${index + 1} of ${monthsToShow} months
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
          <div class="stats-container">
            <div style="background: rgba(50,215,75,0.08); padding: 6px 8px; text-align: center; font-size: 10px; font-weight: 700; color: #32d74b; border-bottom: 1px solid rgba(50,215,75,0.1);">
              🔺 MOST PLAYED
            </div>
            ${generateStatsTable(data.stats.top, data.name, true, index)}
          </div>
          <div class="stats-container">
            <div style="background: rgba(255,69,58,0.08); padding: 6px 8px; text-align: center; font-size: 10px; font-weight: 700; color: #ff453a; border-bottom: 1px solid rgba(255,69,58,0.1);">
              🔻 LEAST PLAYED
            </div>
            ${generateStatsTable(data.stats.bottom, data.name, false, index)}
          </div>
        </div>
        <div class="carousel-subtitle" style="font-size: 8px; color: #64748b; text-align: center; padding: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
          ${isCurrent ? '📅 Current Month Data 📅' : '📅 Historical Data 📅'}
        </div>
      </div>
    `;
  }).join('');
  
  // Generate dots for pagination
  let dotsHtml = '';
  for (let i = 0; i < monthsToShow; i++) {
    dotsHtml += `<span class="monthly-dot" data-index="${i}" style="width: 6px; height: 6px; background: ${i === 0 ? '#ff9d00' : '#555'}; border-radius: 50%; display: inline-block; margin: 0 4px; cursor: pointer; transition: all 0.3s ease; ${i === 0 ? 'width: 16px; border-radius: 4px;' : ''}"></span>`;
  }
  
  const carouselId = 'monthlyCarousel-' + gameType + '-' + Date.now();
  
  return `
    <div class="fsp-carousel-wrapper" style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px;">
        <span style="font-size: 14px; font-weight: 800; color: #ff9d00;">📅 ${title} MONTHLY STATS</span>
        <div style="display: flex; gap: 8px;">
          <button class="carousel-prev-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s ease;">
            ◀
          </button>
          <button class="carousel-next-${gameType}" style="background: rgba(255,157,0,0.3); border: none; border-radius: 20px; padding: 4px 12px; color: white; font-weight: bold; cursor: pointer; transition: all 0.2s ease;">
            ▶
          </button>
        </div>
      </div>
      
      <div class="fsp-carousel" id="${carouselId}" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; padding: 4px 0 16px 0; scroll-behavior: smooth; -webkit-overflow-scrolling: touch;">
        ${slidesHtml}
      </div>
      
      <div style="display: flex; justify-content: center; gap: 8px; margin-top: 12px;" id="${carouselId}-dots">
        ${dotsHtml}
      </div>
      
      <div style="font-size: 8px; color: #475569; text-align: center; margin-top: 6px;">
        Showing ${monthsToShow} months • Swipe or use buttons to navigate
      </div>
    </div>
    
    <style>
      .fsp-carousel::-webkit-scrollbar {
        height: 12px;
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
      .monthly-dot.active {
        background: #ff9d00 !important;
        width: 16px !important;
        border-radius: 4px !important;
      }
    </style>
    
    <script>
      (function() {
        var carousel = document.getElementById('${carouselId}');
        var prevBtn = document.querySelector('.carousel-prev-${gameType}');
        var nextBtn = document.querySelector('.carousel-next-${gameType}');
        var dotsContainer = document.getElementById('${carouselId}-dots');
        var slides = carousel ? carousel.children : [];
        var currentIndex = 0;
        var totalSlides = ${monthsToShow};
        var scrollTimeout;
        
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
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = slides[0] ? slides[0].offsetWidth : 0;
          var gap = 16;
          if (slideWidth > 0) {
            carousel.scrollTo({ left: index * (slideWidth + gap), behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function() {
            if (!carousel || slides.length === 0) return;
            var slideWidth = slides[0] ? slides[0].offsetWidth : 0;
            var gap = 16;
            var scrollPosition = carousel.scrollLeft;
            var newIndex = Math.round(scrollPosition / (slideWidth + gap));
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
              currentIndex = newIndex;
              updateDots();
            }
          }, 100);
        }
        
        if (prevBtn) {
          prevBtn.onclick = function() { scrollToSlide(currentIndex - 1); };
        }
        if (nextBtn) {
          nextBtn.onclick = function() { scrollToSlide(currentIndex + 1); };
        }
        if (carousel) {
          carousel.addEventListener('scroll', handleScroll);
        }
        
        if (dotsContainer && totalSlides > 1) {
          dotsContainer.innerHTML = '';
          for (var i = 0; i < totalSlides; i++) {
            var dot = document.createElement('div');
            dot.className = 'monthly-dot' + (i === currentIndex ? ' active' : '');
            dot.style.cssText = 'width: 6px; height: 6px; background: #555; border-radius: 50%; transition: all 0.3s ease; cursor: pointer; margin: 0 4px;';
            if (i === currentIndex) {
              dot.style.cssText += 'background: #ff9d00; width: 16px; border-radius: 4px;';
            }
            dot.onclick = (function(idx) {
              return function() { scrollToSlide(idx); };
            })(i);
            dotsContainer.appendChild(dot);
          }
        }
        
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}
//////////////////////////////////////////

//////////////////Report//////////////////
// =====================================
// PLAY WHE ANALYSIS READOUT (Intelligent - Previous Week + Current Week Updates)
// =====================================
// =====================================
// PLAY WHE ANALYSIS READOUT (Intelligent - Previous Week + Current Week Updates)
// =====================================
function generatePlayWheReadout(weeksData) {
  // Check if we have valid data
  if (!weeksData || weeksData.length === 0) {
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">⏳ Waiting for Play Whe data to load...</div>';
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
    1: "🔪", 
    2: "👵🏾", 
    3: "🚕", 
    4: "💀", 
    5: "👨🏾‍🦳", 
    6: "🤰🏽", 
    7: "🐗", 
    8: "🐯",
    9: "🐮", 
    10: "🐒", 
    11: "🦅", 
    12: "🤴🏽", 
    13: "🐸", 
    14: "💰", 
    15: "🤧", 
    16: "💃🏽",
    17: "🐦‍⬛", 
    18: "🚤", 
    19: "🐎", 
    20: "🐶", 
    21: "👄", 
    22: "🐀", 
    23: "🏡", 
    24: "🫅🏽",
    25: "🐢", 
    26: "🐔", 
    27: "🐍", 
    28: "🐟", 
    29: "🍻", 
    30: "🐯", 
    31: "👵🏾", 
    32: "🦐",
    33: "🕷️", 
    34: "👨🏾‍🦯", 
    35: "🐍", 
    36: "🫏"
  };
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Enhanced deep search function that skips holidays and searches across all weeks
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    // First try the standard approach (skip holidays)
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      // Special handling for Monday holidays
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    
    // FALLBACK: If no valid draw found, scan ALL weeks for ANY draw
    // This ensures we always find a number, even if we have to go back further
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      // Skip the current week if we're in the middle of it
      if (w === sortedWeeks.length - 1 && week.isCurrentWeek) continue;
      
      // Try all days and slots to find the most recent draw
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const val = getDraw(week, dayNames[d], slots[s]);
          if (val) {
            const date = new Date(week.startDate);
            date.setDate(date.getDate() + d);
            return { value: val, week: week, date: date };
          }
        }
      }
    }
    
    // ULTIMATE FALLBACK: Return a default number if no draws found anywhere
    return { value: 1, week: sortedWeeks[sortedWeeks.length - 1], date: new Date() };
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
    return '<div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 15px; border: 1px solid #ff9d00; text-align:center;">❌ No previous week data available for today\'s analysis</div>';
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
    1: [1,10,19,28], 
    2: [2,11,20,29], 
    3: [3,12,21,30],
    4: [4,13,22,31], 
    5: [5,14,23,32], 
    6: [6,15,24,33],
    7: [7,16,25,34], 
    8: [8,17,26,35], 
    9: [9,18,27,36]
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
    0: [10,20,30], 
    1: [1,11,21,31], 
    2: [2,12,22,32],
    3: [3,13,23,33], 
    4: [4,14,24,34], 
    5: [5,15,25,35],
    6: [6,16,26,36], 
    7: [7,17,27], 
    8: [8,18,28], 
    9: [9,19,29]
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
  // ENHANCED LEAVING & MEETING CONTAINERS WITH FALLBACKS
  // =====================================
  
  // Helper to get Line and Suit for a number
  function getLineAndSuitForNumber(num) {
    const linesChart = {
      1: [1,10,19,28], 
      2: [2,11,20,29], 
      3: [3,12,21,30],
      4: [4,13,22,31], 
      5: [5,14,23,32], 
      6: [6,15,24,33],
      7: [7,16,25,34], 
      8: [8,17,26,35], 
      9: [9,18,27,36]
    };
    const suitsChart = {
      0: [10,20,30], 
      1: [1,11,21,31], 
      2: [2,12,22,32],
      3: [3,13,23,33], 
      4: [4,14,24,34], 
      5: [5,15,25,35],
      6: [6,16,26,36], 
      7: [7,17,27], 
      8: [8,18,28], 
      9: [9,19,29]
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
  
  // Helper to format line/suit string
  function formatLineSuit(line, suit) {
    if (line === null && suit === null) return "—";
    const lineStr = line !== null ? `${line} Line` : "";
    const suitStr = suit !== null ? `${suit} Suit` : "";
    if (lineStr && suitStr) return `${lineStr} / ${suitStr}`;
    return lineStr || suitStr;
  }
  
  // ==================================
  // LEAVING/MEETING LOGIC WITH FALLBACK
  // ===================================
  
  // Find last played number - search current week first
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  const currWeekStartDate = new Date(currentWeek.startDate);
  const todayIdxLocal = now.getDay();
  
  // First, try to find a draw in the current week
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
  
  // If no draw in current week, search ALL previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      let found = false;
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  }
  
  // ULTIMATE FALLBACK: If still no leaving number, use default number 1
  if (!leavingNumber) {
    leavingNumber = 1;
    leavingDate = new Date();
    leavingDay = "Today";
    leavingSlot = "MOR";
    leavingDayIdx = 0;
    leavingSlotIdx = 0;
  }
  
  // NOW find the MEETING number using enhanced deep search
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
      // Use the enhanced findDeepDraw function (which now has a fallback)
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  // ULTIMATE FALLBACK: If no meeting number found, use partner or default
  if (!meetingNumber) {
    // Use the partner of the leaving number as a fallback
    const partnerMap = {
      1: 36, 
      2: 35, 
      3: 34, 
      4: 33, 
      5: 32, 
      6: 31, 
      7: 30, 
      8: 29, 
      9: 28,
      10: 27, 
      11: 26, 
      12: 25, 
      13: 24, 
      14: 23, 
      15: 22, 
      16: 21, 
      17: 20, 
      18: 19,
      19: 18, 
      20: 17, 
      21: 16, 
      22: 15, 
      23: 14, 
      24: 13, 
      25: 12, 
      26: 11, 
      27: 10,
      28: 9, 
      29: 8, 
      30: 7, 
      31: 6, 
      32: 5, 
      33: 4, 
      34: 3, 
      35: 2, 
      36: 1
    };
    if (leavingNumber && partnerMap[leavingNumber]) {
      meetingNumber = partnerMap[leavingNumber];
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    } else {
      // Last resort: use number 1
      meetingNumber = 1;
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    }
  }
  
  // Get Line/Suit for both numbers
  const leavingLineSuit = leavingNumber ? getLineAndSuitForNumber(leavingNumber) : { line: null, suit: null };
  const meetingLineSuit = meetingNumber ? getLineAndSuitForNumber(meetingNumber) : { line: null, suit: null };
  
  // Build the two containers in a 2x2 grid
  const leavingHtml = `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #58a6ff;">
      <div style="font-size: 14px; color: #58a6ff; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">LEAVING</div>
      <div style="font-size: 36px; font-weight: 900; color: #58a6ff; line-height: 1;">${leavingNumber}${spiritEmoji[leavingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${leavingDay ? formatDaySlot(leavingDay, leavingSlot, leavingDate) : 'No data yet'}</div>
      <div style="font-size: 9px; color: #ff9d00; margin-top: 2px; font-weight: 600;">${formatLineSuit(leavingLineSuit.line, leavingLineSuit.suit)}</div>
    </div>
  `;
  
  const meetingHtml = `
    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 5px; text-align: center; border-left: 3px solid #ff9d00;">
      <div style="font-size: 14px; color: #ff9d00; font-weight: bold; letter-spacing: 1px; margin-bottom: 2px;">MEETING</div>
      <div style="font-size: 36px; font-weight: 900; color: #ff9d00; line-height: 1;">${meetingNumber}${spiritEmoji[meetingNumber] || ''}</div>
      <div style="font-size: 10px; color: #aaa; margin-top: 2px;">${meetingDay ? formatDaySlot(meetingDay, meetingSlot, meetingDate) : 'Next Draw'}</div>
      <div style="font-size: 9px; color: #58a6ff; margin-top: 2px; font-weight: 600;">${formatLineSuit(meetingLineSuit.line, meetingLineSuit.suit)}</div>
    </div>
  `;
  
  // 2x2 Grid Layout
  const leavingMeetingHtml = `
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 6px 0;">
    ${leavingHtml}
    ${meetingHtml}
  </div>
  `;
  
// ========== TREND ALERT - Dynamic Trigger Tracking (FULLY CORRECTED) ==========
// Numbers to track: 4, 12, 16, 29
const trendNumbers = [4, 12, 16, 29];

// Define flip partners (mirror numbers)
const flipPartners = {
  4: 33, 33: 4,
  12: 25, 25: 12,
  16: 21, 21: 16,
  29: 8, 8: 29
};

// Helper: Format date for display (e.g., "Fri 2 May")
function formatShortDate(date) {
  if (!date) return null;
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '');
}

// Helper: Format time slot (MOR, MID, NON, EVE)
function formatSlot(slot) {
  if (!slot) return "";
  const slotNames = { MOR: "🌅", MID: "☀️", NON: "🌤️", EVE: "🌙" };
  return `${slotNames[slot] || ""} ${slot}`;
}

// Helper: Get spirit emoji
function getSpiritEmoji(num) {
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "💀", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  return spiritEmoji[num] || '';
}

// ====================================
// BUILD COMPLETE TIMELINE FROM CURRENT WEEK
// NOTE: currWeekStart is already defined earlier in the function
// ====================================
const triggerTimeline = [];

// Collect ALL draws from current week with timestamps
for (let d = 0; d <= todayIdx; d++) {
  for (let s = 0; s < slots.length; s++) {
    const draw = getDraw(currentWeek, dayNames[d], slots[s]);
    if (draw) {
      const drawDate = new Date(currWeekStart);
      drawDate.setDate(currWeekStart.getDate() + d);
      triggerTimeline.push({
        num: draw,
        date: drawDate,
        day: dayNames[d],
        slot: slots[s],
        timestamp: drawDate.getTime()
      });
    }
  }
}

// Sort by timestamp (chronological - oldest first)
triggerTimeline.sort((a, b) => a.timestamp - b.timestamp);

// ====================================
// TRACK ALL TRIGGER EVENTS (Including Mirrors)
// This tracks EVERY time a main number OR its mirror is drawn
// ====================================
const allTriggerEvents = [];
const triggeredMainNumbers = new Set();

// Go through timeline and track EVERY trigger event
for (const draw of triggerTimeline) {
  const num = draw.num;
  const isMain = trendNumbers.includes(num);
  const isMirror = Object.values(flipPartners).includes(num) && !trendNumbers.includes(num);
  
  let mainNumber = null;
  if (isMain) {
    mainNumber = num;
  } else if (isMirror) {
    for (const [key, value] of Object.entries(flipPartners)) {
      if (value === num) {
        mainNumber = parseInt(key);
        break;
      }
    }
  }
  
  // If this is a trigger (main or mirror)
  if (mainNumber) {
    // Track which main numbers have been triggered (first time only)
    if (!triggeredMainNumbers.has(mainNumber)) {
      triggeredMainNumbers.add(mainNumber);
    }
    
    const mirrorNum = flipPartners[mainNumber];
    const mirrorPlayed = triggerTimeline.some(d => d.num === mirrorNum);
    
    // Store EVERY trigger event (including mirrors after the first trigger)
    allTriggerEvents.push({
      mainNumber: mainNumber,
      mirrorNumber: mirrorNum,
      triggeredNumber: num, // The ACTUAL number drawn
      date: draw.date,
      day: draw.day,
      slot: draw.slot,
      isMirror: isMirror,
      mirrorPlayed: mirrorPlayed,
      timestamp: draw.timestamp,
      formattedDate: formatShortDate(draw.date),
      formattedSlot: formatSlot(draw.slot)
    });
  }
}

// Sort all trigger events by timestamp (newest first for display)
allTriggerEvents.sort((a, b) => b.timestamp - a.timestamp);

// The absolute latest trigger is the first one in the sorted array
const absoluteLatestTrigger = allTriggerEvents.length > 0 ? allTriggerEvents[0] : null;

// ====================================
// BUILD COMPLETE TRIGGER HISTORY
// This shows ALL trigger events in order (newest first)
// ====================================
const completeTriggerHistory = allTriggerEvents.map(event => ({
  mainNumber: event.mainNumber,
  mirrorNumber: event.mirrorNumber,
  triggeredNumber: event.triggeredNumber,
  date: event.date,
  day: event.day,
  slot: event.slot,
  isMirror: event.isMirror,
  mirrorPlayed: event.mirrorPlayed,
  timestamp: event.timestamp,
  formattedDate: event.formattedDate,
  formattedSlot: event.formattedSlot
}));

// ====================================
// BUILD TREND ALERT DATA FOR DISPLAY
// ====================================
const trendAlertData = [];
for (let num of trendNumbers) {
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
    flipPlayedSlot: flipPlayedSlot,
    isTriggered: triggeredMainNumbers.has(num)
  });
}

// ====================================
// CHECK STATUS
// ====================================
const allTriggered = triggeredMainNumbers.size === 4;
const remainingNumbers = trendNumbers.filter(n => !triggeredMainNumbers.has(n));

// ====================================
// BUILD MODERN TREND ALERT HTML
// ====================================
let trendAlertHtml = '';

if (completeTriggerHistory.length > 0) {
  // --- Progress Ring ---
  const progressPercent = Math.round((triggeredMainNumbers.size / 4) * 100);
  
  // --- Status Badge ---
  let statusBadge = '';
  if (allTriggered) {
    statusBadge = `
      <div style="background: linear-gradient(135deg, #32d74b, #28a745); border-radius: 20px; padding: 4px 16px; display: inline-block;">
        <span style="color: #fff; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">🎉 COMPLETE</span>
      </div>
    `;
  } else {
    statusBadge = `
      <div style="background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.3); border-radius: 20px; padding: 4px 16px; display: inline-block;">
        <span style="color: #ffd700; font-weight: 800; font-size: 11px; letter-spacing: 0.5px;">⚡ ${triggeredMainNumbers.size}/4 ACTIVE</span>
      </div>
    `;
  }

  // --- Trigger History Cards (NEWEST FIRST - shows ALL trigger events) ---
  const historyCards = completeTriggerHistory.map((trigger, index) => {
    const isLatest = index === 0;
    const emoji = getSpiritEmoji(trigger.triggeredNumber);
    const mainEmoji = getSpiritEmoji(trigger.mainNumber);
    const borderColor = isLatest ? '#ffd700' : 'rgba(255,255,255,0.1)';
    const bgGradient = isLatest ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)';
    const rank = index + 1;
    const isMirrorTrigger = trigger.isMirror;
    
    // Determine if this is a mirror trigger
    const mirrorLabel = isMirrorTrigger ? 
      `<span style="font-size: 8px; color: #58a6ff; font-weight: 600; background: rgba(88,166,255,0.15); padding: 1px 8px; border-radius: 10px;">MIRROR</span>` : 
      `<span style="font-size: 8px; color: #32d74b; font-weight: 600; background: rgba(50,215,75,0.15); padding: 1px 8px; border-radius: 10px;">MARK</span>`;
    
    return `
      <div style="display: flex; align-items: center; gap: 10px; background: ${bgGradient}; border-radius: 8px; padding: 6px 12px; border-left: 3px solid ${borderColor}; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px; min-width: 60px;">
          <span style="font-size: 9px; color: #64748b; font-weight: 600; min-width: 20px;">#${rank}</span>
          <span style="font-size: 18px; font-weight: 900; color: ${isLatest ? '#ffd700' : '#94a3b8'};">
            ${trigger.triggeredNumber}${emoji}
          </span>
          ${mirrorLabel}
        </div>
        <div style="flex: 1; display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
          <span style="font-size: 8px; color: #94a3b8;">#${trigger.mainNumber}${mainEmoji}</span>
          <span style="font-size: 8px; color: #64748b;">${trigger.formattedDate}</span>
          <span style="font-size: 8px; color: #64748b;">${trigger.formattedSlot}</span>
          ${trigger.mirrorPlayed ? `<span style="font-size: 7px; color: #32d74b;">🪞${trigger.mirrorNumber}</span>` : ''}
          ${isLatest ? `<span style="font-size: 7px; background: #ffd700; color: #000; padding: 1px 8px; border-radius: 10px; font-weight: 700;">NEWEST</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // --- Number Status Grid ---
  const numberStatusGrid = trendAlertData.map(item => {
    const isTriggered = item.isTriggered;
    const emoji = getSpiritEmoji(item.num);
    const bgColor = isTriggered ? 'rgba(50,215,75,0.12)' : 'rgba(255,255,255,0.03)';
    const borderColor = isTriggered ? '#32d74b' : 'rgba(255,255,255,0.06)';
    const textColor = isTriggered ? '#32d74b' : '#666';
    
    return `
      <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 6px 8px; text-align: center; flex: 1;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 16px; font-weight: 900; color: ${textColor};">${item.num}</span>
          <span style="font-size: 12px;">${emoji}</span>
          ${isTriggered ? `<span style="font-size: 10px; color: #32d74b;">✅</span>` : `<span style="font-size: 10px; color: #666;">⏳</span>`}
        </div>
        <div style="font-size: 7px; color: #64748b; margin-top: 2px;">
          ${item.playedDate ? formatShortDate(item.playedDate) : '—'}
          ${item.flipPlayedDate ? `🪞${item.flipNum}` : ''}
        </div>
      </div>
    `;
  }).join('');

  // --- Screenshot Graphic ---
  const screenshotGraphic = `
    <div style="background: linear-gradient(135deg, #ffd700, #f5a623); border-radius: 12px; padding: 16px; text-align: center; margin: 6px 0 10px 0; border: 2px solid rgba(255,215,0,0.3);">
      <div style="font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 900; color: #1b4d3e; letter-spacing: 1px;">
        4, 12, 16, 29
      </div>
      <div style="font-size: clamp(1rem, 2vw, 1.6rem); font-weight: 700; color: #1b4d3e; margin: 4px 0;">
        Wen u c 1... play all
      </div>
      <div style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); font-weight: 900; color: #1b4d3e;">
        4
      </div>
    </div>
  `;

  // --- Latest Trigger Banner ---
  let latestBanner = '';
  if (absoluteLatestTrigger) {
    const emoji = getSpiritEmoji(absoluteLatestTrigger.triggeredNumber);
    const triggerType = absoluteLatestTrigger.isMirror ? 'MIRROR' : 'MARK';
    const triggerIcon = absoluteLatestTrigger.isMirror ? '🪞' : '✅';
    
    latestBanner = `
      <div style="background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05)); border-radius: 10px; padding: 10px 14px; border: 1px solid rgba(255,215,0,0.25); margin-bottom: 8px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 9px; font-weight: 700; color: #ffd700; letter-spacing: 0.5px;">🔔 LATEST TRIGGER</span>
          <span style="font-size: 22px; font-weight: 900; color: #ffd700;">${absoluteLatestTrigger.triggeredNumber}${emoji}</span>
          <span style="font-size: 9px; color: #58a6ff; font-weight: 600; background: rgba(88,166,255,0.1); padding: 2px 10px; border-radius: 12px;">${triggerIcon} ${triggerType}</span>
          <span style="font-size: 9px; color: #94a3b8;">${absoluteLatestTrigger.formattedDate}</span>
          <span style="font-size: 9px; color: #94a3b8;">${absoluteLatestTrigger.formattedSlot}</span>
          <span style="font-size: 8px; color: #64748b; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 10px;">
            #${absoluteLatestTrigger.mainNumber}
          </span>
          ${absoluteLatestTrigger.mirrorPlayed ? 
            `<span style="font-size: 8px; color: #32d74b; background: rgba(50,215,75,0.12); padding: 2px 12px; border-radius: 12px;">🪞${absoluteLatestTrigger.mirrorNumber} ✅</span>` : 
            `<span style="font-size: 8px; color: #ff9d00; background: rgba(255,157,0,0.1); padding: 2px 12px; border-radius: 12px;">⏳ Mirror ${absoluteLatestTrigger.mirrorNumber}</span>`
          }
        </div>
      </div>
    `;
  }

  // --- Build Final HTML ---
  trendAlertHtml = `
    <div style="background: linear-gradient(145deg, #0f172a, #1a2332); border-radius: 16px; padding: 14px; margin-bottom: 8px; border: 1px solid rgba(255,215,0,0.15);">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: 800; color: #ffd700;">🆘 PLAY ALL 4</span>
          ${statusBadge}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
            <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #ffd700, #32d74b); border-radius: 4px; transition: width 0.5s ease;"></div>
          </div>
          <span style="font-size: 10px; font-weight: 700; color: #94a3b8;">${progressPercent}%</span>
        </div>
      </div>
      
      <!-- Screenshot Graphic -->
      ${screenshotGraphic}
      
      <!-- Latest Trigger -->
      ${latestBanner}
      
      <!-- Number Status Grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 8px;">
        ${numberStatusGrid}
      </div>
      
      <!-- Trigger History (ALL trigger events - NEWEST FIRST) -->
      <div style="margin-top: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 8px; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">📜 TRIGGER HISTORY</span>
          <span style="font-size: 7px; color: #64748b;">${completeTriggerHistory.length} total</span>
        </div>
        <div style="max-height: 150px; overflow-y: auto; padding-right: 4px;">
          ${historyCards}
        </div>
      </div>
      
      <!-- Remaining / Complete -->
      ${remainingNumbers.length > 0 ? `
        <div style="margin-top: 6px; padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
          <span style="font-size: 8px; color: #64748b;">⏳ Waiting for:</span>
          <span style="font-size: 9px; font-weight: 600; color: #94a3b8; margin-left: 4px;">
            ${remainingNumbers.map(n => `${n}${getSpiritEmoji(n) || ''}`).join(', ')}
          </span>
        </div>
      ` : `
        <div style="margin-top: 6px; padding: 6px 10px; background: rgba(50,215,75,0.08); border-radius: 8px; border: 1px solid rgba(50,215,75,0.15); text-align: center;">
          <span style="font-size: 10px; font-weight: 700; color: #32d74b;">🎉 ALL 4 NUMBERS TRIGGERED! Play all!</span>
        </div>
      `}
      
      <!-- Footer -->
      <div style="font-size: 6px; color: #fffff; text-align: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.03); letter-spacing: 0.5px;">
    CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS   <br>
    CHARTS & READOUTS WHATSAPP CHANNEL
<br>
${completeTriggerHistory.length} trigger${completeTriggerHistory.length > 1 ? 's' : ''} • ${triggeredMainNumbers.size}/4 activated
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
    <div class="analysis-readout" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 16px; margin-bottom: 6px; border: 1px solid #ff9d00;">
      <div style="font-size: 14px; font-weight: 800; color: #ff9d00; margin-bottom: 3px;">📅 UNDER TODAY • ${today} • CWG ©️</div>
      <div style="font-size: 20px; font-weight: 900; text-align: center; margin-bottom: 3px; background: rgba(255,157,0,0.15); padding: 6px; border-radius: 12px;">
        ${todayDrawsText}
      </div>
      ${leavingMeetingHtml}
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 6px;">
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ LINES MISSING</div>
          <div style="font-size: 10px; font-weight: bold; color: #ff9d00;">${linesHtml}</div>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 10px;">
          <div style="font-size: 10px; color: #888;">♠️ SUITS MISSING</div>
          <div style="font-size: 10px; font-weight: bold; color: #ff9d00;">${suitesHtml}</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🗓️ LAST DATE PLAY</div>
        <div style="font-size: 13px; font-weight: bold;">${lastPlayText}</div>
      </div>
      ${lastFlipText ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔄 LAST FLIP</div>
        <div style="font-size: 13px; font-weight: bold;">${lastFlipText}</div>
      </div>` : ''}
      
      <!-- TO DOUBLE SECTION - ONLY 11,22,33 -->
      ${toDoubleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE (MISSING)</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Double numbers that haven't played</div>
      </div>` : ''}
      ${toDoubleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO DOUBLE x2 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toDoubleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Played once this week - could double</div>
      </div>` : ''}
      
      <!-- TO TRIPLE SECTION -->
      ${toTripleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 2 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toTripleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO TRIPLE x3 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toTripleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 2 plays this week - needs 1 more for triple</div>
      </div>` : ''}
      
      <!-- TO QUADRUPLE SECTION -->
      ${toQuadrupleMissingHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (FROM LAST WEEK • ${previousWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleMissingHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Had 3 plays last week - needs 1 more</div>
      </div>` : ''}
      ${toQuadrupleCurrentHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 6px;">
        <div style="font-size: 10px; color: #888;">♠️ TO QUADRUPLE x4 (CURRENT WEEK • ${currentWeekRange})</div>
        <div style="font-size: 13px; font-weight: bold; color: #ff9d00;">${toQuadrupleCurrentHtml}</div>
        <div style="font-size: 9px; color: #888; margin-top: 2px;">Already has 3 plays this week - needs 1 more for quadruple</div>
      </div>` : ''}
      
      ${wappiHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🔥🔥🔥 LAST THREE WAPPI</div>
        <div style="font-size: 11px;">${wappiHtml}</div>
      </div>` : ''}
      ${dambalayHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px; margin-bottom: 3px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE DAMBALAY</div>
        <div style="font-size: 11px;">${dambalayHtml}</div>
      </div>` : ''}
      ${pullBackHtml ? `
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 6px;">
        <div style="font-size: 10px; color: #888;">🪵🪵🪵 LAST THREE PULL BACK</div>
        <div style="font-size: 11px;">${pullBackHtml}</div>
      </div>` : ''}
      <div style="padding: 6px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 7px; color: #333; background: #fafafa;">
          CHARTS & READOUTS WHATSAPP CHANNEL <br>CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS
        </div>
      <br>
      ${trendAlertHtml}
    </div>
  `;
}

// Play All Four Rule Display
function renderScreenshotGraphic() {
    const container = document.getElementById('custom-graphic-container');
    
    // Create the main wrapper styled with the gradient/solid yellow background
    const wrapper = document.createElement('div');
    wrapper.style.backgroundColor = '#ffd700';
    wrapper.style.backgroundImage = 'radial-gradient(circle, #ffe44d 0%, #ffcc00 100%)';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '600px';
    wrapper.style.aspectRatio = '16 / 9';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.textAlign = 'center';
    wrapper.style.padding = '20px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    wrapper.style.fontWeight = '700';
    wrapper.style.color = '#1b4d3e'; // Dark greenish-teal text color from screenshot
    wrapper.style.userSelect = 'none';

    // Numbers Line: 4, 12, 16, 29
    const numbersEl = document.createElement('div');
    numbersEl.textContent = '4, 12, 16, 29';
    numbersEl.style.fontSize = 'clamp(2rem, 5vw, 3.5rem)';
    numbersEl.style.letterSpacing = '1px';
    numbersEl.style.marginBottom = '10px';

    // Text Line 1: Wen u c 1... play all
    const text1El = document.createElement('div');
    text1El.textContent = 'Wen u c 1... play all';
    text1El.style.fontSize = 'clamp(1.5rem, 4vw, 2.8rem)';
    text1El.style.marginBottom = '5px';

    // Text Line 2: 4
    const text2El = document.createElement('div');
    text2El.textContent = '4';
    text2El.style.fontSize = 'clamp(1.8rem, 4.5vw, 3.2rem)';

    // Append elements together
    wrapper.appendChild(numbersEl);
    wrapper.appendChild(text1El);
    wrapper.appendChild(text2El);

    // Clear container and insert
    container.innerHTML = '';
    container.appendChild(wrapper);
}

if (typeof document !== 'undefined') {
    renderScreenshotGraphic();
}
///////////////End of Report//////////////


// ======================================
// FULL SCREEN PLAY WHE CHART VIEW 
// WITH SHELF MARKS & DOUBLES/TRIPLES/QUADRUPLES
// ======================================
function playWheChartOnly(weeksData) {
    // Define variables inside the function
    const dayShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeOrder = ["MOR", "MID", "NON", "EVE"];
    const doubleNumbers = [8, 11, 22, 33];
    
    if (!weeksData || weeksData.length === 0) {
        return '<div style="text-align:center;padding:40px;color:#999;">No data available</div>';
    }
    
    // Get last 30 weeks
    const sortedWeeks = [...weeksData].sort((a, b) => {
        let pa = a.startDate.split(" ");
        let pb = b.startDate.split(" ");
        return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pa[0]);
    });
    const displayWeeks = sortedWeeks.slice(-30);
    const currentWeek = displayWeeks[displayWeeks.length - 1];
    const previousWeek = displayWeeks.length >= 2 ? displayWeeks[displayWeeks.length - 2] : currentWeek;
    
    // Helper to trim leading zeros
    function trimLeadingZeros(str) {
        if (!str) return "";
        const num = parseInt(str, 10);
        return !isNaN(num) ? num.toString() : str;
    }

    // Helper to get draw number
    function getDrawNumber(week, dayName, slot) {
        if (!week) return null;
        const day = week.days.find(d => d.dayName === dayName);
        if (!day) return null;
        const val = day.draws[slot];
        if (!val || val === "-" || val === "PENDING" || val === "HOLIDAY") return null;
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 36 ? num : null;
    }

    // Helper to check if a draw has actually occurred
    function hasDrawOccurred(weekStartDate, dayIndex, slotIndex) {
        if (!weekStartDate) return false;
        const parts = weekStartDate.split(" ");
        const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayIndex);
        const timeOffsets = [9, 12, 15, 18];
        targetDate.setHours(timeOffsets[slotIndex] || 12);
        return targetDate < new Date();
    }

    // Helper to get the date of a specific draw
    function getDrawDate(weekStartDate, dayIndex, slotIndex) {
        if (!weekStartDate) return null;
        const parts = weekStartDate.split(" ");
        const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayIndex);
        return targetDate;
    }

    // Helper to check if a day has passed
    function isDayPassed(weekStartDate, dayIndex) {
        if (!weekStartDate) return false;
        const parts = weekStartDate.split(" ");
        const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayIndex);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return targetDate < today;
    }

    // SCAN ALL WEEKS to find the LAST occurrence of each number
    const lastOccurrence = {};
    
    // Get today's information
    const today = new Date();
    const todayDay = today.getDay();
    const todayHour = today.getHours();
    
    // Determine current slot
    let currentSlot = -1;
    if (todayHour >= 9 && todayHour < 12) currentSlot = 0;
    else if (todayHour >= 12 && todayHour < 15) currentSlot = 1;
    else if (todayHour >= 15 && todayHour < 18) currentSlot = 2;
    else if (todayHour >= 18) currentSlot = 3;
    
    // SCAN BACKWARDS from current moment
    for (let d = todayDay; d >= 0; d--) {
        const maxSlot = (d === todayDay) ? currentSlot : timeOrder.length - 1;
        for (let s = maxSlot; s >= 0; s--) {
            if (hasDrawOccurred(currentWeek.startDate, d, s)) {
                const num = getDrawNumber(currentWeek, daysOfWeek[d], timeOrder[s]);
                if (num && !lastOccurrence[num]) {
                    lastOccurrence[num] = {
                        week: currentWeek,
                        weekIndex: displayWeeks.length - 1,
                        day: daysOfWeek[d],
                        slot: timeOrder[s],
                        dayIndex: d,
                        slotIndex: s,
                        date: getDrawDate(currentWeek.startDate, d, s)
                    };
                }
            }
        }
    }
    
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
        const week = sortedWeeks[w];
        for (let d = daysOfWeek.length - 1; d >= 0; d--) {
            for (let s = timeOrder.length - 1; s >= 0; s--) {
                if (hasDrawOccurred(week.startDate, d, s)) {
                    const num = getDrawNumber(week, daysOfWeek[d], timeOrder[s]);
                    if (num && !lastOccurrence[num]) {
                        lastOccurrence[num] = {
                            week: week,
                            weekIndex: w,
                            day: daysOfWeek[d],
                            slot: timeOrder[s],
                            dayIndex: d,
                            slotIndex: s,
                            date: getDrawDate(week.startDate, d, s)
                        };
                    }
                }
            }
        }
    }

    function getDaysSince(num) {
        if (!lastOccurrence[num]) return "Never";
        const last = lastOccurrence[num];
        const lastDate = last.date;
        if (!lastDate) return "Never";
        lastDate.setHours(23, 59, 59, 999);
        const now = new Date();
        const diff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }

    const currentWeekDraws = [];
    for (let d = 0; d < daysOfWeek.length; d++) {
        for (let s = 0; s < timeOrder.length; s++) {
            if (hasDrawOccurred(currentWeek.startDate, d, s)) {
                const draw = getDrawNumber(currentWeek, daysOfWeek[d], timeOrder[s]);
                if (draw) currentWeekDraws.push(draw);
            }
        }
    }

    const previousWeekDraws = [];
    for (const day of daysOfWeek) {
        for (const slot of timeOrder) {
            const draw = getDrawNumber(previousWeek, day, slot);
            if (draw) previousWeekDraws.push(draw);
        }
    }

    const prevWeekCounts = {};
    const currWeekCounts = {};
    for (let i = 1; i <= 36; i++) {
        prevWeekCounts[i] = 0;
        currWeekCounts[i] = 0;
    }
    previousWeekDraws.forEach(num => { prevWeekCounts[num] = (prevWeekCounts[num] || 0) + 1; });
    currentWeekDraws.forEach(num => { currWeekCounts[num] = (currWeekCounts[num] || 0) + 1; });

    // Shelf-mark logic KEPT (powers the red grid highlight) — table removed
    function isShelfMark(num) {
        const days = getDaysSince(num);
        if (days === "Never") return false;
        if (days === 0) return false;
        if (currentWeekDraws.includes(num)) return false;
        
        for (let d = 0; d < daysOfWeek.length; d++) {
            for (let s = 0; s < timeOrder.length; s++) {
                if (d < todayDay || (d === todayDay && s <= currentSlot)) continue;
                const draw = getDrawNumber(currentWeek, daysOfWeek[d], timeOrder[s]);
                if (draw === num) return false;
            }
        }
        return days > 14;
    }

    const doubles = [];
    doubleNumbers.forEach(num => {
        const prevCount = prevWeekCounts[num] || 0;
        const currCount = currWeekCounts[num] || 0;
        if (currCount >= 2) return;
        
        let status = 0, label = 'Missing', color = '#ffffff', textColor = '#000000';
        if (prevCount === 1 && currCount === 0) {
            status = 1; label = 'Pending (LW)'; color = '#7c02b5'; textColor = '#ffffff';
        } else if (currCount === 1) {
            status = 2; label = '1 Hit (CW)'; color = '#32d74b'; textColor = '#000000';
        }
        doubles.push({ num, status, label, color, textColor, display: trimLeadingZeros(String(num)) });
    });

    const triples = [];
    for (let i = 1; i <= 36; i++) {
        const prevCount = prevWeekCounts[i] || 0;
        const currCount = currWeekCounts[i] || 0;
        if (currCount >= 3) continue;
        
        let include = false, status = 0, label = 'Pending', color = '#7c02b5', textColor = '#ffffff';
        if (prevCount === 2 && currCount === 0) {
            include = true; status = 1; label = 'Pending (LW)'; color = '#7c02b5'; textColor = '#ffffff';
        } else if (currCount === 2) {
            include = true; status = 2; label = '2 Hits (CW)'; color = '#32d74b'; textColor = '#000000';
        }
        if (include) triples.push({ num: i, status, label, color, textColor, display: trimLeadingZeros(String(i)) });
    }
    triples.sort((a, b) => a.num - b.num);

    const quadruples = [];
    for (let i = 1; i <= 36; i++) {
        const prevCount = prevWeekCounts[i] || 0;
        const currCount = currWeekCounts[i] || 0;
        if (currCount >= 4) continue;
        
        let include = false, status = 0, label = 'Pending', color = '#7c02b5', textColor = '#ffffff';
        if (prevCount === 3 && currCount === 0) {
            include = true; status = 1; label = 'Pending (LW)'; color = '#7c02b5'; textColor = '#ffffff';
        } else if (currCount === 3) {
            include = true; status = 2; label = '3 Hits (CW)'; color = '#32d74b'; textColor = '#000000';
        }
        if (include) quadruples.push({ num: i, status, label, color, textColor, display: trimLeadingZeros(String(i)) });
    }
    quadruples.sort((a, b) => a.num - b.num);

    function buildCategoryBalls(categoryData, title, icon, colorClass) {
        if (!categoryData || categoryData.length === 0) {
            return `
                <div class="category-group ${colorClass}">
                    <div class="category-title">${icon} ${title}</div>
                    <div class="category-balls"><span style="color:#999; font-size:8px;">None</span></div>
                    <div class="category-count">(0)</div>
                </div>
            `;
        }
        
        let ballsHtml = categoryData.map(item => {
            let borderStyle = '1px solid #2d8a4e';
            if (item.status === 0) borderStyle = '1px solid #999';
            else if (item.status === 1) borderStyle = '2px solid #7c02b5';
            else if (item.status === 2) borderStyle = '2px solid #32d74b';
            
            return `
                <div class="category-ball" style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 1px;">
                    <div style="
                        width: 14px; height: 14px; background: ${item.color}; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center; font-size: 11px;
                        font-weight: 900; color: ${item.textColor}; border: ${borderStyle}; line-height: 14px;
                    ">${item.display}</div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="category-group ${colorClass}">
                <div class="category-title">${icon} ${title} <span class="category-count">(${categoryData.length})</span></div>
                <div class="category-balls">${ballsHtml}</div>
            </div>
        `;
    }

    // ===================================
    // ENHANCED HIGHLIGHT LOGIC (Last 2 & Next 2)
    // ===================================
    function getHighlightDraws(weeks) {
        if (!weeks || weeks.length === 0) return { lastDraw1: null, lastDraw2: null, nextDraw1: null, nextDraw2: null };
        let currentWeek = weeks[weeks.length - 1];
        
        let curDay = -1, curSlot = -1, curNum = null, curDate = null;
        for (let d = daysOfWeek.length - 1; d >= 0; d--) {
            for (let s = timeOrder.length - 1; s >= 0; s--) {
                if (hasDrawOccurred(currentWeek.startDate, d, s)) {
                    let num = getDrawNumber(currentWeek, daysOfWeek[d], timeOrder[s]);
                    if (num) {
                        curDay = d; curSlot = s; curNum = num;
                        curDate = getDrawDate(currentWeek.startDate, d, s);
                        break;
                    }
                }
            }
            if (curNum) break;
        }
        
        if (!curNum) {
            for (let w = weeks.length - 2; w >= 0; w--) {
                let week = weeks[w];
                for (let d = daysOfWeek.length - 1; d >= 0; d--) {
                    for (let s = timeOrder.length - 1; s >= 0; s--) {
                        let num = getDrawNumber(week, daysOfWeek[d], timeOrder[s]);
                        if (num) {
                            curDay = d; curSlot = s; curNum = num;
                            curDate = getDrawDate(week.startDate, d, s);
                            break;
                        }
                    }
                    if (curNum) break;
                }
                if (curNum) break;
            }
        }
        
        let lastDraw1 = null, lastDraw2 = null, nextDraw1 = null, nextDraw2 = null;
        
        if (curNum) {
            lastDraw1 = { num: curNum, slot: timeOrder[curSlot], date: curDate };
            
            let prevNum = null, prevDate = null, prevSlot = "";
            let d = curDay, s = curSlot;
            for (let step = 0; step < 28; step++) {
                s -= 1;
                if (s < 0) { s = 3; d -= 1; }
                if (d < 0) break;
                let num = getDrawNumber(currentWeek, daysOfWeek[d], timeOrder[s]);
                if (num) { 
                    prevNum = num; prevSlot = timeOrder[s];
                    prevDate = getDrawDate(currentWeek.startDate, d, s);
                    break; 
                }
            }
            if (!prevNum) {
                for (let w = weeks.length - 2; w >= 0; w--) {
                    let week = weeks[w];
                    for (let dd = daysOfWeek.length - 1; dd >= 0; dd--) {
                        for (let ss = timeOrder.length - 1; ss >= 0; ss--) {
                            let num = getDrawNumber(week, daysOfWeek[dd], timeOrder[ss]);
                            if (num) { 
                                prevNum = num; prevSlot = timeOrder[ss];
                                prevDate = getDrawDate(week.startDate, dd, ss);
                                break; 
                            }
                        }
                        if (prevNum) break;
                    }
                    if (prevNum) break;
                }
            }
            if (prevNum) lastDraw2 = { num: prevNum, slot: prevSlot, date: prevDate };
            
            function findDeepDraw(dayIdx, slotIdx) {
                for (let w = weeks.length - 2; w >= 0; w--) {
                    let week = weeks[w];
                    let num = getDrawNumber(week, daysOfWeek[dayIdx], timeOrder[slotIdx]);
                    if (num) return { num: num, date: getDrawDate(week.startDate, dayIdx, slotIdx) };
                }
                return null;
            }
            
            function getNextDraw(dayIdx, slotIdx) {
                let num = getDrawNumber(currentWeek, daysOfWeek[dayIdx], timeOrder[slotIdx]);
                if (num) return { num: num, date: getDrawDate(currentWeek.startDate, dayIdx, slotIdx) };
                return findDeepDraw(dayIdx, slotIdx);
            }
            
            let n1d = curDay, n1s = curSlot + 1;
            if (n1s >= 4) { n1s = 0; n1d = (n1d + 1) % 7; }
            let n1 = getNextDraw(n1d, n1s);
            if (n1) nextDraw1 = { num: n1.num, slot: timeOrder[n1s], date: n1.date };
            
            let n2d = n1d, n2s = n1s + 1;
            if (n2s >= 4) { n2s = 0; n2d = (n2d + 1) % 7; }
            let n2 = getNextDraw(n2d, n2s);
            if (n2) nextDraw2 = { num: n2.num, slot: timeOrder[n2s], date: n2.date };
        }
        
        return { lastDraw1, lastDraw2, nextDraw1, nextDraw2 };
    }
    
    const { lastDraw1, lastDraw2, nextDraw1, nextDraw2 } = getHighlightDraws(displayWeeks);
    
    // Helper function to format short date (ORIGINAL week-label format)
    function formatShortDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split(" ");
        const monthMap = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12};
        const day = parseInt(parts[0]);
        const month = monthMap[parts[1]];
        const year = parts[2].slice(-2);
        return `${day}/${month}/${year}`;
    }
    
    // Helper function to format date display (ORIGINAL LM date format)
    function formatDateDisplay(date) {
        if (!date) return "";
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
    }
    
    let html = `
    <style>
        .playwhe-chart-wrapper, .playwhe-chart-wrapper * { color-scheme: light !important; }
        .playwhe-chart-wrapper {
            background: #ffffff !important; border-radius: 6px; padding: 8px; border: 1px solid #dddddd !important;
            position: relative; overflow: hidden; max-width: 100%; box-sizing: border-box;
        }
        .playwhe-chart-wrapper table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px; background: #ffffff !important; }
        .playwhe-chart-wrapper th, .playwhe-chart-wrapper td {
            padding: 2px 1px; border: 1px solid #cccccc !important; text-align: center; font-weight: 700;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box; background: #ffffff !important; color: #000000 !important;
        }
        .playwhe-chart-wrapper th { padding: 3px 1px; color: #000000 !important; font-weight: 800; font-size: 8px; background: #f5f5f5 !important; border: 1px solid #cccccc !important; }
        .playwhe-chart-wrapper td.week-label { font-size: 8px; background: #f0f0f0 !important; padding: 2px 1px; width: 8%; border: 1px solid #cccccc !important; color: #000000 !important; }
        .playwhe-chart-wrapper td.day-border { border-left: 3px solid #000000 !important; }
        .playwhe-chart-wrapper td.holiday-cell { background: #e8e8e8 !important; color: #cccccc !important; border: 1px solid #cccccc !important; font-size: 8px; text-align: center; }
        .playwhe-chart-wrapper .row-odd td { background: #fafafa !important; }
        .playwhe-chart-wrapper .row-even td { background: #ffffff !important; }
        .playwhe-chart-wrapper .row-odd td.week-label, .playwhe-chart-wrapper .row-even td.week-label { background: #f0f0f0 !important; }
        .playwhe-chart-wrapper .row-current td { background: #fff70f !important; }
        .playwhe-chart-wrapper .row-current td.week-label { background: #53f736 !important; color: #000000 !important; }
        
        /* HIGHLIGHTS */
        .playwhe-chart-wrapper td.latest-highlight { background: #F8C471 !important; color: #000000 !important; font-weight: 900 !important; border: 1px solid #d39e5c !important; }
        .playwhe-chart-wrapper td.prev-highlight { background: #ABEBC6 !important; color: #000000 !important; font-weight: 900 !important; border: 1px solid #7dcea0 !important; }
        .playwhe-chart-wrapper td.next-highlight { background: #85C1E9 !important; color: #000000 !important; font-weight: 900 !important; border: 1px solid #5dade2 !important; }
        .playwhe-chart-wrapper td.shelf-mark { color: #ff0000 !important; font-weight: 900 !important; background: #ffffff !important; border-color: #cccccc !important; }
        
        /* LM BOXES (2 boxes, #:# pairs) */
        .playwhe-chart-wrapper .lm-container {
            display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 4px 0; padding: 0 2px; position: relative; z-index: 2;
        }
        .playwhe-chart-wrapper .lm-box {
            border-radius: 8px; padding: 6px 8px; text-align: center; border: 1px solid #dddddd !important; background: #fafafa !important;
        }
        .playwhe-chart-wrapper .lm-box .label { font-size: 7px; font-weight: 800; color: #666666 !important; text-transform: uppercase; letter-spacing: 0.5px; }
        .playwhe-chart-wrapper .lm-box .number { font-size: 18px; font-weight: 900; margin: 2px 0; color: #000000 !important; }
        .playwhe-chart-wrapper .lm-box .number .pair-sep { color: #666666 !important; }
        .playwhe-chart-wrapper .lm-box .date { font-size: 7px; color: #666666 !important; }
        
        .playwhe-chart-wrapper .chart-header { text-align: center; margin-bottom: 2px; position: relative; z-index: 2; }
        .playwhe-chart-wrapper .chart-header h1 { font-size: 14px; color: #000000 !important; font-weight: 900; letter-spacing: 1px; margin: 0; }
        .playwhe-chart-wrapper .chart-header .sub-date { font-size: 9px; color: #666666 !important; margin-top: 2px; }
        .playwhe-chart-wrapper .footer { margin-top: 6px; padding-top: 6px; border-top: 1px solid #dddddd !important; display: flex; justify-content: space-between; font-size: 7px; color: #666666 !important; position: relative; z-index: 2; }
        .playwhe-chart-wrapper .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 24px; font-weight: 900; color: rgba(0,0,0,0.04) !important; letter-spacing: 9px; pointer-events: none; white-space: nowrap; z-index: 1; }
        .playwhe-chart-wrapper .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; position: relative; z-index: 2; }
        
        /* CATEGORIES 3x3 GRID */
        .playwhe-chart-wrapper .categories-container {
            background: #fafafa; padding: 6px 4px; border: 1px solid #dddddd; border-top: none;
            display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 6px 10px; font-family: 'Courier New', monospace;
        }
        .playwhe-chart-wrapper .categories-container .category-group {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
            padding: 4px 8px; background: rgba(255,255,255,0.4); border-radius: 6px; border: 1px solid rgba(45, 138, 78, 0.15);
            min-width: 80px; flex: 0 1 auto; text-align: center;
        }
        .playwhe-chart-wrapper .categories-container .category-group.doubles { border-top: 3px solid #32d74b; }
        .playwhe-chart-wrapper .categories-container .category-group.triples { border-top: 3px solid #ff9d00; }
        .playwhe-chart-wrapper .categories-container .category-group.quadruples { border-top: 3px solid #ff375f; }
        .playwhe-chart-wrapper .categories-container .category-title { font-size: 9px; font-weight: 800; color: #000000; letter-spacing: 0.5px; }
        .playwhe-chart-wrapper .categories-container .category-title .category-count { font-size: 8px; color: #666; font-weight: normal; }
        .playwhe-chart-wrapper .categories-container .category-balls {
            display: grid; grid-template-columns: repeat(3, max-content); justify-content: center; align-items: center; gap: 3px 8px;
        }
        
        /* CATEGORY LEGEND */
        .playwhe-chart-wrapper .category-legend {
            background: #fafafa; padding: 2px 6px; border: 1px solid #dddddd; border-top: none;
            display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-family: 'Courier New', monospace; font-size: 7px;
        }
        .playwhe-chart-wrapper .category-legend .legend-item { display: flex; align-items: center; gap: 3px; color: #000000; }
        .playwhe-chart-wrapper .category-legend .legend-ball { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1px solid #2d8a4e; flex-shrink: 0; }
        .playwhe-chart-wrapper .category-legend .legend-ball.white { background: #ffffff; border-color: #999; }
        .playwhe-chart-wrapper .category-legend .legend-ball.purple { background: #7c02b5; border-color: #7c02b5; }
        .playwhe-chart-wrapper .category-legend .legend-ball.green { background: #32d74b; border-color: #32d74b; }
        
        /* LEGEND */
        .playwhe-chart-wrapper .green-chart-legend {
            display: flex; align-items: center; gap: 4px; padding: 2px 4px; background: #fafafa;
            border: 1px solid #dddddd; border-top: none; font-size: 7px; font-family: 'Courier New', monospace; flex-wrap: wrap; color: #000000;
        }
        .playwhe-chart-wrapper .green-chart-legend .legend-item { display: flex; align-items: center; gap: 2px; color: #000000; }
        .playwhe-chart-wrapper .green-chart-legend .legend-dot { display: inline-block; width: 6px; height: 6px; border-radius: 1px; border: 1px solid #2d8a4e; flex-shrink: 0; }
        .playwhe-chart-wrapper .green-chart-legend .legend-dot.shelf { background: #ffffff; border-color: #ff0000; }
        .playwhe-chart-wrapper .green-chart-legend .legend-dot.normal { background: #ffffff; }
        .playwhe-chart-wrapper .green-chart-legend .legend-dot.holiday-dot { background: #e8e8e8; border-color: #ccc; }
        .playwhe-chart-wrapper .green-chart-legend .legend-spacer { color: #999; }
        
        @media (max-width: 480px) {
            .playwhe-chart-wrapper table { font-size: 7px; }
            .playwhe-chart-wrapper td { padding: 1px 0px; font-size: 7px; }
            .playwhe-chart-wrapper th { font-size: 6px; padding: 1px 0px; }
            .playwhe-chart-wrapper td.week-label { font-size: 6px; padding: 1px 0px; }
            .playwhe-chart-wrapper .chart-header h1 { font-size: 12px; }
            .playwhe-chart-wrapper .watermark { font-size: 16px; }
            .playwhe-chart-wrapper .lm-box .number { font-size: 16px; }
            .playwhe-chart-wrapper .lm-box { padding: 4px 6px; }
            .playwhe-chart-wrapper th.day-border, .playwhe-chart-wrapper td.day-border { border-left: 2px solid #000000 !important; }
            .playwhe-chart-wrapper .categories-container { padding: 4px 3px; gap: 4px 6px; }
            .playwhe-chart-wrapper .categories-container .category-group { padding: 3px 6px; min-width: 60px; }
            .playwhe-chart-wrapper .categories-container .category-title { font-size: 8px; }
            .playwhe-chart-wrapper .category-legend { font-size: 6px; padding: 2px 4px; gap: 3px 5px; }
            .playwhe-chart-wrapper .category-legend .legend-ball { width: 8px; height: 8px; }
        }
        @media (max-width: 380px) {
            .playwhe-chart-wrapper table { font-size: 6px; }
            .playwhe-chart-wrapper td { font-size: 6px; padding: 1px 0px; }
            .playwhe-chart-wrapper th { font-size: 5px; padding: 1px 0px; }
            .playwhe-chart-wrapper .categories-container .category-title { font-size: 7px; }
            .playwhe-chart-wrapper .categories-container .category-balls .category-ball div { width: 12px !important; height: 12px !important; font-size: 9px !important; }
            .playwhe-chart-wrapper .category-legend { font-size: 5px; padding: 2px 3px; gap: 2px 4px; }
            .playwhe-chart-wrapper .category-legend .legend-ball { width: 7px; height: 7px; }
            .playwhe-chart-wrapper .green-chart-legend { padding: 2px 3px; gap: 3px; font-size: 6px; }
            .playwhe-chart-wrapper .green-chart-legend .legend-dot { width: 4px; height: 4px; }
        }
        @media (min-width: 768px) {
            .playwhe-chart-wrapper table { font-size: 11px; }
            .playwhe-chart-wrapper td { padding: 4px 2px; font-size: 12px; }
            .playwhe-chart-wrapper th { font-size: 9px; padding: 4px 2px; }
            .playwhe-chart-wrapper td.week-label { font-size: 9px; padding: 4px 2px; }
            .playwhe-chart-wrapper .lm-box .number { font-size: 24px; }
        }
    </style>
    
    <div class="playwhe-chart-wrapper">
        <div class="watermark">CODEWITHGLASGOW</div>
        
        <div class="chart-header">
            <h1>♠️ PLAY WHE CHART</h1>
            <div class="sub-date">${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        
        <!-- Leaving/Meeting Boxes (#:# pairs, colors match chart highlights) -->
        <div class="lm-container">
            <div class="lm-box" style="border-color: #F8C471 !important; background: rgba(248, 196, 113, 0.15) !important;">
                <div class="label">LEAVING • ${lastDraw1 ? lastDraw1.slot : ''}</div>
                <div class="number">${lastDraw1 ? `<span style="color:#d39e5c !important;">#${lastDraw1.num}</span>` : '<span style="color:#cccccc !important;">—</span>'}<span class="pair-sep">:</span>${lastDraw2 ? `<span style="color:#7dcea0 !important;">${lastDraw2.num}</span>` : '<span style="color:#cccccc !important;">—</span>'}</div>
                <div class="date">${lastDraw1 && lastDraw1.date ? formatDateDisplay(lastDraw1.date) : 'No data available'}</div>
            </div>
            <div class="lm-box" style="border-color: #85C1E9 !important; background: rgba(133, 193, 233, 0.15) !important;">
                <div class="label">MEETING • ${nextDraw1 ? nextDraw1.slot : ''}</div>
                <div class="number">${nextDraw1 ? `<span style="color:#5dade2 !important;">#${nextDraw1.num}</span>` : '<span style="color:#cccccc !important;">—</span>'}<span class="pair-sep">:</span>${nextDraw2 ? `<span style="color:#5dade2 !important;">${nextDraw2.num}</span>` : '<span style="color:#cccccc !important;">—</span>'}</div>
                <div class="date">${nextDraw1 && nextDraw1.date ? formatDateDisplay(nextDraw1.date) : 'No data available'}</div>
            </div>
        </div>
        
        <!-- Chart Table -->
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;"></th>
    `;
    
    // Day headers
    for (let i = 0; i < dayShort.length; i++) {
        const borderClass = i > 0 ? 'day-border' : '';
        html += `<th colspan="4" class="${borderClass}">${dayShort[i]}</th>`;
    }
    
    html += `</tr></thead><tbody>`;
    
    // Loop through weeks
    displayWeeks.forEach((week, weekIndex) => {
        const isCurrent = week.isCurrentWeek === true;
        const rowClass = isCurrent ? 'row-current' : (weekIndex % 2 === 0 ? 'row-odd' : 'row-even');
        const weekDate = formatShortDate(week.startDate);   // ORIGINAL date column format
        
        html += `<tr class="${rowClass}">`;
        html += `<td class="week-label">${weekDate}</td>`;
        
        for (let d = 0; d < daysOfWeek.length; d++) {
            const dayName = daysOfWeek[d];
            const day = week.days.find(dy => dy.dayName === dayName);
            
            const borderClass = d > 0 ? 'day-border' : '';
            
            let isHoliday = false;
            let hasDraw = false;
            if (day) {
                hasDraw = timeOrder.some(slot => {
                    const val = day.draws[slot];
                    return val && val !== "-" && val !== "PENDING";
                });
            }
            if (!hasDraw && isDayPassed(week.startDate, d)) {
                isHoliday = true;
            }
            
            if (isHoliday) {
                for (let s = 0; s < timeOrder.length; s++) {
                    const slot = timeOrder[s];
                    const cellClass = s === 0 && d > 0 ? borderClass : '';
                    html += `<td class="holiday-cell ${cellClass}">-</td>`;
                }
                continue;
            }
            
            for (let s = 0; s < timeOrder.length; s++) {
                const slot = timeOrder[s];
                const val = day ? day.draws[slot] : null;
                const isValid = val && val !== "-" && val !== "PENDING";
                const num = isValid ? parseInt(val, 10) : null;
                
                let highlightClass = "";
                if (isValid && num) {
                    if (lastDraw1 && num === lastDraw1.num) {
                        highlightClass = 'latest-highlight';
                    } else if (lastDraw2 && num === lastDraw2.num) {
                        highlightClass = 'prev-highlight';
                    } else if ((nextDraw1 && num === nextDraw1.num) || (nextDraw2 && num === nextDraw2.num)) {
                        highlightClass = 'next-highlight';
                    }
                }
                
                // Shelf-mark red highlight KEPT (table removed, highlight remains)
                let shelfClass = "";
                if (num && isShelfMark(num)) {
                    const isLast = lastOccurrence[num] && 
                                   lastOccurrence[num].week === week && 
                                   lastOccurrence[num].day === dayName &&
                                   lastOccurrence[num].slot === slot;
                    if (isLast) shelfClass = 'shelf-mark';
                }
                
                const cellClass = s === 0 && d > 0 ? borderClass : '';
                const combinedClass = [cellClass, highlightClass, shelfClass].filter(c => c).join(' ');
                
                if (isCurrent && !isValid) {
                    if (isDayPassed(week.startDate, d)) {
                        html += `<td class="${combinedClass}" style="color:#999999;">...</td>`;
                    } else {
                        html += `<td class="${combinedClass}" style="color:#dddddd;">—</td>`;
                    }
                } else if (isValid) {
                    html += `<td class="${combinedClass}">${val}</td>`;
                } else {
                    html += `<td class="${combinedClass}" style="color:#dddddd;">—</td>`;
                }
            }
        }
        html += `</tr>`;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <!-- Categories: 3x3 Grid Layout -->
            <div class="categories-container">
                ${buildCategoryBalls(doubles, 'DOUBLES', '🟢', 'doubles')}
                ${buildCategoryBalls(triples, 'TRIPLES', '🟠', 'triples')}
                ${buildCategoryBalls(quadruples, 'QUADRUPLES', '🔴', 'quadruples')}
            </div>
            
            <!-- Category Legend -->
            <div class="category-legend">
                <span style="font-weight:bold; color:#000000;">STATUS:</span>
                <div class="legend-item"><span class="legend-ball white"></span><span>Missing</span></div>
                <div class="legend-item"><span class="legend-ball purple"></span><span>Pending (LW)</span></div>
                <div class="legend-item"><span class="legend-ball green"></span><span>Hit Current Week</span></div>
                <span style="color:#999; font-size:5px; margin-left:auto;">${new Date().toLocaleDateString()}</span>
            </div>
            
            <!-- Compact Legend (Shelf dot kept — red highlight still active in grid) -->
            <div class="green-chart-legend">
                <span style="font-weight:bold; color:#000000;">LEGEND:</span>
                <div class="legend-item">
                    <span class="legend-dot" style="background:#F8C471; border-color:#d39e5c;"></span>
                    <span style="color:#000000;">Latest</span>
                </div>
                <span class="legend-spacer">|</span>
                <div class="legend-item">
                    <span class="legend-dot" style="background:#ABEBC6; border-color:#7dcea0;"></span>
                    <span style="color:#000000;">Previous</span>
                </div>
                <span class="legend-spacer">|</span>
                <div class="legend-item">
                    <span class="legend-dot" style="background:#85C1E9; border-color:#5dade2;"></span>
                    <span style="color:#000000;">Next 2</span>
                </div>
                <span class="legend-spacer">|</span>
                <div class="legend-item">
                    <span class="legend-dot shelf"></span>
                    <span style="color:#000000;">Shelf</span>
                </div>
                <span class="legend-spacer">|</span>
                <div class="legend-item">
                    <span class="legend-dot holiday-dot"></span>
                    <span style="color:#000000;">Holiday</span>
                </div>
                <div class="legend-item" style="margin-left:auto;">
                    <span style="font-size:5px; color:#000000;">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="footer">
                <span>♠️ ${displayWeeks.length} weeks</span>
                <span> CWG Charts Analysis ©️ ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
            </div>
        </div>
    `;
    
    return html;
}
///////////////////////////////////////////
// ======================================
// PLAY WHE 5-CHART VIEW VERSION 2 — CAROUSEL
// Displays: 1/16, 1/8, 1/9, 1/7, 1/5 Charts as a swipeable carousel
// With Leaving/Meeting highlighting
// Each number is in its own individual cell
// + Leaving/Meeting info container per chart
// ======================================
function renderPlayWheFiveChartsv2(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        📊 Loading Chart data...
      </div>
    `;
  }

  // ======================================
  // CONSTANTS & MAPPINGS
  // ======================================

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();

  // Chart definitions
  const chartDefinitions = [
    { id: '1/16', label: '1/16' },
    { id: '1/8', label: '1/8' },
    { id: '1/9', label: '1/9' },
    { id: '1/7', label: '1/7' },
    { id: '1/5', label: '1/5' }
  ];

  // Generate chart data based on the pattern
  function generateChartData(chartType) {
    const data = [];

    // Row 1 base values for each chart (from the reference screenshot)
    const baseRows = {
      '1/16': { main: 1, num2: 29, num3: 16 },
      '1/8':  { main: 1, num2: 8,  num3: 25 },
      '1/9':  { main: 1, num2: 9,  num3: 25 },
      '1/7':  { main: 1, num2: 7,  num3: 12 },
      '1/5':  { main: 1, num2: 5,  num3: 27 }
    };

    const base = baseRows[chartType];
    if (!base) return data;

    // Helper to wrap numbers into 1-36 range
    function wrap(n) {
      while (n > 36) n -= 36;
      while (n < 1) n += 36;
      return n;
    }

    // Generate 36 rows by incrementing all three values by 1 each row
    for (let i = 0; i < 36; i++) {
      data.push({
        main: wrap(base.main + i),
        num2: wrap(base.num2 + i),
        num3: wrap(base.num3 + i)
      });
    }

    return data;
  }

  // ======================================
  // GET LEAVING & MEETING NUMBERS WITH DETAILS
  // ======================================

  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }

  function getLeavingMeetingNumbers() {
    let leavingNumber = null;
    let leavingSlot = null;
    let leavingDate = null;
    let meetingNumber = null;
    let meetingSlot = null;
    let meetingDate = null;

    const sortedWeeks = [...weeksData].sort((a, b) => {
      let pa = a.startDate.split(" ");
      let pb = b.startDate.split(" ");
      return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });

    const currentWeek = sortedWeeks[sortedWeeks.length - 1];
    const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
    const todayIdx = now.getDay();
    const currentHour = now.getHours();

    function getDateForDraw(week, dayName) {
      if (!week || !week.startDate) return null;
      const parts = week.startDate.split(" ");
      const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
      const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
      const dayIndex = dayNames.indexOf(dayName);
      if (dayIndex === -1) return null;
      const drawDate = new Date(startDate);
      drawDate.setDate(startDate.getDate() + dayIndex);
      return drawDate;
    }

    let currentSlotIdx = -1;
    if (currentHour >= 9 && currentHour < 12) currentSlotIdx = 0;
    else if (currentHour >= 12 && currentHour < 15) currentSlotIdx = 1;
    else if (currentHour >= 15 && currentHour < 18) currentSlotIdx = 2;
    else if (currentHour >= 18) currentSlotIdx = 3;

    // Find LEAVING
    let leavingDayIdx = -1;
    let leavingSlotIdx = -1;

    for (let d = todayIdx; d >= 0; d--) {
      const maxSlot = (d === todayIdx) ? currentSlotIdx : slots.length - 1;
      for (let s = maxSlot; s >= 0; s--) {
        const draw = getDraw(currentWeek, dayNames[d], slots[s]);
        if (draw) {
          leavingNumber = draw;
          leavingDayIdx = d;
          leavingSlotIdx = s;
          leavingSlot = slots[s];
          leavingDate = getDateForDraw(currentWeek, dayNames[d]);
          break;
        }
      }
      if (leavingNumber) break;
    }

    if (!leavingNumber) {
      for (let w = sortedWeeks.length - 2; w >= 0; w--) {
        const week = sortedWeeks[w];
        for (let d = dayNames.length - 1; d >= 0; d--) {
          for (let s = slots.length - 1; s >= 0; s--) {
            const draw = getDraw(week, dayNames[d], slots[s]);
            if (draw) {
              leavingNumber = draw;
              leavingDayIdx = d;
              leavingSlotIdx = s;
              leavingSlot = slots[s];
              leavingDate = getDateForDraw(week, dayNames[d]);
              break;
            }
          }
          if (leavingNumber) break;
        }
        if (leavingNumber) break;
      }
    }

    // Find MEETING
    if (leavingNumber && leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
      let nextDayIdx = leavingDayIdx;
      let nextSlotIdx = leavingSlotIdx + 1;

      if (nextSlotIdx >= slots.length) {
        nextSlotIdx = 0;
        nextDayIdx = leavingDayIdx + 1;
      }

      if (nextDayIdx >= dayNames.length) {
        nextDayIdx = 0;
      }

      if (nextDayIdx >= 0 && nextDayIdx < dayNames.length) {
        const targetDay = dayNames[nextDayIdx];
        const targetSlot = slots[nextSlotIdx];

        meetingNumber = getDraw(previousWeek, targetDay, targetSlot);
        if (meetingNumber) {
          meetingSlot = targetSlot;
          meetingDate = getDateForDraw(previousWeek, targetDay);
        }

        if (!meetingNumber) {
          for (let w = sortedWeeks.length - 2; w >= 0; w--) {
            const week = sortedWeeks[w];
            const draw = getDraw(week, targetDay, targetSlot);
            if (draw) {
              meetingNumber = draw;
              meetingSlot = targetSlot;
              meetingDate = getDateForDraw(week, targetDay);
              break;
            }
          }
        }

        if (!meetingNumber) {
          const draw = getDraw(currentWeek, targetDay, targetSlot);
          if (draw) {
            meetingNumber = draw;
            meetingSlot = targetSlot;
            meetingDate = getDateForDraw(currentWeek, targetDay);
          }
        }
      }
    }

    return {
      leavingNumber, leavingSlot, leavingDate,
      meetingNumber, meetingSlot, meetingDate
    };
  }

  const {
    leavingNumber, leavingSlot, leavingDate,
    meetingNumber, meetingSlot, meetingDate
  } = getLeavingMeetingNumbers();

  // ======================================
  // FORMAT DATE DISPLAY
  // ======================================
  function formatDateDisplay(date) {
    if (!date) return "No data";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
  }

  // ======================================
  // RENDER FUNCTIONS
  // ======================================

  // Leaving/Meeting Info Container (reusable per chart)
  function renderLeavingMeetingInfo(compact = false) {
    const leavingDisplay = leavingNumber ? `#${leavingNumber}` : '—';
    const meetingDisplay = meetingNumber ? `#${meetingNumber}` : '—';
    const leavingDateDisplay = leavingDate ? formatDateDisplay(leavingDate) : 'No data';
    const meetingDateDisplay = meetingDate ? formatDateDisplay(meetingDate) : 'No data';

    const pad = compact ? '5px 8px' : '8px 10px';
    const numSize = compact ? '16px' : '22px';
    const lblSize = compact ? '9px' : '10px';
    const dateSize = compact ? '8px' : '9px';

    return `
      <div style="display: flex; gap: 6px; margin-bottom: 6px;">
        <!-- LEAVING Container -->
        <div style="
          flex: 1;
          border-radius: 6px;
          padding: ${pad};
          text-align: center;
          border: 1px solid #58a6ff;
          background: rgba(88,166,255,0.08);
        ">
          <div style="font-size: ${lblSize}; font-weight: 800; color: #58a6ff; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;">
            🔵 LEAVING
          </div>
          <div style="font-size: ${numSize}; font-weight: 900; color: #58a6ff; margin: 2px 0; line-height: 1.1;">
            ${leavingDisplay}
          </div>
          <div style="font-size: ${dateSize}; color: var(--text-dim, #94a3b8); margin-top: 1px; display: flex; justify-content: center; align-items: center; gap: 4px; flex-wrap: wrap;">
            <span>📆 ${leavingDateDisplay}</span>
            <span>•</span>
            <span>⏰ ${leavingSlot || '—'}</span>
          </div>
        </div>

        <!-- MEETING Container -->
        <div style="
          flex: 1;
          border-radius: 6px;
          padding: ${pad};
          text-align: center;
          border: 1px solid #ff9d00;
          background: rgba(255,157,0,0.08);
        ">
          <div style="font-size: ${lblSize}; font-weight: 800; color: #ff9d00; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;">
            🟡 MEETING
          </div>
          <div style="font-size: ${numSize}; font-weight: 900; color: #ff9d00; margin: 2px 0; line-height: 1.1;">
            ${meetingDisplay}
          </div>
          <div style="font-size: ${dateSize}; color: var(--text-dim, #94a3b8); margin-top: 1px; display: flex; justify-content: center; align-items: center; gap: 4px; flex-wrap: wrap;">
            <span>📆 ${meetingDateDisplay}</span>
            <span>•</span>
            <span>⏰ ${meetingSlot || '—'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // Helper: Render an individual number cell
  function renderNumberCell(num, isMain = false) {
    const isLeaving = num === leavingNumber;
    const isMeeting = num === meetingNumber;

    let bgColor = 'var(--card-bg, rgba(255,255,255,0.03))';
    let borderColor = 'var(--border-color, rgba(255,255,255,0.08))';
    let textColor = 'var(--text-main, #e2e8f0)';
    let fontWeight = isMain ? '700' : '400';
    let extraStyle = '';

    if (isLeaving) {
      bgColor = 'rgba(88,166,255,0.25)';
      borderColor = '#58a6ff';
      textColor = '#58a6ff';
      fontWeight = '900';
      extraStyle = 'box-shadow: 0 0 8px rgba(88,166,255,0.3);';
    } else if (isMeeting) {
      bgColor = 'rgba(255,157,0,0.25)';
      borderColor = '#ff9d00';
      textColor = '#ff9d00';
      fontWeight = '900';
      extraStyle = 'box-shadow: 0 0 8px rgba(255,157,0,0.3);';
    }

    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        padding: 3px 4px;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 3px;
        ${extraStyle}
        transition: all 0.2s ease;
      ">
        <span style="
          font-size: ${isMain ? '12px' : '11px'};
          font-weight: ${fontWeight};
          color: ${textColor};
          line-height: 1.1;
        ">${num}</span>
      </div>
    `;
  }

  function renderChart(chartType, label) {
    const data = generateChartData(chartType);
    if (!data || data.length === 0) return '';

    // 3x3 grid layout (3 columns x 12 rows = 36 numbers)
    let gridHtml = '';
    const rows = 12;
    const cols = 3;

    for (let r = 0; r < rows; r++) {
      gridHtml += '<div style="display:flex; justify-content:center; gap:3px; margin-bottom:3px;">';
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        if (index < data.length) {
          const item = data[index];

          // Each row has: [Main] [Num2] [Num3] — each in its own cell
          gridHtml += `
            <div style="
              display: flex;
              align-items: center;
              gap: 3px;
              flex: 1;
              padding: 2px;
              background: var(--card-bg, rgba(255,255,255,0.01));
              border-radius: 5px;
              border: 1px solid var(--border-color, rgba(255,255,255,0.03));
            ">
              ${renderNumberCell(item.main, true)}
              ${renderNumberCell(item.num2, false)}
              ${renderNumberCell(item.num3, false)}
            </div>
          `;
        }
      }
      gridHtml += '</div>';
    }

    return `
      <div style="
        background: var(--card-bg, rgba(255,255,255,0.02));
        border-radius: 8px;
        padding: 8px;
        border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      ">
        <div style="
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          color: var(--text-main, #ff9d00);
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.06));
        ">
          ${label} CHART PLAY
        </div>
        ${renderLeavingMeetingInfo(true)}
        <div style="padding: 0 2px;">
          ${gridHtml}
        </div>
      </div>
    `;
  }

  // ======================================
  // BUILD THE MAIN HTML
  // ======================================

  const carouselId = 'pwc-carousel-' + Date.now();

  // Build carousel slides (each slide is a full chart)
  const slidesHtml = chartDefinitions.map((chart, idx) => `
    <div class="pwc-slide" data-index="${idx}" style="
      min-width: 100%;
      scroll-snap-align: start;
      padding: 2px;
      box-sizing: border-box;
    ">
      ${renderChart(chart.id, chart.label)}
    </div>
  `).join('');

  // Dots
  let dotsHtml = '';
  for (let i = 0; i < chartDefinitions.length; i++) {
    dotsHtml += `
      <span class="pwc-dot" data-index="${i}" style="
        width: 6px; height: 6px;
        background: ${i === 0 ? '#ff9d00' : '#555'};
        border-radius: 50%;
        display: inline-block;
        margin: 0 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        ${i === 0 ? 'width: 16px; border-radius: 4px;' : ''}
      "></span>
    `;
  }

  // Legend for Leaving/Meeting
  const legendHtml = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 6px;
      padding: 6px 12px;
      background: var(--card-bg, rgba(255,255,255,0.02));
      border-radius: 6px;
      border: 1px solid var(--border-color, rgba(255,255,255,0.06));
      flex-wrap: wrap;
    ">
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 12px; height: 12px; background: rgba(88,166,255,0.25); border: 1px solid #58a6ff; border-radius: 3px;"></span>
        <span style="font-size: 8px; color: var(--text-dim, #64748b);">LEAVING</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 12px; height: 12px; background: rgba(255,157,0,0.25); border: 1px solid #ff9d00; border-radius: 3px;"></span>
        <span style="font-size: 8px; color: var(--text-dim, #64748b);">MEETING</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 12px; height: 12px; background: var(--card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--border-color, rgba(255,255,255,0.06)); border-radius: 3px;"></span>
        <span style="font-size: 8px; color: var(--text-dim, #64748b);">MAIN NUMBER</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-size: 8px; color: var(--text-dim, #64748b);">↳</span>
        <span style="font-size: 8px; color: var(--text-dim, #64748b);">CHART NUMBERS</span>
      </div>
    </div>
  `;

  return `
    <style>
      .pwc-track::-webkit-scrollbar { display: none; }
      .pwc-track { -ms-overflow-style: none; scrollbar-width: none; }
    </style>

    <div style="
      background: var(--bg-start, linear-gradient(135deg, #0f172a, #1e293b));
      border-radius: 16px;
      padding: 12px;
      margin-bottom: 15px;
      border: 1px solid var(--border-color, #ff9d00);
    ">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: var(--text-main, #ff9d00); letter-spacing: 0.3px;">
            ♠️ PLAY WHE CHART PLAY VIEW • v2
          </div>
          <div style="font-size: 7px; color: var(--text-dim, #64748b); margin-top: 1px;">
            ${chartDefinitions.map(c => c.label).join(' • ')} • Leaving/Meeting Highlighted
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 6px; color: var(--text-dim, #94a3b8);">
          <span style="color: #ff9d00; font-weight: bold; font-size: 6px;">CWG ©️</span>
        </div>
      </div>

      <!-- Carousel Navigation -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <button class="pwc-prev" style="
          background: rgba(255,157,0,0.15);
          border: 1px solid rgba(255,157,0,0.3);
          color: #ff9d00;
          font-weight: 800;
          font-size: 12px;
          padding: 4px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">◀ Prev</button>

        <span id="${carouselId}-label" style="
          font-size: 10px;
          font-weight: 700;
          color: var(--text-dim, #94a3b8);
          letter-spacing: 0.3px;
        ">${chartDefinitions[0].label} Chart</span>

        <button class="pwc-next" style="
          background: rgba(255,157,0,0.15);
          border: 1px solid rgba(255,157,0,0.3);
          color: #ff9d00;
          font-weight: 800;
          font-size: 12px;
          padding: 4px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">Next ▶</button>
      </div>

      <!-- Carousel Track -->
      <div id="${carouselId}" class="pwc-track" style="
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        gap: 0;
        padding: 0;
      ">
        ${slidesHtml}
      </div>

      <!-- Dots -->
      <div id="${carouselId}-dots" style="display: flex; justify-content: center; align-items: center; margin-top: 8px;">
        ${dotsHtml}
      </div>

      <!-- Legend -->
      ${legendHtml}

      <!-- Footer -->
      <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.02)); display: flex; justify-content: center; align-items: center; gap: 6px; flex-wrap: wrap;">
        <span style="font-size: 7px; color: var(--text-dim, #64748b);">CodeWithGlasgow • CWG Chart Analysis ©️</span>
        <span style="font-size: 7px; color: var(--text-dim, #64748b);">Updated: ${new Date().toLocaleDateString()}</span>
      </div>

    </div>

    <script>
      (function() {
        var trackId = '${carouselId}';
        var track = document.getElementById(trackId);
        if (!track) return;

        var dots = document.querySelectorAll('#' + trackId + '-dots .pwc-dot');
        var label = document.getElementById(trackId + '-label');
        var prevBtn = track.parentElement.querySelector('.pwc-prev');
        var nextBtn = track.parentElement.querySelector('.pwc-next');

        var labels = ${JSON.stringify(chartDefinitions.map(c => c.label + ' Chart'))};
        var totalSlides = ${chartDefinitions.length};
        var currentIndex = 0;
        var scrollTimeout;

        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#ff9d00';
              dot.style.width = '16px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#555';
              dot.style.width = '6px';
              dot.style.borderRadius = '50%';
            }
          });
          if (label && labels[currentIndex]) {
            label.textContent = labels[currentIndex];
          }
        }

        function scrollToSlide(index) {
          if (index < 0) index = 0;
          if (index >= totalSlides) index = totalSlides - 1;
          currentIndex = index;
          var slideWidth = track.children[0] ? track.children[0].offsetWidth : 0;
          if (slideWidth > 0) {
            track.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
          }
          updateDots();
        }

        function handleScroll() {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function() {
            var slideWidth = track.children[0] ? track.children[0].offsetWidth : 0;
            if (slideWidth <= 0) return;
            var newIndex = Math.round(track.scrollLeft / slideWidth);
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalSlides) {
              currentIndex = newIndex;
              updateDots();
            }
          }, 80);
        }

        track.addEventListener('scroll', handleScroll);
        dots.forEach(function(dot) {
          dot.addEventListener('click', function() {
            scrollToSlide(parseInt(dot.getAttribute('data-index'), 10));
          });
        });
        if (prevBtn) prevBtn.addEventListener('click', function() { scrollToSlide(currentIndex - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function() { scrollToSlide(currentIndex + 1); });

        updateDots();
      })();
    </script>
  `;
}
///////////////////////////////////////////
// ======================================
// LINES & SUITS HEAT MAP TRACKING
// ======================================
function renderLSChart(title, labelPrefix, groups, stats, hitData, totalDraws, weeksData, gameType = "PLAY_WHE", currentCycleNumber) {
  let rows = Object.keys(groups).map(key => {
    let cells = groups[key].map(num => {
      let h = hitData[num] || 0;
      let cls = h >= 7 ? "hit-7plus" : "hit-" + h;
      return `<td class="${cls}" style="border: 0.5px solid rgba(0,0,0,0.1);">${num}</td>`;
    }).join("");

    let padding = "";
    if (groups[key].length < 4) {
      for (let i = groups[key].length; i < 4; i++) {
        padding += `<td style="background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.05);"></td>`;
      }
    }

    return `<tr><td class="ls-label">${key}</td><td class="ls-count">${stats[key] || 0}</td>${cells}${padding}</tr>`;
  }).join("");

  // --- Compute missing numbers ---
  let missingNumbers = [];
  for (let n = 1; n <= 36; n++) {
    if (!hitData[n]) missingNumbers.push(n);
  }

  // =====================================
  // HISTORICAL CYCLE COMPLETION RECORDS - DEEP SEARCH FOR PICK 2
  // =====================================
  function getHistoricalCycles(weeksData, gameType) {
    if (!weeksData || weeksData.length === 0) return [];
    
    const sortedWeeks = [...weeksData].sort((a, b) => {
      let pa = a.startDate.split(" ");
      let pb = b.startDate.split(" ");
      return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const slots = ["MOR", "MID", "NON", "EVE"];
    
    // Helper to extract ALL numbers from a draw based on game type
    function extractNumbersFromDraw(val, gameType) {
      if (!val || val === "-" || val === "PENDING" || val === "HOLIDAY") return { numbers: [], raw: val, fullDraw: val };
      
      const numbers = [];
      let rawDraw = val;
      let fullDraw = val;
      
      if (gameType === "PLAY_WHE" || gameType === "P2WHE") {
        const match = String(val).match(/^(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
        }
        rawDraw = match ? match[1] : val;
      } else if (gameType === "PICK_2" || gameType === "PIKII") {
        const strVal = String(val);
        const matches = strVal.match(/\d+/g);
        if (matches) {
          matches.forEach(m => {
            const num = parseInt(m, 10);
            if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
          });
        }
        rawDraw = strVal;
        fullDraw = strVal;
      } else if (gameType === "PICK_4" || gameType === "PIKIV") {
        const strVal = String(val).replace(/\D/g, '');
        for (let i = 0; i < strVal.length; i += 2) {
          if (i + 1 < strVal.length) {
            const pair = strVal.substring(i, i + 2);
            const num = parseInt(pair, 10);
            if (!isNaN(num) && num >= 1 && num <= 36) numbers.push(num);
          }
        }
        rawDraw = strVal;
        fullDraw = strVal;
      }
      
      return { numbers, raw: rawDraw, fullDraw: fullDraw };
    }
    
    function getDraw(week, dayName, slot) {
      if (!week) return null;
      const day = week.days.find(d => d.dayName === dayName);
      if (!day) return null;
      return day.draws[slot] || null;
    }
    
    // Build timeline with all draws
    const timeline = [];
    for (const week of sortedWeeks) {
      const weekStart = new Date(week.startDate);
      for (let d = 0; d < dayNames.length; d++) {
        const drawDate = new Date(weekStart);
        drawDate.setDate(weekStart.getDate() + d);
        for (const slot of slots) {
          const val = getDraw(week, dayNames[d], slot);
          if (val) {
            const { numbers, raw, fullDraw } = extractNumbersFromDraw(val, gameType);
            if (numbers.length > 0) {
              timeline.push({
                num: numbers[0],
                allNums: numbers,
                date: drawDate,
                day: dayNames[d],
                slot: slot,
                timestamp: drawDate.getTime(),
                rawDraw: raw,
                fullDraw: fullDraw,
                weekStart: week.startDate
              });
            }
          }
        }
      }
    }
    
    timeline.sort((a, b) => a.timestamp - b.timestamp);
    
    // Find cycle completion points
    const cycles = [];
    let cycleNumbers = new Set();
    let cycleDrawsList = [];
    let cycleStartIndex = 0;
    let cycleStartDate = timeline.length > 0 ? timeline[0].date : null;
    let completionEntry = null;
    let completionNum = null;
    
    for (let i = 0; i < timeline.length; i++) {
      const entry = timeline[i];
      const numsToCheck = entry.allNums || [entry.num];
      
      let anyNewNumber = false;
      let lastNewNum = null;
      
      for (const num of numsToCheck) {
        if (!cycleNumbers.has(num)) {
          cycleNumbers.add(num);
          anyNewNumber = true;
          lastNewNum = num;
        }
      }
      
      cycleDrawsList.push(entry);
      
      if (anyNewNumber && cycleNumbers.size === 36) {
        completionEntry = entry;
        completionNum = lastNewNum;
      }
      
      if (cycleNumbers.size === 36) {
        const compEntry = completionEntry || entry;
        const compDate = compEntry.date;
        const compFullDraw = compEntry.fullDraw || compEntry.rawDraw || '—';
        const compNum = completionNum || compEntry.num;
        const totalHits = cycleDrawsList.length;
        
        let numPlays = 0;
        for (const draw of cycleDrawsList) {
          const drawNums = draw.allNums || [draw.num];
          if (drawNums.includes(compNum)) {
            numPlays++;
          }
        }
        if (numPlays === 0) numPlays = 1;
        
        let completedItem = '';
        if (labelPrefix === 'L') {
          for (const [lineKey, lineNums] of Object.entries(groups)) {
            if (lineNums.includes(compNum)) {
              completedItem = `${lineKey} Line`;
              break;
            }
          }
        } else {
          for (const [suiteKey, suiteNums] of Object.entries(groups)) {
            if (suiteNums.includes(compNum)) {
              completedItem = `${suiteKey} Suite`;
              break;
            }
          }
        }
        if (!completedItem) {
          for (const [key, nums] of Object.entries(groups)) {
            if (nums.includes(compNum)) {
              completedItem = labelPrefix === 'L' ? `Line ${key}` : `Suite ${key}`;
              break;
            }
          }
        }
        
        const cycleDrawsCopy = [...cycleDrawsList];
        
        cycles.push({
          cycleNumber: cycles.length + 1,
          startDate: cycleStartDate,
          completionDate: compDate,
          lastNum: compNum,
          completionDraw: compFullDraw,
          totalDraws: totalHits,
          completedItem: completedItem || '—',
          numPlays: numPlays,
          cycleDraws: cycleDrawsCopy,
          completionPair: compFullDraw
        });
        
        // Reset for next cycle
        cycleNumbers = new Set();
        cycleDrawsList = [];
        cycleStartIndex = i + 1;
        cycleStartDate = i + 1 < timeline.length ? timeline[i + 1].date : null;
        completionEntry = null;
        completionNum = null;
      }
    }
    
    // If there's an incomplete current cycle, add it as the current cycle
    if (cycleNumbers.size > 0 && cycleNumbers.size < 36) {
      const currentCycleDraws = cycleDrawsList.length;
      // Don't add incomplete cycle to completed cycles list
    }
    
    return cycles;
  }
  
  const allCycles = getHistoricalCycles(weeksData, gameType);
  const historicalCycles = allCycles.slice(-6);
  
  // =====================================
  // DETERMINE GAME TYPE
  // =====================================
  const isPlayWhe = (gameType === "PLAY_WHE" || gameType === "P2WHE");
  const isPick2 = (gameType === "PICK_2" || gameType === "PIKII");
  
  // Build historical cycles HTML
  let historyHtml = '';
  if (historicalCycles.length > 0) {
    let extractedCycle = currentCycleNumber;
    
    if (!extractedCycle || extractedCycle <= 0) {
      const cycleMatch = title.match(/Cycle\s*(\d+)/i);
      if (cycleMatch && cycleMatch[1]) {
        extractedCycle = parseInt(cycleMatch[1], 10);
      }
    }
    
    if (!extractedCycle || extractedCycle <= 0) {
      extractedCycle = allCycles.length + 1;
    }
    
    const currentCycle = extractedCycle;
    
    // Get the start date of the current cycle from the title or from the last cycle's completion
    let currentCycleStartDate = '—';
    if (historicalCycles.length > 0) {
      const lastCompletedCycle = historicalCycles[historicalCycles.length - 1];
      if (lastCompletedCycle && lastCompletedCycle.completionDate) {
        // The current cycle started the day after the last cycle completed
        const startDate = new Date(lastCompletedCycle.completionDate);
        startDate.setDate(startDate.getDate() + 1);
        currentCycleStartDate = startDate.toLocaleDateString('en-US', { 
          day: '2-digit',
          month: 'short', 
          year: 'numeric' 
        }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
      }
    }
    
    // Update the title with the correct start date
    if (currentCycleStartDate !== '—') {
      // The title will be updated in the main return
    }
    
    const cycleRows = historicalCycles.map((cycle, index) => {
      const positionFromEnd = historicalCycles.length - 1 - index;
      const cycleNumber = currentCycle - 1 - positionFromEnd;
      
      const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };
      
      const completionDateFormatted = formatDate(cycle.completionDate);
      const completedItem = cycle.completedItem || '—';
      const totalHits = cycle.totalDraws || 0;
      
      const spiritEmoji = {
      1: "🔪", 
      2: "👵🏾", 
      3: "🚕", 
      4: "⚰️", 
      5: "👨🏾‍🦳", 
      6: "🤰🏽", 
      7: "🐗", 
      8: "🐯",
      9: "🐮", 
      10: "🐒", 
      11: "🦅", 
      12: "🤴🏽", 
      13: "🐸", 
      14: "💰", 
      15: "🤧", 
      16: "💃🏽",
      17: "🐦‍⬛", 
      18: "🚤", 
      19: "🐎", 
      20: "🐶", 
      21: "👄", 
      22: "🐀", 
      23: "🏡", 
      24: "🫅🏽",
      25: "🐢", 
      26: "🐔", 
      27: "🐍", 
      28: "🐟", 
      29: "🍻", 
      30: "🐈‍⬛", 
      31: "👵🏾", 
      32: "🦐",
      33: "🕷️", 
      34: "👨🏾‍🦯", 
      35: "🐍", 
      36: "🫏"
      };
      const emoji = spiritEmoji[cycle.lastNum] || '';
      
      let rankMark = '—';
      let rankCount = 0;
      
      if (isPlayWhe && cycle.cycleDraws && cycle.cycleDraws.length > 0) {
        let maxHits = 0;
        let bestNum = null;
        const cycleHitCounts = {};
        for (const draw of cycle.cycleDraws) {
          const drawNums = draw.allNums || [draw.num];
          for (const num of drawNums) {
            cycleHitCounts[num] = (cycleHitCounts[num] || 0) + 1;
          }
        }
        for (const [num, count] of Object.entries(cycleHitCounts)) {
          if (count > maxHits) {
            maxHits = count;
            bestNum = parseInt(num, 10);
          }
        }
        if (bestNum !== null && maxHits > 0) {
          rankMark = `${bestNum}`;
          rankCount = maxHits;
        }
      }
      
      const rankDisplay = (isPlayWhe && rankMark !== '—') ? 
        `${rankMark}<br><span style="font-size: 9px; color: #94a3b8;">(${rankCount}x)</span>` : 
        '—';
      
      const itemColor = labelPrefix === 'L' ? '#58a6ff' : '#ff9d00';
      
      let markDisplay = `${cycle.lastNum} ${emoji}`;
      let drawDisplay = '—';
      
      if (isPick2) {
        drawDisplay = cycle.completionPair || cycle.completionDraw || '—';
      } else if (isPlayWhe) {
        drawDisplay = rankDisplay;
      } else {
        drawDisplay = cycle.completionDraw || '—';
      }
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #ff9d00; font-size: 12px;">${cycleNumber}</td>
          <td style="padding: 6px 6px; text-align: center; color: ${itemColor}; font-weight: 600; font-size: 11px;">${completedItem}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #ffd700; font-size: 12px;">${totalHits}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: #fff; font-size: 13px;">${markDisplay}</td>
          <td style="padding: 6px 6px; text-align: center; font-weight: 700; color: ${isPick2 ? '#58a6ff' : '#ffd700'}; font-size: 12px; ${isPlayWhe ? 'line-height: 1.2;' : ''}">${drawDisplay}</td>
          <td style="padding: 6px 6px; text-align: center; color: #94a3b8; font-size: 9px;">${completionDateFormatted}</td>
        </tr>
      `;
    }).join('');
    
    const column5Header = isPick2 ? 'DRAW' : (isPlayWhe ? 'MOST PLAYED' : 'DRAW');
    
    historyHtml = `
      <div style="margin-top: 7px; border-top: 2px solid rgba(255,157,0,0.2); padding-top: 7px;">
        <div style="font-size: 11px; font-weight: 800; color: #ff9d00; margin-bottom: 4px; text-align: center; letter-spacing: 0.5px;">
          📜 LAST ${historicalCycles.length} CYCLE COMPLETIONS
        </div>
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05);">
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">CYCLE</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">${labelPrefix === 'L' ? 'LINE' : 'SUITE'}</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">HITS</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">MARK</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">${column5Header}</th>
                <th style="padding: 6px 6px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 10px;">DATE</th>
              </tr>
            </thead>
            <tbody>
              ${cycleRows}
            </tbody>
          </table>
        </div>
        <div style="font-size: 7px; color: #64748b; text-align: center; margin-top: 4px;">
          Last 6 completed cycles • ${labelPrefix === 'L' ? 'Lines' : 'Suites'} completion tracking
          ${isPick2 ? ' • DRAW = full pair that completed the cycle' : ''}
          ${isPlayWhe ? ' • MOST PLAYED = ranked number for that cycle' : ''}
        </div>
      </div>
    `;
  }

  // Format the title with the correct date range
  let displayTitle = title;
  let formattedStartDate = '—';
  
  // Try to extract the start date from the title or use the last cycle completion date
  if (historicalCycles.length > 0) {
    const lastCompletedCycle = historicalCycles[historicalCycles.length - 1];
    if (lastCompletedCycle && lastCompletedCycle.completionDate) {
      const startDate = new Date(lastCompletedCycle.completionDate);
      startDate.setDate(startDate.getDate() + 1);
      formattedStartDate = startDate.toLocaleDateString('en-US', { 
        day: '2-digit',
        month: 'short', 
        year: 'numeric' 
      }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
      
      // Update the title if it contains a date range
      if (formattedStartDate !== '—') {
        const currentDate = new Date();
        const currentDateStr = currentDate.toLocaleDateString('en-US', { 
          day: '2-digit',
          month: 'short', 
          year: 'numeric' 
        }).replace(/,/g, '').replace(/(\d{2})$/, "'$1");
        
        // Extract the game name from the title
        const gameMatch = title.match(/^(LINES|SUITES)\s*\(/i);
        const gameName = gameMatch ? gameMatch[1] : labelPrefix === 'L' ? 'LINES' : 'SUITES';
        
        // Extract cycle number from title
        const cycleMatch = title.match(/Cycle\s*(\d+)/i);
        const cycleNum = cycleMatch ? cycleMatch[1] : currentCycleNumber || '?';
        
        displayTitle = `${gameName} CHART (${formattedStartDate} — NOW) • Cycle ${cycleNum} • ${totalDraws}/36`;
      }
    }
  }

  return `
    <div class="table-wrapper">
      <div class="table-header" style="background:#334155;"><span>${displayTitle}</span></div>
      <table class="ls-table">
        <tr class="ls-header-row">
          <td style="width:15%; color:#888; font-size:10px;">${labelPrefix}</td>
          <td style="width:15%; color:#888; font-size:10px;">HITS</td>
          <td colspan="4" style="color:#888; font-size:10px; text-align:left; padding-left:10px;">MEMBERS</td>
        </tr>
        ${rows}
        <tr class="td-row" style="background: rgba(255,255,255,0.05);">
          <td colspan="2" style="font-size:10px; color: #aaa;">TOTAL DRAW</td>
          <td colspan="4" style="text-align:right; padding-right:8px; font-size:14px; color: #00f2ff; font-weight:900;">
            n = ${totalDraws}
          </td>
        </tr>
        <tr style="background: #0f172a;">
          <td colspan="6" style="padding: 6px 4px;">
            <div style="display:flex; justify-content: space-around; align-items: center; gap: 2px;">
              ${["7plus", "6", "5", "4", "3", "2", "1"].map(c => `
                <div style="display:flex; align-items:center; gap:3px;">
                  <div class="hit-${c}" style="width:4px; height:4px; border-radius:1px;"></div>
                  <span style="font-size:8px; color:#aaa;">${c === '7plus' ? '7x+' : c + 'x'}</span>
                </div>
              `).join("")}
            </div>
          </td>
        </tr>
        ${missingNumbers.length > 0 ? `
        <tr style="background: #111827;">
          <td colspan="6" style="padding:4px 4px; font-size:12px; color:#ff9d00; text-align:center;">
            Missing Until Next Cycle: <br> ${missingNumbers.join(", ")}
          </td>
        </tr>
        ` : ""}
      </table>
      ${historyHtml}
    </div>`;
}
///////////////////////////////////////////

////////////CHART PLAY MAPPING///////////
// ====================================
// PLAY WHE CHART PLAY MAPPING - With Line, Suite & Spirit Info
// ===================================
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
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
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
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Enhanced deep search function that skips holidays and searches across all weeks
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    // First try the standard approach (skip holidays)
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      // Special handling for Monday holidays
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    
    // FALLBACK: If no valid draw found, scan ALL weeks for ANY draw
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      if (w === sortedWeeks.length - 1 && week.isCurrentWeek) continue;
      
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const val = getDraw(week, dayNames[d], slots[s]);
          if (val) {
            const date = new Date(week.startDate);
            date.setDate(date.getDate() + d);
            return { value: val, week: week, date: date };
          }
        }
      }
    }
    
    return { value: 1, week: sortedWeeks[sortedWeeks.length - 1], date: new Date() };
  }
  
  // Find LEAVING number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  // First try current week
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
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // ULTIMATE FALLBACK: If still no leaving number, use default
  if (!leavingNumber) {
    leavingNumber = 1;
    leavingDate = new Date();
    leavingDay = "Today";
    leavingSlot = "MOR";
    leavingDayIdx = 0;
    leavingSlotIdx = 0;
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
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  // ULTIMATE FALLBACK: If no meeting number, use partner or default
  if (!meetingNumber) {
    const partnerMap = {
      1: 36, 
      2: 35, 
      3: 34, 
      4: 33, 
      5: 32, 
      6: 31, 
      7: 30, 
      8: 29, 
      9: 28,
      10: 27, 
      11: 26, 
      12: 25, 
      13: 24, 
      14: 23, 
      15: 22, 
      16: 21, 
      17: 20, 
      18: 19,
      19: 18, 
      20: 17, 
      21: 16, 
      22: 15, 
      23: 14, 
      24: 13, 
      25: 12, 
      26: 11, 
      27: 10,
      28: 9, 
      29: 8, 
      30: 7, 
      31: 6, 
      32: 5, 
      33: 4, 
      34: 3, 
      35: 2, 
      36: 1
    };
    if (leavingNumber && partnerMap[leavingNumber]) {
      meetingNumber = partnerMap[leavingNumber];
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    } else {
      meetingNumber = 1;
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    }
  }
  
// ==== HELPER FUNCTIONS FOR LINE & SUITE 
  const linesChart = {
    1: [1, 10, 19, 28], 
    2: [2, 11, 20, 29], 
    3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 
    5: [5, 14, 23, 32], 
    6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 
    8: [8, 17, 26, 35], 
    9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 
    1: [1, 11, 21, 31], 
    2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 
    4: [4, 14, 24, 34], 
    5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 
    7: [7, 17, 27], 
    8: [8, 18, 28], 
    9: [9, 19, 29]
  };
  
  // Spirit Names mapping
  const spiritNames = {
    1: "Centipede", 
    2: "Old Lady", 
    3: "Carriage", 
    4: "Dead Man", 
    5: "Parson Man",
    6: "Belly", 
    7: "Hog", 
    8: "Tiger", 
    9: "Cattle", 
    10: "Monkey",
    11: "Corbeau", 
    12: "King", 
    13: "Crapaud", 
    14: "Money", 
    15: "Sick Woman",
    16: "Jamette", 
    17: "Pigeon", 
    18: "Water Boat", 
    19: "Horse", 
    20: "Dog",
    21: "Mouth", 
    22: "Rat", 
    23: "House", 
    24: "Queen", 
    25: "Morrocoy",
    26: "Fowl", 
    27: "Little Snake", 
    28: "Red Fish", 
    29: "Opium Man", 
    30: "House Cat",
    31: "Parson Wife", 
    32: "Shrimp", 
    33: "Spider", 
    34: "Blind Man", 
    35: "Big Snake", 
    36: "Donkey"
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
    1: "🔪", 
    2: "👵🏾", 
    3: "🚕", 
    4: "💀", 
    5: "👨🏾‍🦳", 
    6: "🤰🏽", 
    7: "🐗", 
    8: "🐯",
    9: "🐮", 
    10: "🐒", 
    11: "🦅", 
    12: "🤴🏽", 
    13: "🐸", 
    14: "💰", 
    15: "🤧", 
    16: "💃🏽",
    17: "🐦‍⬛", 
    18: "🚤", 
    19: "🐎", 
    20: "🐶", 
    21: "👄", 
    22: "🐀", 
    23: "🏡", 
    24: "🫅🏽",
    25: "🐢", 
    26: "🐔", 
    27: "🐍", 
    28: "🐟", 
    29: "🍻", 
    30: "🐈‍⬛", 
    31: "👵🏾", 
    32: "🦐",
    33: "🕷️", 
    34: "👨🏾‍🦯", 
    35: "🐍", 
    36: "🫏"
  };

  // Exact 10x10 structure
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
        🔵 LEAVING • 🟡 MEETING • CODEWITHGLASGOW ©️ CWG CHART ANALYSIS
      </div>
    </div>
  `;
}

/////////END OF CHART PLAY MAPPING/////////

/////PLAYWHE CHART MAPPING MATRIX//////////
// =====================================
// THE DEVELOPED CHART MAPPING GRID & CONTAINERS (NLCB TRACKER PLATFORM)
// ====================================
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
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
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
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced function to get draws from multiple weeks
  function getDrawFromMultipleWeeks(weeks, dayName, slot) {
    for (let i = weeks.length - 1; i >= 0; i--) {
      const week = weeks[i];
      const draw = getDraw(week, dayName, slot);
      if (draw) {
        return { value: draw, week: week };
      }
    }
    return null;
  }
  
  // Enhanced deep search function that skips holidays and searches across all weeks
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    // First try the standard approach (skip holidays)
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      // Special handling for Monday holidays
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    
    // FALLBACK: If no valid draw found, scan ALL weeks for ANY draw
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      if (w === sortedWeeks.length - 1 && week.isCurrentWeek) continue;
      
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const val = getDraw(week, dayNames[d], slots[s]);
          if (val) {
            const date = new Date(week.startDate);
            date.setDate(date.getDate() + d);
            return { value: val, week: week, date: date };
          }
        }
      }
    }
    
    return { value: 1, week: sortedWeeks[sortedWeeks.length - 1], date: new Date() };
  }
  
  // Dynamic lookup for LEAVING number
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  // First try current week
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
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // ULTIMATE FALLBACK: If still no leaving number, use default
  if (!leavingNumber) {
    leavingNumber = 1;
    leavingDate = new Date();
    leavingDay = "Today";
    leavingSlot = "MOR";
    leavingDayIdx = 0;
    leavingSlotIdx = 0;
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
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
      }
    }
  }
  
  // ULTIMATE FALLBACK: If no meeting number, use partner or default
  if (!meetingNumber) {
    const partnerMap = {
      1: 36, 
      2: 35, 
      3: 34, 
      4: 33, 
      5: 32, 
      6: 31, 
      7: 30, 
      8: 29, 
      9: 28,
      10: 27, 
      11: 26, 
      12: 25, 
      13: 24, 
      14: 23, 
      15: 22, 
      16: 21, 
      17: 20, 
      18: 19,
      19: 18, 
      20: 17, 
      21: 16, 
      22: 15, 
      23: 14, 
      24: 13, 
      25: 12, 
      26: 11, 
      27: 10,
      28: 9, 
      29: 8, 
      30: 7, 
      31: 6, 
      32: 5, 
      33: 4, 
      34: 3, 
      35: 2, 
      36: 1
    };
    if (leavingNumber && partnerMap[leavingNumber]) {
      meetingNumber = partnerMap[leavingNumber];
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    } else {
      meetingNumber = 1;
      meetingDay = "Next Draw";
      meetingSlot = "Upcoming";
      meetingDate = new Date();
      meetingDate.setDate(now.getDate() + 1);
    }
  }
  
  const linesChart = {
    1: [1, 10, 19, 28], 
    2: [2, 11, 20, 29], 
    3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 
    5: [5, 14, 23, 32], 
    6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 
    8: [8, 17, 26, 35], 
    9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 
    1: [1, 11, 21, 31], 
    2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 
    4: [4, 14, 24, 34], 
    5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 
    7: [7, 17, 27], 
    8: [8, 18, 28], 
    9: [9, 19, 29]
  };
  
  const spiritNames = {
    1: "Centipede", 
    2: "Old Lady", 
    3: "Carriage", 
    4: "Dead Man", 
    5: "Parson Man",
    6: "Belly", 
    7: "Hog", 
    8: "Tiger", 
    9: "Cattle", 
    10: "Monkey",
    11: "Corbeau", 
    12: "King", 
    13: "Crapaud", 
    14: "Money", 
    15: "Sick Woman",
    16: "Jamette", 
    17: "Pigeon", 
    18: "Water Boat", 
    19: "Horse", 
    20: "Dog",
    21: "Mouth", 
    22: "Rat", 
    23: "House", 
    24: "Queen", 
    25: "Morrocoy",
    26: "Fowl", 
    27: "Little Snake", 
    28: "Red Fish", 
    29: "Opium Man", 
    30: "House Cat",
    31: "Parson Wife", 
    32: "Shrimp", 
    33: "Spider", 
    34: "Blind Man", 
    35: "Big Snake", 
    36: "Donkey"
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
      ⚡ 🔵 LEAVING • 🔴 MEETING • CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS
    </div>
  </div>
  `;
}

///END OF PLAYWHE CHART MAPPING MATRIX///

/////////////SAGi INSIGHT 2.0//////////////
// =====================================
// CHART PLAY ANALYSIS - Complete Table View with Confidence
// =====================================
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
    1: "🔪", 
    2: "👵🏾", 
    3: "🚕", 
    4: "⚰️", 
    5: "👨🏾‍🦳", 
    6: "🤰🏽", 
    7: "🐗", 
    8: "🐯",
    9: "🐮", 
    10: "🐒", 
    11: "🦅", 
    12: "🤴🏽", 
    13: "🐸", 
    14: "💰", 
    15: "🤧", 
    16: "💃🏽",
    17: "🐦‍⬛", 
    18: "🚤", 
    19: "🐎", 
    20: "🐶", 
    21: "👄", 
    22: "🐀", 
    23: "🏡", 
    24: "🫅🏽",
    25: "🐢", 
    26: "🐔", 
    27: "🐍", 
    28: "🐟", 
    29: "🍻", 
    30: "🐈‍⬛", 
    31: "👵🏾", 
    32: "🦐",
    33: "🕷️", 
    34: "👨🏾‍🦯", 
    35: "🐍", 
    36: "🫏"
  };
  
  // ======== CHART DEFINITIONS ========
  
  const chart16 = {
    1: [1, 16, 29], 
    2: [2, 17, 30], 
    3: [3, 18, 31], 
    4: [4, 19, 32],
    5: [5, 20, 33], 
    6: [6, 21, 34], 
    7: [7, 22, 35], 
    8: [8, 23, 36],
    9: [9, 24, 1], 
    10: [10, 25, 2], 
    11: [11, 26, 3], 
    12: [12, 27, 4],
    13: [13, 28, 5], 
    14: [14, 29, 6], 
    15: [15, 30, 7], 
    16: [16, 31, 8],
    17: [17, 32, 9], 
    18: [18, 33, 10], 
    19: [19, 34, 11], 
    20: [20, 35, 12],
    21: [21, 36, 13], 
    22: [22, 1, 14], 
    23: [23, 2, 15], 
    24: [24, 3, 16],
    25: [25, 4, 17], 
    26: [26, 5, 18], 
    27: [27, 6, 19], 
    28: [28, 7, 20],
    29: [29, 8, 21], 
    30: [30, 9, 22], 
    31: [31, 10, 23], 
    32: [32, 11, 24],
    33: [33, 12, 25], 
    34: [34, 13, 26], 
    35: [35, 14, 27], 
    36: [36, 15, 28]
  };
  
  const chart8 = {
    1: [1, 8, 25], 
    2: [2, 9, 26], 
    3: [3, 10, 27], 
    4: [4, 11, 28],
    5: [5, 12, 29], 
    6: [6, 13, 30], 
    7: [7, 14, 31], 
    8: [8, 15, 32],
    9: [9, 16, 33], 
    10: [10, 17, 34], 
    11: [11, 18, 35], 
    12: [12, 19, 36],
    13: [13, 20, 1], 
    14: [14, 21, 2], 
    15: [15, 22, 3], 
    16: [16, 23, 4],
    17: [17, 24, 5], 
    18: [18, 25, 6], 
    19: [19, 26, 7], 
    20: [20, 27, 8],
    21: [21, 28, 9], 
    22: [22, 29, 10], 
    23: [23, 30, 11], 
    24: [24, 31, 12],
    25: [25, 32, 13], 
    26: [26, 33, 14], 
    27: [27, 34, 15], 
    28: [28, 35, 16],
    29: [29, 36, 17], 
    30: [30, 1, 18], 
    31: [31, 2, 19], 
    32: [32, 3, 20],
    33: [33, 4, 21], 
    34: [34, 5, 22], 
    35: [35, 6, 23], 
    36: [36, 7, 24]
  };
  
  const chart7 = {
    1: [1, 13, 25, 31], 
    2: [2, 14, 26, 32], 
    3: [3, 15, 27, 33],
    4: [4, 16, 28, 34], 
    5: [5, 17, 29, 35], 
    6: [6, 18, 30, 36],
    7: [7, 19, 13], 
    8: [8, 20, 14], 
    9: [9, 21, 15], 
    10: [10, 22, 16],
    11: [11, 23, 17], 
    12: [12, 24, 18], 
    13: [13, 19, 7], 
    14: [14, 20, 8],
    15: [15, 21, 9], 
    16: [16, 22, 10], 
    17: [17, 23, 11], 
    18: [18, 24, 12],
    19: [19, 25, 7], 
    20: [20, 26, 8], 
    21: [21, 27, 9], 
    22: [22, 28, 10],
    23: [23, 29, 11], 
    24: [24, 30, 12], 
    25: [25, 31, 13], 
    26: [26, 32, 14],
    27: [27, 33, 15], 
    28: [28, 34, 16], 
    29: [29, 35, 17], 
    30: [30, 36, 18],
    31: [31, 13, 25], 
    32: [32, 14, 26], 
    33: [33, 15, 27], 
    34: [34, 16, 28],
    35: [35, 17, 29], 
    36: [36, 18, 30]
  };
  
  const linesChart = {
    1: [1, 10, 19, 28], 
    2: [2, 11, 20, 29], 
    3: [3, 12, 21, 30],
    4: [4, 13, 22, 31], 
    5: [5, 14, 23, 32], 
    6: [6, 15, 24, 33],
    7: [7, 16, 25, 34], 
    8: [8, 17, 26, 35], 
    9: [9, 18, 27, 36]
  };
  
  const suitsChart = {
    0: [10, 20, 30], 
    1: [1, 11, 21, 31], 
    2: [2, 12, 22, 32],
    3: [3, 13, 23, 33], 
    4: [4, 14, 24, 34], 
    5: [5, 15, 25, 35],
    6: [6, 16, 26, 36], 
    7: [7, 17, 27], 
    8: [8, 18, 28], 
    9: [9, 19, 29]
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
        <div style="font-size: 14px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">♠️ CHART PLAY ANALYSIS</div>
        
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
                <td style="padding: 4px; text-align: center; font-weight: bold; color: #58a6ff;">L📫</td>
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
                <td style="padding: 4px; text-align: center; font-weight: bold; color: #ff9d00;">M📭</td>
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
        ❌ No draws yet this week to analyze
      </div>
    `;
  }
  
  return chartPlayHtml;
}
////////End of SAGi INSIGHT 2.0//////////

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
    1: 16, 
    2: 24, 
    3: 19, 
    4: 3, 
    5: 1, 
    6: 15, 
    7: 13, 
    8: 29, 
    9: 33,
    10: 28, 
    11: 11, 
    12: 32, 
    13: 7, 
    14: 25, 
    15: 9, 
    16: 17, 
    17: 18, 
    18: 30,
    19: 5, 
    20: 22, 
    21: 23, 
    22: 20, 
    23: 21, 
    24: 2, 
    25: 14, 
    26: 27, 
    27: 16,
    28: 10, 
    29: 4, 
    30: 12, 
    31: 34, 
    32: 8, 
    33: 26, 
    34: 31, 
    35: 4, 
    36: 11
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
            Last 12 Weeks • ${todayName} Draws • CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS
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
  
  // ===================================
  // PLAY WHE ONLY - Dynamic Table Switcher (No pre-built slides)
  // ====================================
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
            Last 12 Weeks • ${todayName} Draws • CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS
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

// =====================================
// Missing Lines and Suits Chart (14 Days)
// MISSING LINES & SUITES CHART WITH DOUBLES/TRIPLES/QUADRUPLES
// =====================================
function renderIntelligentAnalysis(weeks) {
  if (!weeks || weeks.length === 0) {
    return `<div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #dddddd; text-align:center; color:#999;">📊 No data available</div>`;
  }

  // Sort weeks chronologically
  const sortedWeeks = [...weeks].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });

  // Get current and previous week
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  if (!previousWeek) previousWeek = currentWeek;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();

  // Time mapping for display
  const timeDisplay = {
    MOR: "10:30 AM",
    MID: "1:00 PM",
    NON: "4:00 PM",
    EVE: "7:00 PM"
  };

  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }

  function getDrawWithDate(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
      const parts = week.startDate.split(" ");
      const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
      const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
      const dayIndex = dayNames.indexOf(dayName);
      const drawDate = new Date(startDate);
      drawDate.setDate(startDate.getDate() + dayIndex);
      return { value: parseInt(val, 10), date: drawDate, slot: slot };
    }
    return null;
  }

  // Get previous week draws with dates
  const previousWeekDraws = [];
  const previousWeekDrawsWithDate = [];
  for (let d = 0; d < dayNames.length; d++) {
    for (const slot of slots) {
      const result = getDrawWithDate(previousWeek, dayNames[d], slot);
      if (result) {
        previousWeekDraws.push(result.value);
        previousWeekDrawsWithDate.push(result);
      }
    }
  }

  // Get current week draws (up to today)
  const currentWeekDraws = [];
  const currentWeekDrawsWithDate = [];
  const todayIdx = now.getDay();
  for (let d = 0; d <= todayIdx; d++) {
    for (const slot of slots) {
      const result = getDrawWithDate(currentWeek, dayNames[d], slot);
      if (result) {
        currentWeekDraws.push(result.value);
        currentWeekDrawsWithDate.push(result);
      }
    }
  }

  // Count occurrences
  const prevWeekCounts = {};
  const currWeekCounts = {};
  for (let i = 1; i <= 36; i++) {
    prevWeekCounts[i] = 0;
    currWeekCounts[i] = 0;
  }
  previousWeekDraws.forEach(num => { 
    prevWeekCounts[num] = (prevWeekCounts[num] || 0) + 1; 
  });
  currentWeekDraws.forEach(num => { 
    currWeekCounts[num] = (currWeekCounts[num] || 0) + 1; 
  });

  // ====================================
  // DOUBLES, TRIPLES, QUADRUPLES ANALYSIS
  // CORRECTED: Proper streak progression
  // ====================================

  const doubleNumbers = [8, 11, 22, 33];
  const allDoubles = [];
  const allTriples = [];
  const allQuadruples = [];

  // ====================================
  // DOUBLES: Only 8, 11, 22, 33
  // ====================================
  const toDoubleMissing = doubleNumbers.filter(num => 
    !previousWeekDraws.includes(num) && !currentWeekDraws.includes(num)
  );
  
  const toDoublePending = doubleNumbers.filter(num => 
    (prevWeekCounts[num] || 0) === 1 && !currentWeekDraws.includes(num)
  );
  
  const toDoubleCurrent = doubleNumbers.filter(num => 
    (currWeekCounts[num] || 0) === 1
  );
  
  toDoubleMissing.forEach(num => allDoubles.push(num));
  toDoublePending.forEach(num => allDoubles.push(num));
  toDoubleCurrent.forEach(num => allDoubles.push(num));

  // ====================================
  // TRIPLES: All numbers 1-36
  // - Pending: 2 HITS in previous week, 0 HITS in current week (needs 1 more)
  // - 2 HITS: 2 HITS in current week (needs 1 more for TRIPLE)
  // - Completed: 2 HITS previous week + 1 HIT current week = 3
  // NOTE: 1 HIT in previous week does NOT carry over
  // ====================================
  const toTriplePending = [];
  const toTripleCurrent = [];
  
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    
    // PENDING: 2 HITS previous week, 0 HITS current week
    if (prevCount === 2 && currCount === 0) toTriplePending.push(num);
    
    // 2 HITS: 2 HITS current week (needs 1 more)
    if (currCount === 2) toTripleCurrent.push(num);
  }
  toTriplePending.forEach(num => allTriples.push(num));
  toTripleCurrent.forEach(num => allTriples.push(num));

  // ====================================
  // QUADRUPLES: All numbers 1-36
  // - Pending: 3 HITS in previous week, 0 HITS in current week (needs 1 more)
  // - 3 HITS: 3 HITS in current week (needs 1 more for QUADRUPLE)
  // - Completed: 3 HITS previous week + 1 HIT current week = 4
  // NOTE: 1 HIT in previous week does NOT carry over
  // ====================================
  const toQuadruplePending = [];
  const toQuadrupleCurrent = [];
  
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    
    // PENDING: 3 HITS previous week, 0 HITS current week
    if (prevCount === 3 && currCount === 0) toQuadruplePending.push(num);
    
    // 3 HITS: 3 HITS current week (needs 1 more)
    if (currCount === 3) toQuadrupleCurrent.push(num);
  }
  toQuadruplePending.forEach(num => allQuadruples.push(num));
  toQuadrupleCurrent.forEach(num => allQuadruples.push(num));

  // Remove duplicates
  const uniqueDoubles = [...new Set(allDoubles)].sort((a, b) => a - b);
  const uniqueTriples = [...new Set(allTriples)].sort((a, b) => a - b);
  const uniqueQuadruples = [...new Set(allQuadruples)].sort((a, b) => a - b);

  // ====================================
  // CHECK COMPLETED STREAKS 
  // ====================================
  const completedDoubles = [];
  const completedTriples = [];
  const completedQuadruples = [];

  // DOUBLES COMPLETED: 2+ HITS in current week
  doubleNumbers.forEach(num => {
    const currCount = currWeekCounts[num] || 0;
    if (currCount >= 2 && !completedDoubles.includes(num)) {
      completedDoubles.push(num);
    }
  });

  // TRIPLES COMPLETED: 2 HITS previous week + 1 HIT current week = 3
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    // ONLY count if prevCount is 2 and currCount is 1
    // Do NOT count if prevCount is 1 and currCount is 2 (that's 2 HITS current week)
    if (prevCount === 2 && currCount === 1) {
      completedTriples.push(num);
    }
  }

  // QUADRUPLES COMPLETED: 3 HITS previous week + 1 HIT current week = 4
  for (let num = 1; num <= 36; num++) {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    // ONLY count if prevCount is 3 and currCount is 1
    // Do NOT count if prevCount is 2 and currCount is 2 (that's 2 HITS current week)
    // Do NOT count if prevCount is 1 and currCount is 3 (that's 3 HITS current week)
    if (prevCount === 3 && currCount === 1) {
      completedQuadruples.push(num);
    }
  }

  // Remove completed numbers from active lists
  const finalDoubles = uniqueDoubles.filter(num => !completedDoubles.includes(num));
  const finalTriples = uniqueTriples.filter(num => !completedTriples.includes(num));
  const finalQuadruples = uniqueQuadruples.filter(num => !completedQuadruples.includes(num));

  // ====================================
  // SPIRIT EMOJI & NAMES
  // =====================================
  const spiritEmoji = {
    1: "🔪", 
    2: "👵🏾", 
    3: "🚕", 
    4: "⚰️", 
    5: "👨🏾‍🦳", 
    6: "🤰🏽", 
    7: "🐗", 
    8: "🐯",
    9: "🐮", 
    10: "🐒", 
    11: "🦅", 
    12: "🤴🏽", 
    13: "🐸", 
    14: "💰", 
    15: "🤧", 
    16: "💃🏽",
    17: "🐦‍⬛", 
    18: "🚤", 
    19: "🐎", 
    20: "🐶", 
    21: "👄", 
    22: "🐀", 
    23: "🏡", 
    24: "🫅🏽",
    25: "🐢", 
    26: "🐔", 
    27: "🐍", 
    28: "🐟", 
    29: "🍻", 
    30: "🐈‍⬛", 
    31: "👵🏾", 
    32: "🦐",
    33: "🕷️", 
    34: "👨🏾‍🦯", 
    35: "🐍", 
    36: "🫏"
  };

  const spiritNames = {
    1: "Centipede", 
    2: "Old Lady", 
    3: "Carriage", 
    4: "Dead Man", 
    5: "Parson Man",
    6: "Belly", 
    7: "Hog", 
    8: "Tiger", 
    9: "Cattle", 
    10: "Monkey",
    11: "Corbeau", 
    12: "King", 
    13: "Crapaud", 
    14: "Money", 
    15: "Sick Woman",
    16: "Jamette", 
    17: "Pigeon", 
    18: "Water Boat", 
    19: "Horse", 
    20: "Dog",
    21: "Mouth", 
    22: "Rat", 
    23: "House", 
    24: "Queen", 
    25: "Morrocoy",
    26: "Fowl", 
    27: "Little Snake", 
    28: "Red Fish", 
    29: "Opium Man", 
    30: "House Cat",
    31: "Parson Wife", 
    32: "Shrimp", 
    33: "Spider", 
    34: "Blind Man", 
    35: "Big Snake", 
    36: "Donkey"
  };

  // =====================================
  // BUILD COMPLETION BANNER WITH DATE/TIME
  // =====================================
  const completionDetails = {};
  
  currentWeekDrawsWithDate.forEach(draw => {
    const key = `${draw.value}`;
    if (!completionDetails[key]) {
      completionDetails[key] = [];
    }
    completionDetails[key].push({
      date: draw.date,
      slot: draw.slot,
      formatted: formatBannerDate(draw.date, draw.slot)
    });
  });

  function formatBannerDate(date, slot) {
    if (!date) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
    const timeStr = timeDisplay[slot] || slot;
    return `${dateStr} @ ${timeStr}`;
  }

  // =====================================
  // BUILD BANNERS FOR ALL STATUSES
  // =====================================
  const allBanners = [];

  // QUADRUPLE COMPLETED
  completedQuadruples.forEach(num => {
    const draws = completionDetails[num] || [];
    const latest = draws.length > 0 ? draws[draws.length - 1] : null;
    const dateStr = latest ? ` ${latest.formatted}` : "";
    allBanners.push({
      num: num,
      category: 'QUADRUPLE_COMPLETED',
      color: '#ff375f',
      priority: 4,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#ff375f;">QUADRUPLE</span> Play Streak!<br><center>${dateStr}</center>`
    });
  });

  // QUADRUPLE PENDING (3 HITS previous week, 0 current week)
  toQuadruplePending.forEach(num => {
    allBanners.push({
      num: num,
      category: 'QUADRUPLE_PENDING',
      color: '#800080',
      priority: 3,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Made  - 1 More To Complete QUADRUPLE Streak!<br><center>Pending from last week</center>`
    });
  });

  // QUADRUPLE 3 HITS (current week, needs 1 more)
  toQuadrupleCurrent.forEach(num => {
    const draws = completionDetails[num] || [];
    const latest = draws.length > 0 ? draws[draws.length - 1] : null;
    const dateStr = latest ? ` ${latest.formatted}` : "";
    allBanners.push({
      num: num,
      category: 'QUADRUPLE_3HIT',
      color: '#ff375f',
      priority: 2,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Made <span style="color:#ff375f;">3 HITS</span> - 1 More To QUADRUPLE!<br><center>${dateStr}</center>`
    });
  });

  // TRIPLE COMPLETED
  completedTriples.forEach(num => {
    const draws = completionDetails[num] || [];
    const latest = draws.length > 0 ? draws[draws.length - 1] : null;
    const dateStr = latest ? ` ${latest.formatted}` : "";
    allBanners.push({
      num: num,
      category: 'TRIPLE_COMPLETED',
      color: '#ff9d00',
      priority: 1,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#ff9d00;">TRIPLE</span> Play Streak!<br><center>${dateStr}</center>`
    });
  });

  // TRIPLE PENDING (2 HITS previous week, 0 current week)
  toTriplePending.forEach(num => {
    allBanners.push({
      num: num,
      category: 'TRIPLE_PENDING',
      color: '#800080',
      priority: 0,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Made 2 Hits - 1 More To Complete Streak!<br><center>Pending Triple From Last Week</center>`
    });
  });

  // TRIPLE 2 HITS (current week, needs 1 more)
  toTripleCurrent.forEach(num => {
    const draws = completionDetails[num] || [];
    const latest = draws.length > 0 ? draws[draws.length - 1] : null;
    const dateStr = latest ? ` ${latest.formatted}` : "";
    allBanners.push({
      num: num,
      category: 'TRIPLE_2HIT',
      color: '#ff9d00',
      priority: 0,
      text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Made <span style="color:#ff9d00;">2 HITS</span> - 1 More To TRIPLE!<br><center>${dateStr}</center>`
    });
  });

  // DOUBLE COMPLETED
  doubleNumbers.forEach(num => {
    const currCount = currWeekCounts[num] || 0;
    if (currCount >= 2) {
      const draws = completionDetails[num] || [];
      const latest = draws.length > 0 ? draws[draws.length - 1] : null;
      const dateStr = latest ? ` ${latest.formatted}` : "";
      allBanners.push({
        num: num,
        category: 'DOUBLE_COMPLETED',
        color: '#32d74b',
        priority: 0,
        text: `#${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Has Completed <span style="color:#32d74b;">DOUBLE</span> Play Streak!<br><center>${dateStr}</center>`
      });
    }
  });

  // DOUBLE PENDING (1 HIT previous week, 0 current week)
  toDoublePending.forEach(num => {
    allBanners.push({
      num: num,
      category: 'DOUBLE_PENDING',
      color: '#800080',
      priority: 0,
      text: `Double: #${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) <span style="color:#800080;">PENDING</span> - 1 More To Complete DOUBLE Play Streak!<br><center>Pending from last week</center>`
    });
  });

  // DOUBLE 1 HIT (current week, needs 1 more)
  toDoubleCurrent.forEach(num => {
    const draws = completionDetails[num] || [];
    const latest = draws.length > 0 ? draws[draws.length - 1] : null;
    const dateStr = latest ? ` ${latest.formatted}` : "";
    allBanners.push({
      num: num,
      category: 'DOUBLE_1HIT',
      color: '#32d74b',
      priority: 0,
      text: `Double: #${num}${spiritEmoji[num] || ''} (${spiritNames[num] || 'Unknown'}) Made <span style="color:#32d74b;">1 HIT</span> - 1 More To DOUBLE!<br><center>${dateStr}</center>`
    });
  });

  // Sort by priority
  allBanners.sort((a, b) => b.priority - a.priority);

  // Generate completion banner HTML
  let completionBannerHtml = '';
  if (allBanners.length > 0) {
    const bannerItems = allBanners.map((banner, index) => `
      <div class="banner-item" style="
        display: ${index === 0 ? 'flex' : 'none'}; 
        justify-content: center; 
        align-items: center; 
        gap: 6px; 
        background: ${banner.color}20; 
        padding: 4px 12px; 
        border-radius: 8px; 
        border: 1px solid ${banner.color}; 
        width: 100%;
        animation: fadeIn 0.5s ease;
      ">
        <span style="font-size: 10px; font-weight: 700; color: ${banner.color};">🔔</span>
        <span style="font-size: 10px; font-weight: 700; color: #ffffff;">${banner.text}</span>
      </div>
    `).join('');

    const bannerId = 'banner-' + Date.now();

    completionBannerHtml = `
      <div id="${bannerId}" style="display: flex; justify-content: center; align-items: center; min-height: 32px; margin-bottom: 3px; width: 100%;">
        ${bannerItems}
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .banner-item {
          transition: all 0.5s ease;
        }
      </style>
      <script>
        (function() {
          const container = document.getElementById('${bannerId}');
          if (!container) return;
          const items = container.querySelectorAll('.banner-item');
          if (items.length <= 1) return;
          let currentIndex = 0;
          setInterval(function() {
            items[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].style.display = 'flex';
            items[currentIndex].style.animation = 'fadeIn 0.5s ease';
          }, 4000);
        })();
      </script>
    `;
  }

  // =====================================
  // RENDER 3x3 GRID - CLEAN DESIGN
  // =====================================
  function renderCategoryGrid(numbers, categoryColor, isDouble = false, isTriple = false, isQuadruple = false) {
    if (!numbers || numbers.length === 0) {
      return `<div style="text-align:center; color:#999; font-size:11px; padding:8px 0;">None</div>`;
    }
    
    const displayNumbers = numbers.slice(0, 9);
    
    return `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;">
        ${displayNumbers.map(num => {
          // Determine status
          const isMissing = isDouble && 
            !previousWeekDraws.includes(num) && 
            !currentWeekDraws.includes(num);
          
          const isPending = (isDouble && (prevWeekCounts[num] || 0) === 1 && !currentWeekDraws.includes(num)) ||
                           (isTriple && (prevWeekCounts[num] || 0) === 2 && !currentWeekDraws.includes(num)) ||
                           (isQuadruple && (prevWeekCounts[num] || 0) === 3 && !currentWeekDraws.includes(num));
          
          const isOneHit = isDouble && (currWeekCounts[num] || 0) === 1;
          const isTwoHit = isTriple && (currWeekCounts[num] || 0) === 2;
          const isThreeHit = isQuadruple && (currWeekCounts[num] || 0) === 3;
          
          let bgColor = `${categoryColor}15`;
          let textColor = categoryColor;
          let borderColor = `${categoryColor}30`;
          
          if (isMissing) {
            bgColor = '#ffffff';
            textColor = '#000000';
            borderColor = '#cccccc';
          } else if (isPending) {
            bgColor = 'rgba(128, 0, 128, 0.15)';
            textColor = '#800080';
            borderColor = 'rgba(128, 0, 128, 0.4)';
          } else if (isOneHit) {
            bgColor = '#32d74b';
            textColor = '#000000';
            borderColor = '#32d74b';
          } else if (isTwoHit) {
            bgColor = 'rgba(255, 165, 0, 0.25)';
            textColor = '#ff8c00';
            borderColor = 'rgba(255, 165, 0, 0.4)';
          } else if (isThreeHit) {
            bgColor = 'rgba(255, 55, 95, 0.25)';
            textColor = '#ff375f';
            borderColor = 'rgba(255, 55, 95, 0.4)';
          }
          
          return `
            <div style="display: flex; flex-direction: column; align-items: center; background: ${bgColor}; border-radius: 4px; padding: 4px 2px; border: 1px solid ${borderColor};">
              <span style="font-size: 16px; font-weight: 900; color: ${textColor};">${num}</span>
              <span style="font-size: 11px; color: #666;">${spiritEmoji[num] || ''}</span>
            </div>
          `;
        }).join('')}
        ${displayNumbers.length < 9 ? Array(9 - displayNumbers.length).fill(0).map(() => `
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(0,0,0,0.02); border-radius: 4px; padding: 4px 2px; opacity: 0.3;">
            <span style="font-size: 16px; font-weight: 900; color: #ccc;">—</span>
          </div>
        `).join('') : ''}
      </div>
    `;
  }

  // =====================================
  // GET DATE RANGE
  // =====================================
  function getDateRange() {
    if (!weeks || weeks.length === 0) return "Loading...";
    const sorted = [...weeks].sort((a, b) => {
      let pa = a.startDate.split(" ");
      let pb = b.startDate.split(" ");
      return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });
    const lastTwo = sorted.slice(-2);
    if (lastTwo.length === 0) return "No data";
    const startWeek = lastTwo[0];
    const endWeek = lastTwo[lastTwo.length - 1];
    const startDate = new Date(startWeek.startDate);
    const endDate = new Date(endWeek.startDate);
    endDate.setDate(endDate.getDate() + 6);
    const formatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
  }

  // ====================================
  // ORIGINAL LINES & SUITES LOGIC
  // =====================================
  const windowDraws = [];
  weeks.slice(-2).forEach(wk =>
    wk.days.forEach(d =>
      slots.forEach(t => {
        let val = String(d.draws[t]);
        if (val.match(/^\d+/) && val !== "PENDING") windowDraws.push(parseInt(val));
      })
    )
  );

  const lines = {
    1:[1,10,19,28], 
    2:[2,11,20,29], 
    3:[3,12,21,30], 
    4:[4,13,22,31], 
    5:[5,14,23,32], 
    6:[6,15,24,33], 
    7:[7,16,25,34], 
    8:[8,17,26,35], 
    9:[9,18,27,36]
  };

  const suites = {
    0:[10,20,30], 
    1:[1,11,21,31], 
    2:[2,12,22,32], 
    3:[3,13,23,33], 
    4:[4,14,24,34], 
    5:[5,15,25,35], 
    6:[6,16,26,36], 
    7:[7,17,27], 
    8:[8,18,28], 
    9:[9,19,29]
  };

  function renderGroup(group, labelPrefix) {
    return Object.keys(group).map(k => {
      const nums = group[k];
      const missingNums = [];

      const numsHtml = nums.map(n => {
        const appeared = windowDraws.includes(n);
        if (!appeared) missingNums.push(n);
        return `<span style="
          ${appeared ? 'color:#888; text-decoration:line-through; opacity:0.4;' 
                     : 'color:#ff9d00; font-weight:900;'} 
          margin-right:6px;">
          ${n}
        </span>`;
      }).join("");

      const missingText = missingNums.length > 0 
        ? `• ${missingNums.join(", ")} to complete ${k} ${labelPrefix}` 
        : `• ${k} ${labelPrefix} Complete`;

      return `<div style="margin-bottom:6px;">
        <b>${k} ${labelPrefix} :</b> ${numsHtml} ${missingText}
      </div>`;
    }).join("");
  }

  const lineHtml = renderGroup(lines, "LINE");
  const suiteHtml = renderGroup(suites, "SUITE");
  const dateRange = getDateRange();

  // =====================================
  // FINAL HTML OUTPUT
  // =====================================
  return `
    <div style="background: #000000; border-radius: 12px; padding: 12px; border: 1px solid #dddddd; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      
      <!-- HEADER 1 -->
      <div style="text-align: center; margin-bottom: 0px;">
        <div style="font-size: 14px; font-weight: 900; color: #ffffff;">⚜️♨️ STREAK PLAY INSIGHT ♨️⚜️</div>
        <div style="font-size: 10px; font-weight: 700; color: #666;">📅 ${dateRange}</div>
      </div>
      
      <!-- COMPLETION BANNER TICKER -->
      ${completionBannerHtml}
      
      <!-- DOUBLES, TRIPLES, QUADRUPLES - 3 Columns -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 3px;">
        
        <!-- DOUBLES -->
        <div style="background: rgba(50, 215, 75, 0.05); border-radius: 8px; padding: 6px 8px; border: 1px solid rgba(50, 215, 75, 0.2);">
          <div style="text-align: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; color: #32d74b;">🔥DOUBLE🔥</span>
            <span style="font-size: 7px; color: #666; display: block;">1x → 2x</span>
          </div>
          ${renderCategoryGrid(finalDoubles, '#32d74b', true, false, false)}
          ${finalDoubles.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #666; margin-top: 3px;">${finalDoubles.length} numbers</div>` : ''}
        </div>
        
        <!-- TRIPLES -->
        <div style="background: rgba(255, 157, 0, 0.05); border-radius: 8px; padding: 6px 8px; border: 1px solid rgba(255, 157, 0, 0.2);">
          <div style="text-align: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; color: #ff9d00;">♠️TRIPLE♠️</span>
            <span style="font-size: 7px; color: #666; display: block;">2x → 3x</span>
          </div>
          ${renderCategoryGrid(finalTriples, '#ff9d00', false, true, false)}
          ${finalTriples.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #666; margin-top: 3px;">${finalTriples.length} numbers</div>` : ''}
        </div>
        
        <!-- QUADRUPLES -->
        <div style="background: rgba(255, 55, 95, 0.05); border-radius: 8px; padding: 6px 8px; border: 1px solid rgba(255, 55, 95, 0.2);">
          <div style="text-align: center; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; color: #ff375f;">♦️QUADRUPLE♦️</span>
            <span style="font-size: 7px; color: #666; display: block;">3x → 4x</span>
          </div>
          ${renderCategoryGrid(finalQuadruples, '#ff375f', false, false, true)}
          ${finalQuadruples.length > 0 ? `<div style="text-align: center; font-size: 7px; color: #666; margin-top: 3px;">${finalQuadruples.length} numbers</div>` : ''}
        </div>
        
      </div>
      
      <!-- LEGEND - Grid Layout -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; margin: 2px 0 2px 0; padding: 2px; background: #f5f5f5; border-radius: 4px;">
        <div style="display: flex; align-items: center; gap: 3px; font-size: 8px; color: #666; padding: 2px 4px;">
          <span style="display: inline-block; width: 14px; height: 14px; background: #ffffff; border: 1px solid #cccccc; border-radius: 3px; flex-shrink: 0;"></span>
          <span>MISSING</span>
        </div>
        <div style="display: flex; align-items: center; gap: 3px; font-size: 8px; color: #666; padding: 2px 4px;">
          <span style="display: inline-block; width: 14px; height: 14px; background: #800080; border-radius: 3px; flex-shrink: 0;"></span>
          <span>PENDING</span>
        </div>
        <div style="display: flex; align-items: center; gap: 3px; font-size: 8px; color: #666; padding: 2px 4px;">
          <span style="display: inline-block; width: 14px; height: 14px; background: #32d74b; border-radius: 3px; flex-shrink: 0;"></span>
          <span>Double</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 8px; color: #666; padding: 2px 4px;">
          <span style="display: inline-block; width: 14px; height: 14px; background: #ff8c00; border-radius: 3px; flex-shrink: 0;"></span>
          <span>Triple</span>
        </div>
        <div style="display: flex; align-items: center; gap: 3px; font-size: 8px; color: #666; padding: 2px 4px;">
          <span style="display: inline-block; width: 14px; height: 14px; background: #ff375f; border-radius: 3px; flex-shrink: 0;"></span>
          <span>Quadruple</span>
        </div>
      </div>
      
      <hr style="border: none; border-top: 2px solid #ffffff; margin: 6px 0 8px 0;">
    
      <!-- HEADER 2 -->
      <div style="text-align: center; margin-bottom: 0px;">
        <div style="font-size: 14px; font-weight: 900; color: #ffffff;">♠️ MISSING LINES & SUITES CHART ♠️</div>
        <div style="font-size: 10px; font-weight: 700; color: #666;">📅 ${dateRange}</div>
      </div>
      
      <!-- LINES & SUITES -->
      <div style="padding: 4px 8px; font-size: 13px;">
        ${lineHtml}
        <hr style="border: none; border-top: 1px solid #dddddd; margin: 3px 0;">
        ${suiteHtml}
      </div>
      
      <!-- FOOTER -->
      <div style="margin-top: 3px; padding-top: 6px; border-top: 1px solid #dddddd; display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 8px; color: #666;">⚡ Missing Lines & Suites Chart • CodeWithGlasgow ©️ CWG CHARTS ANALYSIS</span>
      </div>
      
    </div>
  `;
}
//////////////////////////////////////////

// ======================================
// RENDER SHELF CONTAINER INSIDE CHART
// ======================================
function renderShelfContainer(weeksData) {
    // Process the weeks data for shelf marks
    const shelfData = processShelfData(weeksData);
    
    // Render the shelf container with hot marks and overdue marks
    return renderPlayWheShelfContainer(
        shelfData.marks,
        shelfData.numberColors,
        shelfData.intervals,
        shelfData.hotMarks,
        shelfData.overdueMarks
    );
}

// =====================================
// PLAYWHE SHELF MARKS PROCESSING & RENDER
// WITH HOT MARKS & OVERDUE MARKS 
// UPDATED: Hot Marks now uses dashboard-style timeline logic
// ====================================

function processShelfData(weeksData) {
    if (!weeksData || weeksData.length === 0) {
        return { marks: [], intervals: {}, numberColors: {}, hotMarks: [], overdueMarks: [] };
    }

    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeOrder = ["MOR", "MID", "NON", "EVE"];
    const timeNames = { MOR: "Morning", MID: "Midday", NON: "Afternoon", EVE: "Evening" };
    
    const numberColors = {
        "01":"#ff6b6b","02":"#ffa94d","03":"#ffd43b","04":"#69db7c","05":"#38d9a9",
        "06":"#4dabf7","07":"#9775fa","08":"#f783ac","09":"#ff922b","10":"#fab005",
        "11":"#82c91e","12":"#20c997","13":"#339af0","14":"#845ef7","15":"#e599f7",
        "16":"#ff8787","17":"#ffc078","18":"#ffe066","19":"#8ce99a","20":"#63e6be",
        "21":"#74c0fc","22":"#b197fc","23":"#faa2c1","24":"#ffa8a8","25":"#ffec99",
        "26":"#c0eb75","27":"#96f2d7","28":"#a5d8ff","29":"#d0bfff","30":"#fcc2d7",
        "31":"#ff6b6b","32":"#ffa94d","33":"#ffd43b","34":"#69db7c","35":"#4dabf7",
        "36":"#9775fa"
    };

    const spirits = {
        1:"Centipede",2:"Old Lady",3:"Carriage",4:"Dead Man",5:"Parson Man",
        6:"Belly",7:"Hog",8:"Tiger",9:"Cattle",10:"Monkey",
        11:"Corbeau",12:"King",13:"Crapaud",14:"Money",15:"Sick Woman",
        16:"Jamette",17:"Pigeon",18:"Water Boat",19:"Horse",20:"Dog",
        21:"Mouth",22:"Rat",23:"House",24:"Queen",25:"Morrocoy",
        26:"Fowl",27:"Little Snake",28:"Red Fish",29:"Opium Man",30:"House Cat",
        31:"Parson Wife",32:"Shrimp",33:"Spider",34:"Blind Man",35:"Big Snake",
        36:"Donkey"
    };

    let intervals = {};
    for (let i = 1; i <= 36; i++) {
        intervals[i] = 12;
    }

    let markInfo = {};
    let lastSeenTime = {};
    let timeline = [];
    let currentWeekHits = {};
    let weeklyHits = {};

    // ===============================
    // FIRST PASS: Build shelf mark data
    // ================================
    for (let week of weeksData) {
        let parts = week.startDate.split(" ");
        let monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
        let baseDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));

        for (let day of week.days) {
            let dDate = new Date(baseDate);
            dDate.setDate(dDate.getDate() + dayOrder.indexOf(day.dayName));
            let ts = dDate.getTime();

            for (let t of timeOrder) {
                let val = day.draws[t];
                if (!val || val === "-" || val === "PENDING") continue;
                
                let num = parseInt(val);
                if (num < 1 || num > 36) continue;
                
                if (week.isCurrentWeek) {
                    currentWeekHits[num] = (currentWeekHits[num] || 0) + 1;
                }
                
                const weekKey = week.startDate;
                if (!weeklyHits[weekKey]) weeklyHits[weekKey] = {};
                weeklyHits[weekKey][num] = (weeklyHits[weekKey][num] || 0) + 1;
                
                lastSeenTime[num] = timeNames[t] || t;
                let entry = { num, ts, dateStr: dDate.toDateString(), time: lastSeenTime[num] };
                timeline.push(entry);

                if (!markInfo[num]) {
                    markInfo[num] = { frequency: 0, lastDate: null, history: [] };
                }
                markInfo[num].frequency++;
                markInfo[num].lastDate = dDate;
                markInfo[num].history.push({ ts, date: entry.dateStr, time: entry.time });
            }
        }
    }

    // Calculate intervals for shelf marks
    let nowTs = Date.now();
    for (let n = 1; n <= 36; n++) {
        let info = markInfo[n];
        if (info && info.history.length > 1) {
            let gaps = [];
            let sortedH = info.history.sort((a, b) => a.ts - b.ts);
            for (let i = 0; i < sortedH.length - 1; i++) {
                gaps.push((sortedH[i+1].ts - sortedH[i].ts) / 86400000);
            }
            if (gaps.length > 0) {
                intervals[n] = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
            }
        }
    }

    // Build shelf marks array
    let marks = [];
    for (let n = 1; n <= 36; n++) {
        let info = markInfo[n] || { frequency: 0, lastDate: null };
        let daysAgo = info.lastDate ? Math.floor((nowTs - info.lastDate.getTime()) / 86400000) : 999;
        let dateStr = info.lastDate ? info.lastDate.toLocaleDateString("en-GB", { day: '2-digit', month: 'short' }) : "N/A";
        
        marks.push({
            num: n,
            spirit: spirits[n] || "Unknown",
            days: daysAgo,
            date: dateStr,
            avg: intervals[n] || 12,
            frequency: info.frequency,
            time: lastSeenTime[n] || "N/A",
            isHitThisWeek: !!currentWeekHits[n]
        });
    }
    
    // Step 1: Build a clean timeline of all draws (same as dashboard)
    const allTimeline = [];
    const sortedWeeks = [...weeksData].sort((a, b) => {
        let pa = a.startDate.split(" ");
        let pb = b.startDate.split(" ");
        return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
    });
    
    // Step 2: Get the last 6 weeks EXCLUDING current week
    // (same as dashboard's hotWeeksCount = 6)
    const hotWeeksCount = 6;
    const startIdx = Math.max(0, sortedWeeks.length - hotWeeksCount - 1); // -1 to exclude current week
    const hotWeeks = sortedWeeks.slice(startIdx, -1); // Exclude last week (current week)
    
    // Step 3: Build timeline from these weeks (same as dashboard)
    for (const week of hotWeeks) {
        const weekStart = new Date(week.startDate);
        for (let d = 0; d < dayOrder.length; d++) {
            const drawDate = new Date(weekStart);
            drawDate.setDate(weekStart.getDate() + d);
            for (const slot of timeOrder) {
                const day = week.days.find(dy => dy.dayName === dayOrder[d]);
                if (!day) continue;
                const val = day.draws[slot];
                if (val && val !== "-" && val !== "PENDING") {
                    const num = parseInt(val);
                    if (num >= 1 && num <= 36) {
                        allTimeline.push({
                            num: num,
                            date: drawDate,
                            timestamp: drawDate.getTime()
                        });
                    }
                }
            }
        }
    }
    
    // Step 4: Calculate frequency (same as dashboard)
    const frequency = {};
    for (let i = 1; i <= 36; i++) {
        frequency[i] = 0;
    }
    
    // Step 5: EXCLUDE numbers played in current week (same as dashboard)
    const currentWeekDraws = Object.keys(currentWeekHits).map(Number);
    allTimeline.forEach(entry => {
        if (!currentWeekDraws.includes(entry.num)) {
            frequency[entry.num] = (frequency[entry.num] || 0) + 1;
        }
    });
    
    // Step 6: Sort and select top 6 (dashboard uses top 8, we use top 6 for 3x3 grid)
    const hotMarks = Object.entries(frequency)
        .filter(([num, count]) => count > 0 && !currentWeekDraws.includes(parseInt(num)))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([num, count]) => ({
            num: parseInt(num),
            count: count,
            spirit: spirits[parseInt(num)] || "Unknown"
        }));

    // Calculate OverDue Marks (top 6 with highest days - always show 6)
    let overdueMarks = marks
        .sort((a, b) => b.days - a.days)
        .slice(0, 6)
        .map(m => ({
            num: m.num,
            days: m.days,
            spirit: m.spirit,
            color: m.days >= 42 ? '#ff453a' : (m.days >= 35 ? '#ff9f0a' : (m.days >= 28 ? '#007AFF' : '#32d74b'))
        }));

    return { marks, intervals, numberColors, hotMarks, overdueMarks };
}

function renderPlayWheShelfContainer(marks, numberColors, intervals, hotMarks, overdueMarks) {
    if (!marks || marks.length === 0) {
        return '<div style="text-align:center; padding:40px; color:#999;">No shelf data available</div>';
    }

    const sortedMarks = [...marks].sort((a, b) => b.days - a.days);
    
    // Calculate dynamic badge text for Overdue Marks
    let overdueBadgeText = "Last ";
    if (overdueMarks && overdueMarks.length > 0) {
        const maxDays = overdueMarks[0].days;
        if (maxDays >= 7) {
            const weeks = Math.floor(maxDays / 7);
            overdueBadgeText += weeks + " Week" + (weeks > 1 ? "s" : "");
        } else {
            overdueBadgeText += maxDays + " Day" + (maxDays > 1 ? "s" : "");
        }
    } else {
        overdueBadgeText = "None";
    }

    let html = `
    <style>
        .shelf-container {
            padding: 10px 4px;
            max-width: 100%;
            margin: 0 auto;
        }
        
  /* Hot & Overdue Marks - Side by Side */
        .top-marks-container {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }
        .top-marks-box {
            flex: 1;
            background: #ffffff;
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid #e0e0e0;
            min-width: 0;
        }
        .top-marks-box .box-title {
            font-size: 11px;
            font-weight: 800;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            text-align: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 4px;
        }
        .top-marks-box .box-title .badge {
            font-size: 9px;
            font-weight: 700;
            background: #000000;
            color: #ffffff;
            padding: 1px 8px;
            border-radius: 10px;
            margin-left: 6px;
        }
        
        /* 3x3 Grid Layout */
        .top-marks-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .top-mark-cell {
            background: #f8f8f8;
            border-radius: 8px;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #e8e8e8;
            min-height: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .top-mark-cell .ball-small {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 900;
            color: #000;
            margin: 0 auto 2px auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .top-mark-cell .stat {
            font-size: 10px;
            font-weight: 700;
            color: #000000;
            line-height: 1.3;
            text-align: center;
        }
        .top-mark-cell .stat.hot-count {
            color: #ff453a;
        }
        .top-mark-cell .stat.overdue-days {
            padding: 1px 6px;
            border-radius: 8px;
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            display: inline-block;
        }
        .top-mark-cell .spirit-name {
            font-size: 7px;
            color: #888888;
            margin-top: 1px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }
        .top-mark-cell.empty-cell {
            background: transparent;
            border: 1px dashed #e0e0e0;
            color: #cccccc;
            font-size: 10px;
        }
        
        .shelf-divider {
            border: none;
            border-top: 3px solid #000000;
            margin: 6px 0 12px 0;
        }
        
        .shelf-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 0 4px;
        }
        .shelf-header-bar .title {
            font-weight: 900;
            font-size: 16px;
            color: #ffffff;
        }
        .shelf-header-bar .count {
            font-size: 10px;
            color: #666666;
        }
        .shelf-scroll {
            max-height: 411px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            padding-right: 4px;
        }
        .shelf-scroll::-webkit-scrollbar {
            width: 4px;
        }
        .shelf-scroll::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 10px;
        }
        .shelf-scroll::-webkit-scrollbar-thumb {
            background: #007AFF;
            border-radius: 10px;
        }
        .shelf-card {
            background: #ffffff;
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s ease;
        }
        .shelf-card:active {
            transform: scale(0.98);
        }
        .shelf-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
        }
        .shelf-card-left {
            display: flex;
            align-items: center;
        }
        .shelf-ball {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 900;
            color: #000;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .shelf-spirit {
            font-weight: 800;
            font-size: 14px;
            color: #000000;
            margin-left: 10px;
        }
        .shelf-status {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.5px;
            padding: 2px 8px;
            border-radius: 10px;
        }
        .shelf-status.due { background: #ff453a; color: #ffffff; }
        .shelf-status.warm { background: #ff9f0a; color: #000000; }
        .shelf-status.monitor { background: #32d74b; color: #000000; }
        .shelf-confidence {
            font-size: 14px;
            font-weight: 900;
            color: #000000;
        }
        .shelf-confidence-label {
            font-size: 8px;
            color: #888888;
        }
        .shelf-bar {
            width: 100%;
            height: 4px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .shelf-bar-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.6s ease;
        }
        .shelf-stats {
            display: flex;
            justify-content: space-around;
            background: #f5f5f5;
            padding: 4px 6px;
            border-radius: 6px;
            border: 0.5px solid #e0e0e0;
            text-align: center;
        }
        .shelf-stat-label {
            font-size: 7px;
            color: #888888;
            text-transform: uppercase;
        }
        .shelf-stat-value {
            font-size: 10px;
            font-weight: 700;
            color: #000000;
        }
        .shelf-stat-value.hits { color: #32d74b; }
        .shelf-footer {
            text-align: center;
            padding: 10px 0 4px;
            color: #999;
            font-size: 9px;
            font-weight: 600;
            border-top: 1px solid #e0e0e0;
            margin-top: 8px;
        }
        
        @media (max-width: 480px) {
            .top-marks-container {
                flex-direction: row;
                gap: 6px;
            }
            .top-marks-box {
                padding: 6px 8px;
            }
            .top-marks-grid {
                gap: 4px;
            }
            .top-mark-cell .ball-small {
                width: 28px;
                height: 28px;
                font-size: 14px;
            }
            .top-mark-cell .stat {
                font-size: 14px;
            }
            .top-mark-cell .stat.overdue-days {
                font-size: 8px;
            }
            .top-mark-cell .spirit-name {
                font-size: 6px;
            }
            .shelf-ball {
                width: 28px;
                height: 28px;
                font-size: 14px;
            }
            .shelf-spirit {
                font-size: 14px;
                margin-left: 8px;
            }
            .shelf-card {
                padding: 8px 10px;
            }
        }
    </style>
    
    <div class="shelf-container">
        <!-- HOT MARKS & OVERDUE MARKS -->
        <div class="top-marks-container">
            <!-- HOT MARKS - 3x3 Grid -->
            <div class="top-marks-box">
                <div class="box-title">🔥 HOT MARKS <br><span class="badge">Last 6 Weeks</span></div>
                <div class="top-marks-grid">
    `;

    // HOT MARKS - 3x3 Grid (6 items)
    if (hotMarks && hotMarks.length > 0) {
        for (let i = 0; i < 6; i++) {
            if (i < hotMarks.length) {
                const m = hotMarks[i];
                const numStr = String(m.num).padStart(2, '0');
                const ballColor = numberColors[numStr] || '#ffffff';
                html += `
                    <div class="top-mark-cell">
                        <div class="ball-small" style="background:${ballColor};">${m.num}</div>
                        <div class="stat hot-count">${m.count}x</div>
                        <div class="spirit-name">${m.spirit.substring(0, 8)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="top-mark-cell empty-cell">—</div>
                `;
            }
        }
    } else {
        html += `
            <div class="top-mark-cell empty-cell" style="grid-column: span 3;">No hot marks</div>
        `;
    }

    html += `
                </div>
            </div>
            
        <!-- OVERDUE MARKS - 3x3 Grid -->
            <div class="top-marks-box">
                <div class="box-title">⏰ OVERDUE MARKS <br><span class="badge">${overdueBadgeText}</span></div>
                <div class="top-marks-grid">
    `;

    // OVERDUE MARKS - 3x3 Grid
    if (overdueMarks && overdueMarks.length > 0) {
        for (let i = 0; i < 6; i++) {
            if (i < overdueMarks.length) {
                const m = overdueMarks[i];
                const numStr = String(m.num).padStart(2, '0');
                const ballColor = numberColors[numStr] || '#ffffff';
                // Color coding: red >= 42 days, orange >= 35 days, blue >= 28 days, green < 28 days
                const bgColor = m.days >= 42 ? '#ff453a' : (m.days >= 35 ? '#ff9f0a' : (m.days >= 28 ? '#007AFF' : '#32d74b'));
                const weeks = Math.floor(m.days / 7);
                const days = m.days % 7;
                const displayText = weeks > 0 ? `${weeks}w ${days}d` : `${days}d`;
                html += `
                    <div class="top-mark-cell">
                        <div class="ball-small" style="background:${ballColor};">${m.num}</div>
                        <div class="stat overdue-days" style="background:${bgColor};">${displayText}</div>
                        <div class="spirit-name">${m.spirit.substring(0, 8)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="top-mark-cell empty-cell">—</div>
                `;
            }
        }
    } else {
        html += `
            <div class="top-mark-cell empty-cell" style="grid-column: span 3; color:#32d74b;">✅ No overdue</div>
        `;
    }

    html += `
                </div>
            </div>
        </div>
        
        <!-- SOLID BLACK LINE -->
        <hr class="shelf-divider">
        
        <!-- SHELF MARKS HEADER -->
        <div class="shelf-header-bar">
            <span class="title">♠️ PlayWhe Shelf Marks</span>
            <span class="count">${sortedMarks.length} marks • ${sortedMarks.filter(m => m.days > (intervals[m.num] || 12)).length} due</span>
        </div>
        
   <!-- SHELF MARKS SCROLLABLE TABLE -->
        <div class="shelf-scroll">
    `;

    sortedMarks.forEach(m => {
        let avg = intervals[m.num] || 12;
        let confidence = Math.min(Math.round((m.days / avg) * 100), 100);
        
        let accentColor = '#32d74b';
        let statusLabel = 'MONITORING';
        let statusClass = 'monitor';
        
        if (m.days > avg) {
            accentColor = '#ff453a';
            statusLabel = '🔥 DUE NOW';
            statusClass = 'due';
        } else if (m.days > (avg * 0.75)) {
            accentColor = '#ff9f0a';
            statusLabel = '♨️ WARM';
            statusClass = 'warm';
        }
        
        const numStr = String(m.num).padStart(2, '0');
        const ballColor = numberColors[numStr] || '#ffffff';
        
        html += `
            <div class="shelf-card" style="border-left: 4px solid ${accentColor};">
                <div class="shelf-card-top">
                    <div class="shelf-card-left">
                        <div class="shelf-ball" style="background:${ballColor};">${m.num}</div>
                        <div class="shelf-spirit">${m.spirit}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="shelf-confidence-label">CONFIDENCE</div>
                        <div class="shelf-confidence">${confidence}%</div>
                    </div>
                </div>
                
                <div class="shelf-bar">
                    <div class="shelf-bar-fill" style="width:${confidence}%; background:${accentColor};"></div>
                </div>
                
                <div class="shelf-stats">
                    <div>
                        <div class="shelf-stat-label">HITS</div>
                        <div class="shelf-stat-value hits">${m.frequency}x</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">AVG GAP</div>
                        <div class="shelf-stat-value">${avg}d</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">SINCE</div>
                        <div class="shelf-stat-value" style="color:${accentColor};">${m.days}d</div>
                    </div>
                    <div>
                        <div class="shelf-stat-label">LAST</div>
                        <div class="shelf-stat-value" style="font-size:8px;">${m.date}</div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="shelf-footer">PlayWhe Shelf Analysis • CODEWITHGLASGOW ©️ CWG Builds</div>
        <div style="width:100%; height:2px; background:#000;"></div>
    </div>
    `;

    return html;
}
///////////////////////////////////////////

// ======================================
// CALENDAR MONTH DISPLAY WITH MEETING LOGIC & COLUMN PLAY ANALYSIS
// REMOVED: Yesterday section, Made Today container smaller with day number highlighted
// =====================================
function renderCalendarMonthDisplay(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return '<div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 4px; margin-bottom: 7px; border: 1px solid #58a6ff; text-align:center;">📅 Loading Calendar data...</div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  
  // Find the most recent non-holiday previous week with valid draws
  let previousWeek = null;
  for (let i = sortedWeeks.length - 2; i >= 0; i--) {
    const week = sortedWeeks[i];
    let hasValidDraw = false;
    if (week && week.days) {
      for (const day of week.days) {
        if (day && day.draws) {
          for (const slot of ["MOR", "MID", "NON", "EVE"]) {
            const val = day.draws[slot];
            if (val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY") {
              hasValidDraw = true;
              break;
            }
          }
        }
        if (hasValidDraw) break;
      }
    }
    if (hasValidDraw) {
      previousWeek = week;
      break;
    }
  }
  
  if (!previousWeek) {
    previousWeek = currentWeek;
  }
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const todayIdx = now.getDay();
  const todayName = dayNames[todayIdx];
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }
  
  // Enhanced deep search function that skips holidays
  function findDeepDraw(sortedWeeks, startWeekIndex, targetDayIdx, targetSlot) {
    const targetDayName = dayNames[targetDayIdx];
    
    for (let w = startWeekIndex; w >= 0; w--) {
      const week = sortedWeeks[w];
      
      if (targetDayIdx === 1) {
        const checkDay = week.days.find(d => d.dayName === "Monday");
        const isHoliday = !checkDay || slots.every(s => {
          const val = checkDay.draws[s];
          return !val || val === "HOLIDAY" || val === "-" || val === "PENDING";
        });
        if (isHoliday) continue;
      }
      
      const val = getDraw(week, targetDayName, targetSlot);
      if (val) {
        return { value: val, week: week, date: new Date(week.startDate) };
      }
    }
    return null;
  }
  
  // Get draws from previous week for column play analysis
  function getPreviousWeekDraws() {
    const prevDraws = [];
    if (previousWeek && previousWeek !== currentWeek) {
      for (const day of previousWeek.days) {
        for (const slot of slots) {
          const draw = getDraw(previousWeek, day.dayName, slot);
          if (draw) prevDraws.push(draw);
        }
      }
    }
    return prevDraws;
  }
  
  const previousWeekDraws = getPreviousWeekDraws();
  
  // Find LEAVING number - search across weeks if needed
  let leavingNumber = null;
  let leavingDate = null;
  let leavingDay = null;
  let leavingSlot = null;
  let leavingDayIdx = -1;
  let leavingSlotIdx = -1;
  
  const currWeekStart = new Date(currentWeek.startDate);
  
  // First try current week
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
  
  // If no leaving number in current week, search previous weeks
  if (!leavingNumber) {
    for (let w = sortedWeeks.length - 2; w >= 0; w--) {
      const week = sortedWeeks[w];
      const weekStart = new Date(week.startDate);
      for (let d = dayNames.length - 1; d >= 0; d--) {
        for (let s = slots.length - 1; s >= 0; s--) {
          const draw = getDraw(week, dayNames[d], slots[s]);
          if (draw) {
            leavingNumber = draw;
            leavingDate = new Date(weekStart);
            leavingDate.setDate(weekStart.getDate() + d);
            leavingDay = dayNames[d];
            leavingSlot = slots[s];
            leavingDayIdx = d;
            leavingSlotIdx = s;
            break;
          }
        }
        if (leavingNumber) break;
      }
      if (leavingNumber) break;
    }
  }
  
  // Find MEETING number
  let meetingNumber = null;
  let meetingDay = null;
  let meetingSlot = null;
  let meetingDate = null;
  let meetingColumnIndex = -1;
  
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
      const result = findDeepDraw(sortedWeeks, sortedWeeks.length - 2, nextDayIdx, slots[nextSlotIdx]);
      if (result && result.value) {
        meetingNumber = result.value;
        meetingDay = dayNames[nextDayIdx];
        meetingSlot = slots[nextSlotIdx];
        meetingDate = result.date;
        
        if (meetingDate) {
          meetingDate.setDate(meetingDate.getDate() + nextDayIdx);
        }
        
        meetingColumnIndex = nextDayIdx;
      }
    }
  }
  
  // Check which column numbers have been played
  const currentWeekDraws = [];
  for (let d = 0; d <= todayIdx; d++) {
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    }
  }
  
  // If no current week draws, search across all weeks
  let allRecentDraws = [...new Set([...currentWeekDraws, ...previousWeekDraws])];
  
  if (allRecentDraws.length === 0) {
    for (let w = sortedWeeks.length - 1; w >= 0; w--) {
      const week = sortedWeeks[w];
      for (const day of week.days) {
        for (const slot of slots) {
          const draw = getDraw(week, day.dayName, slot);
          if (draw && !allRecentDraws.includes(draw)) {
            allRecentDraws.push(draw);
          }
        }
      }
      if (allRecentDraws.length >= 10) break;
    }
  }
  
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };
  
  // Generate Calendar Grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Build a 2D grid of actual days (6 rows x 7 columns)
  let dayGrid = [];
  let dayCounter = 1;
  
  for (let i = 0; i < 6; i++) {
    let weekRow = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        weekRow.push(null);
      } else if (dayCounter > daysInMonth) {
        weekRow.push(null);
      } else {
        weekRow.push(dayCounter);
        dayCounter++;
      }
    }
    dayGrid.push(weekRow);
  }
  
  // Function to find which column a number belongs to based on grid position
  function findNumberColumn(number) {
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        if (dayGrid[row][col] === number) {
          return col;
        }
      }
    }
    // If number not found in grid, find which column it would belong to
    for (let col = 0; col < 7; col++) {
      let lastNumberInColumn = null;
      for (let row = 5; row >= 0; row--) {
        if (dayGrid[row][col] !== null) {
          lastNumberInColumn = dayGrid[row][col];
          break;
        }
      }
      if (lastNumberInColumn !== null) {
        let colStart = lastNumberInColumn;
        while (colStart > 7) colStart -= 7;
        for (let n = colStart; n <= 36; n += 7) {
          if (n === number) {
            return col;
          }
        }
      }
    }
    return -1;
  }
  
  // Find which column the meeting number is actually located in
  let meetingActualColumn = findNumberColumn(meetingNumber);
  let leavingActualColumn = findNumberColumn(leavingNumber);
  
  // Use the meeting's actual column for prediction
  const meetingTargetColumn = (meetingActualColumn !== -1) ? meetingActualColumn : meetingColumnIndex;
  
  // Find the last row index that has content in the meeting column
  let meetingLastRowWithContent = -1;
  if (meetingTargetColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      if (dayGrid[row][meetingTargetColumn] !== null) {
        meetingLastRowWithContent = row;
      }
    }
  }
  
  // Calculate prediction number for the meeting column (last number + 7)
  let meetingColumnPrediction = null;
  if (meetingTargetColumn !== -1 && meetingLastRowWithContent !== -1) {
    const lastNumber = dayGrid[meetingLastRowWithContent][meetingTargetColumn];
    const nextNumber = lastNumber + 7;
    if (nextNumber <= 36) {
      meetingColumnPrediction = nextNumber;
    }
  }
  
  // Calculate prediction number for the leaving column (last number + 7)
  let leavingColumnPrediction = null;
  if (leavingActualColumn !== -1) {
    let leavingLastRowWithContent = -1;
    for (let row = 0; row < 6; row++) {
      if (dayGrid[row][leavingActualColumn] !== null) {
        leavingLastRowWithContent = row;
      }
    }
    if (leavingLastRowWithContent !== -1) {
      const lastNumber = dayGrid[leavingLastRowWithContent][leavingActualColumn];
      const nextNumber = lastNumber + 7;
      if (nextNumber <= 36) {
        leavingColumnPrediction = nextNumber;
      }
    }
  }
  
  // Get all numbers from the meeting column in the calendar grid
  let meetingColumnCalendarNumbers = [];
  if (meetingActualColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      const num = dayGrid[row][meetingActualColumn];
      if (num !== null && !meetingColumnCalendarNumbers.includes(num)) {
        meetingColumnCalendarNumbers.push(num);
      }
    }
    meetingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the predictive number to the meeting column numbers
  if (meetingColumnPrediction !== null && !meetingColumnCalendarNumbers.includes(meetingColumnPrediction)) {
    meetingColumnCalendarNumbers.push(meetingColumnPrediction);
    meetingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Get all numbers from the leaving column in the calendar grid
  let leavingColumnCalendarNumbers = [];
  if (leavingActualColumn !== -1) {
    for (let row = 0; row < 6; row++) {
      const num = dayGrid[row][leavingActualColumn];
      if (num !== null && !leavingColumnCalendarNumbers.includes(num)) {
        leavingColumnCalendarNumbers.push(num);
      }
    }
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the predictive number to the leaving column numbers
  if (leavingColumnPrediction !== null && !leavingColumnCalendarNumbers.includes(leavingColumnPrediction)) {
    leavingColumnCalendarNumbers.push(leavingColumnPrediction);
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Add the leaving number itself if it's a prediction (not in the grid)
  if (leavingNumber !== null && leavingActualColumn !== -1 && !leavingColumnCalendarNumbers.includes(leavingNumber)) {
    leavingColumnCalendarNumbers.push(leavingNumber);
    leavingColumnCalendarNumbers.sort((a, b) => a - b);
  }
  
  // Split meeting column numbers into played and pending
  const meetingPlayedColumnNumbers = [];
  const meetingPendingColumnNumbers = [];
  
  meetingColumnCalendarNumbers.forEach(num => {
    const isPlayedInRecent = allRecentDraws.includes(num);
    const isMeetingNumber = (num === meetingNumber);
    const isPredictionNumber = (num === meetingColumnPrediction);
    
    if (isMeetingNumber) {
      meetingPendingColumnNumbers.unshift({ num, isMeeting: true });
    } else if (!isPlayedInRecent) {
      meetingPendingColumnNumbers.push({ num, isMeeting: false, isPrediction: isPredictionNumber });
    } else {
      meetingPlayedColumnNumbers.push({ num });
    }
  });
  
  // Split leaving column numbers into played and pending
  const leavingPlayedColumnNumbers = [];
  const leavingPendingColumnNumbers = [];
  
  leavingColumnCalendarNumbers.forEach(num => {
    const isPlayedInRecent = allRecentDraws.includes(num);
    const isLeavingNumber = (num === leavingNumber);
    const isPredictionNumber = (num === leavingColumnPrediction);
    
    if (isLeavingNumber) {
      leavingPendingColumnNumbers.unshift({ num, isLeaving: true });
    } else if (!isPlayedInRecent) {
      leavingPendingColumnNumbers.push({ num, isLeaving: false, isPrediction: isPredictionNumber });
    } else {
      leavingPlayedColumnNumbers.push({ num });
    }
  });
  
  // Build calendar cells
  let calendarCells = [];
  dayCounter = 1;
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        calendarCells.push({ day: null, isEmpty: true, isBlank: true, row: i, col: j });
      } else if (dayCounter > daysInMonth) {
        const isMeetingTargetColumn = (j === meetingTargetColumn);
        const isMeetingRowAfterLastContent = (i === meetingLastRowWithContent + 1);
        const shouldShowMeetingPrediction = isMeetingTargetColumn && isMeetingRowAfterLastContent && meetingColumnPrediction !== null;
        
        const isLeavingTargetColumn = (j === leavingActualColumn);
        const isLeavingRowAfterLastContent = (i === (() => {
          let lastRow = -1;
          for (let row = 0; row < 6; row++) {
            if (dayGrid[row][leavingActualColumn] !== null) {
              lastRow = row;
            }
          }
          return lastRow;
        })() + 1);
        const shouldShowLeavingPrediction = isLeavingTargetColumn && isLeavingRowAfterLastContent && leavingColumnPrediction !== null;
        
        calendarCells.push({ 
          day: null, 
          isEmpty: true, 
          isBlank: true,
          row: i,
          col: j,
          meetingPredictionNumber: shouldShowMeetingPrediction ? meetingColumnPrediction : null,
          leavingPredictionNumber: shouldShowLeavingPrediction ? leavingColumnPrediction : null,
          isMeetingPredictionSpot: shouldShowMeetingPrediction,
          isLeavingPredictionSpot: shouldShowLeavingPrediction
        });
      } else {
        const isToday = (dayCounter === currentDay);
        const isMeetingNumberHere = (dayCounter === meetingNumber);
        const isLeavingNumberHere = (dayCounter === leavingNumber);
        
        calendarCells.push({ 
          day: dayCounter, 
          isEmpty: false, 
          isToday: isToday,
          isMeetingNumber: isMeetingNumberHere,
          isLeavingNumber: isLeavingNumberHere,
          row: i,
          col: j,
          date: new Date(currentYear, currentMonth, dayCounter)
        });
        dayCounter++;
      }
    }
  }
  
  // Generate Pending Items HTML for Meeting
  const meetingPendingItemsHtml = meetingPendingColumnNumbers.map(item => {
    if (item.isMeeting) {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #ff9d00, #ff6b00); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(255,157,0,0.5);">
            <span style="font-size: 18px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ff9d00;">
            <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    }
  }).join('');
  
  // Generate Played Items HTML for Meeting
  const meetingPlayedItemsHtml = meetingPlayedColumnNumbers.map(item => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.6;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #ff9d00;">
        <span style="font-size: 16px; font-weight: 900; color: #ffd700; line-height: 22px;">${item.num}</span>
      </div>
    </div>
  `).join('');
  
  // Generate Pending Items HTML for Leaving
  const leavingPendingItemsHtml = leavingPendingColumnNumbers.map(item => {
    if (item.isLeaving) {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #58a6ff, #0a4a8a); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(88,166,255,0.5);">
            <span style="font-size: 18px; font-weight: 900; color: #fff; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px;">
          <div style="width: 22px; height: 22px; background: #ffd700; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #58a6ff;">
            <span style="font-size: 16px; font-weight: 900; color: #000; line-height: 22px;">${item.num}</span>
          </div>
        </div>
      `;
    }
  }).join('');
  
  // Generate Played Items HTML for Leaving
  const leavingPlayedItemsHtml = leavingPlayedColumnNumbers.map(item => `
    <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 0 4px; opacity: 0.6;">
      <div style="width: 22px; height: 22px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #58a6ff;">
        <span style="font-size: 16px; font-weight: 900; color: #58a6ff; line-height: 22px;">${item.num}</span>
      </div>
    </div>
  `).join('');
  
  // ====================================
  // GET TODAY'S COLUMN NUMBERS (Active day column)
  // ====================================
  function getTodaysColumnNumbers() {
    const numbers = [];
    const dayNum = currentDay;
    const col = findNumberColumn(dayNum);
    
    if (col !== -1) {
      for (let row = 0; row < 6; row++) {
        const num = dayGrid[row][col];
        if (num !== null && !numbers.includes(num)) {
          numbers.push(num);
        }
      }
      const lastNum = numbers[numbers.length - 1];
      if (lastNum && lastNum + 7 <= 36) {
        numbers.push(lastNum + 7);
      }
    }
    return numbers;
  }
  
  const todaysColumnNumbers = getTodaysColumnNumbers();
  
  // ====================================
  // BUILD NUMBER STATUS FUNCTION
  // ====================================
  function getNumberStatus(num) {
    if (!num) return { status: 'pending', label: '⏳' };
    
    const isPlayed = currentWeekDraws.includes(num);
    const isDue = previousWeekDraws.includes(num) && !isPlayed;
    const isMeetingNum = (num === meetingNumber);
    
    if (isMeetingNum) {
      return { status: 'meeting', label: '⚜️' };
    } else if (isDue) {
      return { status: 'due', label: '📅' };
    } else if (isPlayed) {
      return { status: 'played', label: '✅' };
    } else {
      return { status: 'pending', label: '⏳' };
    }
  }
  
  // ====================================
  // RENDER TODAY CONTAINER WITH LEGEND (Smaller with Day Highlight)
  // ====================================
  function renderTodayContainer() {
    const todayDate = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    if (todaysColumnNumbers.length === 0) {
      return `
        <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 10px; border: 1px solid #00ff88; text-align:center;">
          <span style="color: #94a3b8; font-size: 11px;">No numbers for today's column</span>
        </div>
      `;
    }
    
    // Find the day number in the column (should be currentDay)
    const dayNumber = currentDay;
    
    const numberItems = todaysColumnNumbers.map(num => {
      const status = getNumberStatus(num);
      const emoji = spiritEmoji[num] || '';
      const isLeaving = (num === leavingNumber);
      const isMeeting = (num === meetingNumber);
      const isDayNumber = (num === dayNumber);
      
      let textColor = '#ffffff';
      let highlightStyle = '';
      let bgColor = 'rgba(255,255,255,0.03)';
      
      // Highlight the day number with a special style
      if (isDayNumber) {
        bgColor = 'rgba(255,215,0,0.25)';
        highlightStyle = 'box-shadow: 0 0 20px rgba(255,215,0,0.3); border: 2px solid #ffd700;';
        textColor = '#ffd700';
      } else if (isLeaving) {
        bgColor = 'rgba(88,166,255,0.15)';
        highlightStyle = 'box-shadow: 0 0 20px rgba(88,166,255,0.4); border: 2px solid #58a6ff;';
        textColor = '#58a6ff';
      } else if (isMeeting) {
        bgColor = 'rgba(255,157,0,0.15)';
        highlightStyle = 'box-shadow: 0 0 20px rgba(255,157,0,0.4); border: 2px solid #ff9d00;';
        textColor = '#ff9d00';
      }
      
      return `
        <div style="display: inline-flex; flex-direction: column; align-items: center; background: ${bgColor}; border-radius: 8px; padding: 4px 8px; border: 1px solid rgba(255,255,255,0.1); ${highlightStyle} min-width: 40px;">
          <div style="display: flex; align-items: center; gap: 3px;">
            <span style="font-size: ${isDayNumber ? '20px' : '16px'}; font-weight: ${isDayNumber ? '900' : '900'}; color: ${textColor};">${num}</span>
            <span style="font-size: ${isDayNumber ? '14px' : '11px'};">${emoji}</span>
          </div>
          <div style="display: flex; gap: 3px; margin-top: 1px;">
            <span style="font-size: 8px; font-weight: 700; color: ${textColor};">${status.label}</span>
            ${isLeaving ? '<span style="font-size: 6px; font-weight: 700; color: #58a6ff; background: rgba(88,166,255,0.2); padding: 1px 4px; border-radius: 6px;">LEAVING</span>' : ''}
            ${isMeeting ? '<span style="font-size: 6px; font-weight: 700; color: #ff9d00; background: rgba(255,157,0,0.2); padding: 1px 4px; border-radius: 6px;">MEETING</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 10px; padding: 6px 8px; margin-top: 8px; border: 2px solid #00ff88;">
        <div style="font-size: 11px; font-weight: 800; color: #00ff88; text-align: center; margin-bottom: 4px;">
          📅 TODAY • ${todayDate}
        </div>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">
          ${numberItems}
        </div>
        <!-- Legend -->
        <div style="display: flex; justify-content: center; gap: 12px; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
          <span style="font-size: 7px; color: #ffd700;">⚜️ Meeting</span>
          <span style="font-size: 7px; color: #94a3b8;">⏳ Pending</span>
          <span style="font-size: 7px; color: #ff9d00;">📅 Due</span>
        </div>
      </div>
    `;
  }
  
  // ====================================
  // RENDER CURRENT LEAVING/MEETING
  // ====================================
  function renderCurrentLeavingMeeting() {
    return `
      <div style="display: flex; gap: 12px; margin-bottom: 7px;">
        <div style="flex: 1; background: rgba(88,166,255,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #58a6ff;">
          <div style="font-size: 11px; color: #58a6ff; font-weight: bold;">LEAVING PLAY</div>
          <div style="font-size: 28px; font-weight: 900; color: #58a6ff;">${leavingNumber || '—'} ${leavingNumber ? spiritEmoji[leavingNumber] || '' : ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${leavingDay || ''} ${leavingSlot || ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${leavingDate ? leavingDate.toLocaleDateString() : ''}</div>
        </div>
        <div style="flex: 1; background: rgba(255,157,0,0.12); border-radius: 14px; padding: 10px; text-align: center; border-left: 4px solid #ff9d00;">
          <div style="font-size: 11px; color: #ff9d00; font-weight: bold;">MEETING PLAY</div>
          <div style="font-size: 28px; font-weight: 900; color: #ff9d00;">${meetingNumber || '—'} ${meetingNumber ? spiritEmoji[meetingNumber] || '' : ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${meetingDay || ''} ${meetingSlot || ''}</div>
          <div style="font-size: 9px; color: #94a3b8;">${meetingDate ? meetingDate.toLocaleDateString() : 'Next Draw'}</div>
        </div>
      </div>
    `;
  }
  
  // Build the side-by-side sections (Current Leaving/Meeting with Pending/Played)
  const sideBySideSections = `
    <div style="display: flex; gap: 12px; margin-top: 4px;">
      <!-- LEAVING SECTION (LEFT) -->
      <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #58a6ff;">
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; text-align: center; margin-bottom: 10px;">
          🔵 LEAVING PLAY • ${leavingDay || ''} ${leavingSlot || ''}
        </div>
        
        ${leavingPendingItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 10px;">
            ${leavingPendingItemsHtml}
          </div>
        ` : ''}
        
        ${leavingPlayedItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${leavingPlayedItemsHtml}
          </div>
          <div style="text-align: center; font-size: 9px; color: #58a6ff; margin-top: 3px; opacity: 0.8;">↻ PULL BACKS</div>
        ` : ''}
      </div>
      
      <!-- VERTICAL SEPARATOR -->
      <div style="width: 1px; background: linear-gradient(180deg, transparent, #58a6ff, #ff9d00, transparent); margin: 5px 0;"></div>
      
      <!-- MEETING SECTION (RIGHT) -->
      <div style="flex: 1; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 10px; border: 1px solid #ff9d00;">
        <div style="font-size: 13px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 10px;">
          🟡 MEETING PLAY • ${meetingDay || ''} ${meetingSlot || ''}
        </div>
        
        ${meetingPendingItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 10px;">
            ${meetingPendingItemsHtml}
          </div>
        ` : ''}
        
        ${meetingPlayedItemsHtml ? `
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;">
            ${meetingPlayedItemsHtml}
          </div>
          <div style="text-align: center; font-size: 9px; color: #ff9d00; margin-top: 3px; opacity: 0.8;">↻ PULL BACKS</div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Build the complete HTML
  return `
    <div class="calendar-month-container" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 20px; padding: 8px; margin-bottom: 7px; border: 1px solid #58a6ff;">
      
      <div style="font-size: 16px; font-weight: 800; color: #ff9d00; text-align: center; margin-bottom: 8px;">Calender Daily Chart Play<br>
        📅 ${currentDay} ${monthNames[currentMonth]} ${currentYear} 📅</div>
      
      <!-- Calendar Grid -->
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 5px;">
        ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => `
          <div style="text-align: center; font-size: 10px; font-weight: bold; color: #58a6ff; padding: 2px;">${day}</div>
        `).join('')}
        
        ${calendarCells.map(cell => {
          if (cell.isEmpty && cell.isBlank) {
            if (cell.meetingPredictionNumber && cell.isMeetingPredictionSpot) {
              return `
                <div style="aspect-ratio: 1; background: rgba(255,157,0,0.15); border-radius: 4px; border: 1px dashed #ff9d00; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 900; color: #ffd700;">${cell.meetingPredictionNumber}</span>
                  <span style="font-size: 8px; color: #ff9d00;">+7</span>
                </div>
              `;
            }
            if (cell.leavingPredictionNumber && cell.isLeavingPredictionSpot) {
              return `
                <div style="aspect-ratio: 1; background: rgba(88,166,255,0.15); border-radius: 4px; border: 1px dashed #58a6ff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <span style="font-size: 16px; font-weight: 900; color: #58a6ff;">${cell.leavingPredictionNumber}</span>
                  <span style="font-size: 8px; color: #58a6ff;">+7</span>
                </div>
              `;
            }
            return `<div style="aspect-ratio: 1; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>`;
          }
          
          if (cell.isEmpty) {
            return `<div style="aspect-ratio: 1; background: rgba(255,255,255,0.03); border-radius: 4px;"></div>`;
          }
          
          const isToday = cell.isToday;
          const isMeetingHighlight = cell.isMeetingNumber;
          const isLeavingHighlight = cell.isLeavingNumber;
          
          let cellStyle = '';
          let textStyle = '';
          
          if (isMeetingHighlight) {
            cellStyle = 'background: linear-gradient(135deg, rgba(255,157,0,0.4), rgba(255,107,0,0.4)); border: 2px solid #ff9d00; box-shadow: 0 0 8px rgba(255,157,0,0.5);';
            textStyle = 'color: #ff9d00; font-weight: 900;';
          } else if (isLeavingHighlight) {
            cellStyle = 'background: linear-gradient(135deg, rgba(88,166,255,0.4), rgba(0,100,200,0.4)); border: 2px solid #58a6ff; box-shadow: 0 0 8px rgba(88,166,255,0.5);';
            textStyle = 'color: #58a6ff; font-weight: 900;';
          } else if (isToday) {
            cellStyle = 'background: rgba(255,157,0,0.2); border: 1px solid #ff9d00;';
            textStyle = 'color: #ff9d00; font-weight: 900;';
          } else {
            cellStyle = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);';
            textStyle = 'color: #fff; font-weight: 600;';
          }
          
          return `
            <div style="aspect-ratio: 1; ${cellStyle} border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 14px; ${textStyle}">${cell.day}</span>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- CURRENT LEAVING AND MEETING -->
      ${renderCurrentLeavingMeeting()}
      
      ${sideBySideSections}
      
      <!-- TODAY CONTAINER (Smaller with Legend & Day Highlight) -->
      ${renderTodayContainer()}
      
      <!-- Simple Footer -->
      <div style="margin-top: 6px; padding: 4px 8px; background: rgba(255,255,255,0.01); border-radius: 8px; border-top: 1px solid rgba(255,255,255,0.03);">
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 7px; color: #94a3b8;">
          <span>Calendar Chart Play • CODEWITHGLASGOW ©️ CWG CHART ANALYSIS</span>
        </div>
      </div>
    </div>
  `;
}
//////////////////////////////////////////
// ======================================
// PLAY WHE WHITE BOARD V2 (AUTHENTIC)
// Traditional Play Whe White Board with Outstanding Marks & Best Bets
// New board created every week (Sunday to Saturday)
// Strike-through: DIAGONAL - Green (1x), Blue (2x), Red (3x+)
// Outstanding: Shows marks with 3+ weeks (stays visible, diagonal strike-through when played)
// Best Bets: 20 items in 2 rows of 10 (Excludes Outstanding marks)
// ======================================
function renderPlayWheWhiteBoardv2(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return `
      <div style="background: #ffffff; border-radius: 12px; padding: 16px; margin-bottom: 15px; border: 2px solid #333; text-align:center;">
        <span style="font-size: 14px; color: #333; font-weight: 600;">📊 Loading White Board...</span>
      </div>
    `;
  }

  // ======================================
  // CONSTANTS & HELPERS
  // ======================================

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();
  const currentDay = now.getDay();

  // Get the start of the current week (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDay);
  weekStart.setHours(0, 0, 0, 0);

  // Get the end of the current week (Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });

  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;

  // ======================================
  // GET DRAWS
  // ======================================

  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }

  function getWeekDraws(week) {
    const draws = [];
    if (!week) return draws;
    for (const day of dayNames) {
      for (const slot of slots) {
        const draw = getDraw(week, day, slot);
        if (draw) draws.push(draw);
      }
    }
    return draws;
  }

  // ======================================
  // GET CURRENT WEEK DRAWS (up to today)
  // ======================================

  const currentWeekDraws = [];
  for (let d = 0; d <= currentDay; d++) {
    for (const slot of slots) {
      const draw = getDraw(currentWeek, dayNames[d], slot);
      if (draw) currentWeekDraws.push(draw);
    }
  }

  // ======================================
  // COUNT OCCURRENCES FOR STRIKE-THROUGH
  // ======================================

  const currWeekCounts = {};
  for (let i = 1; i <= 36; i++) {
    currWeekCounts[i] = 0;
  }
  currentWeekDraws.forEach(num => {
    currWeekCounts[num] = (currWeekCounts[num] || 0) + 1;
  });

  // ======================================
  // SHELF MARKS (Outstanding - AT THE START OF THE WEEK)
  // ======================================

  function hasDrawOccurred(weekStartDate, dayIndex, slotIndex) {
    if (!weekStartDate) return false;
    const parts = weekStartDate.split(" ");
    const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
    const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayIndex);
    const timeOffsets = [9, 12, 15, 18];
    targetDate.setHours(timeOffsets[slotIndex] || 12);
    return targetDate < new Date();
  }

  const today = new Date();
  const todayDay = today.getDay();
  const todayHour = today.getHours();
  
  let currentSlot = -1;
  if (todayHour >= 9 && todayHour < 12) currentSlot = 0;
  else if (todayHour >= 12 && todayHour < 15) currentSlot = 1;
  else if (todayHour >= 15 && todayHour < 18) currentSlot = 2;
  else if (todayHour >= 18) currentSlot = 3;

  // Find last occurrence of each number BEFORE the current week started
  // We need to find when each number was LAST played BEFORE Sunday
  const lastOccurrence = {};
  
  // First, check previous weeks (before current week)
  for (let w = sortedWeeks.length - 2; w >= 0; w--) {
    const week = sortedWeeks[w];
    const weekStartDate = new Date(week.startDate);
    // Only process weeks before the current week
    if (weekStartDate >= weekStart) continue;
    
    for (let d = dayNames.length - 1; d >= 0; d--) {
      for (let s = slots.length - 1; s >= 0; s--) {
        if (hasDrawOccurred(week.startDate, d, s)) {
          const num = getDraw(week, dayNames[d], slots[s]);
          if (num && !lastOccurrence[num]) {
            lastOccurrence[num] = {
              date: new Date(new Date(week.startDate).getTime() + d * 86400000)
            };
          }
        }
      }
    }
  }

  function getDaysSince(num) {
    if (!lastOccurrence[num]) return 999;
    const lastDate = lastOccurrence[num].date;
    if (!lastDate) return 999;
    lastDate.setHours(0, 0, 0, 0);
    const weekStartMidnight = new Date(weekStart);
    weekStartMidnight.setHours(0, 0, 0, 0);
    const diff = Math.floor((weekStartMidnight - lastDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // Determine shelf marks (numbers not played in current week BEFORE Sunday)
  // THESE ARE THE NUMBERS THAT WERE OUTSTANDING AT THE START OF THE WEEK
  const shelfMarks = [];
  for (let i = 1; i <= 36; i++) {
    const days = getDaysSince(i);
    if (days > 0) {
      const weeks = Math.floor(days / 7);
      shelfMarks.push({
        num: i,
        days: days,
        weeks: weeks
      });
    }
  }
  shelfMarks.sort((a, b) => b.days - a.days);

  // OUTSTANDING MARKS - SHOW MARKS WITH 2+ WEEKS (AT THE START OF THE WEEK)
  // These are the numbers that started the week as outstanding
  // THEY STAY VISIBLE EVEN IF PLAYED THIS WEEK (with strike-through)
  const outstandingMarks = shelfMarks.filter(item => item.weeks >= 2);

  // Create a Set of outstanding mark numbers
  const outstandingSet = new Set(outstandingMarks.map(item => item.num));

  // ======================================
  // BEST BETS (Hot/Cold combined - EXCLUDING OUTSTANDING)
  // ======================================

  // Calculate frequency from last 200 draws
  const allDraws = [];
  for (let w = sortedWeeks.length - 1; w >= 0 && allDraws.length < 200; w--) {
    const week = sortedWeeks[w];
    const weekStartDate = new Date(week.startDate);
    for (let d = dayNames.length - 1; d >= 0 && allDraws.length < 200; d--) {
      for (let s = slots.length - 1; s >= 0 && allDraws.length < 200; s--) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          allDraws.push({ num: draw, date: new Date(weekStartDate.getTime() + d * 86400000) });
        }
      }
    }
  }

  const frequency = {};
  for (let i = 1; i <= 36; i++) {
    frequency[i] = 0;
  }
  allDraws.forEach(draw => {
    frequency[draw.num] = (frequency[draw.num] || 0) + 1;
  });

  // Get hot marks (top 30 most frequent) - EXCLUDING OUTSTANDING
  const hotMarks = Object.entries(frequency)
    .filter(([num]) => !outstandingSet.has(parseInt(num)))
    .map(([num, count]) => ({ num: parseInt(num), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .map(item => item.num);

  // Get cold marks (bottom 30 least frequent, excluding zeros) - EXCLUDING OUTSTANDING
  const coldMarks = Object.entries(frequency)
    .filter(([num, count]) => count > 0 && !outstandingSet.has(parseInt(num)))
    .map(([num, count]) => ({ num: parseInt(num), count }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 30)
    .map(item => item.num);

  // Best Bets: Combine hot and cold, remove duplicates
  const bestBetsSet = new Set();
  hotMarks.forEach(num => bestBetsSet.add(num));
  coldMarks.forEach(num => bestBetsSet.add(num));

  let bestBetsArray = Array.from(bestBetsSet);

  // LIMIT TO 20 ITEMS (2 rows of 10)
  if (bestBetsArray.length > 20) {
    bestBetsArray = bestBetsArray.slice(0, 20);
  }

  // Split into rows of 10 (2 rows)
  const bestBetsRows = [];
  for (let i = 0; i < bestBetsArray.length; i += 10) {
    bestBetsRows.push(bestBetsArray.slice(i, i + 10));
  }

  // ======================================
  // RENDER FUNCTIONS
  // ======================================

  // Helper to get strike-through style based on count
  function getStrikeStyle(num) {
    const count = currWeekCounts[num] || 0;
    if (count === 0) return '';
    if (count === 1) return 'position: relative; color: #28a745; font-weight: 900; text-decoration: none; display: inline-block;';
    if (count === 2) return 'position: relative; color: #007bff; font-weight: 900; text-decoration: none; display: inline-block;';
    if (count >= 3) return 'position: relative; color: #dc3545; font-weight: 900; text-decoration: none; display: inline-block;';
    return '';
  }

  // Generate diagonal strike-through overlay
  function getDiagonalStrike(num) {
    const count = currWeekCounts[num] || 0;
    if (count === 0) return '';
    const color = count === 1 ? '#28a745' : count === 2 ? '#007bff' : '#dc3545';
    return `
      <span style="
        position: absolute;
        top: 50%;
        left: -10%;
        width: 120%;
        height: 2px;
        background: ${color};
        transform: rotate(-45deg);
        transform-origin: center;
        pointer-events: none;
        box-shadow: 0 0 4px rgba(0,0,0,0.1);
      "></span>
    `;
  }

  // Render Outstanding Marks - ONE ROW, NO WRAP
  function renderOutstandingMarks() {
    if (!outstandingMarks || outstandingMarks.length === 0) {
      return '<div style="text-align: center; color: #999; font-size: 11px; padding: 8px 0;">No outstanding marks</div>';
    }

    let html = `<div style="display: flex; justify-content: center; align-items: center; gap: 4px; flex-wrap: nowrap; overflow-x: auto; padding: 4px 0; -webkit-overflow-scrolling: touch;">`;
    
    outstandingMarks.forEach((item, index) => {
      const isPlayed = currWeekCounts[item.num] > 0;
      let numColor = '#000';
      
      // Color based on play count in current week
      if (isPlayed) {
        const count = currWeekCounts[item.num];
        numColor = count === 1 ? '#28a745' : count === 2 ? '#007bff' : '#dc3545';
      }
      
      if (index > 0) {
        html += `<span style="color: #28a745; font-weight: 700; font-size: 12px; flex-shrink: 0;">+</span>`;
      }
      
      html += `
        <div style="display: flex; flex-direction: column; align-items: center; min-width: 28px; flex-shrink: 0; position: relative;">
          <div style="position: relative; display: inline-block;">
            <span style="font-size: 16px; font-weight: 700; color: ${numColor}; ${isPlayed ? 'font-weight: 900;' : ''}">
              ${item.num}
            </span>
            ${isPlayed ? getDiagonalStrike(item.num) : ''}
          </div>
          <span style="font-size: 8px; color: #666; font-weight: 600;">${item.weeks} WKS</span>
        </div>
      `;
    });
    
    html += `</div>`;
    return html;
  }

  // Render Best Bets - 10 items per row, exactly 2 rows
  function renderBestBets() {
    if (!bestBetsRows || bestBetsRows.length === 0) {
      return '<div style="text-align: center; color: #999; font-size: 16px; padding: 8px 0;">No best bets available</div>';
    }

    let html = '';
    bestBetsRows.forEach((row, rowIndex) => {
      html += `<div style="display: flex; justify-content: center; align-items: center; gap: 5px; margin-bottom: 2px; flex-wrap: nowrap;">`;
      
      row.forEach((num, index) => {
        const isPlayed = currWeekCounts[num] > 0;
        let numColor = '#000';
        if (isPlayed) {
          const count = currWeekCounts[num];
          numColor = count === 1 ? '#28a745' : count === 2 ? '#007bff' : '#dc3545';
        }
        
        if (index > 0) {
          html += `<span style="color: #28a745; font-weight: 700; font-size: 14px;">+</span>`;
        }
        html += `
          <span style="font-size: 14px; font-weight: 700; color: ${numColor}; position: relative; display: inline-block;">
            ${num}
            ${isPlayed ? getDiagonalStrike(num) : ''}
          </span>
        `;
      });
      
      html += `</div>`;
    });

    return html;
  }

// ======================================
// BUILD THE WHITE BOARD
// ======================================

// Get the earliest week in the data
const earliestWeek = sortedWeeks[0];
const earliestDate = new Date(earliestWeek.startDate);

// Calculate the correct week number based on the data
// This gives us the number of weeks since the earliest week
const weekNumber = Math.ceil((weekStart - earliestDate) / (7 * 24 * 60 * 60 * 1000)) + 1;

// Validate the week number (ensure it's reasonable)
const displayWeekNumber = (weekNumber > 0 && weekNumber < 999) ? weekNumber : 1;

const weekStartStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const weekEndStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const weekRange = `${weekStartStr} - ${weekEndStr}`;

  return `
    <div style="
      background: #ffffff;
      border-radius: 8px;
      padding: 12px 14px;
      border: 2px solid #333;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      max-width: 480px;
      margin: 0 auto;
      font-family: 'Courier New', monospace;
    ">
      <!-- Header -->
      <div style="
        text-align: center;
        border-bottom: 2px solid #333;
        padding-bottom: 4px;
        margin-bottom: 4px;
      ">
        <div style="font-size: 18px; font-weight: 900; color: #000; letter-spacing: 2px;">
          D WHE WHE WHITE BOARD
        </div>
        <div style="font-size: 12px; color: #000; font-weight: 600; margin-top: 1px;">
          ${weekRange} • Week ${weekNumber}
        </div>
        <div style="font-size: 12px; color: #000; margin-top: 1px;">
          ${now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <!-- OUTSTANDING - One Row No Wrap -->
      <div style="margin-bottom: 8px;">
        <div style="font-size: 18px; font-weight: 800; color: #000; letter-spacing: 2px; margin-bottom: 4px; text-align: center;">
          OUTSTANDING
        </div>
        ${renderOutstandingMarks()}
      </div>

      <!-- BEST BETS - Exactly 2 Rows of 10 (20 items) - Excludes Outstanding -->
      <div style="margin-top: 6px; border-top: 2px solid #333; padding-top: 8px;">
        <div style="font-size: 16px; font-weight: 800; color: #000; letter-spacing: 2px; margin-bottom: 4px; text-align: center;">
          BEST BETS
        </div>
        ${renderBestBets()}
      </div>

      <!-- Legend -->
      <div style="
        margin-top: 8px;
        padding-top: 4px;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: center;
        gap: 9px;
        font-size: 7px;
        color: #666;
      ">
        <span style="color: #28a745;">● 1x Played</span>
        <span style="color: #007bff;">● 2x Played</span>
        <span style="color: #dc3545;">● 3x+ Played</span>
      </div>

      <!-- Footer -->
      <div style="
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid #eee;
        text-align: center;
        font-size: 6px;
        color: #999;
        letter-spacing: 0.5px;
      ">
    CWG Chart Analysis©️ White Board v2 
      </div>
    </div>
  `;
}
//////////////////////////////////////////
// ==== Hot & Cold Adv Chart Version ====
// ======================================
// PLAY WHE HOT & COLD MARKS ENHANCED
// Shows: Under Today, Leaving/Meeting, Top 9 Hot/Cold (200 draws),
// Hot Marks (20 draws), Cold Marks (20 draws), Weekly Streak Details
// ======================================
function renderPlayWheHotColdMarksEnhanced(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return `
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 16px; margin-bottom: 15px; border: 1px solid #58a6ff; text-align:center;">
        📊 Loading Play Whe data...
      </div>
    `;
  }

  // ======================================
  // HELPER FUNCTIONS
  // ======================================

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();
  const todayName = dayNames[now.getDay()];
  const doubleNumbers = [8, 11, 22, 33];

  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? parseInt(val, 10) : null;
  }

  // Spirit Emoji mapping
  const spiritEmoji = {
    1: "🔪", 2: "👵🏾", 3: "🚕", 4: "⚰️", 5: "👨🏾‍🦳", 6: "🤰🏽", 7: "🐗", 8: "🐯",
    9: "🐮", 10: "🐒", 11: "🦅", 12: "🤴🏽", 13: "🐸", 14: "💰", 15: "🤧", 16: "💃🏽",
    17: "🐦‍⬛", 18: "🚤", 19: "🐎", 20: "🐶", 21: "👄", 22: "🐀", 23: "🏡", 24: "🫅🏽",
    25: "🐢", 26: "🐔", 27: "🐍", 28: "🐟", 29: "🍻", 30: "🐈‍⬛", 31: "👵🏾", 32: "🦐",
    33: "🕷️", 34: "👨🏾‍🦯", 35: "🐍", 36: "🫏"
  };

  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });

  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;

  // ======================================
  // GET TODAY'S DRAWS (UNDER TODAY)
  // ======================================
  const todayDraws = [];
  for (const slot of slots) {
    const draw = getDraw(previousWeek, todayName, slot);
    if (draw) todayDraws.push(draw);
  }

  // ======================================
  // GET LEAVING & MEETING NUMBERS
  // ======================================
  function getLeavingMeetingNumbers() {
    let leavingNumber = null;
    let leavingSlot = null;
    let leavingDate = null;
    let meetingNumber = null;
    let meetingSlot = null;
    let meetingDate = null;
    
    const todayIdx = now.getDay();
    const currentHour = now.getHours();
    
    function getDateForDraw(week, dayName) {
      if (!week || !week.startDate) return null;
      const parts = week.startDate.split(" ");
      const monthMap = {"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11};
      const startDate = new Date(parts[2], monthMap[parts[1]], parseInt(parts[0]));
      const dayIndex = dayNames.indexOf(dayName);
      if (dayIndex === -1) return null;
      const drawDate = new Date(startDate);
      drawDate.setDate(startDate.getDate() + dayIndex);
      return drawDate;
    }
    
    let currentSlotIdx = -1;
    if (currentHour >= 9 && currentHour < 12) currentSlotIdx = 0;
    else if (currentHour >= 12 && currentHour < 15) currentSlotIdx = 1;
    else if (currentHour >= 15 && currentHour < 18) currentSlotIdx = 2;
    else if (currentHour >= 18) currentSlotIdx = 3;
    
    let leavingDayIdx = -1;
    let leavingSlotIdx = -1;
    
    for (let d = todayIdx; d >= 0; d--) {
      const maxSlot = (d === todayIdx) ? currentSlotIdx : slots.length - 1;
      for (let s = maxSlot; s >= 0; s--) {
        const draw = getDraw(currentWeek, dayNames[d], slots[s]);
        if (draw) {
          leavingNumber = draw;
          leavingDayIdx = d;
          leavingSlotIdx = s;
          leavingSlot = slots[s];
          leavingDate = getDateForDraw(currentWeek, dayNames[d]);
          break;
        }
      }
      if (leavingNumber) break;
    }
    
    if (!leavingNumber) {
      for (let w = sortedWeeks.length - 2; w >= 0; w--) {
        const week = sortedWeeks[w];
        for (let d = dayNames.length - 1; d >= 0; d--) {
          for (let s = slots.length - 1; s >= 0; s--) {
            const draw = getDraw(week, dayNames[d], slots[s]);
            if (draw) {
              leavingNumber = draw;
              leavingDayIdx = d;
              leavingSlotIdx = s;
              leavingSlot = slots[s];
              leavingDate = getDateForDraw(week, dayNames[d]);
              break;
            }
          }
          if (leavingNumber) break;
        }
        if (leavingNumber) break;
      }
    }
    
    if (leavingNumber && leavingDayIdx !== -1 && leavingSlotIdx !== -1) {
      let nextDayIdx = leavingDayIdx;
      let nextSlotIdx = leavingSlotIdx + 1;
      
      if (nextSlotIdx >= slots.length) {
        nextSlotIdx = 0;
        nextDayIdx = leavingDayIdx + 1;
      }
      
      if (nextDayIdx >= dayNames.length) {
        nextDayIdx = 0;
      }
      
      if (nextDayIdx >= 0 && nextDayIdx < dayNames.length) {
        const targetDay = dayNames[nextDayIdx];
        const targetSlot = slots[nextSlotIdx];
        
        meetingNumber = getDraw(previousWeek, targetDay, targetSlot);
        if (meetingNumber) {
          meetingSlot = targetSlot;
          meetingDate = getDateForDraw(previousWeek, targetDay);
        }
        
        if (!meetingNumber) {
          for (let w = sortedWeeks.length - 2; w >= 0; w--) {
            const week = sortedWeeks[w];
            const draw = getDraw(week, targetDay, targetSlot);
            if (draw) {
              meetingNumber = draw;
              meetingSlot = targetSlot;
              meetingDate = getDateForDraw(week, targetDay);
              break;
            }
          }
        }
        
        if (!meetingNumber) {
          const draw = getDraw(currentWeek, targetDay, targetSlot);
          if (draw) {
            meetingNumber = draw;
            meetingSlot = targetSlot;
            meetingDate = getDateForDraw(currentWeek, targetDay);
          }
        }
      }
    }
    
    return { leavingNumber, leavingSlot, leavingDate, meetingNumber, meetingSlot, meetingDate };
  }

  const { leavingNumber, leavingSlot, leavingDate, meetingNumber, meetingSlot, meetingDate } = getLeavingMeetingNumbers();

  // ======================================
  // COLLECT LAST 200 DRAWS
  // ======================================
  const allDraws200 = [];
  
  for (let w = sortedWeeks.length - 1; w >= 0 && allDraws200.length < 200; w--) {
    const week = sortedWeeks[w];
    const weekStart = new Date(week.startDate);
    
    for (let d = dayNames.length - 1; d >= 0 && allDraws200.length < 200; d--) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      
      for (let s = slots.length - 1; s >= 0 && allDraws200.length < 200; s--) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          allDraws200.push({
            num: draw,
            date: drawDate,
            day: dayNames[d],
            slot: slots[s]
          });
        }
      }
    }
  }

  const totalDraws200 = allDraws200.length;

  // ======================================
  // COLLECT LAST 20 DRAWS
  // ======================================
  const allDraws20 = [];
  
  for (let w = sortedWeeks.length - 1; w >= 0 && allDraws20.length < 20; w--) {
    const week = sortedWeeks[w];
    const weekStart = new Date(week.startDate);
    
    for (let d = dayNames.length - 1; d >= 0 && allDraws20.length < 20; d--) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      
      for (let s = slots.length - 1; s >= 0 && allDraws20.length < 20; s--) {
        const draw = getDraw(week, dayNames[d], slots[s]);
        if (draw) {
          allDraws20.push({
            num: draw,
            date: drawDate,
            day: dayNames[d],
            slot: slots[s]
          });
        }
      }
    }
  }

  const totalDraws20 = allDraws20.length;

  // ======================================
  // CALCULATE FREQUENCY - 200 DRAWS
  // ======================================
  const frequency200 = {};
  const lastPlayed200 = {};
  for (let i = 1; i <= 36; i++) {
    frequency200[i] = 0;
    lastPlayed200[i] = null;
  }
  
  allDraws200.forEach(draw => {
    frequency200[draw.num] = (frequency200[draw.num] || 0) + 1;
    if (!lastPlayed200[draw.num] || draw.date > lastPlayed200[draw.num]) {
      lastPlayed200[draw.num] = draw.date;
    }
  });

  const sortedNumbers200 = Object.entries(frequency200)
    .map(([num, count]) => ({ 
      num: parseInt(num), 
      count,
      lastDate: lastPlayed200[parseInt(num)]
    }))
    .sort((a, b) => b.count - a.count);

  const hotMarks200 = sortedNumbers200.slice(0, 10);
  const coldMarks200 = sortedNumbers200.slice(-10).reverse();

// ======================================
// CALCULATE FREQUENCY - 20 DRAWS (with last played date)
// ======================================
const frequency20 = {};
const lastPlayed20 = {};
for (let i = 1; i <= 36; i++) {
  frequency20[i] = 0;
  lastPlayed20[i] = null;
}

allDraws20.forEach(draw => {
  frequency20[draw.num] = (frequency20[draw.num] || 0) + 1;
  if (!lastPlayed20[draw.num] || draw.date > lastPlayed20[draw.num]) {
    lastPlayed20[draw.num] = draw.date;
  }
});

// Sort by frequency (highest to lowest)
const sortedNumbers20 = Object.entries(frequency20)
  .map(([num, count]) => ({ 
    num: parseInt(num), 
    count,
    lastDate: lastPlayed20[parseInt(num)]
  }))
  .sort((a, b) => b.count - a.count);

// HOT MARKS - Top 9 most frequent (highest count, excluding zeros)
const hotMarks20 = sortedNumbers20.filter(item => item.count > 0).slice(0, 9);

// COLD MARKS - Bottom 9 least frequent (lowest count, excluding zeros)
const coldMarks20 = sortedNumbers20
  .filter(item => item.count > 0)
  .slice(-9)
  .reverse();

  // ======================================
  // CURRENT WEEK DRAWS
  // ======================================
  const currentWeekDraws = [];
  for (let d = 0; d < dayNames.length; d++) {
    for (let s = 0; s < slots.length; s++) {
      const draw = getDraw(currentWeek, dayNames[d], slots[s]);
      if (draw) currentWeekDraws.push(draw);
    }
  }

  const previousWeekDraws = [];
  for (const day of dayNames) {
    for (const slot of slots) {
      const draw = getDraw(previousWeek, day, slot);
      if (draw) previousWeekDraws.push(draw);
    }
  }

  const prevWeekCounts = {};
  const currWeekCounts = {};
  for (let i = 1; i <= 36; i++) {
    prevWeekCounts[i] = 0;
    currWeekCounts[i] = 0;
  }
  previousWeekDraws.forEach(num => { prevWeekCounts[num] = (prevWeekCounts[num] || 0) + 1; });
  currentWeekDraws.forEach(num => { currWeekCounts[num] = (currWeekCounts[num] || 0) + 1; });

  // ======================================
  // WEEKLY STREAK INSIGHT (Original Logic)
  // ======================================

  // DOUBLES - Only 8, 11, 22, 33
  const doubles = [];
  doubleNumbers.forEach(num => {
    const prevCount = prevWeekCounts[num] || 0;
    const currCount = currWeekCounts[num] || 0;
    
    if (currCount >= 2) return; // Hide completed
    
    let status = 0;
    let label = 'Missing';
    let color = '#ffffff';
    let textColor = '#000000';
    
    if (prevCount === 1 && currCount === 0) {
      status = 1;
      label = 'Pending (LW) - Needs 1 More';
      color = '#7c02b5';
      textColor = '#ffffff';
    } else if (currCount === 1) {
      status = 2;
      label = '1 Hit (CW) - Needs 1 More';
      color = '#32d74b';
      textColor = '#000000';
    }
    
    doubles.push({
      num: num,
      status: status,
      label: label,
      color: color,
      textColor: textColor,
      prevCount: prevCount,
      currCount: currCount,
      emoji: spiritEmoji[num] || ''
    });
  });

  // TRIPLES - All numbers
  const triples = [];
  for (let i = 1; i <= 36; i++) {
    const prevCount = prevWeekCounts[i] || 0;
    const currCount = currWeekCounts[i] || 0;
    
    if (currCount >= 3) continue; // Hide completed
    
    let include = false;
    let status = 0;
    let label = 'Pending';
    let color = '#7c02b5';
    let textColor = '#ffffff';
    
    if (prevCount === 2 && currCount === 0) {
      include = true;
      status = 1;
      label = 'Pending (LW) - Needs 1 More';
      color = '#7c02b5';
      textColor = '#ffffff';
    } else if (currCount === 2) {
      include = true;
      status = 2;
      label = '2 Hits (CW) - Needs 1 More';
      color = '#32d74b';
      textColor = '#000000';
    }
    
    if (include) {
      triples.push({
        num: i,
        status: status,
        label: label,
        color: color,
        textColor: textColor,
        prevCount: prevCount,
        currCount: currCount,
        emoji: spiritEmoji[i] || ''
      });
    }
  }
  triples.sort((a, b) => a.num - b.num);

  // QUADRUPLES - All numbers
  const quadruples = [];
  for (let i = 1; i <= 36; i++) {
    const prevCount = prevWeekCounts[i] || 0;
    const currCount = currWeekCounts[i] || 0;
    
    if (currCount >= 4) continue; // Hide completed
    
    let include = false;
    let status = 0;
    let label = 'Pending';
    let color = '#7c02b5';
    let textColor = '#ffffff';
    
    if (prevCount === 3 && currCount === 0) {
      include = true;
      status = 1;
      label = 'Pending (LW) - Needs 1 More';
      color = '#7c02b5';
      textColor = '#ffffff';
    } else if (currCount === 3) {
      include = true;
      status = 2;
      label = '3 Hits (CW) - Needs 1 More';
      color = '#32d74b';
      textColor = '#000000';
    }
    
    if (include) {
      quadruples.push({
        num: i,
        status: status,
        label: label,
        color: color,
        textColor: textColor,
        prevCount: prevCount,
        currCount: currCount,
        emoji: spiritEmoji[i] || ''
      });
    }
  }
  quadruples.sort((a, b) => a.num - b.num);

  // ======================================
  // RENDER FUNCTIONS
  // ======================================

  function formatDate(date) {
    if (!date) return '—';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  function formatDateDisplay(date) {
    if (!date) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} '${date.getFullYear().toString().slice(-2)}`;
  }

// Render Today Draws - Centered with auto-switch at 6:16 PM
function renderTodayDraws() {
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if it's after 6:16 PM (18:16)
  const isAfterEve = (currentHour > 18) || (currentHour === 18 && currentMinute >= 16);
  
  // Determine which day to show
  let displayDate = new Date(now);
  let displayDayName = todayName;
  let displayLabel = "📅 UNDER TODAY";
  
  if (isAfterEve) {
    // After 6:59 PM, show tomorrow's date
    displayDate.setDate(now.getDate() + 1);
    displayDayName = dayNames[(now.getDay() + 1) % 7];
    displayLabel = "📅 UNDER TOMORROW";
  }
  
  // Format date as "Wed 3 Aug" (no year)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${days[displayDate.getDay()]} ${displayDate.getDate()} ${months[displayDate.getMonth()]}`;
  
  // Get the draws for the display day (from previous week if today, or adjust for tomorrow)
  let displayDraws = [];
  
  if (isAfterEve) {
    // For tomorrow, we want to show the previous week's draws for tomorrow's day
    const tomorrowDayName = dayNames[(now.getDay() + 1) % 7];
    for (const slot of slots) {
      const draw = getDraw(previousWeek, tomorrowDayName, slot);
      if (draw) displayDraws.push(draw);
    }
  } else {
    // For today, use the existing logic
    displayDraws = todayDraws;
  }
  
  const todayDrawsHtml = displayDraws.map(num => `
    <span style="display: inline-flex; align-items: center; gap: 2px; background: var(--card-bg, rgba(255,255,255,0.05)); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--border-color, rgba(255,255,255,0.06));">
      <span style="font-size: 16px; font-weight: 900; color: var(--text-main, #ffd700);">${num}</span>
      <span style="font-size: 16px;">${spiritEmoji[num] || ''}</span>
    </span>
  `).join('');

  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 4px 8px; background: var(--card-bg, rgba(255,255,255,0.02)); border-radius: 6px; border: 1px solid var(--border-color, rgba(255,255,255,0.06)); margin-bottom: 3px;">
      <span style="font-size: 16px; font-weight: 700; color: var(--text-main, #ff9d00); letter-spacing: 0.3px;">${displayLabel} • ${formattedDate}</span>
      <div style="display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center;">
        ${displayDraws.length > 0 ? todayDrawsHtml : '<span style="font-size: 9px; color: var(--text-dim, #64748b);">No draws available</span>'}
      </div>
    </div>
  `;
}

  // Render Leaving/Meeting
  function renderLeavingMeeting() {
    const leavingDisplay = leavingNumber ? `#${leavingNumber}` : '—';
    const meetingDisplay = meetingNumber ? `#${meetingNumber}` : '—';
    const leavingDateDisplay = leavingDate ? formatDateDisplay(leavingDate) : 'No data available';
    const meetingDateDisplay = meetingDate ? formatDateDisplay(meetingDate) : 'No data available';
    
    return `
      <div style="display: flex; gap: 8px; margin-bottom: 3px;">
        <div style="flex: 1; border-radius: 6px; padding: 4px 8px; text-align: center; border: 1px solid var(--text-main, #58a6ff); background: rgba(88,166,255,0.08);">
          <div style="font-size: 12px; font-weight: 800; color: var(--text-main, #58a6ff); text-transform: uppercase; letter-spacing: 0.5px;">LEAVING • ${leavingSlot || ''}</div>
          <div style="font-size: 18px; font-weight: 900; color: var(--text-main, #58a6ff); margin: 2px 0;">${leavingDisplay}</div>
          <div style="font-size: 12px; color: var(--text-dim, #666);">${leavingDateDisplay}</div>
        </div>
        <div style="flex: 1; border-radius: 6px; padding: 4px 8px; text-align: center; border: 1px solid var(--text-main, #ff9d00); background: rgba(255,157,0,0.08);">
          <div style="font-size: 12px; font-weight: 800; color: var(--text-main, #ff9d00); text-transform: uppercase; letter-spacing: 0.5px;">MEETING • ${meetingSlot || ''}</div>
          <div style="font-size: 18px; font-weight: 900; color: var(--text-main, #ff9d00); margin: 2px 0;">${meetingDisplay}</div>
          <div style="font-size: 12px; color: var(--text-dim, #666);">${meetingDateDisplay}</div>
        </div>
      </div>
    `;
  }

  // Render Mark Row (for Top 9 Hot/Cold)
  function renderMarkRow(marks, title, titleColor, isHot = true) {
    if (!marks || marks.length === 0) {
      return `
        <div style="text-align: center; padding: 6px; color: var(--text-dim, #64748b); font-size: 10px;">
          No marks available
        </div>
      `;
    }

    const marksHtml = marks.map(item => {
      const emoji = spiritEmoji[item.num] || '';
      const count = item.count;
      const lastDate = formatDate(item.lastDate);
      
      return `
        <div style="display: flex; flex-direction: column; align-items: center; min-width: 26px; padding: 2px 2px; background: var(--card-bg, rgba(255,255,255,0.03)); border-radius: 4px; border: 1px solid var(--border-color, rgba(255,255,255,0.04)); flex: 0 1 auto;">
          <span style="font-size: 16px; font-weight: 900; color: ${isHot ? '#ff6b6b' : '#58a6ff'}; line-height: 1.2;">${item.num}</span>
          <span style="font-size: 9px; color: var(--text-dim, #94a3b8); font-weight: 600; margin-top: 1px;">${count}x</span>
          <span style="font-size: 9px; color: var(--text-dim, #64748b); margin-top: 1px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.06)); padding-top: 1px; width: 100%; text-align: center;">${lastDate}</span>
        </div>
      `;
    }).join('');

    return `
      <div style="margin-bottom: ${isHot ? '4px' : '0'};">
        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
          <span style="font-size: 10px; font-weight: 800; color: ${titleColor}; letter-spacing: 0.3px;">${title}</span>
          <span style="font-size: 6px; color: var(--text-dim, #64748b); background: var(--card-bg, rgba(255,255,255,0.05)); padding: 1px 5px; border-radius: 6px;">${marks.length}</span>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 2px; flex-wrap: nowrap; overflow-x: auto; background: var(--card-bg, rgba(255,255,255,0.02)); border-radius: 6px; padding: 2px 4px; border: 1px solid var(--border-color, rgba(255,255,255,0.04)); min-height: 42px; -webkit-overflow-scrolling: touch;">
          ${marksHtml}
        </div>
      </div>
    `;
  }

// Render 20 Draw Marks with last played date
function render20DrawMarks(marks, title, titleColor) {
  if (!marks || marks.length === 0) {
    return `
      <div style="text-align: center; padding: 6px; color: var(--text-dim, #64748b); font-size: 10px;">
        No marks available
      </div>
    `;
  }

  const marksHtml = marks.map(item => {
    const emoji = spiritEmoji[item.num] || '';
    const count = item.count;
    const lastDate = formatDate(item.lastDate);
    
    return `
      <div style="display: flex; flex-direction: column; align-items: center; min-width: 26px; padding: 2px 2px; background: var(--card-bg, rgba(255,255,255,0.03)); border-radius: 4px; border: 1px solid var(--border-color, rgba(255,255,255,0.04)); flex: 0 1 auto;">
        <span style="font-size: 16px; font-weight: 900; color: ${titleColor}; line-height: 1.2;">${item.num}</span>
        <span style="font-size: 9px; color: var(--text-dim, #94a3b8); font-weight: 600; margin-top: 1px;">${count}x</span>
        <span style="font-size: 9px; color: var(--text-dim, #64748b); margin-top: 1px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.06)); padding-top: 1px; width: 100%; text-align: center;">${lastDate}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-bottom: 2px;">
      <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
        <span style="font-size: 10px; font-weight: 800; color: ${titleColor}; letter-spacing: 0.3px;">${title}</span>
        <span style="font-size: 6px; color: var(--text-dim, #64748b); background: var(--card-bg, rgba(255,255,255,0.05)); padding: 1px 5px; border-radius: 6px;">${marks.length}</span>
      </div>
      <div style="display: flex; justify-content: center; align-items: center; gap: 2px; flex-wrap: nowrap; overflow-x: auto; background: var(--card-bg, rgba(255,255,255,0.02)); border-radius: 6px; padding: 2px 4px; border: 1px solid var(--border-color, rgba(255,255,255,0.04)); min-height: 42px; -webkit-overflow-scrolling: touch;">
        ${marksHtml}
      </div>
    </div>
  `;
}

  // Render Weekly Streak Insight (Original Logic with Details)
  function renderWeeklyStreakInsight() {
    function buildCategoryBalls(categoryData, title, icon, colorClass, maxPerRow = 3) {
      if (!categoryData || categoryData.length === 0) {
        return `
          <div class="category-group ${colorClass}" style="display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 4px; border-radius:6px; border:1px solid var(--border-color, rgba(45,138,78,0.15)); min-width:60px; flex:0 1 auto; text-align:center;">
            <div class="category-title" style="font-size:12px; font-weight:800; color:var(--text-main, #000000); letter-spacing:0.5px;">${icon} ${title} <span class="category-count" style="font-size:8px; color:var(--text-dim, #666); font-weight:normal;">(0)</span></div>
            <div class="category-balls" style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:2px;"><span style="color:var(--text-dim, #999); font-size:8px;">None</span></div>
          </div>
        `;
      }
      
      let ballsHtml = '';
      for (const item of categoryData) {
        let borderStyle = '1px solid #2d8a4e';
        if (item.status === 0) {
          borderStyle = '1px solid #999';
        } else if (item.status === 1) {
          borderStyle = '2px solid #7c02b5';
        } else if (item.status === 2) {
          borderStyle = '2px solid #32d74b';
        }
        
        ballsHtml += `
          <div class="category-ball" style="display:inline-flex; flex-direction:column; align-items:center; margin:0 1px;">
            <div style="width:18px; height:18px; background:${item.color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:${item.textColor}; border:${borderStyle}; line-height:18px;">${item.num}</div>
            ${item.status === 1 ? `<span style="font-size:5px; color:#7c02b5;">LW</span>` : ''}
            ${item.status === 2 ? `<span style="font-size:5px; color:#32d74b;">CW</span>` : ''}
          </div>
        `;
      }
      
      return `
        <div class="category-group ${colorClass}" style="display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 4px; border-radius:6px; border:1px solid var(--border-color, rgba(45,138,78,0.15)); min-width:60px; flex:0 1 auto; text-align:center;">
          <div class="category-title" style="font-size:9px; font-weight:800; color:var(--text-main, #000000); letter-spacing:0.5px;">${icon} ${title} <span class="category-count" style="font-size:8px; color:var(--text-dim, #666); font-weight:normal;">(${categoryData.length})</span></div>
          <div class="category-balls" style="display:grid; grid-template-columns: repeat(${maxPerRow}, 1fr); gap:2px; justify-items:center;">${ballsHtml}</div>
        </div>
      `;
    }

    // Generate detailed bullet points
    function generateDetails(data, type) {
      const details = [];
      const pendingLW = data.filter(d => d.status === 1);
      const pendingCW = data.filter(d => d.status === 2);
      
      if (pendingLW.length > 0) {
        details.push(`▫️ ${pendingLW.map(d => `${d.num}${d.emoji}`).join(', ')} Needs 1 More To Complete ${type} (From Last Week)`);
      }
      if (pendingCW.length > 0) {
        details.push(`▫️ ${pendingCW.map(d => `${d.num}${d.emoji}`).join(', ')} Needs 1 More To Complete ${type} (Current Week)`);
      }
      if (pendingLW.length === 0 && pendingCW.length === 0) {
        details.push(`▫️ No pending ${type} streaks`);
      }
      
      return details.length > 0 ? details.join('<br>') : '▫️ No data available';
    }

    const doublesDetails = generateDetails(doubles, 'DOUBLE');
    const triplesDetails = generateDetails(triples, 'TRIPLE');
    const quadruplesDetails = generateDetails(quadruples, 'QUADRUPLE');

    return `
      <div style="margin-top: 3px; padding-top: 6px; border-top: 1px dashed var(--border-color, rgba(255,255,255,0.06));">
        <div style="font-size: 10px; font-weight: 800; color: var(--text-main, #ff9d00); margin-bottom: 2px; text-align: center; letter-spacing: 0.3px;">
   ⚜️♨️ WEEKLY STREAK INSIGHT ♨️⚜️
        </div>
        
        <!-- Category Balls -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 6px 10px; background: var(--card-bg, rgba(255,255,255,0.02)); border-radius: 8px; padding: 6px 8px; border: 1px solid var(--border-color, rgba(255,255,255,0.04)); margin-bottom: 3px;">
          ${buildCategoryBalls(doubles, 'DOUBLES', '🟢', 'doubles', 3)}
          ${buildCategoryBalls(triples, 'TRIPLES', '🟠', 'triples', 3)}
          ${buildCategoryBalls(quadruples, 'QUADRUPLES', '🔴', 'quadruples', 3)}
        </div>
        
        <!-- Details Bullet Points -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; font-size: 8px; color: var(--text-main, #e2e8f0);">
          <div style="background: var(--card-bg, rgba(50,215,75,0.05)); border-radius: 4px; padding: 4px 6px; border: 1px solid rgba(50,215,75,0.1);">
            <span style="font-weight: 700; color: #32d74b;">DOUBLES</span><br>
            ${doublesDetails}
          </div>
          <div style="background: var(--card-bg, rgba(255,157,0,0.05)); border-radius: 4px; padding: 4px 6px; border: 1px solid rgba(255,157,0,0.1);">
            <span style="font-weight: 700; color: #ff9d00;">TRIPLES</span><br>
            ${triplesDetails}
          </div>
          <div style="background: var(--card-bg, rgba(255,55,95,0.05)); border-radius: 4px; padding: 4px 6px; border: 1px solid rgba(255,55,95,0.1);">
            <span style="font-weight: 700; color: #ff375f;">QUADRUPLES</span><br>
            ${quadruplesDetails}
          </div>
        </div>
      </div>
    `;
  }

  // ======================================
  // BUILD THE MAIN HTML
  // ======================================

  const todayHtml = renderTodayDraws();
  const leavingMeetingHtml = renderLeavingMeeting();
  const hotHtml200 = renderMarkRow(hotMarks200, '🔥 HOT MARKS - LAST 200 DRAWS', '#ff6b6b', true);
  const coldHtml200 = renderMarkRow(coldMarks200, '❄️ COLD MARKS - LAST 200 DRAWS', '#58a6ff', false);
  
  // 20 Draw sections - CORRECTED
  const hotMarks20Html = render20DrawMarks(hotMarks20, '🔥 HOT MARKS - LAST 20 DRAWS', '#ff6b6b');
  const coldMarks20Html = render20DrawMarks(coldMarks20, '❄️ COLD MARKS - LAST 20 DRAWS', '#58a6ff');

  const weeklyStreakHtml = renderWeeklyStreakInsight();

  return `
    <div style="
      background: var(--bg-start, linear-gradient(135deg, #0f172a, #1e293b));
      border-radius: 16px; 
      padding: 10px; 
      margin-bottom: 15px; 
      border: 1px solid var(--border-color, #ff9d00);
    ">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; flex-wrap: wrap; gap: 4px;">
      </div>
      
      <!-- Section 1: Under Today -->
      ${todayHtml}
      
      <!-- Section 2: Leaving/Meeting -->
      ${leavingMeetingHtml}
      
      <!-- Separator -->
      <div style="margin: 4px 0; border-top: 1px solid var(--border-color, #000000);"></div>
      
<!-- Sec 3: Top 9 Hot&Cold (200 draws) -->
      <div style="font-size: 13px; font-weight: 800; color: var(--text-main, #ff9d00); letter-spacing: 0.3px;">
    ♠️ TOP HOT & COLD MARKS ♠️
      </div>
      
      ${hotHtml200}
      ${coldHtml200}
      
      <!-- Separator -->
      <div style="margin: 4px 0; border-top: 1px solid var(--border-color, #000000);"></div>
      
 <!-- Sec 4: Hot&Cold Marks (20 draws) -->
      ${hotMarks20Html}
      ${coldMarks20Html}
      
      <!-- Separator -->
      <div style="margin: 4px 0; border-top: 1px solid var(--border-color, #000000);"></div>
      
 <!-- Sec 5: Weekly Streak Insight -->
      ${weeklyStreakHtml}
      
      <!-- Footer -->
      <div style="margin-top: 2px; padding-top: 4px; border-top: 1px solid var(--border-color, rgba(255,255,255,0.02)); display: flex; justify-content: center; align-items: center; gap: 6px; flex-wrap: wrap;">
        <span style="font-size: 10px; color: var(--text-main, #00000);">CodeWithGlasgow • CWG Chart Analysis ©️</span>
      </div>
      
    </div>
  `;
}
///////////////////////////////////////////

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
  const itemsPerPage = 4;// no. items page
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
        <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 8px;">📅 PICK 2 CURRENT WEEK PLAYS INFO</div>
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
      <div style="font-size: 13px; font-weight: 800; color: #58a6ff; margin-bottom: 12px; text-align: center;">📅 PICK 2 CURRENT WEEK PLAYS INFO</div>
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
        Based on current week plays • Historical data from previous weeks • ${allPlays.length} total plays • ◀️▶️ Swipe for more
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
// PICK 4 CURRENT WEEK PLAYS INFO - PERMUTATION ANALYSIS (REDESIGNED)
// Professional UI with clean card layout, better typography, and visual hierarchy
// ======================================
function renderPick4CurrentWeekPlays(weeksData) {
  if (!weeksData || weeksData.length === 0) {
    return `
      <div class="pick4-container" style="background: linear-gradient(145deg, #0f172a, #1a2332); border-radius: 16px; padding: 24px; border: 1px solid rgba(88,166,255,0.15); text-align:center;">
        <div style="font-size: 14px; color: #58a6ff; font-weight: 600;">⏳ Loading Pick 4 data...</div>
      </div>
    `;
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
  
  // --- Helper Functions ---
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
  
  function getPick4Number(draw) {
    if (!draw) return null;
    const cleanDraw = draw.toString().replace(/[^0-9]/g, '');
    if (cleanDraw.length === 8) return cleanDraw;
    return cleanDraw.padStart(4, '0');
  }
  
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
  
  // --- Build History Map ---
  const historyMap = new Map();
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
  
  // --- Collect Current Week Draws ---
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
  
  // --- Build Permutations Map ---
  const drawPermutationsMap = new Map();
  currentWeekDraws.forEach(draw => {
    const key = draw.original;
    if (!drawPermutationsMap.has(key)) {
      const allPerms = getAllPermutations(draw.digits);
      const playedPermutations = allPerms.filter(perm => historyMap.has(perm));
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
  
  const allDraws = Array.from(drawPermutationsMap.values());
  const itemsPerPage = 1;
  const totalPages = Math.ceil(allDraws.length / itemsPerPage);
  
  if (allDraws.length === 0) {
    return `
      <div class="pick4-container" style="background: linear-gradient(145deg, #0f172a, #1a2332); border-radius: 16px; padding: 24px; border: 1px solid rgba(88,166,255,0.15); text-align:center;">
        <div style="font-size: 14px; color: #58a6ff; font-weight: 600;">♠️ PICK 4 PERMUTATION ANALYSIS</div>
        <div style="color: #64748b; margin-top: 8px; font-size: 13px;">No Pick 4 plays recorded in current week yet</div>
      </div>
    `;
  }
  
  // --- Render Functions ---
  function renderDigitChips(digits, highlightIndex = -1) {
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
    return digits.map((d, i) => `
      <span style="
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background: ${i === highlightIndex ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)'};
        border-radius: 8px;
        font-size: 16px;
        font-weight: 700;
        color: ${colors[i] || '#94a3b8'};
        border: ${i === highlightIndex ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.06)'};
        margin: 0 2px;
      ">${d}</span>
    `).join('');
  }
  
  function renderPermutationItem(perm, isOriginal, hitCount, lastDate, isPlayedThisWeek) {
    const bgColor = isOriginal ? 'rgba(255,157,0,0.12)' : 'rgba(255,255,255,0.03)';
    const borderColor = isOriginal ? '#ff9d00' : (isPlayedThisWeek ? '#58a6ff' : 'rgba(255,255,255,0.06)');
    const textColor = isOriginal ? '#ff9d00' : (isPlayedThisWeek ? '#58a6ff' : '#e2e8f0');
    const badge = isOriginal ? '⚜️' : (isPlayedThisWeek ? '🔄' : '');
    
    // Split permutation into individual digits for display
    const digits = perm.split('');
    const digitColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
    
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 10px;
        padding: 8px 14px;
        margin-bottom: 6px;
        transition: all 0.2s ease;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${badge ? `<span style="font-size: 12px;">${badge}</span>` : ''}
          <div style="display: flex; gap: 3px;">
            ${digits.map((d, i) => `
              <span style="
                display: inline-block;
                width: 26px;
                height: 26px;
                line-height: 26px;
                text-align: center;
                background: rgba(255,255,255,0.05);
                border-radius: 6px;
                font-size: 14px;
                font-weight: 700;
                color: ${digitColors[i] || '#94a3b8'};
                border: 1px solid rgba(255,255,255,0.05);
              ">${d}</span>
            `).join('')}
          </div>
          <span style="
            font-size: 11px;
            font-weight: 600;
            color: #32d74b;
            background: rgba(50,215,75,0.1);
            padding: 0 10px;
            border-radius: 12px;
          ">${hitCount}x</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 9px; color: #64748b;">Last: ${lastDate}</span>
          ${isOriginal ? `<span style="font-size: 9px; color: #ff9d00; font-weight: 700;">🔔</span>` : ''}
        </div>
      </div>
    `;
  }
  
  // --- Build Pages ---
  const pagesHtml = [];
  for (let page = 0; page < totalPages; page++) {
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const pageDraws = allDraws.slice(start, end);
    
    let pageRowsHtml = '';
    for (let draw of pageDraws) {
      const comboData = historyMap.get(draw.original) || { hits: 0, lastDate: null, lastSlot: null };
      const lastPlayed = comboData.lastDate ? formatDisplayDate(comboData.lastDate, comboData.lastSlot) : "Never";
      const totalPerms = draw.permutations.length;
      const totalPossible = 24;
      const coveragePercent = Math.round((totalPerms / totalPossible) * 100);
      
      // Build permutations list
      let permsHtml = '';
      draw.permutations.forEach(perm => {
        const permData = historyMap.get(perm);
        const isOriginal = (perm === draw.original);
        const hitCount = permData?.hits || 0;
        let isPlayedThisWeek = false;
        for (let cd of currentWeekDraws) {
          if (cd.original === perm) {
            isPlayedThisWeek = true;
            break;
          }
        }
        const lastDate = permData?.lastDate ? formatDisplayDate(permData.lastDate, permData.lastSlot) : 'Never';
        permsHtml += renderPermutationItem(perm, isOriginal, hitCount, lastDate, isPlayedThisWeek);
      });
      
      pageRowsHtml += `
        <div style="
          background: linear-gradient(145deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6));
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(88,166,255,0.12);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        ">
          <!-- Draw Header -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
            flex-wrap: wrap;
            gap: 8px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; font-weight: 600; color: #58a6ff; letter-spacing: 0.5px;">🎲 DRAWN</span>
              <div style="display: flex; gap: 4px;">
                ${renderDigitChips(draw.original.split(''))}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="text-align: right;">
                <div style="font-size: 10px; color: #64748b;">${draw.playedDay} ${draw.playedSlotIcon}</div>
                <div style="font-size: 10px; color: #94a3b8;">
                  <span style="color: #32d74b;">${comboData.hits}x</span> hits · Last: ${lastPlayed}
                </div>
              </div>
              <div style="
                background: rgba(88,166,255,0.1);
                border-radius: 20px;
                padding: 2px 12px;
                border: 1px solid rgba(88,166,255,0.15);
              ">
                <span style="font-size: 10px; font-weight: 600; color: #58a6ff;">${totalPerms}/${totalPossible}</span>
                <span style="font-size: 8px; color: #64748b;">(${coveragePercent}%)</span>
              </div>
            </div>
          </div>
          
          <!-- Permutations List -->
          <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 10px; letter-spacing: 0.3px;">
            📜 PERMUTATIONS PLAYED IN HISTORY
            <span style="font-size: 9px; font-weight: 400; color: #64748b; margin-left: 6px;">
              (${totalPerms} of ${totalPossible} possible)
            </span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            ${permsHtml || `
              <div style="text-align: center; color: #64748b; padding: 16px; font-size: 12px;">
                No permutations of this number have been played in history
              </div>
            `}
          </div>
          
          <!-- Coverage Bar -->
          <div style="margin-top: 10px;">
            <div style="
              height: 3px;
              background: rgba(255,255,255,0.05);
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                height: 100%;
                width: ${coveragePercent}%;
                background: linear-gradient(90deg, #58a6ff, #ff9d00);
                border-radius: 4px;
                transition: width 0.6s ease;
              "></div>
            </div>
          </div>
        </div>
      `;
    }
    
    pagesHtml.push(`
      <div class="pick4-slide" style="
        min-width: 100%;
        scroll-snap-align: start;
        padding: 4px 2px;
      ">
        ${pageRowsHtml}
      </div>
    `);
  }
  
  // --- Generate Pagination Dots ---
  let dotsHtml = '';
  for (let i = 0; i < totalPages; i++) {
    dotsHtml += `
      <span class="pick4-dot" data-slide="${i}" style="
        width: 8px;
        height: 8px;
        background: ${i === 0 ? '#58a6ff' : '#334155'};
        border-radius: 50%;
        display: inline-block;
        margin: 0 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        ${i === 0 ? 'width: 20px; border-radius: 4px;' : ''}
      "></span>
    `;
  }
  
  const carouselId = 'pick4-perm-' + Date.now();
  
  // --- Final HTML ---
  return `
    <div class="pick4-container" style="
      background: linear-gradient(145deg, #0f172a, #1a2332);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(88,166,255,0.1);
      margin-bottom: 12px;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
        flex-wrap: wrap;
        gap: 8px;
      ">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #58a6ff; letter-spacing: 0.3px;">
            ♠️ PICK 4 PERMUTATION ANALYSIS
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Historical permutations for each drawn number
          </div>
        </div>
        <div style="
          background: rgba(88,166,255,0.08);
          padding: 4px 14px;
          border-radius: 20px;
          border: 1px solid rgba(88,166,255,0.1);
        ">
          <span style="font-size: 11px; font-weight: 600; color: #94a3b8;">
            ${allDraws.length} draws · 
            <span style="color: #58a6ff;">${totalPages}</span> pages
          </span>
        </div>
      </div>
      
      <!-- Legend -->
      <div style="
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 0 12px 0;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        margin-bottom: 14px;
      ">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="
            display: inline-block;
            width: 12px;
            height: 12px;
            background: rgba(255,157,0,0.3);
            border-radius: 4px;
            border: 1px solid #ff9d00;
          "></span>
          <span style="font-size: 9px; color: #94a3b8;">Drawn Number</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="
            display: inline-block;
            width: 12px;
            height: 12px;
            background: rgba(88,166,255,0.2);
            border-radius: 4px;
            border: 1px solid #58a6ff;
          "></span>
          <span style="font-size: 9px; color: #94a3b8;">Played This Week</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="
            display: inline-block;
            width: 12px;
            height: 12px;
            background: rgba(50,215,75,0.15);
            border-radius: 4px;
            border: 1px solid #32d74b;
          "></span>
          <span style="font-size: 9px; color: #94a3b8;">Hit Count</span>
        </div>
      </div>
      
      <!-- Carousel -->
      <div id="${carouselId}" style="
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        display: flex;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        gap: 20px;
        padding: 4px 2px 12px 2px;
      ">
        ${pagesHtml.join('')}
      </div>
      
      <!-- Footer -->
      <div style="
        font-size: 8px;
        color: #475569;
        text-align: center;
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(255,255,255,0.02);
      ">
        ◀️▶️ Swipe To View • ${allDraws.length} draws this week • Showing historical permutations
      </div>
    </div>
    
    <script>
      (function() {
        var container = document.getElementById('${carouselId}');
        var dots = document.querySelectorAll('#${carouselId}-dots .pick4-dot');
        var prevBtn = container.parentElement.querySelector('.pick4-prev');
        var nextBtn = container.parentElement.querySelector('.pick4-next');
        var currentIndex = 0;
        var totalSlides = ${totalPages};
        
        function updateDots() {
          dots.forEach(function(dot, idx) {
            if (idx === currentIndex) {
              dot.style.background = '#58a6ff';
              dot.style.width = '20px';
              dot.style.borderRadius = '4px';
            } else {
              dot.style.background = '#334155';
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
            container.scrollTo({ left: index * (slideWidth + 20), behavior: 'smooth' });
          }
          updateDots();
        }
        
        function handleScroll() {
          var slideWidth = container.children[0] ? container.children[0].offsetWidth : 0;
          var scrollPosition = container.scrollLeft;
          var newIndex = Math.round(scrollPosition / (slideWidth + 20));
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
          if (prevBtn) prevBtn.addEventListener('click', function() { scrollToSlide(currentIndex - 1); });
          if (nextBtn) nextBtn.addEventListener('click', function() { scrollToSlide(currentIndex + 1); });
        }
        
        updateDots();
        setTimeout(function() { scrollToSlide(0); }, 100);
      })();
    </script>
  `;
}
////////END OF PK4 C.WKS PLAY/////////////

/////////////////////////////////////////
// =======================================
// RENDER PICK 4 DIGIT FREQUENCY TRACKER - ENHANCED
// With Current Week & Previous Week Integration (Internal)
// =======================================
function renderPick4DigitTracker(title, weeksData, currentCycleNumber) {
  // Define digit colors
  const numberColors = {
    0: "#6c757d", 1: "#ff6b6b", 2: "#ffa94d", 3: "#ffd43b", 
    4: "#69db7c", 5: "#38d9a9", 6: "#4dabf7", 7: "#9775fa", 
    8: "#f783ac", 9: "#ff922b"
  };
  
  if (!weeksData || weeksData.length === 0) {
    return '<div class="table-wrapper"><div class="table-header" style="background:#334155;"><span>No Pick 4 data available</span></div></div>';
  }
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    let pa = a.startDate.split(" ");
    let pb = b.startDate.split(" ");
    return new Date(pa[2] + "-" + pa[1] + "-" + pa[0]) - new Date(pb[2] + "-" + pb[1] + "-" + pb[0]);
  });
  
  // Get current week and previous week
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : null;
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  const now = new Date();
  const todayIdx = now.getDay();
  
  function getDraw(week, dayName, slot) {
    if (!week) return null;
    const day = week.days.find(d => d.dayName === dayName);
    if (!day) return null;
    const val = day.draws[slot];
    return val && val !== "-" && val !== "PENDING" && val !== "HOLIDAY" ? val.toString() : null;
  }
  
  // ====================================
  // GET CURRENT WEEK DRAWS
  // =====================================
  function getCurrentWeekDraws() {
    const draws = [];
    if (!currentWeek) return draws;
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(currentWeek, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          draws.push({ draw: draw, digits: digits, day: dayNames[d], slot: slot });
        }
      }
    }
    return draws;
  }
  
  // ===================================
  // GET PREVIOUS WEEK DRAWS (same days as current week)
  // ===================================
  function getPreviousWeekDraws() {
    const draws = [];
    if (!previousWeek) return draws;
    for (let d = 0; d <= todayIdx; d++) {
      for (const slot of slots) {
        const draw = getDraw(previousWeek, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          draws.push({ draw: draw, digits: digits, day: dayNames[d], slot: slot });
        }
      }
    }
    return draws;
  }
  
  const currentWeekDraws = getCurrentWeekDraws();
  const previousWeekDraws = getPreviousWeekDraws();
  
  // ===================================
  // BUILD TIMELINE WITH ALL DRAWS
  // ===================================
  const timeline = [];
  for (const week of sortedWeeks) {
    const weekStart = new Date(week.startDate);
    for (let d = 0; d < dayNames.length; d++) {
      const drawDate = new Date(weekStart);
      drawDate.setDate(weekStart.getDate() + d);
      for (const slot of slots) {
        const draw = getDraw(week, dayNames[d], slot);
        if (draw) {
          const digits = draw.replace(/\D/g, '').split('').map(Number);
          for (const digit of digits) {
            if (!isNaN(digit) && digit >= 0 && digit <= 9) {
              timeline.push({
                digit: digit,
                date: drawDate,
                day: dayNames[d],
                slot: slot,
                timestamp: drawDate.getTime(),
                draw: draw,
                week: week
              });
            }
          }
        }
      }
    }
  }
  
  timeline.sort((a, b) => a.timestamp - b.timestamp);
  
  if (timeline.length === 0) {
    return '<div class="table-wrapper"><div class="table-header" style="background:#334155;"><span>No Pick 4 digit data available</span></div></div>';
  }
  
  // =====================================
  // CALCULATE DIGIT FREQUENCY
  // =====================================
  const digitFrequency = {};
  const currentWeekFrequency = {};
  const previousWeekFrequency = {};
  for (let i = 0; i <= 9; i++) {
    digitFrequency[i] = 0;
    currentWeekFrequency[i] = 0;
    previousWeekFrequency[i] = 0;
  }
  
  timeline.forEach(entry => {
    digitFrequency[entry.digit] = (digitFrequency[entry.digit] || 0) + 1;
  });
  
  currentWeekDraws.forEach(draw => {
    draw.digits.forEach(digit => {
      currentWeekFrequency[digit] = (currentWeekFrequency[digit] || 0) + 1;
    });
  });
  
  previousWeekDraws.forEach(draw => {
    draw.digits.forEach(digit => {
      previousWeekFrequency[digit] = (previousWeekFrequency[digit] || 0) + 1;
    });
  });
  
  // ====================================
  // CALCULATE DAYS SINCE LAST APPEARANCE
  // ====================================
  const today = new Date();
  const daysSinceLast = {};
  for (let i = 0; i <= 9; i++) {
    const lastEntry = [...timeline].reverse().find(e => e.digit === i);
    if (lastEntry) {
      const daysDiff = Math.floor((today - lastEntry.date) / (1000 * 60 * 60 * 24));
      daysSinceLast[i] = daysDiff;
    } else {
      daysSinceLast[i] = 99;
    }
  }
  
  // =====================================
  // CALCULATE AVERAGE GAP WITH RECENT WEIGHTING
  // ====================================
  const avgGap = {};
  for (let i = 0; i <= 9; i++) {
    const entries = timeline.filter(e => e.digit === i);
    if (entries.length < 2) {
      avgGap[i] = 14;
    } else {
      // Weight recent gaps more heavily (last 10 appearances)
      const recentEntries = entries.slice(-10);
      let totalGap = 0;
      let weightTotal = 0;
      for (let j = 1; j < recentEntries.length; j++) {
        const gap = Math.floor((recentEntries[j].date - recentEntries[j-1].date) / (1000 * 60 * 60 * 24));
        const weight = 1 + (j / recentEntries.length); // Recent gaps get higher weight
        totalGap += gap * weight;
        weightTotal += weight;
      }
      avgGap[i] = Math.round(totalGap / weightTotal);
    }
  }
  
  // ======================================
  // ENHANCED CONFIDENCE SCORE - WITH CURRENT & PREVIOUS WEEK FACTORS
  // ====================================
  const confidence = {};
  const trend = {};
  const trendArrow = {};
  
  for (let i = 0; i <= 9; i++) {
    const days = daysSinceLast[i];
    const avg = avgGap[i];
    const currentWk = currentWeekFrequency[i] || 0;
    const prevWk = previousWeekFrequency[i] || 0;
    const total = digitFrequency[i] || 1;
    
    // Base confidence from historical pattern
    let baseConf = 0;
    if (days === 0) {
      baseConf = 0;
    } else if (avg === 0) {
      baseConf = 50;
    } else {
      const ratio = days / avg;
      if (ratio >= 2) baseConf = Math.min(100, Math.round(ratio * 50));
      else if (ratio >= 1.5) baseConf = Math.min(95, Math.round(70 + (ratio - 1.5) * 50));
      else if (ratio >= 1) baseConf = Math.min(85, Math.round(50 + (ratio - 1) * 40));
      else baseConf = Math.min(49, Math.round(ratio * 50));
    }
    
    // Current week boost: if digit played this week, confidence drops (recently played)
    // If digit hasn't played this week but did last week, confidence rises
    let weekBoost = 0;
    let trendLabel = 'STABLE';
    let arrow = '➡️';
    
    if (currentWk > 0) {
      // Played this week - lower confidence (might not repeat)
      weekBoost = -Math.min(20, currentWk * 5);
      trendLabel = 'RECENT';
      arrow = '🔽';
    } else if (prevWk > 0) {
      // Played last week but not this week - could be due
      weekBoost = Math.min(25, prevWk * 8);
      trendLabel = 'DUE';
      arrow = '🔼';
    } else {
      // Not played in either week - watch
      weekBoost = 10;
      trendLabel = 'WATCH';
      arrow = '⏳';
    }
    
    // Frequency boost: if digit is historically frequent, add small boost
    const freqRatio = total / (timeline.length / 10);
    const freqBoost = Math.min(10, Math.round((freqRatio - 0.5) * 20));
    
    // Calculate final confidence
    let finalConf = baseConf + weekBoost + freqBoost;
    finalConf = Math.max(0, Math.min(100, finalConf));
    confidence[i] = finalConf;
    
    // Determine status
    let statusLabel = 'RECENT';
    let statusColor = '#32d74b';
    
    if (currentWk > 0) {
      statusLabel = 'RECENT';
      statusColor = '#32d74b';
    } else if (days > avg * 1.5 && prevWk > 0) {
      statusLabel = '🔥 DUE NOW';
      statusColor = '#ff453a';
    } else if (days > avg * 1.2) {
      statusLabel = 'HEATING UP';
      statusColor = '#ff9f0a';
    } else if (days > avg * 0.8 && prevWk > 0) {
      statusLabel = '👀 WATCHING';
      statusColor = '#ffd60a';
    } else if (days > avg * 0.5) {
      statusLabel = '📊 MONITORING';
      statusColor = '#58a6ff';
    } else {
      statusLabel = '✅ RECENT';
      statusColor = '#32d74b';
    }
    
    // Add arrow indicator
    if (currentWk > 0 && prevWk > 0 && currentWk > prevWk) {
      trendLabel = '↑ HOT';
      arrow = '🔥';
    } else if (currentWk > 0 && prevWk > 0 && currentWk < prevWk) {
      trendLabel = '↓ COOL';
      arrow = '❄️';
    } else if (currentWk > 0 && prevWk === 0) {
      trendLabel = '↗ NEW';
      arrow = '🆕';
    } else if (currentWk === 0 && prevWk > 0) {
      trendLabel = '↘ DUE';
      arrow = '⏰';
    }
    
    trend[i] = trendLabel;
    trendArrow[i] = arrow;
  }
  
  // ====================================
  // HISTORICAL CYCLE COMPLETION RECORDS
  // ====================================
  function getHistoricalDigitCycles() {
    const cycles = [];
    let cycleDigits = new Set();
    let cycleDrawsList = [];
    let cycleEntries = [];
    
    for (let i = 0; i < timeline.length; i++) {
      cycleDigits.add(timeline[i].digit);
      cycleDrawsList.push(timeline[i]);
      if (!cycleEntries.find(e => e.draw === timeline[i].draw && e.date === timeline[i].date)) {
        cycleEntries.push(timeline[i]);
      }
      
      if (cycleDigits.size === 10) {
        const completionDate = timeline[i].date;
        const lastDigit = timeline[i].digit;
        const lastDraw = timeline[i].draw;
        const totalHits = cycleDrawsList.length;
        
        cycles.push({
          completionDate: completionDate,
          lastDigit: lastDigit,
          lastDraw: lastDraw,
          totalDraws: totalHits
        });
        
        cycleDigits = new Set();
        cycleDrawsList = [];
        cycleEntries = [];
      }
    }
    
    return cycles.slice(-5);
  }
  
  const historicalCycles = getHistoricalDigitCycles();
  
  // ====================================
  // BUILD THE ROWS
  // ====================================
  let rowsHtml = '';
  
  // Sort digits by confidence (highest first)
  const sortedDigits = [0,1,2,3,4,5,6,7,8,9].sort((a, b) => confidence[b] - confidence[a]);
  
  for (const i of sortedDigits) {
    const freq = digitFrequency[i] || 0;
    const days = daysSinceLast[i] || 0;
    const conf = confidence[i] || 0;
    const avg = avgGap[i] || 0;
    const currentWk = currentWeekFrequency[i] || 0;
    const prevWk = previousWeekFrequency[i] || 0;
    const trendLabel = trend[i] || 'STABLE';
    const arrow = trendArrow[i] || '➡️';
    
    // Determine status
    let statusLabel = 'RECENT';
    let statusColor = '#32d74b';
    if (days > avg * 1.5 && prevWk > 0) { statusLabel = '🔥 DUE NOW'; statusColor = '#ff453a'; }
    else if (days > avg * 1.2) { statusLabel = 'HEATING UP'; statusColor = '#ff9f0a'; }
    else if (days > avg * 0.8 && prevWk > 0) { statusLabel = '👀 WATCHING'; statusColor = '#ffd60a'; }
    else if (days > avg * 0.5) { statusLabel = '📊 MONITORING'; statusColor = '#58a6ff'; }
    else { statusLabel = '✅ RECENT'; statusColor = '#32d74b'; }
    
    // Create a progress bar for confidence
    const barWidth = Math.min(conf, 100);
    
    // Show current week vs previous week play count
    const wkDisplay = currentWk > 0 || prevWk > 0 ? 
      `<span style="color: #32d74b;">${currentWk}x</span>${prevWk > 0 ? ` / <span style="color: #64748b;">${prevWk}x</span>` : ''}` : 
      `<span style="color: #64748b;">—</span>`;
    
    rowsHtml += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td class="ls-label" style="font-weight: 700; font-size: 16px; text-align: center; background: rgba(0,0,0,0.2);">
          <span style="background: ${numberColors[i] || '#ffffff'}; color: #000; padding: 2px 8px; border-radius: 4px;">${i}</span>
        </td>
        <td style="text-align: center; font-weight: 700; color: #ffd700;">${freq}</td>
        <td style="text-align: center; font-weight: 700; color: ${days > 14 ? '#ff453a' : '#ffd700'};">${days}d</td>
        <td style="text-align: center; font-weight: 700; color: ${statusColor}; font-size: 11px;">${statusLabel}</td>
        <td style="text-align: center; font-weight: 700; color: #58a6ff; font-size: 11px;">${avg}d</td>
        <td style="text-align: center; font-weight: 700; color: #94a3b8; font-size: 11px;">${wkDisplay}</td>
        <td style="text-align: center; font-weight: 700; color: #ff9d00; font-size: 11px;">${arrow} ${trendLabel}</td>
        <td style="text-align: center; width: 80px;">
          <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; width: 100%; overflow: hidden;">
            <div style="background: ${statusColor}; height: 100%; width: ${barWidth}%; border-radius: 4px; transition: width 0.3s;"></div>
          </div>
          <span style="font-size: 9px; color: #94a3b8;">${conf}%</span>
        </td>
      </tr>
    `;
  }
  
  // =================================
  // BUILD THE HISTORICAL CYCLES HTML
  // =================================
  let historyHtml = '';
  if (historicalCycles.length > 0) {
    let extractedCycle = currentCycleNumber;
    if (!extractedCycle || extractedCycle <= 0) {
      const cycleMatch = title.match(/Cycle\s*(\d+)/i);
      if (cycleMatch && cycleMatch[1]) {
        extractedCycle = parseInt(cycleMatch[1], 10);
      }
    }
    if (!extractedCycle || extractedCycle <= 0) {
      extractedCycle = historicalCycles.length + 1;
    }
    
    const currentCycle = extractedCycle;
    
    const cycleRows = historicalCycles.map((cycle, index) => {
      const positionFromEnd = historicalCycles.length - 1 - index;
      const cycleNumber = currentCycle - 1 - positionFromEnd;
      
      const formatDate = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      };
      
      const completionDateFormatted = formatDate(cycle.completionDate);
      const totalHits = cycle.totalDraws || 0;
      
      const coloredDraw = cycle.lastDraw.split('').map(d => {
        const digit = parseInt(d, 10);
        const color = numberColors[digit] || '#ffffff';
        return `<span style="background: ${color}; color: #000; padding: 2px 4px; border-radius: 3px; margin: 0 1px; font-weight: 700;">${d}</span>`;
      }).join('');
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #ff9d00;">${cycleNumber}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #ffd700;">${totalHits}</td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #fff;">
            <span style="background: ${numberColors[cycle.lastDigit] || '#ffffff'}; color: #000; padding: 2px 8px; border-radius: 4px;">${cycle.lastDigit}</span>
          </td>
          <td style="padding: 6px 8px; text-align: center; font-weight: 700; color: #fff; font-family: monospace; font-size: 14px;">${coloredDraw}</td>
          <td style="padding: 6px 8px; text-align: center; color: #94a3b8; font-size: 10px;">${completionDateFormatted}</td>
        </tr>
      `;
    }).join('');
    
    historyHtml = `
      <div style="margin-top: 15px; border-top: 2px solid rgba(255,157,0,0.2); padding-top: 12px;">
        <div style="font-size: 11px; font-weight: 800; color: #ff9d00; margin-bottom: 8px; text-align: center; letter-spacing: 0.5px;">
          📜 LAST ${historicalCycles.length} DIGIT CYCLES COMPLETED
        </div>
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: rgba(255,255,255,0.05);">
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">CYCLE</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">HITS</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">LAST DIGIT</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">DRAW</th>
                <th style="padding: 6px 8px; text-align: center; color: #94a3b8; font-weight: 700;">DATE</th>
              </tr>
            </thead>
            <tbody>
              ${cycleRows}
            </tbody>
          </table>
        </div>
        <div style="font-size: 7px; color: #64748b; text-align: center; margin-top: 4px;">
          Last 5 completed digit cycles • All 10 digits (0-9) appeared
        </div>
      </div>
    `;
  }
  
  // Calculate total draws
  const totalDraws = timeline.length;
  
  return `
    <div class="table-wrapper">
      <div class="table-header" style="background:#334155;">
        <span>${title}</span>
      </div>
      
      <table class="ls-table">
        <thead>
          <tr class="ls-header-row">
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">DIGIT</td>
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">HITS</td>
            <td style="width:9%; color:#888; font-size:9px; text-align:center;">DAYS</td>
            <td style="width:13%; color:#888; font-size:9px; text-align:center;">STATUS</td>
            <td style="width:8%; color:#888; font-size:9px; text-align:center;">AVG</td>
            <td style="width:12%; color:#888; font-size:9px; text-align:center;">WEEK</td>
            <td style="width:12%; color:#888; font-size:9px; text-align:center;">TREND</td>
            <td style="width:30%; color:#888; font-size:9px; text-align:center;">CONFIDENCE</td>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="td-row" style="background: rgba(255,255,255,0.05);">
            <td colspan="3" style="font-size:10px; color: #aaa;">TOTAL DRAW</td>
            <td colspan="5" style="text-align:right; padding-right:8px; font-size:14px; color: #00f2ff; font-weight:900;">
              n = ${totalDraws}
            </td>
          </tr>
          <tr style="background: #0f172a;">
            <td colspan="8" style="padding: 6px 4px;">
              <div style="display:flex; justify-content: space-around; align-items: center; gap: 2px; flex-wrap: wrap;">
                ${["7plus", "6", "5", "4", "3", "2", "1", "0"].map(c => `
                  <div style="display:flex; align-items:center; gap:3px;">
                    <div class="hit-${c}" style="width:8px; height:8px; border-radius:1px;"></div>
                    <span style="font-size:8px; color:#aaa;">${c === '7plus' ? '7x+' : c + 'x'}</span>
                  </div>
                `).join("")}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      ${historyHtml}
    </div>
  `;
}
/////////////////////////////////////////


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

// ===== DYNAMIC START HEADER FOR LINES & SUITES =====
// Process Play Whe data for cycle tracking
let dynamicStartHeader = "";
let pwCycleNum = 1;
let filteredPW = [];

// Build timeline for Play Whe to track cycles
function buildPlayWheTimeline(weeksData) {
    const pwTimeline = [];
    const slots = ["MOR", "MID", "NON", "EVE"];
    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    if (!weeksData || weeksData.length === 0) return [];
    
    weeksData.forEach(wk => {
        wk.days.forEach(day => {
            slots.forEach(t => {
                let val = String(day.draws[t]);
                let m = val.match(/^(\d+)/);
                if (m && val !== "PENDING" && val !== "-" && val !== "HOLIDAY") {
                    pwTimeline.push({ n: parseInt(m[1]), date: wk.startDate });
                }
            });
        });
    });
    
    return pwTimeline;
}

// Calculate current cycle for Play Whe
function calculateCurrentCycle(weeksData) {
    const pwTimeline = buildPlayWheTimeline(weeksData);
    let cycleNumbers = new Set();
    let cycleStartIndex = 0;
    
    for (let i = 0; i < pwTimeline.length; i++) {
        cycleNumbers.add(pwTimeline[i].n);
        
        if (cycleNumbers.size === 36) {
            cycleStartIndex = i + 1;
            cycleNumbers.clear();
        }
    }
    
    // Get the draws from the current cycle
    const filteredPWLocal = pwTimeline.slice(cycleStartIndex);
    const cycleNum = Math.floor(cycleStartIndex / 36) + 1;
    const startDate = filteredPWLocal[0]?.date || "";
    
    return { 
        filteredPW: filteredPWLocal, 
        cycleNum: cycleNum, 
        startDate: startDate 
    };
}

// Calculate and set the dynamic values
const cycleData = calculateCurrentCycle(pw ? pw.weeks : []);
dynamicStartHeader = cycleData.startDate;
pwCycleNum = cycleData.cycleNum;
filteredPW = cycleData.filteredPW;

// == CAL. HITS & STATS FOR LINES & SUITES 
const lines = {
    1: [1,10,19,28], 
    2: [2,11,20,29], 
    3: [3,12,21,30],
    4: [4,13,22,31], 
    5: [5,14,23,32], 
    6: [6,15,24,33],
    7: [7,16,25,34], 
    8: [8,17,26,35], 
    9: [9,18,27,36]
};

const suites = {
    0: [10,20,30], 
    1: [1,11,21,31], 
    2: [2,12,22,32],
    3: [3,13,23,33], 
    4: [4,14,24,34], 
    5: [5,15,25,35],
    6: [6,16,26,36], 
    7: [7,17,27], 
    8: [8,18,28], 
    9: [9,19,29]
};

// Calculate hit counts for numbers in current cycle
let lsPwTotalHits = {};
if (filteredPW.length > 0) {
    filteredPW.forEach(x => {
        lsPwTotalHits[x.n] = (lsPwTotalHits[x.n] || 0) + 1;
    });
} else {
    // Fallback: calculate from all weeks data
    const allDraws = [];
    if (pw && pw.weeks) {
        pw.weeks.forEach(wk => {
            wk.days.forEach(day => {
                ["MOR", "MID", "NON", "EVE"].forEach(slot => {
                    let val = String(day.draws[slot]);
                    let m = val.match(/^(\d+)/);
                    if (m && val !== "PENDING" && val !== "-" && val !== "HOLIDAY") {
                        allDraws.push(parseInt(m[1]));
                    }
                });
            });
        });
    }
    allDraws.forEach(x => {
        lsPwTotalHits[x] = (lsPwTotalHits[x] || 0) + 1;
    });
}

// Calculate line and suite stats
let lineStats = {};
let suiteStats = {};
Object.keys(lines).forEach(l => {
    lineStats[l] = lines[l].reduce((sum, num) => sum + (lsPwTotalHits[num] || 0), 0);
});
Object.keys(suites).forEach(s => {
    suiteStats[s] = suites[s].reduce((sum, num) => sum + (lsPwTotalHits[num] || 0), 0);
});

// ===== PICK 2 CYCLE CALCULATION =====
let p2DynamicStartHeader = "";
let p2CycleNum = 1;
let filteredP2 = [];

// Build timeline for Pick 2
function buildPick2Timeline(weeksData) {
    const p2Timeline = [];
    const slots = ["MOR", "MID", "NON", "EVE"];
    
    if (!weeksData || weeksData.length === 0) return [];
    
    weeksData.forEach(wk => {
        wk.days.forEach(day => {
            slots.forEach(t => {
                let raw = String(day.draws[t]);
                if (raw && raw !== "PENDING" && raw !== "-" && raw !== "HOLIDAY") {
                    let parts = raw.split(",").map(x => parseInt(x.trim(), 10));
                    parts.forEach(num => {
                        if (!isNaN(num) && num >= 1 && num <= 36) {
                            p2Timeline.push({ n: num, date: wk.startDate });
                        }
                    });
                }
            });
        });
    });
    
    return p2Timeline;
}

// Calculate current cycle for Pick 2
function calculatePick2Cycle(weeksData) {
    const p2Timeline = buildPick2Timeline(weeksData);
    let cycleNumbers = new Set();
    let cycleStartIndex = 0;
    
    for (let i = 0; i < p2Timeline.length; i++) {
        cycleNumbers.add(p2Timeline[i].n);
        
        if (cycleNumbers.size === 36) {
            cycleStartIndex = i + 1;
            cycleNumbers.clear();
        }
    }
    
    const filteredP2Local = p2Timeline.slice(cycleStartIndex);
    const cycleNum = Math.floor(cycleStartIndex / 36) + 1;
    const startDate = filteredP2Local[0]?.date || "";
    
    return { 
        filteredP2: filteredP2Local, 
        cycleNum: cycleNum, 
        startDate: startDate 
    };
}

// Calculate Pick 2 cycle data
const p2CycleData = calculatePick2Cycle(p2 ? p2.weeks : []);
p2DynamicStartHeader = p2CycleData.startDate;
p2CycleNum = p2CycleData.cycleNum;
filteredP2 = p2CycleData.filteredP2;

// Calculate Pick 2 hit counts
let p2TotalHits = {};
if (filteredP2.length > 0) {
    filteredP2.forEach(x => {
        p2TotalHits[x.n] = (p2TotalHits[x.n] || 0) + 1;
    });
} else {
    // Fallback: calculate from all weeks data
    if (p2 && p2.data && p2.weeks) {
        p2.weeks.forEach(wk => {
            wk.days.forEach(day => {
                ["MOR", "MID", "NON", "EVE"].forEach(slot => {
                    let raw = String(day.draws[slot]);
                    if (raw && raw !== "PENDING" && raw !== "-" && raw !== "HOLIDAY") {
                        let parts = raw.split(",").map(x => parseInt(x.trim(), 10));
                        parts.forEach(num => {
                            if (!isNaN(num) && num >= 1 && num <= 36) {
                                p2TotalHits[num] = (p2TotalHits[num] || 0) + 1;
                            }
                        });
                    }
                });
            });
        });
    }
}

// Calculate Pick 2 line and suite stats
let p2LineStats = {};
let p2SuiteStats = {};
Object.keys(lines).forEach(l => {
    p2LineStats[l] = lines[l].reduce((sum, num) => sum + (p2TotalHits[num] || 0), 0);
});
Object.keys(suites).forEach(s => {
    p2SuiteStats[s] = suites[s].reduce((sum, num) => sum + (p2TotalHits[num] || 0), 0);
});

// ===== PICK 4 CYCLE CALCULATION =====
let p4DynamicStartHeader = "";
let p4CycleNum = 1;
let filteredP4 = [];

// Build timeline for Pick 4
function buildPick4Timeline(weeksData) {
    const p4Timeline = [];
    const slots = ["MOR", "MID", "NON", "EVE"];
    
    if (!weeksData || weeksData.length === 0) return [];
    
    weeksData.forEach(wk => {
        wk.days.forEach(day => {
            slots.forEach(t => {
                let raw = String(day.draws[t]);
                if (raw && raw !== "PENDING" && raw !== "-" && raw !== "HOLIDAY") {
                    // Pick 4 draws are typically 8 digits (4 pairs)
                    let clean = raw.replace(/\s/g, '');
                    if (clean.length >= 2) {
                        let pairs = clean.match(/.{2}/g);
                        if (pairs) {
                            pairs.forEach(pair => {
                                let num = parseInt(pair, 10);
                                if (!isNaN(num) && num >= 1 && num <= 36) {
                                    p4Timeline.push({ n: num, date: wk.startDate });
                                }
                            });
                        }
                    }
                }
            });
        });
    });
    
    return p4Timeline;
}

// Calculate current cycle for Pick 4
function calculatePick4Cycle(weeksData) {
    const p4Timeline = buildPick4Timeline(weeksData);
    let cycleNumbers = new Set();
    let cycleStartIndex = 0;
    
    for (let i = 0; i < p4Timeline.length; i++) {
        cycleNumbers.add(p4Timeline[i].n);
        
        if (cycleNumbers.size === 36) {
            cycleStartIndex = i + 1;
            cycleNumbers.clear();
        }
    }
    
    const filteredP4Local = p4Timeline.slice(cycleStartIndex);
    const cycleNum = Math.floor(cycleStartIndex / 36) + 1;
    const startDate = filteredP4Local[0]?.date || "";
    
    return { 
        filteredP4: filteredP4Local, 
        cycleNum: cycleNum, 
        startDate: startDate 
    };
}

// Calculate Pick 4 cycle data
const p4CycleData = calculatePick4Cycle(p4 ? p4.weeks : []);
p4DynamicStartHeader = p4CycleData.startDate;
p4CycleNum = p4CycleData.cycleNum;
filteredP4 = p4CycleData.filteredP4;

// Calculate Pick 4 hit counts
let p4TotalHits = {};
if (filteredP4.length > 0) {
    filteredP4.forEach(x => {
        p4TotalHits[x.n] = (p4TotalHits[x.n] || 0) + 1;
    });
} else {
    // Fallback: calculate from all weeks data
    if (p4 && p4.data && p4.weeks) {
        p4.weeks.forEach(wk => {
            wk.days.forEach(day => {
                ["MOR", "MID", "NON", "EVE"].forEach(slot => {
                    let raw = String(day.draws[slot]);
                    if (raw && raw !== "PENDING" && raw !== "-" && raw !== "HOLIDAY") {
                        let clean = raw.replace(/\s/g, '');
                        if (clean.length >= 2) {
                            let pairs = clean.match(/.{2}/g);
                            if (pairs) {
                                pairs.forEach(pair => {
                                    let num = parseInt(pair, 10);
                                    if (!isNaN(num) && num >= 1 && num <= 36) {
                                        p4TotalHits[num] = (p4TotalHits[num] || 0) + 1;
                                    }
                                });
                            }
                        }
                    }
                });
            });
        });
    }
}

// Calculate Pick 4 line and suite stats
let p4LineStats = {};
let p4SuiteStats = {};
Object.keys(lines).forEach(l => {
    p4LineStats[l] = lines[l].reduce((sum, num) => sum + (p4TotalHits[num] || 0), 0);
});
Object.keys(suites).forEach(s => {
    p4SuiteStats[s] = suites[s].reduce((sum, num) => sum + (p4TotalHits[num] || 0), 0);
});

//=========================================
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
      return 'style="background:' + color + '; color:#000; font-weight:bold; border-radius:50%; display:inline-block; width:22px; height:22px; line-height:22px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.1);"';
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
              html += "<span style='font-weight:bold; color:#333; font-size:10px;'>" + displayVal + "</span>";
            } else if (gameType === 'p4') {
              html += "<span style='font-weight:bold; color:#333; font-family:monospace; font-size:10px;'>" + displayVal + "</span>";
            } else {
              html += "<span style='font-weight:bold; color:#333;'>" + displayVal + "</span>";
            }
          } else if (isCurrent && (isFuture || !hasValue)) {
            // Current week: future draws or pending slots → show "..."
            html += "<span style='color:#aaa; font-size:10px;'>...</span>";
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
///////////////////////////////////////////

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
      font-size: 10px; 
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
      font-size: 10px; 
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
      
/* ===== TABLE STYLES ===== */
.table-wrapper { 
    margin-bottom: 9px; 
    border-radius: 12px; 
    overflow: hidden; 
    border: 1px solid rgba(255,255,255,0.1); 
    background: var(--card); 
}

.table-header { 
    background: rgba(255,255,255,0.1); 
    padding: 8px; 
    font-size: 12px; 
    font-weight: 900; 
    color: var(--accent); 
    display: flex; 
    justify-content: space-between; 
}

.table-header.current-header {
    border-left: 4px solid #00ff88;
    background: rgba(0,255,136,0.1);
}

table { 
    width: 100%; 
    border-collapse: collapse; 
}

th { 
    font-size: 11px; 
    color: var(--text-dim); 
    padding: 8px; 
}

td { 
    padding: 8px 4px; 
    text-align: center; 
    border-bottom: 1px solid rgba(255,255,255,0.05); 
    font-size: 15px; 
    font-weight: 800; 
}

/* ===== LS TABLE (Lines & Suites) ===== */
.ls-table td { 
    font-size: 13px; 
}

.ls-label { 
    background: #00f2ff !important; 
    color: #000 !important; 
    width: 35px; 
}

.ls-count { 
    background: #ff375f33 !important; 
    color: #ff375f !important; 
    width: 35px; 
}

.ls-header-row td {
    color: #888; 
    font-size: 10px; 
}

/* ===== HEAT MAP CELLS ===== */
.heat-grid { 
    display: grid; 
    grid-template-columns: repeat(6, 1fr); 
    gap: 5px; 
    padding: 10px; 
}

.heat-cell { 
    aspect-ratio: 1/1; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    border-radius: 6px; 
    position: relative; 
    overflow: hidden; 
    border: 1px solid rgba(255,255,255,0.05); 
}

.hit-0 { background: #fff !important; color: #000 !important; }
.hit-1 { background: #ffd60a !important; color: #000 !important; }
.hit-2 { background: #ff9f0a !important; color: #000 !important; }
.hit-3 { background: #ff375f !important; color: #fff !important; }
.hit-4 { background: #5856d6 !important; color: #fff !important; }
.hit-5 { background: #007aff !important; color: #fff !important; }
.hit-6 { background: #32d74b !important; color: #000 !important; }
.hit-7plus { background: #bf5af2 !important; color: #fff !important; }

/* ===== DAY LABEL ===== */
.day-label { 
    color: var(--accent); 
    font-size: 11px; 
}

.current-day { 
    background: rgba(255, 157, 0, 0.15) !important; 
    color: var(--accent) !important; 
}

/* ===== BRANDING ===== */
.branding { 
    background: #ff9d00; 
    color: #000; 
    text-align: center; 
    padding: 5px; 
    font-weight: 900; 
    margin-top: 10px;
}
    </style>
  </head>
  <body>
    <div class="nav-scroll">
      <button class="tab active" onclick="sw('pw', this)">PLAY WHE <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('p2', this)">PICK 2 <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('p4', this)">PICK 4 <br> Day to Day <br> Chart</button>
      <button class="tab" onclick="sw('cp', this)">CASH POT <br> Week to Week <br> Chart</button>
      <button class="tab" onclick="sw('w4l', this)">WIN 4 LIFE <br> Month to Month <br> Chart</button>
      <button class="tab" onclick="sw('p5', this)">LOTTO PLUS <br> Month to Month <br> Chart</button>
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
  <!----- D WHE WHE WHITE BOARD ----->
  ${renderPlayWheWhiteBoardv2(pw ? pw.weeks : [])}
  <br>
  <!-- PlayWhe Full Screen Chart -->
  ${playWheChartOnly(pw ? pw.weeks : [])}
  <br>
<!-- 1/16, 1/8, 1/9, 1/7, 1/5 Charts v2-->
  ${renderPlayWheFiveChartsv2(pw ? pw.weeks : [])}
  <br>
  <!-- Day To Day Carousel Container -->
  ${renderCarouselWithCurrentGrid(pw, "pw")}
  <br>
  <!---- HOT or COLD Chart Analysis ---->
  ${renderPlayWheHotColdMarksEnhanced(pw ? pw.weeks : [])}
  <br>
  <!-- Calendar Chart Play Container -->
  ${renderCalendarMonthDisplay(pw ? pw.weeks : [])}
  <br>
  <!-- Chart Play Mapping Container -->
${renderChartPlayMapping(pw ? pw.weeks : [])}
  <br>
  <!-- PlayWhe Chart Mapping Container -->
  ${renderPlayWheChartMapping(pw ? pw.weeks : [])}
  <br>
  <!-- Chart Play Analysis Container -->
  ${generateChartPlayAnalysis(pw ? pw.weeks : [])}
  <br>
  <!-- PlayWhe Shelf Marks Container -->
  ${renderShelfContainer(pw ? pw.weeks : [])}
  <br>
  <!-- Lines Chart Heat Map Tracking -->
  ${renderLSChart(
  `PLAY WHE LINES CHART (${dynamicStartHeader} — NOW) • Cycle ${pwCycleNum} • ${filteredPW.length}/36`,
  "L", lines, lineStats, lsPwTotalHits, filteredPW.length, pw ? pw.weeks : [], "PLAY_WHE"
)}
  <br>
  <!-- Missing Lines & Suites Container -->
  ${renderIntelligentAnalysis(pw ? pw.weeks : [])}
  <br>
  <!-- PlayWhe Readout Report Container -->
  ${generatePlayWheReadout(pw ? pw.weeks : [])}
  <br>
  <!--Monthly Carousel Insight Container-->
  ${renderMonthlyCarousel(pw, "P2WHE", "PLAY WHE")}
  <br>

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
  ${renderPick2CurrentWeekPlays(p2 ? p2.weeks : [])}
  <br>
  ${renderLSChart(
  `PICK 2 LINES CHART (${p2DynamicStartHeader} — NOW) • Cycle ${p2CycleNum} • ${filteredP2.length}/36`,
  "L", lines, p2LineStats, p2TotalHits, filteredP2.length, p2 ? p2.weeks : [], "PICK_2"
)}
  <br>
  ${renderMonthlyCarousel(p2, "PIKII", "PICK 2")}
  <br>
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
    ${renderPick4DigitTracker(
    `DIGIT FREQUENCY (${p4DynamicStartHeader} — NOW) • Cycle ${p4CycleNum} • ${filteredP4.length}/36`,
    p4.weeks,
    p4CycleNum
  )}
  <br>
  ${renderPick4CurrentWeekPlays(p4 ? p4.weeks : [])}
    <br>
  ${renderMonthlyCarousel(p4, "PIKIV", "PICK 4")}
  <br>
  ${renderComingUnderModalWeekly(p4 ? p4.weeks : [], "PICK 4", "PIKIV")}
</div>

<div id="cp" class="container">
  ${renderCarouselWithCurrentCashPot(cp)}
  <br>
  ${renderCashPotFrequencyChart(cp)}
  <br>
  ${renderMonthlyCarousel(cp, "CASHPOT", "CASH POT")}
</div>

<div id="p5" class="container">
  ${renderCarouselWithCurrentLotto(lotto)}
  <br>
  ${renderLottoFrequencyChart(lotto)}
  <br>
  ${renderMonthlyCarousel(lotto, "LOTTO", "LOTTO PLUS")}
</div>

<div id="w4l" class="container">
  ${renderCarouselWithCurrentWinForLife(w4l)}
  <br>
  ${renderWinForLifeFrequencyChart(w4l)}
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
//////////////////////////////////////////

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
///////////////////////////////////////////

// ======================================
// RENDER PLAY WHE WITH CAROUSEL
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
  <div style="text-align:center; padding:3px 3px; opacity:0.18; font-weight:600; letter-spacing:2px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:12px;">CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS </p></div>
  <script>initPrevCarousel('${containerId}', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}
//////////////////////////////////////////

// ======================================
// RENDER PICK 2 WITH CAROUSEL 
// (Bidirectional Highlighting)
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
///////////////////////////////////////////

// =======================================
// RENDER PICK 4 WITH CAROUSEL 
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
  <div style="text-align:center; padding:3px 3px; opacity:0.18; font-weight:600; letter-spacing:2px; pointer-events:none; user-select:none;"><p style="margin:0; font-size:12px;">CODEWITHGLASGOW ©️ CWG CHARTS ANALYSIS</p></div>
  <script>initPrevCarousel('p4', ${previousWeeks.length});</script>
  ` : '<div style="text-align:center;padding:20px;color:#64748b;">📅 No previous weeks available</div>';
  
  return carouselHtml + currentHtml;
}
//////////////////////////////////////////

// ==================================
// RENDER CASH POT WITH CAROUSEL
// ==================================
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
      // Check if this is the current week
      const isCurrentWeek = week.isCurrentWeek === true;
      
      const validDays = week.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate)) {
            // For current week, include all days (past and future)
            if (isCurrentWeek) {
              return true;
            }
            // For past weeks, only include days that have passed
            return drawDate <= today;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        weeksWithDays.push({
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          isCurrentWeek: isCurrentWeek,
          days: validDays,
          timestamp: validDays[0]?.date ? new Date(validDays[0].date).getTime() : 0
        });
      }
    }
  });
  
  if (weeksWithDays.length === 0) {
    return '<div class="empty-state" style="text-align:center;padding:40px;color:#94a3b8;">📡 No draws for current period</div>';
  }
  
  // Sort by timestamp
  weeksWithDays.sort((a, b) => a.timestamp - b.timestamp);
  
  // Find current week (either marked as current or the last week)
  let currentWeekIndex = weeksWithDays.findIndex(w => w.isCurrentWeek);
  if (currentWeekIndex === -1) {
    currentWeekIndex = weeksWithDays.length - 1;
  }
  
  const previousWeeks = weeksWithDays.slice(0, currentWeekIndex);
  const currentWeek = weeksWithDays[currentWeekIndex];
  
  // Helper function to determine what to display for a Cash Pot day
  function getCashPotDisplay(day) {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isScheduled = day.date === "SCHEDULED" || day.status === "scheduled";
    const isPending = day.status === "pending" || day.status === "scheduled";
    
    // Check if ANY numbers exist in the draws AND they're not PENDING
    let hasActualNumbers = false;
    let numberArray = [];
    for (let n = 1; n <= 5; n++) {
      let val = draws[`Num${n}`];
      // Only count as actual number if it's NOT "PENDING" or empty
      if (val && 
          val !== "-" && 
          val !== "PENDING" && 
          val !== "SCHEDULED" && 
          val.toString().trim() !== "" && 
          val.toString().trim() !== "SCHEDULED") {
        hasActualNumbers = true;
        numberArray.push(trimLeadingZeros(val.toString().trim()));
      }
    }
    
    // Determine what to display
    let numberGrid = '';
    
    // Check if it's a holiday (missing)
    if (isMissing) {
      numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
    } 
    // Check if it's a scheduled/pending draw (future)
    else if (isScheduled || isPending) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    // Check if there are actual numbers to display
    else if (hasActualNumbers && numberArray.length > 0) {
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      // Add special balls if present
      if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "" && special.multiplier !== "PENDING") {
        numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
      }
    } 
    // No numbers - check if it's a future or past draw
    else if (day.date && day.date !== "SCHEDULED") {
      const drawDate = new Date(day.date);
      const now = new Date();
      // Check if the draw time has passed (Cash Pot draws in the evening)
      // Cash Pot draws at 6:30 PM, so if it's before 6:30 PM, it's still pending
      const isEvening = now.getHours() >= 18 && now.getMinutes() >= 30;
      
      if (drawDate > now || (drawDate.toDateString() === now.toDateString() && !isEvening)) {
        // Future draw or today before evening draw - show "AWAITING DRAW"
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      } else {
        // Past draw with no numbers - show "HOLIDAY"
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      }
    } 
    // Fallback
    else {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    
    return numberGrid;
  }
  
  // Helper function to render a week's days
  function renderWeekDays(week, isCurrent = false) {
    let daysHtml = '';
    week.days.forEach(day => {
      const numberGrid = getCashPotDisplay(day);
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      // For current week, add a visual indicator for today
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isToday = dayName.toLowerCase() === todayName.toLowerCase();
      const rowStyle = isCurrent && isToday ? 'background: rgba(0, 255, 136, 0.1);' : '';
      
      daysHtml += `
        <tr style="${rowStyle}">
          <td class="day-label" style="padding-bottom:10px; ${isCurrent && isToday ? 'color: #00ff88;' : ''}">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    return daysHtml;
  }
  
  // Build previous weeks carousel
  const prevSlidesHtml = previousWeeks.reverse().map((week, idx) => {
    const weekNum = previousWeeks.length - idx;
    const weekRange = week.startDate ? `Wk ${week.weekNumber} (${week.startDate})` : `Week ${week.weekNumber}`;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ P.Wk ${weekNum}</span>
          <span>${weekRange}</span>
        </div>
        <table>${renderWeekDays(week)}</table>
      </div>
    </div>`;
  }).join('');
  
  // Build current week
  const currentWeekRange = currentWeek.startDate ? `Wk ${currentWeek.weekNumber} (${currentWeek.startDate})` : `Week ${currentWeek.weekNumber}`;
  
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT WEEK ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentWeekRange}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${renderWeekDays(currentWeek, true)}</table>
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
//////////////////////////////////////////

// ====================================
// RENDER LOTTO WITH CAROUSEL 
// ====================================
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
      // Check if this is the current month
      const isCurrentMonth = month.isCurrentMonth === true || month.month === "Current";
      
      const validDays = month.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate)) {
            // For current month, include all days (past and future)
            if (isCurrentMonth) {
              return true;
            }
            // For past months, only include days that have passed
            return drawDate <= today;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        processedMonths.push({
          monthName: month.month || "",
          isCurrentMonth: isCurrentMonth,
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
  
  // Find current month
  let currentMonthIndex = processedMonths.findIndex(m => m.isCurrentMonth);
  if (currentMonthIndex === -1) {
    currentMonthIndex = processedMonths.length - 1;
  }
  
  const previousMonths = processedMonths.slice(0, currentMonthIndex);
  const currentMonth = processedMonths[currentMonthIndex];
  
  // Helper function to determine what to display for a Lotto day
  function getLottoDisplay(day) {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isScheduled = day.date === "SCHEDULED" || day.status === "scheduled";
    const isPending = day.status === "pending" || day.status === "scheduled";
    
    // Check if ANY numbers exist in the draws AND they're not PENDING
    let hasActualNumbers = false;
    let numberArray = [];
    for (let n = 1; n <= 5; n++) {
      let val = draws[`Num${n}`];
      if (val && 
          val !== "-" && 
          val !== "PENDING" && 
          val !== "SCHEDULED" && 
          val.toString().trim() !== "" && 
          val.toString().trim() !== "SCHEDULED") {
        hasActualNumbers = true;
        numberArray.push(trimLeadingZeros(val.toString().trim()));
      }
    }
    
    // Determine what to display
    let numberGrid = '';
    
    // Check if it's a holiday (missing)
    if (isMissing) {
      numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
    } 
    // Check if it's a scheduled/pending draw (future)
    else if (isScheduled || isPending) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    // Check if there are actual numbers to display
    else if (hasActualNumbers && numberArray.length > 0) {
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      // Add special balls if present
      if (special.powerBall && special.powerBall !== "-" && special.powerBall !== "" && special.powerBall !== "PENDING") {
        numberGrid += `<div class="ball pb">${trimLeadingZeros(special.powerBall.toString())}</div>`;
      }
      if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "" && special.multiplier !== "PENDING") {
        numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
      }
    } 
    // No numbers - check if it's a future or past draw
    else if (day.date && day.date !== "SCHEDULED") {
      const drawDate = new Date(day.date);
      const now = new Date();
      // Lotto Plus draws at 8:30 PM
      const isEvening = now.getHours() >= 20 && now.getMinutes() >= 30;
      
      if (drawDate > now || (drawDate.toDateString() === now.toDateString() && !isEvening)) {
        // Future draw or today before evening draw - show "AWAITING DRAW"
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      } else {
        // Past draw with no numbers - show "HOLIDAY"
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      }
    } 
    // Fallback
    else {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    
    return numberGrid;
  }
  
  // Helper function to render a month's days
  function renderMonthDays(month, isCurrent = false) {
    let daysHtml = '';
    month.days.forEach(day => {
      const numberGrid = getLottoDisplay(day);
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      // For current month, add a visual indicator for today
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isToday = dayName.toLowerCase() === todayName.toLowerCase();
      const rowStyle = isCurrent && isToday ? 'background: rgba(0, 255, 136, 0.1);' : '';
      
      daysHtml += `
        <tr style="${rowStyle}">
          <td class="day-label" style="padding-bottom:10px; ${isCurrent && isToday ? 'color: #00ff88;' : ''}">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    return daysHtml;
  }
  
  // Build previous months carousel
  const prevSlidesHtml = previousMonths.reverse().map((month, idx) => {
    const monthNum = previousMonths.length - idx;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ PREVIOUS MONTH ${monthNum}</span>
          <span>${month.monthName}</span>
        </div>
        <table style="width:100%; border-collapse:collapse;">${renderMonthDays(month)}</table>
      </div>
    </div>`;
  }).join('');
  
  // Build current month (fixed)
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT MONTH ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentMonth.monthName}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${renderMonthDays(currentMonth, true)}</table>
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
//////////////////////////////////////////

// =====================================
// RENDER WIN FOR LIFE WITH CAROUSEL 
// =====================================
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
      // Check if this is the current month
      const isCurrentMonth = month.isCurrentMonth === true || month.month === "Current";
      
      const validDays = month.days.filter(day => {
        if (day.date && day.date !== "SCHEDULED") {
          const drawDate = new Date(day.date);
          if (!isNaN(drawDate)) {
            // For current month, include all days (past and future)
            if (isCurrentMonth) {
              return true;
            }
            // For past months, only include days that have passed
            return drawDate <= today;
          }
        }
        return false;
      });
      
      if (validDays.length > 0) {
        processedMonths.push({
          monthName: month.month || "",
          isCurrentMonth: isCurrentMonth,
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
  
  // Find current month
  let currentMonthIndex = processedMonths.findIndex(m => m.isCurrentMonth);
  if (currentMonthIndex === -1) {
    currentMonthIndex = processedMonths.length - 1;
  }
  
  const previousMonths = processedMonths.slice(0, currentMonthIndex);
  const currentMonth = processedMonths[currentMonthIndex];
  
  // Helper function to determine what to display for a Win For Life day
  function getWinForLifeDisplay(day) {
    const draws = day.draws || {};
    const special = day.special || {};
    const isMissing = day.status === "missing";
    const isScheduled = day.date === "SCHEDULED" || day.status === "scheduled";
    const isPending = day.status === "pending" || day.status === "scheduled";
    
    // Check if ANY numbers exist in the draws AND they're not PENDING
    let hasActualNumbers = false;
    let numberArray = [];
    for (let n = 1; n <= 6; n++) {
      let val = draws[`Num${n}`];
      if (val && 
          val !== "-" && 
          val !== "PENDING" && 
          val !== "SCHEDULED" && 
          val.toString().trim() !== "" && 
          val.toString().trim() !== "SCHEDULED") {
        hasActualNumbers = true;
        numberArray.push(trimLeadingZeros(val.toString().trim()));
      }
    }
    
    // Determine what to display
    let numberGrid = '';
    
    // Check if it's a holiday (missing)
    if (isMissing) {
      numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
    } 
    // Check if it's a scheduled/pending draw (future)
    else if (isScheduled || isPending) {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    // Check if there are actual numbers to display
    else if (hasActualNumbers && numberArray.length > 0) {
      numberArray.forEach(num => {
        numberGrid += `<div class="ball main">${num}</div>`;
      });
      // Add special balls if present
      if (special.cashBall && special.cashBall !== "-" && special.cashBall !== "" && special.cashBall !== "PENDING") {
        numberGrid += `<div class="ball cb">${trimLeadingZeros(special.cashBall.toString())}</div>`;
      }
      if (special.multiplier && special.multiplier !== "-" && special.multiplier !== "" && special.multiplier !== "PENDING") {
        numberGrid += `<div class="ball mult">${special.multiplier}X</div>`;
      }
    } 
    // No numbers - check if it's a future or past draw
    else if (day.date && day.date !== "SCHEDULED") {
      const drawDate = new Date(day.date);
      const now = new Date();
      // Win For Life draws at 7:00 PM
      const isEvening = now.getHours() >= 18 && now.getMinutes() >= 30;
      
      if (drawDate > now || (drawDate.toDateString() === now.toDateString() && !isEvening)) {
        // Future draw or today before evening draw - show "AWAITING DRAW"
        numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
      } else {
        // Past draw with no numbers - show "HOLIDAY"
        numberGrid = '<span class="holiday">🇹🇹 HOLIDAY 🇹🇹</span>';
      }
    } 
    // Fallback
    else {
      numberGrid = '<span class="awaiting">⏳ AWAITING DRAW</span>';
    }
    
    return numberGrid;
  }
  
  // Helper function to render a month's days
  function renderMonthDays(month, isCurrent = false) {
    let daysHtml = '';
    month.days.forEach(day => {
      const numberGrid = getWinForLifeDisplay(day);
      
      const dayName = day.dayName || "";
      const displayDate = day.date || "";
      
      // For current month, add a visual indicator for today
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const isToday = dayName.toLowerCase() === todayName.toLowerCase();
      const rowStyle = isCurrent && isToday ? 'background: rgba(0, 255, 136, 0.1);' : '';
      
      daysHtml += `
        <tr style="${rowStyle}">
          <td class="day-label" style="padding-bottom:10px; ${isCurrent && isToday ? 'color: #00ff88;' : ''}">
            ${dayName.slice(0,3)}
            <div style="font-size:14px;color:#64748b;font-weight:normal;margin-top:2px;">${displayDate}</div>
          </td>
          <td style="text-align:right; padding-right:15px;"><div class="ball-grid">${numberGrid}</div></td>
        </tr>
      `;
    });
    return daysHtml;
  }
  
  // Build previous months carousel
  const prevSlidesHtml = previousMonths.reverse().map((month, idx) => {
    const monthNum = previousMonths.length - idx;
    
    return `
    <div class="carousel-slide">
      <div class="table-wrapper">
        <div class="section-header">
          <span>⌛ PREVIOUS MONTH ${monthNum}</span>
          <span>${month.monthName}</span>
        </div>
        <table>${renderMonthDays(month)}</table>
      </div>
    </div>`;
  }).join('');
  
  // Build current month (fixed)
  const currentHtml = `
  <div class="current-section">
    <div class="current-label">⚜️ CURRENT MONTH ⚜️</div>
    <div class="table-wrapper">
      <div class="section-header current-header">
        <span>📅 ${currentMonth.monthName}</span>
        <span>LIVE RESULTS</span>
      </div>
      <table>${renderMonthDays(currentMonth, true)}</table>
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
//////////////////////////////////////////

// ======================================
// CASH POT FREQUENCY CHART WITH PROBABILITY ANALYSIS
// ======================================
function renderCashPotFrequencyChart(gameData) {
  if (!gameData) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Cash Pot data available</div>';
  }
  
  // Extract weeks data
  let weeksData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    weeksData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    weeksData = gameData;
  }
  
  if (!weeksData || weeksData.length === 0) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Cash Pot data available</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = ["MOR", "MID", "NON", "EVE"];
  
  // Sort weeks chronologically
  const sortedWeeks = [...weeksData].sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate) - new Date(b.startDate);
  });
  
  const currentWeek = sortedWeeks[sortedWeeks.length - 1];
  const previousWeek = sortedWeeks.length >= 2 ? sortedWeeks[sortedWeeks.length - 2] : currentWeek;
  
  // Extract all numbers from the data
  let allNumbers = [];
  let lastPlayed = {};
  let currentWeekNumbers = [];
  let previousWeekNumbers = [];
  
  // Process each week
  sortedWeeks.forEach(week => {
    if (week.days && Array.isArray(week.days)) {
      week.days.forEach(day => {
        if (day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const drawDate = new Date(day.date);
          const draws = day.draws || {};
          
          // Extract numbers 1-5
          for (let n = 1; n <= 5; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 20) {
                allNumbers.push(num);
                if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                  lastPlayed[num] = new Date(drawDate);
                }
                
                // Track current week numbers
                if (week.isCurrentWeek) {
                  currentWeekNumbers.push(num);
                }
                // Track previous week numbers
                if (week === previousWeek) {
                  previousWeekNumbers.push(num);
                }
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate frequency
  const frequency = {};
  for (let i = 1; i <= 20; i++) {
    frequency[i] = 0;
  }
  allNumbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  // Calculate days since last played
  const daysSinceLast = {};
  for (let i = 1; i <= 20; i++) {
    if (lastPlayed[i]) {
      const diffDays = Math.floor((now - lastPlayed[i]) / (1000 * 60 * 60 * 24));
      daysSinceLast[i] = diffDays;
    } else {
      daysSinceLast[i] = 'Never';
    }
  }
  
  // ===================================
  // PROBABILITY ANALYSIS FOR UPCOMING DRAW
  // ===================================
  // Determine next draw time
  const currentHour = now.getHours();
  let nextSlot = "EVE";
  let nextDay = now.getDay();
  let isTomorrow = false;
  
  if (currentHour >= 5 && currentHour < 10) nextSlot = "MID";
  else if (currentHour >= 10 && currentHour < 14) nextSlot = "NON";
  else if (currentHour >= 14 && currentHour < 18) nextSlot = "EVE";
  else {
    nextSlot = "MOR";
    nextDay = (now.getDay() + 1) % 7;
    isTomorrow = true;
  }
  
  const nextDayName = dayNames[nextDay];
  
  // Get historical draws for the same day from previous weeks
  const sameDayDraws = [];
  sortedWeeks.forEach(week => {
    if (week.days) {
      week.days.forEach(day => {
        if (day.dayName === nextDayName && day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const draws = day.draws || {};
          for (let n = 1; n <= 5; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 20) {
                sameDayDraws.push(num);
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate probability scores for each number
  const probabilityScores = {};
  const totalDraws = allNumbers.length || 1;
  const totalSameDay = sameDayDraws.length || 1;
  
  for (let i = 1; i <= 20; i++) {
    let score = 0;
    
    // Factor 1: Historical frequency (30%)
    const freqWeight = (frequency[i] || 0) / totalDraws;
    score += freqWeight * 30;
    
    // Factor 2: Days since last played (25%)
    const days = daysSinceLast[i];
    if (days !== 'Never') {
      const daysWeight = Math.min(days / 30, 1);
      score += daysWeight * 25;
    } else {
      score += 25;
    }
    
    // Factor 3: Same day historical performance (20%)
    const sameDayCount = sameDayDraws.filter(n => n === i).length;
    const sameDayWeight = sameDayCount / totalSameDay;
    score += sameDayWeight * 20;
    
    // Factor 4: Current week trend (15%)
    const currentWeekCount = currentWeekNumbers.filter(n => n === i).length;
    const previousWeekCount = previousWeekNumbers.filter(n => n === i).length;
    let trendWeight = 0;
    if (currentWeekCount === 0 && previousWeekCount > 0) {
      trendWeight = 0.8;
    } else if (currentWeekCount === 0 && previousWeekCount === 0) {
      trendWeight = 0.5;
    } else if (currentWeekCount > 0 && previousWeekCount === 0) {
      trendWeight = 0.3;
    } else if (currentWeekCount > 0 && previousWeekCount > 0) {
      trendWeight = 0.6;
    }
    score += trendWeight * 15;
    
    // Factor 5: Pattern recognition (10%)
    let patternWeight = 0;
    if (currentWeekNumbers.length > 0) {
      for (const num of currentWeekNumbers) {
        const appearsTogether = allNumbers.filter((n, idx) => 
          n === num && idx + 1 < allNumbers.length && allNumbers[idx + 1] === i
        ).length;
        patternWeight += appearsTogether / 10;
      }
    }
    patternWeight = Math.min(patternWeight, 1);
    score += patternWeight * 10;
    
    probabilityScores[i] = Math.min(Math.round(score), 100);
  }
  
  // Get top 20 probability picks (4 rows x 5 numbers)
  const topProbPicks = Object.entries(probabilityScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([num, score]) => ({ num: parseInt(num), score: score }));
  
  // Sort numbers by frequency for main table
  const sortedNumbers = Object.keys(frequency)
    .map(Number)
    .sort((a, b) => frequency[b] - frequency[a]);
  
  const top5 = sortedNumbers.slice(0, 5);
  const bottom5 = sortedNumbers.slice(-5).reverse();
  
  // Color mapping
  const numberColors = {
    1: "#ff6b6b", 2: "#ffa94d", 3: "#ffd43b", 4: "#69db7c", 5: "#38d9a9",
    6: "#4dabf7", 7: "#9775fa", 8: "#f783ac", 9: "#ff922b", 10: "#fab005",
    11: "#82c91e", 12: "#20c997", 13: "#339af0", 14: "#845ef7", 15: "#e599f7",
    16: "#ff8787", 17: "#ffc078", 18: "#ffe066", 19: "#8ce99a", 20: "#63e6be"
  };
  
  // Build the HTML
  let html = `
  <style>
    .frequency-chart {
      background: linear-gradient(145deg, #0f172a, #1a2332);
      border-radius: 16px;
      padding: 16px;
      border: 1px solid rgba(88,166,255,0.1);
      margin-bottom: 12px;
    }
    .frequency-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .frequency-title {
      font-size: 16px;
      font-weight: 800;
      color: #58a6ff;
    }
    .frequency-title span {
      font-size: 11px;
      font-weight: 400;
      color: #64748b;
      margin-left: 8px;
    }
    .frequency-stats {
      font-size: 11px;
      color: #94a3b8;
      background: rgba(88,166,255,0.08);
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(88,166,255,0.1);
    }
    .frequency-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .frequency-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      padding: 8px 4px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.06);
      transition: all 0.2s ease;
    }
    .frequency-cell .number {
      font-size: 20px;
      font-weight: 900;
      display: block;
    }
    .frequency-cell .count {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 2px;
    }
    .frequency-cell .days {
      font-size: 8px;
      color: #64748b;
      margin-top: 1px;
    }
    .frequency-cell.top-ranked {
      border-color: #32d74b;
      background: rgba(50,215,75,0.05);
    }
    .frequency-cell.top-ranked .count {
      color: #32d74b;
    }
    .frequency-cell.bottom-ranked {
      border-color: #ff453a;
      background: rgba(255,69,58,0.05);
    }
    .frequency-cell.bottom-ranked .count {
      color: #ff453a;
    }
    .frequency-rank-label {
      font-size: 8px;
      font-weight: 700;
      padding: 1px 8px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 2px;
    }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    
    .frequency-table-wrap {
      overflow-x: auto;
      margin-top: 4px;
    }
    .frequency-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .frequency-table th {
      background: rgba(255,255,255,0.05);
      padding: 8px 6px;
      text-align: center;
      font-weight: 700;
      color: #94a3b8;
      border-bottom: 2px solid rgba(88,166,255,0.15);
      font-size: 10px;
    }
    .frequency-table td {
      padding: 6px 4px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-weight: 600;
    }
    .frequency-table .num-cell {
      font-weight: 800;
      font-size: 14px;
    }
    .frequency-table .hit-cell {
      font-weight: 700;
    }
    .frequency-bar-wrap {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
      width: 100%;
    }
    .frequency-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }
    .frequency-footer {
      font-size: 8px;
      color: #475569;
      text-align: center;
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
    }
    
    /* Probability Section - Compact */
    .probability-section {
      background: rgba(255,157,0,0.04);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 10px;
      border: 1px solid rgba(255,157,0,0.08);
    }
    .probability-title {
      font-size: 11px;
      font-weight: 700;
      color: #ff9d00;
      text-align: center;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .probability-subtitle {
      font-size: 8px;
      color: #64748b;
      text-align: center;
      margin-bottom: 8px;
    }
    .probability-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }
    .probability-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      padding: 4px 2px;
      text-align: center;
      border: 1px solid rgba(255,157,0,0.1);
      transition: all 0.2s ease;
    }
    .probability-cell:hover {
      transform: scale(1.05);
      border-color: #ff9d00;
      background: rgba(255,157,0,0.05);
    }
    .probability-cell .number {
      font-size: 16px;
      font-weight: 900;
      display: block;
      line-height: 1.2;
    }
    .probability-cell .score {
      font-size: 9px;
      font-weight: 600;
      color: #ff9d00;
    }
    .probability-cell .score-bar {
      width: 100%;
      height: 2px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 2px;
    }
    .probability-cell .score-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }
    .probability-row-label {
      font-size: 7px;
      font-weight: 700;
      color: #64748b;
      text-align: center;
      padding: 2px 0;
      letter-spacing: 0.5px;
    }
    .probability-cell.rank-1 {
      border-color: #ffd700;
      background: rgba(255,215,0,0.06);
    }
    .probability-cell.rank-2 {
      border-color: #c0c0c0;
      background: rgba(192,192,192,0.04);
    }
    .probability-cell.rank-3 {
      border-color: #cd7f32;
      background: rgba(205,127,50,0.04);
    }
    
    /* Probability Factors Footer */
    .probability-factors {
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 8px;
      border: 1px solid rgba(255,255,255,0.04);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 4px 10px;
    }
    .probability-factors .label {
      font-size: 7px;
      font-weight: 700;
      color: #58a6ff;
      letter-spacing: 0.3px;
    }
    .probability-factors .factor {
      font-size: 6px;
      color: #94a3b8;
    }
    .probability-factors .factor .pct {
      font-weight: 700;
    }
    .probability-factors .factor .pct.historical { color: #ff6b6b; }
    .probability-factors .factor .pct.days { color: #ffd93d; }
    .probability-factors .factor .pct.same { color: #6bcb77; }
    .probability-factors .factor .pct.trend { color: #4d96ff; }
    .probability-factors .factor .pct.pattern { color: #9b59b6; }
    
    @media (max-width: 480px) {
      .frequency-grid { grid-template-columns: repeat(4, 1fr); }
      .probability-grid { grid-template-columns: repeat(5, 1fr); }
    }
  </style>
  
  <div class="frequency-chart">
    <div class="frequency-header">
      <div class="frequency-title">
        ♠️ CASH POT FREQUENCY CHART
        <span>1-20</span>
      </div>
      <div class="frequency-stats">
        ${allNumbers.length} total draws
      </div>
    </div>
    
    <!-- Top 5 & Bottom 5 Grid -->
    <div class="frequency-grid">
  `;
  
  // Top 5
  top5.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1">#1</span>' : 
                      idx === 1 ? '<span class="frequency-rank-label rank-2">#2</span>' :
                      idx === 2 ? '<span class="frequency-rank-label rank-3">#3</span>' : '';
    
    html += `
      <div class="frequency-cell top-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  // Bottom 5
  bottom5.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1" style="background:#ff6b6b;color:#fff;">⚠️</span>' : '';
    
    html += `
      <div class="frequency-cell bottom-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  html += `
    </div>
    
    <!-- Full Frequency Table -->
    <div class="frequency-table-wrap">
      <table class="frequency-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NUM</th>
            <th>HITS</th>
            <th>LAST PLAYED</th>
            <th>DAYS</th>
            <th>FREQ %</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  const maxFreq = Math.max(...Object.values(frequency), 1);
  
  sortedNumbers.forEach(num => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const percent = Math.round((count / Math.max(allNumbers.length, 1)) * 100);
    const barWidth = Math.round((count / maxFreq) * 100);
    const days = daysSinceLast[num];
    const isTop = top5.includes(num);
    const isBottom = bottom5.includes(num);
    const rowClass = isTop ? 'style="background: rgba(50,215,75,0.03);"' : 
                     isBottom ? 'style="background: rgba(255,69,58,0.03);"' : '';
    
    html += `
      <tr ${rowClass}>
        <td style="color:#64748b;font-size:10px;">${sortedNumbers.indexOf(num) + 1}</td>
        <td class="num-cell" style="color:${color};">${num}</td>
        <td class="hit-cell" style="color:${count >= 10 ? '#32d74b' : count >= 5 ? '#ffd700' : '#94a3b8'};">${count}x</td>
        <td style="font-size:10px;color:#94a3b8;">${days !== 'Never' ? new Date(lastPlayed[num]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'}</td>
        <td style="font-size:10px;font-weight:700;color:${days !== 'Never' && days > 14 ? '#ff453a' : '#94a3b8'};">${days !== 'Never' ? days + 'd' : '—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:9px;color:#64748b;min-width:30px;">${percent}%</span>
            <div class="frequency-bar-wrap">
              <div class="frequency-bar" style="width:${barWidth}%;background:${color};"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    
    <!-- PROBABILITY SECTION -->
    <div class="probability-section">
      <div class="probability-title">♠️ CASH POT: PROBABILITY ANALYSIS</div>
      <div class="probability-subtitle">
        Next Draw: ${nextDayName} ${nextSlot} • ${!isTomorrow ? 'Today' : 'Tomorrow'}
      </div>
  `;
  
  // Split top 20 into 4 rows of 5
  for (let row = 0; row < 4; row++) {
    const rowStart = row * 5;
    const rowEnd = rowStart + 5;
    const rowPicks = topProbPicks.slice(rowStart, rowEnd);
    
    if (rowPicks.length > 0) {
      html += `
        <div style="margin-bottom: ${row < 3 ? '4px' : '0'};">
          <div class="probability-row-label">${row === 0 ? '🏆 TOP TIER' : row === 1 ? '⭐ HIGH' : row === 2 ? '▫️ MEDIUM' : '👀 WATCH'}</div>
          <div class="probability-grid">
      `;
      
      rowPicks.forEach((pick, idx) => {
        const color = numberColors[pick.num] || '#ffffff';
        const rankClass = idx === 0 && row === 0 ? 'rank-1' : 
                         idx === 1 && row === 0 ? 'rank-2' : 
                         idx === 2 && row === 0 ? 'rank-3' : '';
        
        html += `
          <div class="probability-cell ${rankClass}">
            <span class="number" style="color: ${color};">${pick.num}</span>
            <div class="score">${pick.score}%</div>
            <div class="score-bar">
              <div class="score-bar-fill" style="width: ${pick.score}%; background: ${color};"></div>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
  }
  
  // Probability Factors Footer
  html += `
      <div class="probability-factors">
        <span class="label">📜 5-Factor Model:</span>
        <span class="factor"><span class="pct historical">30%</span> Historical</span>
        <span class="factor"><span class="pct days">25%</span> Days Since</span>
        <span class="factor"><span class="pct same">20%</span> Same Day</span>
        <span class="factor"><span class="pct trend">15%</span> Trend</span>
        <span class="factor"><span class="pct pattern">10%</span> Pattern</span>
        <span style="font-size: 6px; color: #475569;">• Real-time probability</span>
      </div>
    </div>
    
    <div class="frequency-footer">
      🟢 Top 5 Most Played • 🔴 Bottom 5 Least Played • ⚜️ Probability based on 5 factors
    </div>
  </div>
  `;
  
  return html;
}
/////////////////////////////////////////

// ==================================
// LOTTO PLUS FREQUENCY CHART WITH PROBABILITY ANALYSIS
// ===================================
function renderLottoFrequencyChart(gameData) {
  if (!gameData) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Lotto Plus data available</div>';
  }
  
  // Extract months data
  let monthsData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    monthsData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    monthsData = gameData;
  }
  
  if (!monthsData || monthsData.length === 0) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Lotto Plus data available</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Sort months chronologically
  const sortedMonths = [...monthsData].sort((a, b) => {
    if (!a.month || !b.month) return 0;
    return new Date(a.month) - new Date(b.month);
  });
  
  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths.length >= 2 ? sortedMonths[sortedMonths.length - 2] : currentMonth;
  
  // Extract all numbers from the data
  let allNumbers = [];
  let lastPlayed = {};
  let currentMonthNumbers = [];
  let previousMonthNumbers = [];
  
  // Process each month
  sortedMonths.forEach(month => {
    if (month.days && Array.isArray(month.days)) {
      month.days.forEach(day => {
        if (day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const drawDate = new Date(day.date);
          const draws = day.draws || {};
          
          // Extract numbers 1-5
          for (let n = 1; n <= 5; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 35) {
                allNumbers.push(num);
                if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                  lastPlayed[num] = new Date(drawDate);
                }
                
                if (month === currentMonth) {
                  currentMonthNumbers.push(num);
                }
                if (month === previousMonth) {
                  previousMonthNumbers.push(num);
                }
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate frequency
  const frequency = {};
  for (let i = 1; i <= 35; i++) {
    frequency[i] = 0;
  }
  allNumbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  // Calculate days since last played
  const daysSinceLast = {};
  for (let i = 1; i <= 35; i++) {
    if (lastPlayed[i]) {
      const diffDays = Math.floor((now - lastPlayed[i]) / (1000 * 60 * 60 * 24));
      daysSinceLast[i] = diffDays;
    } else {
      daysSinceLast[i] = 'Never';
    }
  }
  
  // ===================================
  // PROBABILITY ANALYSIS FOR UPCOMING DRAW
  // ===================================
  
  // Determine next draw time (Lotto draws on Wednesdays and Saturdays)
  const currentDay = now.getDay();
  let nextDrawDay = currentDay;
  let daysUntilDraw = 0;
  
  if (currentDay === 3) {
    daysUntilDraw = 0;
    nextDrawDay = 3;
  } else if (currentDay === 6) {
    daysUntilDraw = 0;
    nextDrawDay = 6;
  } else if (currentDay > 3 && currentDay < 6) {
    daysUntilDraw = 6 - currentDay;
    nextDrawDay = 6;
  } else {
    daysUntilDraw = (3 - currentDay + 7) % 7;
    nextDrawDay = 3;
  }
  
  const nextDayName = dayNames[nextDrawDay];
  
  // Get historical draws for the same day from previous months
  const sameDayDraws = [];
  sortedMonths.forEach(month => {
    if (month.days) {
      month.days.forEach(day => {
        if (day.dayName === nextDayName && day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const draws = day.draws || {};
          for (let n = 1; n <= 5; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 35) {
                sameDayDraws.push(num);
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate probability scores
  const probabilityScores = {};
  const totalDraws = allNumbers.length || 1;
  const totalSameDay = sameDayDraws.length || 1;
  
  for (let i = 1; i <= 35; i++) {
    let score = 0;
    
    const freqWeight = (frequency[i] || 0) / totalDraws;
    score += freqWeight * 30;
    
    const days = daysSinceLast[i];
    if (days !== 'Never') {
      const daysWeight = Math.min(days / 40, 1);
      score += daysWeight * 25;
    } else {
      score += 25;
    }
    
    const sameDayCount = sameDayDraws.filter(n => n === i).length;
    const sameDayWeight = sameDayCount / totalSameDay;
    score += sameDayWeight * 20;
    
    const currentMonthCount = currentMonthNumbers.filter(n => n === i).length;
    const previousMonthCount = previousMonthNumbers.filter(n => n === i).length;
    let trendWeight = 0;
    if (currentMonthCount === 0 && previousMonthCount > 0) {
      trendWeight = 0.8;
    } else if (currentMonthCount === 0 && previousMonthCount === 0) {
      trendWeight = 0.5;
    } else if (currentMonthCount > 0 && previousMonthCount === 0) {
      trendWeight = 0.3;
    } else if (currentMonthCount > 0 && previousMonthCount > 0) {
      trendWeight = 0.6;
    }
    score += trendWeight * 15;
    
    let patternWeight = 0;
    if (currentMonthNumbers.length > 0) {
      for (const num of currentMonthNumbers) {
        const appearsTogether = allNumbers.filter((n, idx) => 
          n === num && idx + 1 < allNumbers.length && allNumbers[idx + 1] === i
        ).length;
        patternWeight += appearsTogether / 10;
      }
    }
    patternWeight = Math.min(patternWeight, 1);
    score += patternWeight * 10;
    
    probabilityScores[i] = Math.min(Math.round(score), 100);
  }
  
  // Get top 20 probability picks (4 rows x 5 numbers)
  const topProbPicks = Object.entries(probabilityScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([num, score]) => ({ num: parseInt(num), score: score }));
  
  // Sort numbers by frequency
  const sortedNumbers = Object.keys(frequency)
    .map(Number)
    .sort((a, b) => frequency[b] - frequency[a]);
  
  const top7 = sortedNumbers.slice(0, 7);
  const bottom7 = sortedNumbers.slice(-7).reverse();
  
  // Color mapping
  const numberColors = {
    1: "#ff6b6b", 2: "#ffa94d", 3: "#ffd43b", 4: "#69db7c", 5: "#38d9a9",
    6: "#4dabf7", 7: "#9775fa", 8: "#f783ac", 9: "#ff922b", 10: "#fab005",
    11: "#82c91e", 12: "#20c997", 13: "#339af0", 14: "#845ef7", 15: "#e599f7",
    16: "#ff8787", 17: "#ffc078", 18: "#ffe066", 19: "#8ce99a", 20: "#63e6be",
    21: "#74c0fc", 22: "#b197fc", 23: "#faa2c1", 24: "#ffa8a8", 25: "#ffec99",
    26: "#c0eb75", 27: "#96f2d7", 28: "#a5d8ff", 29: "#d0bfff", 30: "#fcc2d7",
    31: "#ff6b6b", 32: "#ffa94d", 33: "#ffd43b", 34: "#69db7c", 35: "#38d9a9"
  };
  
  // Build HTML
  let html = `
  <style>
    .frequency-chart {
      background: linear-gradient(145deg, #0f172a, #1a2332);
      border-radius: 16px;
      padding: 16px;
      border: 1px solid rgba(255,157,0,0.1);
      margin-bottom: 12px;
    }
    .frequency-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .frequency-title {
      font-size: 16px;
      font-weight: 800;
      color: #ff9d00;
    }
    .frequency-title span {
      font-size: 11px;
      font-weight: 400;
      color: #64748b;
      margin-left: 8px;
    }
    .frequency-stats {
      font-size: 11px;
      color: #94a3b8;
      background: rgba(255,157,0,0.08);
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255,157,0,0.1);
    }
    .frequency-grid-lotto {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .frequency-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      padding: 6px 4px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.06);
      transition: all 0.2s ease;
    }
    .frequency-cell .number {
      font-size: 18px;
      font-weight: 900;
      display: block;
    }
    .frequency-cell .count {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 2px;
    }
    .frequency-cell .days {
      font-size: 7px;
      color: #64748b;
      margin-top: 1px;
    }
    .frequency-cell.top-ranked {
      border-color: #32d74b;
      background: rgba(50,215,75,0.05);
    }
    .frequency-cell.top-ranked .count {
      color: #32d74b;
    }
    .frequency-cell.bottom-ranked {
      border-color: #ff453a;
      background: rgba(255,69,58,0.05);
    }
    .frequency-cell.bottom-ranked .count {
      color: #ff453a;
    }
    .frequency-rank-label {
      font-size: 7px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 2px;
    }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    
    .frequency-table-wrap {
      overflow-x: auto;
      margin-top: 4px;
    }
    .frequency-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .frequency-table th {
      background: rgba(255,255,255,0.05);
      padding: 6px 4px;
      text-align: center;
      font-weight: 700;
      color: #94a3b8;
      border-bottom: 2px solid rgba(255,157,0,0.15);
      font-size: 9px;
    }
    .frequency-table td {
      padding: 5px 3px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-weight: 600;
    }
    .frequency-table .num-cell {
      font-weight: 800;
      font-size: 13px;
    }
    .frequency-table .hit-cell {
      font-weight: 700;
    }
    .frequency-bar-wrap {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      height: 5px;
      overflow: hidden;
      width: 100%;
    }
    .frequency-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }
    .frequency-footer {
      font-size: 8px;
      color: #475569;
      text-align: center;
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
    }
    
    .probability-section {
      background: rgba(255,157,0,0.04);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 10px;
      border: 1px solid rgba(255,157,0,0.08);
    }
    .probability-title {
      font-size: 11px;
      font-weight: 700;
      color: #ff9d00;
      text-align: center;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .probability-subtitle {
      font-size: 8px;
      color: #64748b;
      text-align: center;
      margin-bottom: 8px;
    }
    .probability-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
    }
    .probability-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      padding: 4px 2px;
      text-align: center;
      border: 1px solid rgba(255,157,0,0.1);
      transition: all 0.2s ease;
    }
    .probability-cell:hover {
      transform: scale(1.05);
      border-color: #ff9d00;
      background: rgba(255,157,0,0.05);
    }
    .probability-cell .number {
      font-size: 16px;
      font-weight: 900;
      display: block;
      line-height: 1.2;
    }
    .probability-cell .score {
      font-size: 9px;
      font-weight: 600;
      color: #ff9d00;
    }
    .probability-cell .score-bar {
      width: 100%;
      height: 2px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 2px;
    }
    .probability-cell .score-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }
    .probability-row-label {
      font-size: 7px;
      font-weight: 700;
      color: #64748b;
      text-align: center;
      padding: 2px 0;
      letter-spacing: 0.5px;
    }
    .probability-cell.rank-1 {
      border-color: #ffd700;
      background: rgba(255,215,0,0.06);
    }
    .probability-cell.rank-2 {
      border-color: #c0c0c0;
      background: rgba(192,192,192,0.04);
    }
    .probability-cell.rank-3 {
      border-color: #cd7f32;
      background: rgba(205,127,50,0.04);
    }
    
    .probability-factors {
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 8px;
      border: 1px solid rgba(255,255,255,0.04);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 4px 10px;
    }
    .probability-factors .label {
      font-size: 7px;
      font-weight: 700;
      color: #58a6ff;
      letter-spacing: 0.3px;
    }
    .probability-factors .factor {
      font-size: 6px;
      color: #94a3b8;
    }
    .probability-factors .factor .pct {
      font-weight: 700;
    }
    .probability-factors .factor .pct.historical { color: #ff6b6b; }
    .probability-factors .factor .pct.days { color: #ffd93d; }
    .probability-factors .factor .pct.same { color: #6bcb77; }
    .probability-factors .factor .pct.trend { color: #4d96ff; }
    .probability-factors .factor .pct.pattern { color: #9b59b6; }
    
    @media (max-width: 480px) {
      .frequency-grid-lotto { grid-template-columns: repeat(4, 1fr); }
      .probability-grid { grid-template-columns: repeat(5, 1fr); }
    }
  </style>
  
  <div class="frequency-chart">
    <div class="frequency-header">
      <div class="frequency-title">
        ♠️ LOTTO PLUS FREQUENCY CHART
        <span>1-35</span>
      </div>
      <div class="frequency-stats">
        ${allNumbers.length} total draws
      </div>
    </div>
    
    <!-- Top 7 & Bottom 7 Grid -->
    <div class="frequency-grid-lotto">
  `;
  
  top7.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1">#1</span>' : 
                      idx === 1 ? '<span class="frequency-rank-label rank-2">#2</span>' :
                      idx === 2 ? '<span class="frequency-rank-label rank-3">#3</span>' : '';
    
    html += `
      <div class="frequency-cell top-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  bottom7.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1" style="background:#ff6b6b;color:#fff;">⚠️</span>' : '';
    
    html += `
      <div class="frequency-cell bottom-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  html += `
    </div>
    
    <!-- Full Frequency Table -->
    <div class="frequency-table-wrap">
      <table class="frequency-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NUM</th>
            <th>HITS</th>
            <th>LAST PLAYED</th>
            <th>DAYS</th>
            <th>FREQ %</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  const maxFreq = Math.max(...Object.values(frequency), 1);
  
  sortedNumbers.forEach(num => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const percent = Math.round((count / Math.max(allNumbers.length, 1)) * 100);
    const barWidth = Math.round((count / maxFreq) * 100);
    const days = daysSinceLast[num];
    
    html += `
      <tr>
        <td style="color:#64748b;font-size:9px;">${sortedNumbers.indexOf(num) + 1}</td>
        <td class="num-cell" style="color:${color};">${num}</td>
        <td class="hit-cell" style="color:${count >= 10 ? '#32d74b' : count >= 5 ? '#ffd700' : '#94a3b8'};">${count}x</td>
        <td style="font-size:9px;color:#94a3b8;">${days !== 'Never' ? new Date(lastPlayed[num]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'}</td>
        <td style="font-size:9px;font-weight:700;color:${days !== 'Never' && days > 30 ? '#ff453a' : '#94a3b8'};">${days !== 'Never' ? days + 'd' : '—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:8px;color:#64748b;min-width:28px;">${percent}%</span>
            <div class="frequency-bar-wrap">
              <div class="frequency-bar" style="width:${barWidth}%;background:${color};"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    
    <!-- PROBABILITY SECTION -->
    <div class="probability-section">
      <div class="probability-title">♠️ LOTTO: PROBABILITY ANALYSIS</div>
      <div class="probability-subtitle">
        Next Draw: ${nextDayName} • ${daysUntilDraw === 0 ? 'Today' : daysUntilDraw + ' days'}
      </div>
  `;
  
  // Split top 20 into 4 rows of 5
  for (let row = 0; row < 4; row++) {
    const rowStart = row * 5;
    const rowEnd = rowStart + 5;
    const rowPicks = topProbPicks.slice(rowStart, rowEnd);
    
    if (rowPicks.length > 0) {
      html += `
        <div style="margin-bottom: ${row < 3 ? '4px' : '0'};">
          <div class="probability-row-label">${row === 0 ? '🏆 TOP TIER' : row === 1 ? '⭐ HIGH' : row === 2 ? '▫️ MEDIUM' : '👀 WATCH'}</div>
          <div class="probability-grid">
      `;
      
      rowPicks.forEach((pick, idx) => {
        const color = numberColors[pick.num] || '#ffffff';
        const rankClass = idx === 0 && row === 0 ? 'rank-1' : 
                         idx === 1 && row === 0 ? 'rank-2' : 
                         idx === 2 && row === 0 ? 'rank-3' : '';
        
        html += `
          <div class="probability-cell ${rankClass}">
            <span class="number" style="color: ${color};">${pick.num}</span>
            <div class="score">${pick.score}%</div>
            <div class="score-bar">
              <div class="score-bar-fill" style="width: ${pick.score}%; background: ${color};"></div>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
  }
  
  // Probability Factors Footer
  html += `
      <div class="probability-factors">
        <span class="label">📜 5-Factor Model:</span>
        <span class="factor"><span class="pct historical">30%</span> Historical</span>
        <span class="factor"><span class="pct days">25%</span> Days Since</span>
        <span class="factor"><span class="pct same">20%</span> Same Day</span>
        <span class="factor"><span class="pct trend">15%</span> Trend</span>
        <span class="factor"><span class="pct pattern">10%</span> Pattern</span>
        <span style="font-size: 6px; color: #475569;">• Real-time probability</span>
      </div>
    </div>
    
    <div class="frequency-footer">
      🟢 Top 7 Most Played • 🔴 Bottom 7 Least Played • ⚜️ Probability based on 5 factors
    </div>
  </div>
  `;
  
  return html;
}
//////////////////////////////////////////

// ======================================
// WIN FOR LIFE FREQUENCY CHART WITH PROBABILITY ANALYSIS
// ======================================
function renderWinForLifeFrequencyChart(gameData) {
  if (!gameData) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Win For Life data available</div>';
  }
  
  // Extract months data
  let monthsData = [];
  if (gameData && gameData.data && Array.isArray(gameData.data)) {
    monthsData = gameData.data;
  } else if (gameData && Array.isArray(gameData)) {
    monthsData = gameData;
  }
  
  if (!monthsData || monthsData.length === 0) {
    return '<div class="frequency-chart" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 20px; border: 1px solid #58a6ff; text-align:center;">📊 No Win For Life data available</div>';
  }
  
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Sort months chronologically
  const sortedMonths = [...monthsData].sort((a, b) => {
    if (!a.month || !b.month) return 0;
    return new Date(a.month) - new Date(b.month);
  });
  
  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths.length >= 2 ? sortedMonths[sortedMonths.length - 2] : currentMonth;
  
  // Extract all numbers from the data
  let allNumbers = [];
  let lastPlayed = {};
  let currentMonthNumbers = [];
  let previousMonthNumbers = [];
  
  // Process each month
  sortedMonths.forEach(month => {
    if (month.days && Array.isArray(month.days)) {
      month.days.forEach(day => {
        if (day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const drawDate = new Date(day.date);
          const draws = day.draws || {};
          
          // Extract numbers 1-6
          for (let n = 1; n <= 6; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 28) {
                allNumbers.push(num);
                if (!lastPlayed[num] || drawDate > lastPlayed[num]) {
                  lastPlayed[num] = new Date(drawDate);
                }
                
                if (month === currentMonth) {
                  currentMonthNumbers.push(num);
                }
                if (month === previousMonth) {
                  previousMonthNumbers.push(num);
                }
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate frequency
  const frequency = {};
  for (let i = 1; i <= 28; i++) {
    frequency[i] = 0;
  }
  allNumbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  // Calculate days since last played
  const daysSinceLast = {};
  for (let i = 1; i <= 28; i++) {
    if (lastPlayed[i]) {
      const diffDays = Math.floor((now - lastPlayed[i]) / (1000 * 60 * 60 * 24));
      daysSinceLast[i] = diffDays;
    } else {
      daysSinceLast[i] = 'Never';
    }
  }
  
  // ====================================
  // PROBABILITY ANALYSIS FOR UPCOMING DRAW
  // ====================================
  
  // Win For Life draws daily
  const currentDay = now.getDay();
  let nextDrawDay = currentDay;
  let daysUntilDraw = 0;
  
  const currentHour = now.getHours();
  if (currentHour < 18) {
    daysUntilDraw = 0;
    nextDrawDay = currentDay;
  } else {
    daysUntilDraw = 1;
    nextDrawDay = (currentDay + 1) % 7;
  }
  
  const nextDayName = dayNames[nextDrawDay];
  
  // Get historical draws for the same day from previous months
  const sameDayDraws = [];
  sortedMonths.forEach(month => {
    if (month.days) {
      month.days.forEach(day => {
        if (day.dayName === nextDayName && day.date && day.date !== "SCHEDULED" && day.date !== "PENDING") {
          const draws = day.draws || {};
          for (let n = 1; n <= 6; n++) {
            let val = draws[`Num${n}`];
            if (val && val !== "-" && val !== "PENDING" && val !== "SCHEDULED") {
              let num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 28) {
                sameDayDraws.push(num);
              }
            }
          }
        }
      });
    }
  });
  
  // Calculate probability scores
  const probabilityScores = {};
  const totalDraws = allNumbers.length || 1;
  const totalSameDay = sameDayDraws.length || 1;
  
  for (let i = 1; i <= 28; i++) {
    let score = 0;
    
    const freqWeight = (frequency[i] || 0) / totalDraws;
    score += freqWeight * 30;
    
    const days = daysSinceLast[i];
    if (days !== 'Never') {
      const daysWeight = Math.min(days / 35, 1);
      score += daysWeight * 25;
    } else {
      score += 25;
    }
    
    const sameDayCount = sameDayDraws.filter(n => n === i).length;
    const sameDayWeight = sameDayCount / totalSameDay;
    score += sameDayWeight * 20;
    
    const currentMonthCount = currentMonthNumbers.filter(n => n === i).length;
    const previousMonthCount = previousMonthNumbers.filter(n => n === i).length;
    let trendWeight = 0;
    if (currentMonthCount === 0 && previousMonthCount > 0) {
      trendWeight = 0.8;
    } else if (currentMonthCount === 0 && previousMonthCount === 0) {
      trendWeight = 0.5;
    } else if (currentMonthCount > 0 && previousMonthCount === 0) {
      trendWeight = 0.3;
    } else if (currentMonthCount > 0 && previousMonthCount > 0) {
      trendWeight = 0.6;
    }
    score += trendWeight * 15;
    
    let patternWeight = 0;
    if (currentMonthNumbers.length > 0) {
      for (const num of currentMonthNumbers) {
        const appearsTogether = allNumbers.filter((n, idx) => 
          n === num && idx + 1 < allNumbers.length && allNumbers[idx + 1] === i
        ).length;
        patternWeight += appearsTogether / 10;
      }
    }
    patternWeight = Math.min(patternWeight, 1);
    score += patternWeight * 10;
    
    probabilityScores[i] = Math.min(Math.round(score), 100);
  }
  
  // Get top 24 probability picks (4 rows x 6 numbers)
  const topProbPicks = Object.entries(probabilityScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([num, score]) => ({ num: parseInt(num), score: score }));
  
  // Sort numbers by frequency
  const sortedNumbers = Object.keys(frequency)
    .map(Number)
    .sort((a, b) => frequency[b] - frequency[a]);
  
  const top6 = sortedNumbers.slice(0, 6);
  const bottom6 = sortedNumbers.slice(-6).reverse();
  
  // Color mapping
  const numberColors = {
    1: "#ff6b6b", 2: "#ffa94d", 3: "#ffd43b", 4: "#69db7c", 5: "#38d9a9",
    6: "#4dabf7", 7: "#9775fa", 8: "#f783ac", 9: "#ff922b", 10: "#fab005",
    11: "#82c91e", 12: "#20c997", 13: "#339af0", 14: "#845ef7", 15: "#e599f7",
    16: "#ff8787", 17: "#ffc078", 18: "#ffe066", 19: "#8ce99a", 20: "#63e6be",
    21: "#74c0fc", 22: "#b197fc", 23: "#faa2c1", 24: "#ffa8a8", 25: "#ffec99",
    26: "#c0eb75", 27: "#96f2d7", 28: "#a5d8ff"
  };
  
  // Build HTML
  let html = `
  <style>
    .frequency-chart {
      background: linear-gradient(145deg, #0f172a, #1a2332);
      border-radius: 16px;
      padding: 16px;
      border: 1px solid rgba(88,166,255,0.1);
      margin-bottom: 12px;
    }
    .frequency-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .frequency-title {
      font-size: 16px;
      font-weight: 800;
      color: #58a6ff;
    }
    .frequency-title span {
      font-size: 11px;
      font-weight: 400;
      color: #64748b;
      margin-left: 8px;
    }
    .frequency-stats {
      font-size: 11px;
      color: #94a3b8;
      background: rgba(88,166,255,0.08);
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(88,166,255,0.1);
    }
    .frequency-grid-wfl {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .frequency-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      padding: 6px 4px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.06);
      transition: all 0.2s ease;
    }
    .frequency-cell .number {
      font-size: 18px;
      font-weight: 900;
      display: block;
    }
    .frequency-cell .count {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 2px;
    }
    .frequency-cell .days {
      font-size: 7px;
      color: #64748b;
      margin-top: 1px;
    }
    .frequency-cell.top-ranked {
      border-color: #32d74b;
      background: rgba(50,215,75,0.05);
    }
    .frequency-cell.top-ranked .count {
      color: #32d74b;
    }
    .frequency-cell.bottom-ranked {
      border-color: #ff453a;
      background: rgba(255,69,58,0.05);
    }
    .frequency-cell.bottom-ranked .count {
      color: #ff453a;
    }
    .frequency-rank-label {
      font-size: 7px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 10px;
      display: inline-block;
      margin-top: 2px;
    }
    .rank-1 { background: #ffd700; color: #000; }
    .rank-2 { background: #c0c0c0; color: #000; }
    .rank-3 { background: #cd7f32; color: #fff; }
    
    .frequency-table-wrap {
      overflow-x: auto;
      margin-top: 4px;
    }
    .frequency-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .frequency-table th {
      background: rgba(255,255,255,0.05);
      padding: 6px 4px;
      text-align: center;
      font-weight: 700;
      color: #94a3b8;
      border-bottom: 2px solid rgba(88,166,255,0.15);
      font-size: 9px;
    }
    .frequency-table td {
      padding: 5px 3px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-weight: 600;
    }
    .frequency-table .num-cell {
      font-weight: 800;
      font-size: 13px;
    }
    .frequency-table .hit-cell {
      font-weight: 700;
    }
    .frequency-bar-wrap {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      height: 5px;
      overflow: hidden;
      width: 100%;
    }
    .frequency-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
    }
    .frequency-footer {
      font-size: 8px;
      color: #475569;
      text-align: center;
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.02);
    }
    
    .probability-section {
      background: rgba(88,166,255,0.04);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 10px;
      border: 1px solid rgba(88,166,255,0.08);
    }
    .probability-title {
      font-size: 11px;
      font-weight: 700;
      color: #58a6ff;
      text-align: center;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .probability-subtitle {
      font-size: 8px;
      color: #64748b;
      text-align: center;
      margin-bottom: 8px;
    }
    .probability-grid-wfl {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 4px;
    }
    .probability-cell {
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      padding: 4px 2px;
      text-align: center;
      border: 1px solid rgba(88,166,255,0.1);
      transition: all 0.2s ease;
    }
    .probability-cell:hover {
      transform: scale(1.05);
      border-color: #58a6ff;
      background: rgba(88,166,255,0.05);
    }
    .probability-cell .number {
      font-size: 16px;
      font-weight: 900;
      display: block;
      line-height: 1.2;
    }
    .probability-cell .score {
      font-size: 9px;
      font-weight: 600;
      color: #58a6ff;
    }
    .probability-cell .score-bar {
      width: 100%;
      height: 2px;
      background: rgba(255,255,255,0.08);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 2px;
    }
    .probability-cell .score-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }
    .probability-row-label {
      font-size: 7px;
      font-weight: 700;
      color: #64748b;
      text-align: center;
      padding: 2px 0;
      letter-spacing: 0.5px;
    }
    .probability-cell.rank-1 {
      border-color: #ffd700;
      background: rgba(255,215,0,0.06);
    }
    .probability-cell.rank-2 {
      border-color: #c0c0c0;
      background: rgba(192,192,192,0.04);
    }
    .probability-cell.rank-3 {
      border-color: #cd7f32;
      background: rgba(205,127,50,0.04);
    }
    
    .probability-factors {
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 8px;
      border: 1px solid rgba(255,255,255,0.04);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 4px 10px;
    }
    .probability-factors .label {
      font-size: 7px;
      font-weight: 700;
      color: #58a6ff;
      letter-spacing: 0.3px;
    }
    .probability-factors .factor {
      font-size: 6px;
      color: #94a3b8;
    }
    .probability-factors .factor .pct {
      font-weight: 700;
    }
    .probability-factors .factor .pct.historical { color: #ff6b6b; }
    .probability-factors .factor .pct.days { color: #ffd93d; }
    .probability-factors .factor .pct.same { color: #6bcb77; }
    .probability-factors .factor .pct.trend { color: #4d96ff; }
    .probability-factors .factor .pct.pattern { color: #9b59b6; }
    
    @media (max-width: 480px) {
      .frequency-grid-wfl { grid-template-columns: repeat(3, 1fr); }
      .probability-grid-wfl { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
  
  <div class="frequency-chart">
    <div class="frequency-header">
      <div class="frequency-title">
        🏆 WIN FOR LIFE FREQUENCY CHART
        <span>1-28</span>
      </div>
      <div class="frequency-stats">
        ${allNumbers.length} total draws
      </div>
    </div>
    
    <!-- Top 6 & Bottom 6 Grid -->
    <div class="frequency-grid-wfl">
  `;
  
  top6.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1">#1</span>' : 
                      idx === 1 ? '<span class="frequency-rank-label rank-2">#2</span>' :
                      idx === 2 ? '<span class="frequency-rank-label rank-3">#3</span>' : '';
    
    html += `
      <div class="frequency-cell top-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  bottom6.forEach((num, idx) => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const days = daysSinceLast[num];
    const rankLabel = idx === 0 ? '<span class="frequency-rank-label rank-1" style="background:#ff6b6b;color:#fff;">⚠️</span>' : '';
    
    html += `
      <div class="frequency-cell bottom-ranked">
        <span class="number" style="color: ${color};">${num}</span>
        <div class="count">${count}x</div>
        <div class="days">${days !== 'Never' ? days + 'd' : 'Never'}</div>
        ${rankLabel}
      </div>
    `;
  });
  
  html += `
    </div>
    
    <!-- Full Frequency Table -->
    <div class="frequency-table-wrap">
      <table class="frequency-table">
        <thead>
          <tr>
            <th>#</th>
            <th>NUM</th>
            <th>HITS</th>
            <th>LAST PLAYED</th>
            <th>DAYS</th>
            <th>FREQ %</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  const maxFreq = Math.max(...Object.values(frequency), 1);
  
  sortedNumbers.forEach(num => {
    const color = numberColors[num] || '#ffffff';
    const count = frequency[num] || 0;
    const percent = Math.round((count / Math.max(allNumbers.length, 1)) * 100);
    const barWidth = Math.round((count / maxFreq) * 100);
    const days = daysSinceLast[num];
    
    html += `
      <tr>
        <td style="color:#64748b;font-size:9px;">${sortedNumbers.indexOf(num) + 1}</td>
        <td class="num-cell" style="color:${color};">${num}</td>
        <td class="hit-cell" style="color:${count >= 10 ? '#32d74b' : count >= 5 ? '#ffd700' : '#94a3b8'};">${count}x</td>
        <td style="font-size:9px;color:#94a3b8;">${days !== 'Never' ? new Date(lastPlayed[num]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'}</td>
        <td style="font-size:9px;font-weight:700;color:${days !== 'Never' && days > 30 ? '#ff453a' : '#94a3b8'};">${days !== 'Never' ? days + 'd' : '—'}</td>
        <td>
          <div style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:8px;color:#64748b;min-width:28px;">${percent}%</span>
            <div class="frequency-bar-wrap">
              <div class="frequency-bar" style="width:${barWidth}%;background:${color};"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    
    <!-- PROBABILITY SECTION -->
    <div class="probability-section">
      <div class="probability-title">♠️ WIN FOR LIFE: PROBABILITY ANALYSIS</div>
      <div class="probability-subtitle">
        Next Draw: ${nextDayName} • ${daysUntilDraw === 0 ? 'Today' : 'Tomorrow'}
      </div>
  `;
  
  // Split top 24 into 4 rows of 6
  for (let row = 0; row < 4; row++) {
    const rowStart = row * 6;
    const rowEnd = rowStart + 6;
    const rowPicks = topProbPicks.slice(rowStart, rowEnd);
    
    if (rowPicks.length > 0) {
      html += `
        <div style="margin-bottom: ${row < 3 ? '4px' : '0'};">
          <div class="probability-row-label">${row === 0 ? '🏆 TOP TIER' : row === 1 ? '⭐ HIGH' : row === 2 ? '▫️ MEDIUM' : '👀 WATCH'}</div>
          <div class="probability-grid-wfl">
      `;
      
      rowPicks.forEach((pick, idx) => {
        const color = numberColors[pick.num] || '#ffffff';
        const rankClass = idx === 0 && row === 0 ? 'rank-1' : 
                         idx === 1 && row === 0 ? 'rank-2' : 
                         idx === 2 && row === 0 ? 'rank-3' : '';
        
        html += `
          <div class="probability-cell ${rankClass}">
            <span class="number" style="color: ${color};">${pick.num}</span>
            <div class="score">${pick.score}%</div>
            <div class="score-bar">
              <div class="score-bar-fill" style="width: ${pick.score}%; background: ${color};"></div>
            </div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
  }
  
  // Probability Factors Footer
  html += `
      <div class="probability-factors">
        <span class="label">📜 5-Factor Model:</span>
        <span class="factor"><span class="pct historical">30%</span> Historical</span>
        <span class="factor"><span class="pct days">25%</span> Days Since</span>
        <span class="factor"><span class="pct same">20%</span> Same Day</span>
        <span class="factor"><span class="pct trend">15%</span> Trend</span>
        <span class="factor"><span class="pct pattern">10%</span> Pattern</span>
        <span style="font-size: 6px; color: #475569;">• Real-time probability</span>
      </div>
    </div>
    
    <div class="frequency-footer">
      🟢 Top 6 Most Played • 🔴 Bottom 6 Least Played • ⚜️ Probability based on 5 factors
    </div>
  </div>
  `;
  
  return html;
}