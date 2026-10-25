const $=id=>document.getElementById(id);
const S={target:0,locked:0,live:0,playing:false,win:0,lose:0,streak:0,best:0,mqtt:false,buf:[]};
const fmt=n=>(Math.round(n*10)/10).toFixed(1);
let P=[];   // confetti particles (ประกาศไว้บนสุด)

function log(html,cls=''){
  const d=document.createElement('div');
  d.className=cls;
  d.innerHTML=html;
  $('log').prepend(d);
}

function setMsg(t,c){
  $('msg').textContent=t;
  $('msg').className=c||'';
}

function setLive(v){
  S.buf.push(v);if(S.buf.length>5)S.buf.shift();
  S.live=v;
  render();
}

function render(){
  $('live').firstChild.nodeValue=fmt(S.live);
  if(!S.playing){
    return;
  }
  const rem=S.target-S.locked-S.live, tol=+$('tol').value;
  $('rem').firstChild.nodeValue=fmt(rem);
  $('rem').style.color=rem<-tol?'var(--rd)':Math.abs(rem)<=tol?'var(--gr)':'var(--yl)';
  const used=S.locked+S.live, pct=Math.min(100,used/S.target*100);
  $('fill').style.width=pct+'%';
  $('fill').classList.toggle('over',rem<-tol);
}

function flash(color,cls){
  const a=$('arena');a.style.setProperty('--c',color);
  a.classList.remove('flash','shake');
  void a.offsetWidth;a.classList.add(cls||'flash');
  a.onanimationend=()=>a.classList.remove('flash','shake');
}

let tInt=null,tLeft=0;
function stopTimer(){
  clearInterval(tInt);tInt=null;
}

function updTimer(){
  $('tnum').textContent=tLeft.toFixed(1);
  $('tfill').style.width=(tLeft/+$('tlimit').value*100)+'%';$('timer').classList.toggle('low',tLeft<=5);
}

function startTimer(){
  stopTimer();
  if($('mode').value!=='timer'){
    $('timer').style.display='none';
    return;
  }
  const lim=+$('tlimit').value,t0=performance.now();tLeft=lim;$('timer').style.display='';updTimer();
  tInt=setInterval(()=>{
    tLeft=Math.max(0,lim-(performance.now()-t0)/1000);updTimer();
    if(tLeft<=0){
      stopTimer();
      if(S.playing)end(false,0,true);}},100);
}
$('mode').onchange=()=>{if(!S.playing)
                          $('timer').style.display='none';
                        };

function startGame(){
  const max=+$('maxR').value;
  S.target=Math.round((30+Math.random()*(max-30))*10)/10;
  S.locked=0;
  S.playing=true;P=[];cx.clearRect(0,0,cv.width,cv.height);
  $('arena').classList.remove('flash','shake');
  $('target').firstChild.nodeValue=fmt(S.target);
  $('tmax').textContent=fmt(S.target)+' cm';
  $('lock').disabled=false;
  $('start').textContent='🔄 เริ่มใหม่';
  setMsg('กะระยะแล้วกดล็อก — ทำให้คงเหลือเป็น 0!');
  startTimer();render();
  log('🎯 รอบใหม่ เป้าหมาย <b>'+fmt(S.target)+' cm</b>');
}

function lockValue(val){
  if(!S.playing)
    return;

  const tol=+$('tol').value;
  const v=(typeof val==='number')?val:S.live;
  const rem=S.target-S.locked-v; S.locked+=v;
  log('🔒 ล็อก <b>'+fmt(v)+'</b> cm → เหลือ <b>'+fmt(rem)+'</b>');

  if(Math.abs(rem)<=tol){ 
      end(true,rem); 
  } else if(rem<0){
      end(false,rem); 
  } else { 
      flash('#22e6ff');
      setMsg('เหลืออีก '+fmt(rem)+' cm — กะต่อได้เลย','');
      S.buf=[]; 
  }
  render();
}
function end(won,rem,timeout){
  stopTimer();S.playing=false;
  $('lock').disabled=true;
  if(won){
    S.win++;
    S.streak++;
    S.best=Math.max(S.best,S.streak);
    const ts=$('mode').value==='timer'?' • เหลือเวลา '+tLeft.toFixed(1)+' วิ':'';
    setMsg('🎉 สำเร็จ! คลาดเคลื่อน '+fmt(Math.abs(rem))+' cm'+ts,'win');
    log('✅ ชนะ (คลาดเคลื่อน '+fmt(Math.abs(rem))+')'+ts,'win');
    flash('#3dff9a');
    confetti();
  }else{
    S.lose++;S.streak=0;
    if(timeout){
      setMsg('⏰ หมดเวลา — แพ้!','lose');
      log('❌ แพ้ (หมดเวลา)','lose');
    } else{
      setMsg('💥 ติดลบ '+fmt(rem)+' cm — แพ้!','lose');
      log('❌ แพ้ (ติดลบ '+fmt(rem)+')','lose');
    }
    flash('#ff4d6d','shake');
  }
  $('sWin').textContent=S.win;
  $('sLose').textContent=S.lose;
  $('sStreak').textContent=S.streak;
  $('sBest').textContent=S.best;
}

