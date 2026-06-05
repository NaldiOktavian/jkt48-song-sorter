// ===============================
// 🎮 GLOBAL STATE
// ===============================

let selectedSongs = [];
let currentLeft = null;
let currentRight = null;
let eliminatedSongs = [];

let totalBattle = 0;
let currentBattle = 0;

let history = [];
let scores = {}; // 🔥 sistem voting
let gameMode = "score"; // default
let finalRanking = [];
let usedPairs = new Set();
let songPower = {};
let milestone25 = false;
let milestone50 = false;
let milestone75 = false;

// ===============================
// 🚀 START SCREEN
// ===============================

function enterGame(){

  const start = document.getElementById("start-screen");
  const menu = document.getElementById("menu");
  const battle = document.getElementById("battle-screen");

  // reset semua screen
  battle.classList.add("hidden");
  menu.classList.remove("hidden");

  start.style.opacity = "0";
  start.style.transition = "0.5s";

  setTimeout(()=>{
    start.style.display = "none";
  }, 500);
}

// ===============================
// 🎯 START SORTER
// ===============================

function startSorter(amount){

  const menu = document.getElementById("menu");
  const battle = document.getElementById("battle-screen");

  menu.classList.add("hidden");
  battle.classList.remove("hidden");

  document.body.classList.add("no-scroll");

  selectedSongs = [];
  eliminatedSongs = [];

  // 🎯 SET MODE

  if(amount === 40 || amount === 60){

    gameMode = "score";

  }else{

    gameMode = "elimination";

  }

// =========================
// 🎮 SMART DIFFICULTY POOL
// =========================

  let pool = [];

  if(amount === 40){

    // 🟢 EASY
    pool = songs.filter(
      song => song.popularity === "High"
    );

    pool = shuffle(pool).slice(0,40);

  }else if(amount === 60){

    // 🔵 MEDIUM
    pool = songs.filter(
      song =>
        song.popularity === "High" ||
        song.popularity === "Medium"
    );

    pool = shuffle(pool).slice(0,60);

  }else if(amount === 100){

    // 🟠 HARD

    const highMedium =
      songs.filter(
        song =>
          song.popularity === "High" ||
          song.popularity === "Medium"
      );

    const lowSongs =
      songs.filter(
        song => song.popularity === "Low"
      );

    pool = [
      ...highMedium,
      ...shuffle(lowSongs).slice(0,25)
    ];

    pool = shuffle(pool).slice(0,100);

  }else{

    // 🔴 LEGENDARY
    pool = [...songs];

  }

selectedSongs = shuffle(pool);

// =========================
// 🔥 INIT SONG POWER
// =========================

songPower = {};

selectedSongs.forEach(song => {

  songPower[song.title] = 1000;

});

// =========================
// 🔥 INIT SCORE
// =========================

scores = {};

selectedSongs.forEach(song => {

  scores[song.title] = 0;

});

// =========================
// 🎯 TOTAL BATTLE
// =========================

// 🟢 SCORE MODE
if(gameMode === "score"){

  totalBattle = amount * 2;

}else{

  // 🔥 elimination hybrid
  totalBattle = selectedSongs.length - 1;

}

currentBattle = 0;

history = [];

milestone25 = false;
milestone50 = false;
milestone75 = false;

usedPairs.clear();

nextBattle();

}

// ===============================
// 🔀 SHUFFLE FUNCTION
// ===============================

function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ===============================
// ⚔️ NEXT BATTLE
// ===============================

function nextBattle(){

  // 🎯 MODE SCORE
  if(gameMode === "score"){
    if(currentBattle >= totalBattle){
      showResult();
      return;
    }
  }

  // 🎯 MODE ELIMINASI
  if(gameMode === "elimination"){
    if(selectedSongs.length === 1){
      showResult();
      return;
    }
  }

    let validPair = false;
    let attempts = 0;

    while(!validPair && attempts < 500){

      attempts++;

      // 🎯 random left
      currentLeft =
        selectedSongs[
          Math.floor(Math.random() * selectedSongs.length)
        ];

      // 🔥 power current song
      const leftPower =
        songPower[currentLeft.title];

      // 🎯 cari lagu power mirip
      const candidates =
        selectedSongs.filter(song => {

          if(song === currentLeft){
            return false;
          }

          const diff =
            Math.abs(
              songPower[song.title] - leftPower
            );

          return diff <= 80;
        });

      // 🎯 pilih candidate
      if(candidates.length > 0){

        currentRight =
          candidates[
            Math.floor(Math.random() * candidates.length)
          ];

      }else{

        // fallback random
        currentRight =
          selectedSongs[
            Math.floor(Math.random() * selectedSongs.length)
          ];
      }

      // ❌ jangan sama
      if(currentLeft === currentRight){
        continue;
      }

      // 🔥 unique pair
      const pairKey = [
        currentLeft.title,
        currentRight.title
      ].sort().join("|");

      if(!usedPairs.has(pairKey)){

        usedPairs.add(pairKey);

        validPair = true;
      }
    }

    // 🚨 kalau udah mentok
    if(attempts >= 500){

      showResult();
      return;
    }

renderBattle();
}

