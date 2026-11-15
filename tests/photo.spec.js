const {test,expect}=require('@playwright/test');
async function fixture(page,noise=false){
 return Buffer.from(await page.evaluate(noise=>{const c=document.createElement('canvas');c.width=1000;c.height=1200;const x=c.getContext('2d');if(noise){const d=x.createImageData(1000,1200);let s=42;for(let i=0;i<d.data.length;i+=4){s=(s*1664525+1013904223)>>>0;d.data[i]=s&255;d.data[i+1]=(s>>>8)&255;d.data[i+2]=(s>>>16)&255;d.data[i+3]=255;}x.putImageData(d,0,0);}else{ x.fillStyle='#d6b58e';x.fillRect(0,0,1000,1200);x.fillStyle='#3f6857';x.fillRect(0,0,500,1200);x.fillStyle='#f0dfbd';x.beginPath();x.arc(500,480,210,0,7);x.fill();}return Array.from(Uint8Array.from(atob(c.toDataURL('image/png').split(',')[1]),ch=>ch.charCodeAt(0)));},noise));
}
async function upload(page,noise){await page.locator('#file').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:await fixture(page,noise)});await expect(page.locator('#preview-area')).toBeVisible();}
test('end-to-end crop, JPG download, dimensions, size and local-only processing',async({page,baseURL})=>{
 const errors=[], remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(new URL(baseURL).origin))remote.push(r.url());});
 await page.goto('./');await expect(page.locator('#convert')).toBeDisabled();await upload(page,true);
 await page.locator('#zoom').fill('1.5');await page.locator('#pan-x').fill('0');await page.locator('#convert').click();await expect(page.locator('#result')).toBeVisible();
 const output=await page.evaluate(async()=>{const blob=await(await fetch(document.querySelector('#download').href)).blob();const img=await createImageBitmap(blob);return{size:blob.size,type:blob.type,w:img.width,h:img.height};});
 expect(output).toMatchObject({type:'image/jpeg',w:413,h:531});expect(output.size).toBeLessThanOrEqual(500*1024);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);expect(download.suggestedFilename()).toBe('photo-fit-413x531.jpg');
 await page.locator('#limit').fill('50');await expect(page.locator('#result')).toBeHidden();await page.locator('#convert').click();await expect(page.locator('#result')).toBeVisible();
 expect(await page.evaluate(async()=> (await(await fetch(document.querySelector('#download').href)).blob()).size)).toBeLessThanOrEqual(50*1024);
 await page.locator('#width').fill('1000');await page.locator('#height').fill('1200');await page.locator('#limit').fill('5');await page.locator('#convert').click();await expect(page.locator('#status')).toContainText('맞출 수 없어요');await expect(page.locator('#result')).toBeHidden();expect(errors).toEqual([]);expect(remote.filter(u=>!u.startsWith('blob:'))).toEqual([]); 
});
test('invalid input, corrupt image, replace and reset recovery',async({page})=>{
 await page.goto('./');await page.locator('#file').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('bad')});await expect(page.locator('#status')).toContainText('사진만');
 await page.locator('#file').setInputFiles({name:'bad.jpg',mimeType:'image/jpeg',buffer:Buffer.from('bad')});await expect(page.locator('#status')).toContainText('열 수 없어요');
 await upload(page);await page.locator('#width').fill('0');await expect(page.locator('#convert')).toBeDisabled();await expect(page.locator('#status')).toContainText('정수');
 await page.locator('#preset').selectOption('id');await page.locator('#convert').click();await expect(page.locator('#result-info')).toContainText('450 × 600');
 await page.locator('#reset').click();await expect(page.locator('#drop')).toBeVisible();await expect(page.locator('#result')).toBeHidden();await upload(page);await expect(page.locator('#convert')).toBeEnabled();
});
test('mobile and desktop layouts, screenshot and console',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./');await upload(page);
 for(const width of [390,1280]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/photo-fit-${width}.png`,fullPage:true});}
 expect(errors).toEqual([]);
});
