'use strict';
const $ = id => document.getElementById(id);
const file = $('file'), preview = $('preview'), ctx = preview.getContext('2d');
const fields = ['width','height','limit','zoom','pan-x','pan-y'];
let photo = null, photoUrl = null, resultUrl = null, selection = 0, busy = false;
function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
function clearResult() {
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = null; $('result').hidden = true; $('download').removeAttribute('href');
}
function config() {
  const w = Number($('width').value), h = Number($('height').value), kb = Number($('limit').value);
  if (![w,h,kb].every(Number.isInteger) || w < 32 || h < 32 || w > 4096 || h > 4096 || kb < 5 || kb > 10000) throw new Error('가로·세로는 32~4096px, 용량은 5~10000KB의 정수로 입력해 주세요.');
  return {w,h,kb};
}
function draw(canvas, w, h) {
  canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0,0,w,h);
  const scale = Math.max(w/photo.naturalWidth, h/photo.naturalHeight) * Number($('zoom').value);
  const sw = w/scale, sh = h/scale;
  const sx = Math.max(0,photo.naturalWidth-sw) * Number($('pan-x').value)/100;
  const sy = Math.max(0,photo.naturalHeight-sh) * Number($('pan-y').value)/100;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(photo,sx,sy,sw,sh,0,0,w,h);
}
function update() {
  clearResult();
  try {
    const {w,h} = config();
    if (photo) { const ratio = Math.min(360/w,260/h,1); draw(preview,Math.max(1,Math.round(w*ratio)),Math.max(1,Math.round(h*ratio))); }
    $('convert').disabled = !photo || busy;
    status(photo ? '미리보기 영역이 그대로 저장돼요. 위치를 확인해 주세요.' : '사진을 선택하면 시작할 수 있어요.');
  } catch(e) { $('convert').disabled = true; status(e.message,true); }
}
function lock(value) {
  busy=value;
  for (const id of [...fields,'preset','file','reset']) $(id).disabled=value;
  $('convert').disabled = value || !photo;
  $('drop').setAttribute('aria-disabled',String(value));
}
async function loadPhoto(blob) {
  if (busy || !blob) return;
  const ticket=++selection;
  clearResult(); photo=null; $('preview-area').hidden=true; $('drop').hidden=false; $('reset').hidden=false;
  if (photoUrl) URL.revokeObjectURL(photoUrl); photoUrl=null;
  $('convert').disabled=true;
  if (!['image/jpeg','image/png','image/webp'].includes(blob.type)) {status('JPG, PNG, WebP 사진만 선택해 주세요. HEIC는 JPG로 변환 후 이용해 주세요.',true); return;}
  if (blob.size > 30*1024*1024) {status('사진이 너무 커요. 30MB 이하 파일을 선택해 주세요.',true); return;}
  status('사진을 불러오는 중이에요…');
  const url=URL.createObjectURL(blob), img=new Image();
  try {
    img.src=url; await img.decode();
    if (ticket!==selection) {URL.revokeObjectURL(url); return;}
    if (img.naturalWidth*img.naturalHeight > 40_000_000) throw new Error('사진 해상도가 너무 커요. 4,000만 화소 이하로 줄여 주세요.');
    photo=img; photoUrl=url;
    $('zoom').value=1; $('pan-x').value=50; $('pan-y').value=50;
    $('file-info').textContent=`${blob.name || '사진'} · ${img.naturalWidth} × ${img.naturalHeight}px · ${(blob.size/1024).toFixed(1)}KB`;
    $('drop').hidden=true; $('preview-area').hidden=false; update();
  } catch(e) {URL.revokeObjectURL(url); if(ticket===selection) status(e.message.includes('화소') ? e.message : '사진을 열 수 없어요. 손상되지 않은 다른 사진을 선택해 주세요.',true);}
}
file.addEventListener('change',()=> {loadPhoto(file.files[0]); file.value='';});
$('drop').addEventListener('keydown',e=>{if(e.target===$('drop') && ['Enter',' '].includes(e.key)){e.preventDefault();if(!busy)file.click();}});
for(const event of ['dragover','dragleave','drop']) $('drop').addEventListener(event,e=> {e.preventDefault(); $('drop').classList.toggle('drag',event==='dragover'); if(event==='drop') loadPhoto(e.dataTransfer.files[0]);});
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',e=>e.preventDefault());
for(const id of fields) $(id).addEventListener('input',()=>{if(['width','height'].includes(id)) $('preset').value='custom';update();});
$('preset').addEventListener('change',()=>{
  const presets={passport:[413,531,500],id:[450,600,500]};
  if(presets[$('preset').value]) {const [w,h,kb]=presets[$('preset').value]; $('width').value=w; $('height').value=h; $('limit').value=kb;}
  update();
});
$('reset').addEventListener('click',()=>{
  ++selection; photo=null; if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null; clearResult();ctx.clearRect(0,0,preview.width,preview.height);
  $('preview-area').hidden=true;$('drop').hidden=false;$('reset').hidden=true;file.value='';update();
});
const encode=(canvas,quality)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('JPG 저장을 지원하지 않는 브라우저예요. 최신 브라우저에서 다시 시도해 주세요.')),'image/jpeg',quality));
$('convert').addEventListener('click',async()=> {
  if(!photo || busy)return;
  clearResult(); let settings;
  try {settings=config();} catch(e){status(e.message,true);return;}
  lock(true);$('convert').textContent='JPG를 만드는 중…';status('사진을 자르고 파일 용량을 확인하고 있어요…');
  try {
    await new Promise(requestAnimationFrame);
    const {w,h,kb}=settings, canvas=document.createElement('canvas');draw(canvas,w,h);
    const maxBytes=kb*1024; let blob=await encode(canvas,0.95);
    if(blob.size>maxBytes) {
      let low=0.1,high=0.95, best=await encode(canvas,low);
      if(best.size>maxBytes) throw new Error('이 픽셀 크기에서는 지정 용량을 맞출 수 없어요. 최대 용량을 늘리거나 픽셀을 줄여 다시 시도해 주세요.');
      for(let i=0;i<9;i++) {const q=(low+high)/2, candidate=await encode(canvas,q); if(candidate.size<=maxBytes){best=candidate;low=q;}else high=q;}
      blob=best;
    }
    resultUrl=URL.createObjectURL(blob);$('download').href=resultUrl;$('download').download=`photo-fit-${w}x${h}.jpg`;
    $('result-info').textContent=`${w} × ${h}px · ${(blob.size/1024).toFixed(1)}KB / ${kb}KB 이하 · JPG`;
    $('result').hidden=false; status('완료! 아래 버튼으로 저장해 주세요. 원본은 변경하지 않았어요.');
  }catch(e){status(e.message || '변환에 실패했어요. 다른 사진으로 다시 시도해 주세요.',true);}
  finally{lock(false);$('convert').innerHTML='규격에 맞춰 JPG 만들기 <span>↗</span>';}
});