// ===============================
// 🎧 BATTLE PREVIEW AUDIO
// ===============================

const battlePreviewAudio =
  document.getElementById("battle-preview-audio");

let currentBattlePreviewSide = null;

function playBattlePreview(event, side){

  event.stopPropagation();

  if(!battlePreviewAudio) return;

  const song =
    side === "left"
      ? currentLeft
      : currentRight;

  if(!song || !song.audio){
    alert("Preview audio belum tersedia untuk lagu ini 😭");
    return;
  }

  document
    .querySelectorAll(".battle-preview-btn")
    .forEach(btn =>
      btn.classList.remove("playing")
    );

  const clickedBtn =
    event.currentTarget;

  if(
    currentBattlePreviewSide === side &&
    !battlePreviewAudio.paused
  ){
    battlePreviewAudio.pause();
    currentBattlePreviewSide = null;
    return;
  }

  battlePreviewAudio.src = song.audio;
  battlePreviewAudio.currentTime = 0;

  battlePreviewAudio.play().catch(()=>{});

  clickedBtn.classList.add("playing");

  currentBattlePreviewSide = side;
}

if(battlePreviewAudio){

  battlePreviewAudio.onended = () => {

    document
      .querySelectorAll(".battle-preview-btn")
      .forEach(btn =>
        btn.classList.remove("playing")
      );

    currentBattlePreviewSide = null;
  };

}
// ===============================
// 🎨 RENDER UI
// ===============================

function renderBattle(){

  const leftCover =
    document.getElementById("battle-left-cover");

  const rightCover =
    document.getElementById("battle-right-cover");

  const leftTitle =
    document.getElementById("left-title");

  const rightTitle =
    document.getElementById("right-title");

  leftCover.src =
    currentLeft.cover || "assets/default.jpg";

  rightCover.src =
    currentRight.cover || "assets/default.jpg";

  leftTitle.innerText = currentLeft.title;
  rightTitle.innerText = currentRight.title;

  leftTitle.title = currentLeft.title;
  rightTitle.title = currentRight.title;

  updateProgress();
}

// ===============================
// 📊 PROGRESS BAR
// ===============================

  function updateProgress(){

    const percent = totalBattle > 0
      ? (currentBattle / totalBattle) * 100
      : 0;

    const bar =
      document.getElementById("progress-bar");

    const text =
      document.getElementById("progress-text");

    bar.style.width =
      percent + "%";

    text.innerText =
      Math.round(percent) + "%";

    document.getElementById("battle-counter").innerText =
      `⚔️ Battle ${currentBattle} / ${totalBattle}`;

    checkMilestone(percent);
  }

function checkMilestone(percent){

  if(percent >= 25 && !milestone25){

    milestone25 = true;

    showMilestone("🎉 25% COMPLETE!");
  }

  if(percent >= 50 && !milestone50){

    milestone50 = true;

    showMilestone("🔥 50% COMPLETE!");
  }

  if(percent >= 75 && !milestone75){

    milestone75 = true;

    showMilestone("👑 75% COMPLETE!");
  }
}

function showMilestone(title){

  const popup =
    document.getElementById("milestone-popup");

  const titleEl =
    document.getElementById("milestone-title");

  const textEl =
    document.getElementById("milestone-text");

  titleEl.innerText = title;

  let message =
    "Semangat terus ya kak 💕";

  if(title.includes("25")){
    message =
      "Wahh udah seperlempat jalan! Pemanasan dulu kak, jangan nyerlah ya 🎧";
  }

  if(title.includes("50")){
    message =
      "Setengah jalan nih! Favorlit kakak mulai kelihatan 🔥";
  }

  if(title.includes("75")){
    message =
      "Dikit lagi selesai! Aku penasarlan lagu apa yang jadi #1 kakak 👑";
  }

  textEl.innerText =
    `"${message}"`;

  popup.classList.remove("hidden");

  const closeBtn =
    document.getElementById("milestone-close");

  closeBtn.onclick = () => {

    popup.classList.add("hidden");

  };
}

