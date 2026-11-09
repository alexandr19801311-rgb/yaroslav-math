var f=Object.defineProperty;var E=(a,i,t)=>i in a?f(a,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[i]=t;var r=(a,i,t)=>E(a,typeof i!="symbol"?i+"":i,t);(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&e(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();const v="logikids_";class y{saveHighScore(i,t){const e=this.getHighScore(i);return t>e?(localStorage.setItem(this.buildKey(i),t.toString()),!0):!1}getHighScore(i){const t=localStorage.getItem(this.buildKey(i));if(t===null)return 0;const e=Number.parseInt(t,10);return Number.isFinite(e)?e:0}buildKey(i){return`${v}${i}`}}class L{constructor(i,t){r(this,"duration");r(this,"timeLeft");r(this,"timerId",null);r(this,"onTimeUp");this.duration=i,this.timeLeft=i,this.onTimeUp=t}start(i){this.timerId===null&&(i(this.timeLeft,1),this.timerId=window.setInterval(()=>{this.timeLeft--;const t=this.timeLeft/this.duration;i(this.timeLeft,t),this.timeLeft<=0&&(this.stop(),this.onTimeUp())},1e3))}pause(){this.stop()}reset(){this.stop(),this.timeLeft=this.duration}stop(){this.timerId!==null&&(clearInterval(this.timerId),this.timerId=null)}}class b{constructor(i=60){r(this,"score",0);r(this,"isRunning",!1);r(this,"timer");r(this,"stateManager");this.timer=new L(i,()=>this.onTimeUp()),this.stateManager=new y}start(){this.score=0,this.isRunning=!0,this.onStart(),this.timer.start((i,t)=>this.onTick(t,i)),this.generateTask()}pause(){this.isRunning=!1,this.timer.pause()}addScore(i){this.isRunning&&(this.score+=i)}onTimeUp(){this.isRunning=!1,this.timer.stop();const i=this.stateManager.saveHighScore(this.gameId,this.score);this.showGameOverScreen(i)}onStart(){}onCorrect(i,t){}onWrong(){}onTick(i,t){}}const d=class d extends b{constructor(){super(...arguments);r(this,"gameId","arithmetic");r(this,"currentAnswer",0);r(this,"problemEl");r(this,"inputEl");r(this,"submitBtn");r(this,"scoreEl");r(this,"timerFillEl");r(this,"timerBarEl");r(this,"timerTextEl");r(this,"comboEl");r(this,"highScoreEl");r(this,"overlayEl",null);r(this,"combo",{streak:0,multiplier:1})}init(){const t=document.getElementById("game-container");t&&(t.innerHTML=`
      <div class="game-card">
        <div class="game-header">
          <div class="timer-block">
            <div class="timer-bar" id="timer-bar">
              <div class="timer-bar__fill" id="timer-fill"></div>
            </div>
            <span class="timer-text" id="timer-text">60с</span>
          </div>
          <div class="score-box">Очки: <span id="game-score">0</span></div>
          <div class="record-box">Рекорд: <span id="game-record">0</span></div>
        </div>

        <div class="combo-box" id="combo-box" aria-live="polite"></div>

        <div class="problem-display" id="problem-text">Загрузка...</div>

        <div class="input-zone">
          <input
            type="number"
            id="answer-input"
            placeholder="?"
            autofocus
            inputmode="numeric"
            autocomplete="off"
          />
          <button id="submit-btn" type="button">Ответить</button>
        </div>
      </div>
    `,this.problemEl=this.mustGet("problem-text"),this.inputEl=this.mustGet("answer-input"),this.submitBtn=this.mustGet("submit-btn"),this.scoreEl=this.mustGet("game-score"),this.timerFillEl=this.mustGet("timer-fill"),this.timerBarEl=this.mustGet("timer-bar"),this.timerTextEl=this.mustGet("timer-text"),this.comboEl=this.mustGet("combo-box"),this.highScoreEl=this.mustGet("game-record"),this.highScoreEl.textContent=String(this.stateManager.getHighScore(this.gameId)),this.submitBtn.addEventListener("click",()=>this.handleAnswerSubmit()),this.inputEl.addEventListener("keydown",e=>{e.key==="Enter"&&this.handleAnswerSubmit()}),this.start())}generateTask(){const t=Math.random()>.5;let e=Math.floor(Math.random()*15)+1,s=Math.floor(Math.random()*15)+1;if(t){for(;e+s>20;)e=Math.floor(Math.random()*15)+1,s=Math.floor(Math.random()*15)+1;this.currentAnswer=e+s,this.problemEl.textContent=`${e} + ${s} =`}else{if(e<s){const n=e;e=s,s=n}this.currentAnswer=e-s,this.problemEl.textContent=`${e} - ${s} =`}this.inputEl.value="",this.inputEl.focus()}checkAnswer(t){return typeof t!="number"||!Number.isFinite(t)?!1:t===this.currentAnswer?(this.handleCorrect(),!0):(this.handleWrong(),!1)}handleAnswerSubmit(){if(!this.isRunning)return;const t=this.inputEl.value.trim();if(t==="")return;const e=Number(t);Number.isFinite(e)&&this.checkAnswer(e)}handleCorrect(){this.combo.streak+=1,this.combo.multiplier=this.calcMultiplier(this.combo.streak);const t=d.BASE_POINTS,e=Math.round(t*this.combo.multiplier);this.addScore(e),this.updateScoreUI(),this.updateComboUI(),this.onCorrect(t,e),this.generateTask()}handleWrong(){const t=this.combo.streak;this.combo.streak=0,this.combo.multiplier=1,this.updateComboUI(),this.onWrong(),t>0&&(this.inputEl.value="",this.inputEl.focus())}calcMultiplier(t){return t>=6?2:t>=3?1.5:1}updateScoreUI(){this.scoreEl.textContent=String(this.score)}updateComboUI(){this.combo.streak>=2?(this.comboEl.textContent=`🔥 Комбо ×${this.combo.streak} (×${this.combo.multiplier} очков)`,this.comboEl.classList.add("combo-box--visible"),this.comboEl.classList.toggle("combo-box--hot",this.combo.multiplier>1)):(this.comboEl.textContent="",this.comboEl.classList.remove("combo-box--visible","combo-box--hot"))}onTick(t,e){const s=Math.max(0,Math.min(1,t));this.timerFillEl.style.transform=`scaleX(${s})`,this.timerTextEl.textContent=`${e}с`,this.timerBarEl.classList.remove("timer-bar--warn","timer-bar--danger"),s<=.2?this.timerBarEl.classList.add("timer-bar--danger"):s<=.5&&this.timerBarEl.classList.add("timer-bar--warn")}onCorrect(t,e){this.problemEl.classList.remove("problem-display--pop"),this.problemEl.offsetWidth,this.problemEl.classList.add("problem-display--pop"),this.spawnFloatingPoints(e),this.submitBtn.classList.remove("btn--flash"),this.submitBtn.offsetWidth,this.submitBtn.classList.add("btn--flash")}onWrong(){this.inputEl.classList.remove("error-shake"),this.inputEl.offsetWidth,this.inputEl.classList.add("error-shake"),setTimeout(()=>this.inputEl.classList.remove("error-shake"),300)}spawnFloatingPoints(t){const e=document.createElement("div");e.className="floating-points",e.textContent=`+${t}`,this.problemEl.appendChild(e),e.addEventListener("animationend",()=>e.remove())}showGameOverScreen(){const t=this.score,e=this.stateManager.getHighScore(this.gameId),s=this.stateManager.getHighScore(this.gameId),n=s>e||s===t&&t>e;this.overlayEl&&this.overlayEl.remove();const o=document.createElement("div");o.className="game-overlay",o.innerHTML=`
      <div class="game-overlay__card">
        <h2 class="game-overlay__title">Время вышло!</h2>
        <p class="game-overlay__score">Очки: <strong>${t}</strong></p>
        <p class="game-overlay__record">
          ${n?"🎉 Новый рекорд!":`Рекорд: <strong>${s}</strong>`}
        </p>
        <button type="button" class="game-overlay__btn" id="overlay-restart">Играть снова</button>
      </div>
    `,document.body.appendChild(o),this.overlayEl=o;const l=o.querySelector("#overlay-restart");l==null||l.addEventListener("click",()=>this.restartGame()),l==null||l.focus()}restartGame(){this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null),this.combo={streak:0,multiplier:1},this.updateComboUI(),this.updateScoreUI(),this.highScoreEl.textContent=String(this.stateManager.getHighScore(this.gameId)),this.timer.reset(),this.start()}mustGet(t){const e=document.getElementById(t);if(!e)throw new Error(`[ArithmeticGame] Element #${t} not found`);return e}};r(d,"BASE_POINTS",10);let g=d;const S={"app.title":"LogiKids: Развивающие игры","game.time":"Время","game.score":"Очки","game.record":"Рекорд","game.level":"Уровень","game.answer":"Ответить","game.placeholder":"?","game.playAgain":"Играть снова","game.timeUp":"Время вышло!","game.newRecord":"Новый рекорд!","game.combo":"Комбо ×{streak} (×{multiplier} очков)","game.comboShort":"Комбо ×{streak}","scales.hintMsg":"Посмотри на подсказку и попробуй еще раз!"},M={"app.title":"LogiKids: Learning Games","game.time":"Time","game.score":"Score","game.record":"Record","game.level":"Level","game.answer":"Answer","game.placeholder":"?","game.playAgain":"Play again","game.timeUp":"Time's up!","game.newRecord":"New record!","game.combo":"Combo ×{streak} (×{multiplier} points)","game.comboShort":"Combo ×{streak}","scales.hintMsg":"Look at the hint and try again!"},w="logikids_locale",I="ru",T=["ru","en"],k={ru:S,en:M};function C(){const a=localStorage.getItem(w);if(a!==null&&p(a))return a;const t=navigator.language.toLowerCase().split("-")[0];return p(t)?t:I}function p(a){return T.includes(a)}let x=C();function c(a,i){return k[x][a]??a}class _ extends b{constructor(){super(...arguments);r(this,"gameId","logic-scales");r(this,"isHintMode",!1);r(this,"currentTask",null);r(this,"comboStreak",0);r(this,"leftPanEl");r(this,"rightPanEl");r(this,"leftHintEl");r(this,"rightHintEl");r(this,"leftLabelEl");r(this,"rightLabelEl");r(this,"scoreEl");r(this,"hintMsgEl")}init(){const t=document.getElementById("game-container");t&&(t.innerHTML=`
      <div class="scales-card">
        <div class="scales-header">
          <div class="scales-score">${c("game.score")}: <span id="scales-score">0</span></div>
        </div>
        
        <div class="scales-hint-msg" id="scales-hint-msg"></div>

        <div class="scales-board">
          <div class="scale-side" id="left-side">
            <div class="scale-label" id="left-label">?</div>
            <div class="scale-pan" id="left-pan">
              <div class="scale-hint-area" id="left-hint"></div>
            </div>
          </div>
          
          <div class="scale-center">⚖️</div>
          
          <div class="scale-side" id="right-side">
            <div class="scale-label" id="right-label">?</div>
            <div class="scale-pan" id="right-pan">
              <div class="scale-hint-area" id="right-hint"></div>
            </div>
          </div>
        </div>

        <div class="scales-controls">
          <button type="button" class="scales-btn" data-answer="<">&lt;</button>
          <button type="button" class="scales-btn" data-answer="=">=</button>
          <button type="button" class="scales-btn" data-answer=">">&gt;</button>
        </div>
      </div>
    `,this.leftPanEl=document.getElementById("left-side"),this.rightPanEl=document.getElementById("right-side"),this.leftHintEl=document.getElementById("left-hint"),this.rightHintEl=document.getElementById("right-hint"),this.leftLabelEl=document.getElementById("left-label"),this.rightLabelEl=document.getElementById("right-label"),this.scoreEl=document.getElementById("scales-score"),this.hintMsgEl=document.getElementById("scales-hint-msg"),t.querySelectorAll(".scales-btn").forEach(e=>{e.addEventListener("click",s=>{const n=s.currentTarget;this.handleAnswerSubmit(n.dataset.answer)})}),this.start())}onStart(){this.isHintMode=!1,this.comboStreak=0,this.updateScoreUI()}generateTask(){this.isHintMode=!1,this.resetScalesVisuals(),this.hintMsgEl.textContent="",this.hintMsgEl.classList.remove("visible");const t=Math.random()>.5;let e,s,n;if(t){const m=Math.floor(Math.random()*5)+1,u=Math.floor(Math.random()*5)+1;e=m+u,s=`${m} + ${u}`,n=[m,u]}else e=Math.floor(Math.random()*10)+1,s=e.toString(),n=[e];const o=Math.floor(Math.random()*10)+1,l=o.toString(),h=[o];this.currentTask={leftValue:e,rightValue:o,leftLabel:s,rightLabel:l,hintLeft:n,hintRight:h},this.leftLabelEl.textContent=s,this.rightLabelEl.textContent=l}handleAnswerSubmit(t){this.isRunning&&this.checkAnswer(t)}checkAnswer(t){if(!this.isRunning||!this.currentTask||typeof t!="string")return!1;const e=this.getCorrectSymbol(this.currentTask.leftValue,this.currentTask.rightValue);return t===e?(this.isHintMode?(this.addScore(2),this.comboStreak=0):(this.addScore(10),this.comboStreak++),this.updateScoreUI(),this.generateTask(),!0):this.isHintMode?(this.isHintMode=!1,this.onWrong(),this.hintMsgEl.textContent=`${c("game.answer")}: ${e}`,this.hintMsgEl.classList.add("visible"),setTimeout(()=>this.generateTask(),1500),!1):(this.isHintMode=!0,this.renderVisualHint(),this.onWrong(),this.hintMsgEl.textContent=c("scales.hintMsg"),this.hintMsgEl.classList.add("visible"),!1)}getCorrectSymbol(t,e){return t>e?">":t<e?"<":"="}renderVisualHint(){this.currentTask&&(this.renderItemsToContainer(this.leftHintEl,this.currentTask.hintLeft),this.renderItemsToContainer(this.rightHintEl,this.currentTask.hintRight),this.leftPanEl.classList.remove("tip-down","tip-up"),this.rightPanEl.classList.remove("tip-down","tip-up"),this.currentTask.leftValue>this.currentTask.rightValue?(this.leftPanEl.classList.add("tip-down"),this.rightPanEl.classList.add("tip-up")):this.currentTask.leftValue<this.currentTask.rightValue&&(this.leftPanEl.classList.add("tip-up"),this.rightPanEl.classList.add("tip-down")))}renderItemsToContainer(t,e){t.innerHTML="",e.forEach((s,n)=>{const o=document.createElement("div");o.className=`hint-group hint-color-${n%2}`;for(let l=0;l<s;l++){const h=document.createElement("span");h.className="hint-item",h.style.animationDelay=`${l*50}ms`,o.appendChild(h)}t.appendChild(o)})}resetScalesVisuals(){this.leftPanEl.classList.remove("tip-down","tip-up"),this.rightPanEl.classList.remove("tip-down","tip-up"),this.leftHintEl.innerHTML="",this.rightHintEl.innerHTML=""}updateScoreUI(){this.scoreEl&&(this.scoreEl.textContent=String(this.score))}showGameOverScreen(t){var n;const e=this.score,s=document.createElement("div");s.className="game-overlay",s.innerHTML=`
      <div class="game-overlay__card">
        <h2 class="game-overlay__title">${c("game.timeUp")}</h2>
        <p class="game-overlay__score">${c("game.score")}: <strong>${e}</strong></p>
        <p class="game-overlay__record">
          ${t?`🎉 ${c("game.newRecord")}`:""}
        </p>
        <button type="button" class="game-overlay__btn" id="restart-btn">${c("game.playAgain")}</button>
      </div>
    `,document.body.appendChild(s),(n=s.querySelector("#restart-btn"))==null||n.addEventListener("click",()=>{s.remove(),this.timer.reset(),this.start()})}}document.addEventListener("DOMContentLoaded",()=>{const a=document.getElementById("menu-container"),i=document.getElementById("game-container"),t=document.getElementById("btn-start-arithmetic"),e=document.getElementById("btn-start-scales");function s(n){a&&i&&(a.style.display="none",i.style.display="block",n.init())}t&&t.addEventListener("click",()=>{s(new g(60))}),e&&e.addEventListener("click",()=>{s(new _(60))})});