function nextpage(){
  window.location.href = 'index2.html';
}

function returnpage(){
  window.location.href = 'index.html';
}


$('start').onclick=startGame;
$('lock').onclick=lockValue;
$('next').onclick=nextpage;
$('return').onclick=returnpage;

addEventListener('keydown',e=>{
  const tg=e.target.tagName;
  if(e.code==='Space'&&tg!=='SELECT'&&tg!=='INPUT'){
    e.preventDefault();S.playing?lockValue():startGame();
  }
});
$('sim').oninput=e=>{if(!S.mqtt)
                        setLive(+e.target.value);
                      };

/* ---------- MQTT ---------- */
let mq=null,lastMsg=0;

function mqSet(on){
  S.mqtt=on;
  $('dot').classList.toggle('on',on);
  $('connectMqtt').textContent=on?'✖ ตัด MQTT':'📶 MQTT';
  if(!on){
    $('cstat').textContent='ยังไม่เชื่อมต่อ';
  }
}

setInterval(()=>{
  if(!S.mqtt) {
    return;
  }
  const ok=lastMsg&&Date.now()-lastMsg<3000;
  $('cstat').textContent=ok?'MQTT เชื่อมต่อแล้ว • รับข้อมูลจากบอร์ด ✓'
    :'ต่อโบรกเกอร์แล้ว แต่ยังไม่ได้รับข้อมูลจาก Arduino (เช็ก topic / บอร์ด)';
},1000);

$('connectMqtt').onclick=()=>{
  // กดซ้ำ = ตัดการเชื่อมต่อ
  if(mq){
    try{mq.disconnect();}catch(e){}
    mq=null;mqSet(false);log('📶 ตัดการเชื่อมต่อ MQTT');return;
  }
  if(typeof Paho==='undefined'){
    alert('โหลดไลบรารี Paho ไม่ได้ — เช็กอินเทอร์เน็ต');
    return;
  }

  const host=$('mqUrl').value.trim(), port=parseInt($('mqPort').value,10);
  const pre=$('mqTopic').value.trim().replace(/\/+$/,'');
  const ssl=$('mqSsl').value==='1';
  if(!host || !port || !pre){
    alert('กรอก broker / port / topic ให้ครบ');
    return;
  }

  const client=new Paho.MQTT.Client(host,port,'zero-'+Math.random().toString(16).slice(2,8));
  mq=client;lastMsg=0;
  $('cstat').textContent='กำลังเชื่อมต่อ MQTT…';
  log('📶 กำลังเชื่อมต่อ '+host+':'+port+(ssl?' (wss)':' (ws)'));

  client.onConnectionLost=r=>{
    if(mq!==client)
      return;
    mq=null;
    mqSet(false);
    log('⚠️ MQTT หลุด: '+(r.errorMessage||''),'lose');
  };
  client.onMessageArrived=m=>{
    lastMsg=Date.now();
    const v=parseFloat(m.payloadString);
    if(!(v>0&&v<500)){ 
      return;
    }

    if(m.destinationName===pre+'/lock'){
      lockValue();
      return;
    }

    if(m.destinationName===pre+'/distance'){
      setLive(v);
    }
  };

  client.connect({
    timeout:5,
    useSSL:ssl,
    onSuccess:()=>{
      client.subscribe(pre+'/distance');
      client.subscribe(pre+'/lock');
      mqSet(true);
      log('📶 เชื่อมต่อ MQTT สำเร็จ ('+pre+')');
    },
    onFailure:e=>{
      if(mq===client)
        mq=null;
      mqSet(false);
      log('⚠️ เชื่อมต่อไม่สำเร็จ: '+(e.errorMessage||'')+' — ลองสลับ wss/ws หรือเปลี่ยนพอร์ต','lose');
    }
  });
};

/* ---------- confetti ---------- */
const cv=$('fx'),cx=cv.getContext('2d');

function size(){
  cv.width=innerWidth;
  cv.height=innerHeight
}
size();
addEventListener('resize',size);

function confetti(){
  for(let i=0;i<140;i++){
    P.push({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*16,vy:Math.random()*-14-2,r:Math.random()*5+2,c:['#22e6ff','#ff3df0','#3dff9a','#ffd23d'][i%4],l:100});
    anim();
  }
}

function anim(){
  cx.clearRect(0,0,cv.width,cv.height);
  P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.l--;cx.fillStyle=p.c;cx.fillRect(p.x,p.y,p.r,p.r*1.6)});
  P=P.filter(p=>p.l>0);
  if(P.length){
    requestAnimationFrame(anim);
  } else {
    cx.clearRect(0,0,cv.width,cv.height);
  }
}