// ===============================
// 🏆 CHOOSE
// ===============================

function saveBattleHistory(){

  history.push({
    selectedSongs:[...selectedSongs],
    eliminatedSongs:[...eliminatedSongs],
    scores:{...scores},
    songPower:{...songPower},
    usedPairs:new Set(usedPairs),
    currentBattle,
    currentLeft,
    currentRight
  });

}

function choose(side){

  if(battlePreviewAudio){
  battlePreviewAudio.pause();
  battlePreviewAudio.currentTime = 0;
  currentBattlePreviewSide = null;

  document
    .querySelectorAll(".battle-preview-btn")
    .forEach(btn =>
      btn.classList.remove("playing")
    );
}

  saveBattleHistory();

  let winner, loser;

  if(side === 0){
    winner = currentLeft;
    loser = currentRight;
  }else{
    winner = currentRight;
    loser = currentLeft;
  }

  songPower[winner.title] += 10;
  songPower[loser.title] -= 5;

  if(gameMode === "score"){

    scores[winner.title]++;

  }else{

    eliminatedSongs.push(loser);

    selectedSongs =
      selectedSongs.filter(song => song !== loser);

  }

  currentBattle++;
  nextBattle();
}

// ===============================
// 🤝 TIE
// ===============================

function tie(){

  saveBattleHistory();

  scores[currentLeft.title]++;
  scores[currentRight.title]++;

  songPower[currentLeft.title] += 2;
  songPower[currentRight.title] += 2;

  currentBattle++;
  nextBattle();
}

// ===============================
// ⏪ UNDO
// ===============================

function undo(){

  if(history.length === 0) return;

  const prev = history.pop();

  selectedSongs = [...prev.selectedSongs];
  eliminatedSongs = [...prev.eliminatedSongs];
  scores = {...prev.scores};
  songPower = {...prev.songPower};
  usedPairs = new Set(prev.usedPairs);

  currentBattle = prev.currentBattle;
  currentLeft = prev.currentLeft;
  currentRight = prev.currentRight;

  renderBattle();
}

// ===============================
// 🔥 TIMER FUNCTION (TARUH DI SINI)
// ===============================
function startTimer(duration){

  return new Promise(resolve => {

    const timerEl =
      document.getElementById("timer");

    let count = 1;

    const interval =
      setInterval(()=>{

        if(skipCountdown){

          const sfx =
            document.getElementById("reveal-sfx");

          if(sfx){
            sfx.pause();
            sfx.currentTime = 0;
          }

          clearInterval(interval);
          clearTimeout(timeout);

          resolve();
          return;
        }

        timerEl.innerText =
          String(count).padStart(2, "0");

        count++;

        if(count > 99) count = 1;

      }, duration / 99);

    const timeout =
      setTimeout(()=>{

        clearInterval(interval);

        resolve();

      }, duration);

  });
}

// ===============================
// 🔥 SKIP SYSTEM (TARUH DI SINI)
// ===============================
let skipCountdown = false;
let skipSong = false;

const skipCountdownBtn =
  document.getElementById("skip-countdown-btn");

const skipSongBtn =
  document.getElementById("skip-song-btn");

if(skipCountdownBtn){

  skipCountdownBtn.onclick = () => {
    skipCountdown = true;
  };

}

if(skipSongBtn){

  skipSongBtn.onclick = () => {
    skipSong = true;
  };

}



// ===============================
// 🏁 RESULT (SIMPLE VERSION)
// ===============================

function wait(ms){

  return new Promise(resolve => {

    setTimeout(resolve, ms);

  });
}

function showResult(){

  // 🔥 save current screen
  localStorage.setItem(
    "currentScreen",
    "result"
  );

  const battle = document.getElementById("battle-screen");
  const result = document.getElementById("result-screen");

  // 🔥 enable scroll lagi
  document.body.classList.remove("no-scroll");

  battle.classList.add("hidden");

  // tampilkan reveal screen dulu
  document.getElementById("reveal-screen").style.display = "flex";

  result.scrollTop = 0;

  let ranking;

  // =========================
  // 🎯 BUILD RANKING
  // =========================
  if(gameMode === "score"){

    ranking = [...selectedSongs]
      .sort((a,b)=>{

        const scoreDiff =
          scores[b.title] - scores[a.title];

        if(scoreDiff !== 0) return scoreDiff;

        return (
          (songPower[b.title] || 0)
          -
          (songPower[a.title] || 0)
        );

      })
      .slice(0, 40);

  } else {

    ranking = [selectedSongs[0],...eliminatedSongs.reverse()].slice(0,40);

  }

  // ambil top 10
  const revealList = ranking.slice(0,10);

  // mulai dari rank #10
  let index = revealList.length - 1;

  async function revealNext(){

    // =========================
    // 🏁 FINISH → SHOW RESULT
    // =========================
    if(index < 0){

      document.getElementById("reveal-screen").style.display = "none";

      result.classList.add("result-enter");
      result.classList.remove("hidden");

      requestAnimationFrame(()=>{

        result.classList.remove("result-enter");

      });

      window.scrollTo({
        top:0,
        behavior:"instant"
      });

      // 🔥 final ranking
      finalRanking = [...ranking];

      localStorage.setItem(
        "currentScreen",
        "result"
      );

      localStorage.setItem(
        "savedRanking",
        JSON.stringify(finalRanking)
      );

      // 🔥 RENDER RESULT
      renderResult();

      return;
    }

    // =========================
    // 🎬 REVEAL PROCESS
    // =========================
    skipCountdown = false;
    skipSong = false;

    document.getElementById("skip-countdown-btn")
      .style.display = "block";

    document.getElementById("skip-song-btn")
      .style.display = "none";

    const song = revealList[index];

    const overlay = document.getElementById("reveal-overlay");
    const preview = document.getElementById("preview-player");
    const sfx = document.getElementById("reveal-sfx");

    const cover = document.getElementById("reveal-cover");
    const title = document.getElementById("reveal-title");
    const rank = document.getElementById("reveal-rank");

    // reset UI
    cover.style.display = "none";
    title.innerText = "";

    // 🔥 hanya tampil sekali di awal
    if(index === revealList.length - 1){
      rank.innerText = "🔥 TOP 10 🔥";
    }

    overlay.style.display = "flex";

    if(sfx && sfx.src){
      sfx.currentTime = 0;
      sfx.play().catch(()=>{});
    }

    await startTimer(10000);

    if(sfx){
      sfx.pause();
      sfx.currentTime = 0;
    }

    // tampilkan hasil
    overlay.style.display = "none";

    document.getElementById("skip-countdown-btn")
      .style.display = "none";

    document.getElementById("skip-song-btn")
      .style.display = "block";

    let rankNumber = index + 1;

    rank.innerText = `#${rankNumber}`;

    // reset animation
    rank.classList.remove("show");
    cover.classList.remove("show");
    title.classList.remove("show");

    cover.style.display = "none";
    title.innerText = "";

    // =========================
    // 🎨 BG
    // =========================

    const revealScreen =
    document.getElementById("reveal-screen");

    revealScreen.classList.remove("rank-one-mode");

    if(rankNumber >= 7){

      revealScreen.style.background =
        "linear-gradient(to bottom,#0f172a,#000)";

    }else if(rankNumber >= 4){

      revealScreen.style.background =
        "linear-gradient(to bottom,#2e1065,#000)";

    }else if(rankNumber >= 2){

      revealScreen.style.background =
        "linear-gradient(to bottom,#78350f,#000)";

    }else{

      revealScreen.style.background =
        "radial-gradient(circle,#ffe600,#000)";
    }

    // =========================
    // 🎬 CINEMATIC FLOW
    // =========================

    // STEP 1
    await wait(400);

    // reset
    rank.classList.remove("rank-impact");
    cover.classList.remove("cover-reveal");
    title.classList.remove("title-reveal");
    revealScreen.classList.remove("reveal-shake");

    void rank.offsetWidth;
    void cover.offsetWidth;

    // SHAKE
    revealScreen.classList.add(
      "reveal-shake"
    );

    // RANK IMPACT
    rank.classList.add(
      "rank-impact"
    );

    // STEP 2
    await wait(1200);

    // show cover
    cover.src = song.cover;
    cover.style.display = "block";

    void cover.offsetWidth;

    cover.classList.add(
      "cover-reveal"
    );

    // rank1 effect
    if(rankNumber === 1){

      revealScreen.classList.add("rank-one-mode");

      cover.classList.add("rank1-glow");

      launchConfetti();
      launchConfetti();
      launchConfetti();
    }

    // STEP 3
    await wait(1000);

    // title show
    title.innerText = song.title;

    title.classList.add(
      "title-reveal"
    );

    // play audio
    if(song.audio && song.audio !== ""){
      preview.src = song.audio;
      preview.currentTime = 0;
      preview.play().catch(()=>{});
    }

    // tunggu sampai lagu selesai / skip
    await new Promise(resolve => {

      let finished = false;

      const finishReveal = () => {

        if(finished) return;
        finished = true;

        preview.pause();
        preview.currentTime = 0;
        preview.onended = null;

        document.getElementById("skip-song-btn")
          .style.display = "none";

        clearInterval(checkSkip);
        clearTimeout(noAudioTimeout);

        resolve();
      };

      const checkSkip = setInterval(() => {

        if(skipSong){
          finishReveal();
        }

      }, 200);

      const noAudioTimeout =
        !song.audio
          ? setTimeout(finishReveal, 2000)
          : null;

      preview.onended = finishReveal;

    });

    index--;
    await revealNext();
  }

  revealNext();
}
// =========================
// LEGENDARY POPUP
// =========================

const trishaDialogs = [

  "Sabarl kak Sabarl.. kakak serius pilih level legendarly?",

  "Level ini cuman untuk sepuh loh kak",

  "Kakak ga akan kuat, ini cuma untuk yang prlo",

  "eh ini tuh benerlan bakalan susah banget tau",

  "Tunggu... aku mau jelasin tentang level ini, tapi bentarl dulu deh",

  "Jangan nangis ya pas main di level ini",

  "Kemarlin temen aku main di mode ini dia sampe nangis nangis loh",

  "ih apa ya aku lupa mau ngomong apa kak",

  "Ganbatte ne aseekk!!",

  "Kalau salah pencet jangan nyalahin aku ya 😌"

];

let lastTrishaIndex = -1;

function openLegendaryPopup(){

  const popup =
    document.getElementById("legendary-popup");

  const trishaText =
    document.getElementById("trisha-text");

  let randomIndex;

  do{

    randomIndex =
      Math.floor(
        Math.random() * trishaDialogs.length
      );

  }while(randomIndex === lastTrishaIndex);

  lastTrishaIndex = randomIndex;

  trishaText.innerText =
    `"${trishaDialogs[randomIndex]}"`;

  popup.classList.remove("hidden");
}

function closeLegendaryPopup(){
  document.getElementById("legendary-popup").classList.add("hidden");
}

function confirmLegendary(){
  closeLegendaryPopup();
  startSorter(350);
}

// =========================
// BACK TO START SCREEN
// =========================

function backToStart(){

  localStorage.removeItem("currentScreen");

  document.body.classList.remove("no-scroll");

  document.getElementById("result-screen")
    .classList.add("hidden");

  document.getElementById("battle-screen")
    .classList.add("hidden");

  document.getElementById("menu")
    .classList.add("hidden");

  const start =
    document.getElementById("start-screen");

  start.style.display = "block";
  start.style.opacity = "1";

  window.scrollTo({
    top:0,
    behavior:"instant"
  });

  if(typeof dailyPicksAudio !== "undefined"){
    dailyPicksAudio.pause();
  }
}

// =========================
// 🔙 OPTIONAL: BACK TO START SCREEN
// =========================
function goToStart(){

  const start = document.getElementById("start-screen");
  const menu = document.getElementById("menu");
  const battle = document.getElementById("battle-screen");

  start.style.display = "block";
  setTimeout(()=>{
    start.style.opacity = "1";
  },10);

  menu.classList.add("hidden");
  battle.classList.add("hidden");
}

function launchConfetti(){

  const confettiCount =
    window.innerWidth < 500 ? 20 : 40;

  for(let i=0;i<confettiCount;i++){

    let c = document.createElement("div");

    c.style.position="fixed";

    c.style.width="6px";
    c.style.height="6px";

    const colors = [
      "gold",
      "white",
      "#ff4fd8",
      "#00ffff",
      "#ff5252"
    ];

    c.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    c.style.top="0";

    c.style.left=
      Math.random()*100+"%";

    c.style.pointerEvents="none";

    document.body.appendChild(c);

    c.animate([
      {transform:"translateY(0)"},
      {transform:"translateY(100vh)"}
    ],{
      duration:
        1000 + Math.random()*1000
    });

    setTimeout(
      ()=>c.remove(),
      2000
    );
  }
}

function restartGame(){

  localStorage.removeItem("currentScreen");
  localStorage.removeItem("savedRanking");

  document.body.classList.remove("no-scroll");

  document.getElementById("start-screen").style.display =
    "none";

  document.getElementById("result-screen")
    .classList.add("hidden");

  document.getElementById("battle-screen")
    .classList.add("hidden");

  document.getElementById("menu")
    .classList.remove("hidden");

  window.scrollTo({
    top:0,
    behavior:"instant"
  });

  if(typeof dailyPicksAudio !== "undefined"){
    dailyPicksAudio.pause();
  }
}

// =========================
// ✏️ EDIT RESULT TITLE
// =========================

const editBtn =
document.getElementById("edit-title-btn");

const rankingInput =
document.getElementById("ranking-name");

// klik tombol edit
if(editBtn && rankingInput){

  editBtn.onclick = () => {

    rankingInput.removeAttribute("readonly");

    rankingInput.focus();

  };

  // auto save
  rankingInput.addEventListener("input", () => {

    localStorage.setItem(
      "rankingTitle",
      rankingInput.value
    );

  });

  // 🔥 AUTO LOCK LAGI
  rankingInput.addEventListener("blur", () => {

    rankingInput.setAttribute(
      "readonly",
      true
    );

  });

  // load saved title
  const savedTitle =
  localStorage.getItem("rankingTitle");

  if(savedTitle){
    rankingInput.value = savedTitle;
  }

}

// =========================
// 🔥 RESTORE RESULT PAGE
// =========================

window.onload = () => {

  const screen =
    localStorage.getItem("currentScreen");

  const savedRanking =
    JSON.parse(
      localStorage.getItem("savedRanking")
    );

  const savedRequestHour =
    JSON.parse(
      localStorage.getItem("savedRequestHour")
    );

  if(screen !== "result" || !savedRanking){
    return;
  }

  finalRanking = savedRanking;

  if(savedRequestHour){
    document.getElementById("ranking-name").value =
      savedRequestHour.title;
  }

  document.getElementById("start-screen").style.display =
    "none";

  document.getElementById("menu")
    .classList.add("hidden");

  document.getElementById("battle-screen")
    .classList.add("hidden");

  document.getElementById("result-screen")
    .classList.remove("hidden");

  window.scrollTo({
    top:0,
    behavior:"instant"
  });

  renderResult();
};

// =========================
// 🏆 RENDER RESULT
// =========================

function renderResult(){

  const top3Grid =
  document.getElementById("top3-grid");

  const rankingGrid =
  document.getElementById("ranking-grid");

  top3Grid.innerHTML = "";
  rankingGrid.innerHTML = "";

  // TOP 3

  finalRanking.slice(0,3)
  .forEach((song,i)=>{

    const card =
    document.createElement("div");

    let className =
    "top3-card";

    if(i === 0) className += " rank1";
    if(i === 1) className += " rank2";
    if(i === 2) className += " rank3";

    card.className =
    className;

    card.innerHTML = `

      <div class="top3-rank">
        ${i+1}
      </div>

      <img
        src="${
          song.cover ||
          'assets/default.jpg'
        }"
      >

      <div class="top3-title">
        ${song.title}
      </div>

    `;

    top3Grid.appendChild(card);

  });

  // RANK 4+

  finalRanking.slice(3)
  .forEach((song,i)=>{

    const rank = i + 4;

    const card =
    document.createElement("div");

    card.className =
    "rank-card";

    card.innerHTML = `

      <img
        src="${
          song.cover ||
          'assets/default.jpg'
        }"
      >

      <div class="rank-info">

        <div class="rank-number">
          #${rank}
        </div>

        <div class="rank-song">
          ${song.title}
        </div>

      </div>

    `;

    rankingGrid.appendChild(card);

  });

}

// =========================
// 📂 LOAD SAVED RESULT
// =========================

function loadSavedResult(){

  const saved =
    JSON.parse(
      localStorage.getItem("savedRequestHour")
    );

  if(!saved){
    alert("No saved result!");
    return;
  }

  finalRanking = saved.ranking;

  document.getElementById("menu")
    .classList.add("hidden");

  document.getElementById("start-screen")
    .style.display = "none";

  document.getElementById("battle-screen")
    .classList.add("hidden");

  document.getElementById("result-screen")
    .classList.remove("hidden");

  document.getElementById("ranking-name").value =
    saved.title;

  renderResult();
}


function resetSave(){

  // 🗑 hapus SEMUA save
  localStorage.removeItem("currentScreen");
  localStorage.removeItem("savedRanking");
  localStorage.removeItem("rankingTitle");
  localStorage.removeItem("savedRequestHour");

  // 🔥 reset memory
  history = [];
  selectedSongs = [];
  eliminatedSongs = [];
  finalRanking = [];

  // 🔥 balik ke home clean
  location.reload();
}

// =========================
// 🍔 BURGER MENU
// =========================

function toggleMenu(){

const menu =
document.getElementById("side-menu");

const burgerBtn =
document.getElementById("burgerBtn");

menu.classList.toggle("show");

burgerBtn.classList.toggle("active");

}

// =========================
// 📖 ABOUT
// =========================

function openAbout(){

  alert(
`JKT48 Song Sorter dibuat untuk meramaikan Request Hour 2026 🎵

Request Hour adalah event dimana fans memilih lagu favorit mereka untuk menentukan ranking setlist terbaik JKT48 ✨`
  );
}

// =========================
// 🎵 SONG PREVIEW
// =========================

function openPreview(){

  alert(
    "Song Preview akan hadir di update berikutnya 🎧"
  );
}

function scrollToAbout(){

  document
    .getElementById("about-section")
    .scrollIntoView({
      behavior:"smooth"
    });

  toggleMenu();
}

function scrollToPreview(){

  document
    .getElementById("preview-section")
    .scrollIntoView({
      behavior:"smooth"
    });

  toggleMenu();
}

/* ========================= */
/* ⏳ REQUEST HOUR COUNTDOWN */
/* ========================= */

const targetDate = new Date(
  "June 13, 2026 00:00:00"
).getTime();

function updateCountdown(){

  const now = new Date().getTime();

  const distance =
    targetDate - now;

  const days =
    Math.floor(
      distance / (1000 * 60 * 60 * 24)
    );

  const hours =
    Math.floor(
      (distance % (1000 * 60 * 60 * 24))
      / (1000 * 60 * 60)
    );

  const minutes =
    Math.floor(
      (distance % (1000 * 60 * 60))
      / (1000 * 60)
    );

  const seconds =
    Math.floor(
      (distance % (1000 * 60))
      / 1000
    );

  document.getElementById("days").innerText =
    String(days).padStart(2,"0");

  document.getElementById("hours").innerText =
    String(hours).padStart(2,"0");

  document.getElementById("minutes").innerText =
    String(minutes).padStart(2,"0");

  document.getElementById("seconds").innerText =
    String(seconds).padStart(2,"0");
}

updateCountdown();

setInterval(updateCountdown,1000);

// =========================
// 🎧 TRISHA DAILY COVERFLOW
// =========================

const dailyDialogTexts = [
  "Harli ini aku pilih lagu ini buat kakak 💕",
  "Coba dengerlin ini dulu deh, vibesnya dapet banget ✨",
  "Menurut Trisha, lagu harli ini cocok buat nemenin mood kakak 🎧",
  "Jangan diskip ya kak, ini pilihan spesial harli ini 😌",
  "Aku ambilin darli semesta buat kakak harli ini 🎀",
  "Kalau bingung mau dengerlin apa, mulai darli lagu ini dulu kak 💫",
  "Ini lagu pilihan Trisha buat nemenin harli kakak 🌙"
];

const coverflowDots =
document.getElementById(
  "coverflow-dots"
);

const coverflowTrack =
  document.getElementById("coverflow-track");

const coverflowTitle =
  document.getElementById("coverflow-title");

const coverflowSetlist =
  document.getElementById("coverflow-setlist");

const coverflowPlay =
  document.getElementById("coverflow-play");

const dailyPicksAudio =
  document.getElementById("daily-picks-audio");

const dailyDialog =
  document.getElementById("daily-dialog");

let dailyCoverflowSongs = [];
let activeCoverflowIndex = 0;
let coverflowTimer = null;

function getDailySongs(){

  const today = new Date();

  const dayKey =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const picked = [];

  for(let i = 0; i < 5; i++){

    const index =
      (dayKey + i * 37) % songs.length;

    picked.push(songs[index]);
  }

  return picked;
}

function updateDailyDialog(){

  const today =
    new Date();

  const dialogIndex =
    today.getDate() % dailyDialogTexts.length;

  dailyDialog.innerText =
    `"${dailyDialogTexts[dialogIndex]}"`;
}

function initDailyCoverflow(){
  
    if(
    !coverflowTrack ||
    !coverflowDots ||
    !coverflowTitle ||
    !coverflowSetlist ||
    !coverflowPlay ||
    !dailyPicksAudio
  ){
    return;
  }

  dailyCoverflowSongs =
    getDailySongs();

  updateDailyDialog();

  coverflowTrack.innerHTML = "";
  coverflowDots.innerHTML = "";

  dailyCoverflowSongs.forEach((song,index)=>{

    const card =
      document.createElement("div");

    card.className =
      "coverflow-card hidden-card";

    const dot =
    document.createElement("div");

    dot.className =
      "coverflow-dot";

    coverflowDots.appendChild(dot);

    card.innerHTML = `
      <img src="${song.cover || 'assets/default.jpg'}">
    `;

    card.onclick = () => {

      if(index === activeCoverflowIndex){

        if(dailyPicksAudio.paused){

          playActiveCoverflowSong();

        }else{

          dailyPicksAudio.pause();

          coverflowPlay.innerText =
            "▶ PLAY PREVIEW";
        }

        return;
      }

      activeCoverflowIndex = index;

      updateCoverflow();

      playActiveCoverflowSong();
    };

    coverflowTrack.appendChild(card);
  });

  updateCoverflow();
  restartCoverflowAuto();
}

function updateCoverflow(){

  const cards =
    document.querySelectorAll(".coverflow-card");

  const total =
    dailyCoverflowSongs.length;

  const activeSong =
    dailyCoverflowSongs[activeCoverflowIndex];

  cards.forEach((card,index)=>{

    card.className =
      "coverflow-card hidden-card";

    const leftIndex =
      (activeCoverflowIndex - 1 + total) % total;

    const rightIndex =
      (activeCoverflowIndex + 1) % total;

    if(index === activeCoverflowIndex){
      card.className = "coverflow-card active";
    }

    if(index === leftIndex){
      card.className = "coverflow-card left";
    }

    if(index === rightIndex){
      card.className = "coverflow-card right";
    }

  });

  coverflowTitle.innerText =
    activeSong.title;

  coverflowSetlist.innerText =
    (
      activeSong.setlist ||
      activeSong.type ||
      "JKT48"
    ).toUpperCase();

  coverflowPlay.innerText =
    "▶ PLAY PREVIEW";

  const dots =
  document.querySelectorAll(
    ".coverflow-dot"
  );

  dots.forEach((dot,index)=>{

    dot.classList.toggle(
      "active",
      index === activeCoverflowIndex
    );

  });
}

function nextCoverflow(){

  activeCoverflowIndex =
    (activeCoverflowIndex + 1) %
    dailyCoverflowSongs.length;

  updateCoverflow();

  playActiveCoverflowSong();
}

function playActiveCoverflowSong(){

  const song =
    dailyCoverflowSongs[activeCoverflowIndex];

  if(!song.audio){
    stopDailyAudio();
    return;
  }

  dailyPicksAudio.src = song.audio;
  dailyPicksAudio.currentTime = 0;

  dailyPicksAudio.play().catch(()=>{});

  coverflowPlay.innerText =
    "❚❚ PAUSE";
}

function prevCoverflow(){

  activeCoverflowIndex =
    (
      activeCoverflowIndex - 1 +
      dailyCoverflowSongs.length
    ) % dailyCoverflowSongs.length;

  stopDailyAudio();

  updateCoverflow();
}

function restartCoverflowAuto(){
  clearInterval(coverflowTimer);
}

function stopDailyAudio(){

  dailyPicksAudio.pause();
  dailyPicksAudio.currentTime = 0;

  coverflowPlay.innerText =
    "▶ PLAY PREVIEW";
}

coverflowPlay.onclick = () => {

  const song =
    dailyCoverflowSongs[activeCoverflowIndex];

  if(!song.audio){
    alert("Preview audio belum tersedia untuk lagu ini 😭");
    return;
  }

  clearInterval(coverflowTimer);

  if(dailyPicksAudio.paused){

    dailyPicksAudio.src = song.audio;
    dailyPicksAudio.play().catch(()=>{});

    coverflowPlay.innerText =
      "❚❚ PAUSE";

  }else{

    stopDailyAudio();

    restartCoverflowAuto();
  }
};

dailyPicksAudio.onended = () => {

  coverflowPlay.innerText =
    "▶ PLAY PREVIEW";

  nextCoverflow();

  playActiveCoverflowSong();
};

// swipe mobile

let coverTouchStart = 0;
let coverTouchEnd = 0;

coverflowTrack.addEventListener("touchstart",(e)=>{

  coverTouchStart =
    e.changedTouches[0].screenX;

});

coverflowTrack.addEventListener("touchend",(e)=>{

  coverTouchEnd =
    e.changedTouches[0].screenX;

  const diff =
    coverTouchEnd - coverTouchStart;

  if(diff > 50){
    prevCoverflow();
    playActiveCoverflowSong();
  }

  if(diff < -50){
    nextCoverflow();
    playActiveCoverflowSong();
  }

});

initDailyCoverflow();

// =========================
// ⏸️ AUTO PAUSE DAILY PICKS
// =========================

const dailySection =
  document.getElementById("preview-section");

const dailyObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if(!entry.isIntersecting){

          dailyPicksAudio.pause();

          coverflowPlay.innerText =
            "▶ PLAY PREVIEW";
        }

      });

    },
    {
      threshold:0.25
    }
  );

dailyObserver.observe(dailySection);